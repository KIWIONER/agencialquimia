import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../lib/auth';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

/**
 * Radar Hunter — API del panel admin.
 *
 * GET  /api/admin/hunter → leads cazados (con lat/lon si están geolocalizados)
 *                         + queries activas del radar (campo geo en texto)
 * POST /api/admin/hunter { action: 'radar' }   → lanza el radar (webhook hunter-ops)
 * POST /api/admin/hunter { action: 'geocode' } → geocodifica leads sin coordenadas
 *                                                (Nominatim/OSM, máx ~12 por llamada)
 *
 * Los leads los genera el workflow n8n "hunterops-alquimia" (webhook hunter-ops,
 * trigger diario 12:00 + manual). Las columnas lat/lon se añadieron en
 * leads_hunter para pintar los negocios en el mapa.
 */

const pool = new Pool({
  host: process.env.PANEL_DB_HOST ?? '',
  port: Number(process.env.PANEL_DB_PORT ?? 5432),
  user: process.env.PANEL_DB_USER ?? '',
  password: process.env.PANEL_DB_PASSWORD ?? '',
  database: process.env.PANEL_DB_NAME ?? 'postgres',
  ssl: { rejectUnauthorized: false },
  max: 5,
});

const HUNTER_WEBHOOK = `${(process.env.N8N_API_URL ?? 'https://cerebro.agencialquimia.com/api/v1').replace(/\/api\/v1\/?$/, '')}/webhook/hunter-ops`;

async function requireAdmin(request: Request) {
  const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1];
  const { valid } = await verifyAdminToken(token ?? '');
  return valid;
}

/** Limpia el nombre de negocio para geocodificar: "Tipo en Ciudad - Nombre" → "Nombre" */
function businessName(empresa: string): string {
  const parts = empresa.split('-').map((p) => p.trim());
  const last = parts[parts.length - 1] ?? empresa;
  if (last && last.length >= 3) return last;
  return empresa;
}

/** Detecta la ciudad en el nombre: "Clínica dental en Madrid - X" → "Madrid";
 *  "Best Cafés in Santiago de Compostela - Y" → "Santiago de Compostela" */
function cityFromName(text: string): string | null {
  const m = text.match(/\b(?:en|in|de)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/);
  if (!m) return null;
  const city = m[1];
  // Descartar falsos positivos: "en Odontología", "en Hostelería" (sectores, no ciudades)
  const sectores = ['odontolog', 'hosteler', 'inmobiliari', 'salud', 'retail', 'alimentaci', 'bienestar', 'servicios', 'general', 'real state', 'marketing', 'online'];
  if (sectores.some((s) => city.toLowerCase().startsWith(s))) return null;
  return city;
}

/** Extrae el nombre del negocio del dominio: https://www.clinicacloe.com → "Clinicacloe" */
function domainName(url: string | null): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    const name = host.split('.')[0];
    return name && name.length >= 3 ? name : null;
  } catch {
    return null;
  }
}

// Caja geográfica de España (península + islas) para descartar coincidencias absurdas
const ES_BBOX = { minLat: 27, maxLat: 44, minLon: -18.5, maxLon: 5 };
function inSpain(lat: number, lon: number): boolean {
  return lat >= ES_BBOX.minLat && lat <= ES_BBOX.maxLat && lon >= ES_BBOX.minLon && lon <= ES_BBOX.maxLon;
}

/** Geocodifica probando varias queries: negocio, negocio+ciudad, dominio+ciudad, ciudad.
 *  Usa Photon (Komoot, OSM, sin API key) con Nominatim como respaldo.
 *  Solo acepta resultados dentro de España (el radar apunta a negocios españoles). */
async function geocode(queries: string[]): Promise<{ lat: number; lon: number; match: string } | null> {
  for (const query of queries) {
    // Photon primero (más permisivo, sin rate limit estricto)
    try {
      const pUrl = `https://photon.komoot.io/api/?limit=3&q=${encodeURIComponent(query)}`;
      const pRes = await fetch(pUrl, {
        headers: { 'User-Agent': 'AgenciAlquimiaPanel/1.0 (admin panel geocoding)' },
        signal: AbortSignal.timeout(8000),
      });
      if (pRes.ok) {
        const pData = (await pRes.json()) as { features?: Array<{ geometry: { coordinates: [number, number] } }> };
        for (const feat of pData.features ?? []) {
          const [lon, lat] = feat?.geometry?.coordinates ?? [0, 0];
          if (inSpain(lat, lon)) {
            return { lat, lon, match: query };
          }
        }
      }
    } catch {
      // seguir con Nominatim
    }
    // Nominatim como respaldo
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=3&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AgenciAlquimiaPanel/1.0 (admin panel geocoding)' },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = (await res.json()) as Array<{ lat: string; lon: string }>;
      for (const item of data) {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        if (inSpain(lat, lon)) {
          return { lat, lon, match: query };
        }
      }
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return null;
}

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const [leads, objetivos, queries] = await Promise.all([
      pool.query(
        `SELECT id, empresa, nicho, email, telefono, senal_detectada, estado_caza,
                feedback_cliente, url_web, lat, lon, created_at
         FROM leads_hunter ORDER BY created_at DESC`
      ),
      pool.query(
        `SELECT id, negocio, fallo_detectado, potencial_venta, url, sector, lat, lon, created_at
         FROM objetivos_agencia ORDER BY created_at DESC`
      ),
      pool.query(
        `SELECT id, query, sector, activo, plataforma, geo, config
         FROM radar_queries WHERE activo = true ORDER BY created_at DESC`
      ),
    ]);
    return NextResponse.json({ leads: leads.rows, objetivos: objetivos.rows, queries: queries.rows });
  } catch (err) {
    console.error('hunter GET error:', err);
    return NextResponse.json({ message: 'Error al leer el radar' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  let body: { action?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const action = body.action ?? 'radar';

  if (action === 'radar') {
    try {
      const res = await fetch(HUNTER_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual', source: 'panel-admin' }),
        signal: AbortSignal.timeout(30000),
      });
      const text = await res.text();
      if (!res.ok) {
        return NextResponse.json(
          { message: `El radar respondió ${res.status}: ${text.slice(0, 200)}` },
          { status: 502 }
        );
      }
      return NextResponse.json({ ok: true, message: 'Radar lanzado. Los nuevos leads aparecerán en el mapa en unos minutos.' });
    } catch (err) {
      console.error('hunter radar error:', err);
      return NextResponse.json({ message: 'No se pudo lanzar el radar' }, { status: 500 });
    }
  }

  if (action === 'geocode') {
    try {
      // Primero los objetivos (negocios diana reales del radar), luego leads sin coord.
      const objetivos = await pool.query(
        `SELECT id, negocio, url FROM objetivos_agencia
         WHERE lat IS NULL OR lon IS NULL ORDER BY created_at DESC LIMIT 8`
      );
      const leads = await pool.query(
        `SELECT id, empresa, url_web FROM leads_hunter
         WHERE lat IS NULL OR lon IS NULL
         ORDER BY (empresa LIKE '% - %') DESC, created_at DESC
         LIMIT 8`
      );
      const updated: string[] = [];
      const failed: string[] = [];

      for (const row of [...objetivos.rows, ...leads.rows]) {
        const isObj = 'negocio' in row;
        const nombre = isObj ? row.negocio : row.empresa;
        const url = isObj ? row.url : row.url_web;
        const city = cityFromName(nombre);
        const domain = domainName(url);
        // Queries en orden de precisión: negocio+ciudad, dominio+ciudad, negocio, dominio, ciudad
        const queries: string[] = [];
        if (nombre && city) queries.push(`${nombre} ${city}`);
        if (domain && city) queries.push(`${domain} ${city}`);
        if (nombre) queries.push(nombre);
        if (domain) queries.push(domain);
        if (city) queries.push(city);
        const coords = await geocode(queries);
        if (coords) {
          await pool.query(
            isObj
              ? 'UPDATE objetivos_agencia SET lat = $1, lon = $2 WHERE id = $3'
              : 'UPDATE leads_hunter SET lat = $1, lon = $2 WHERE id = $3',
            [coords.lat, coords.lon, row.id]
          );
          updated.push(`${nombre.slice(0, 30)} → ${coords.match}`);
        } else {
          failed.push(nombre.slice(0, 40));
        }
      }
      return NextResponse.json({
        ok: true,
        geocoded: updated.length,
        failed: failed.length,
        updated,
        failed_names: failed,
      });
    } catch (err) {
      console.error('hunter geocode error:', err);
      return NextResponse.json({ message: 'Error al geocodificar' }, { status: 500 });
    }
  }

  return NextResponse.json({ message: 'Acción no soportada' }, { status: 400 });
}
