import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../lib/auth';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

/**
 * Radar Hunter — API del panel admin.
 *
 * GET  /api/admin/hunter → leads cazados (con lat/lon si están geolocalizados)
 *                         + queries del radar (activas e inactivas, campo geo en texto)
 * POST /api/admin/hunter { action: 'radar' }   → lanza el radar (webhook hunter-ops)
 * POST /api/admin/hunter { action: 'geocode' } → geocodifica leads sin coordenadas
 *                                                (Nominatim/OSM, máx ~12 por llamada)
 * POST /api/admin/hunter { action: 'crear-query' }       → añade query al radar
 * POST /api/admin/hunter { action: 'actualizar-query' }  → edita query (incl. activo)
 * POST /api/admin/hunter { action: 'eliminar-query' }    → borra query
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

// Distritos/regiones de Portugal que Photon devuelve como "state" — rechazar
const PORTUGAL_STATES = ['viseu', 'lisboa', 'lisbon', 'porto', 'porto district', 'braga', 'coimbra', 'aveiro', 'setúbal', 'setubal', 'faro', 'guarda', 'vila real', 'bragança', 'braganca', 'viana do castelo', 'santarém', 'santarem', 'leiria', 'castelo branco', 'beja', 'évora', 'evora', 'portalegre', 'madeira', 'açores', 'azores', 'região norte', 'regiao norte', 'região centro', 'regiao centro', 'alentejo', 'algarve'];

// Comunidades autónomas españolas (lo que devuelve Photon como state)
const ES_COMUNIDADES = ['galicia', 'país vasco', 'pais vasco', 'euskadi', 'cataluña', 'cataluna', 'comunidad de madrid', 'madrid', 'andalucía', 'andalucia', 'comunidad valenciana', 'valenciana', 'aragón', 'aragon', 'castilla y león', 'castilla y leon', 'castilla-la mancha', 'castilla la mancha', 'extremadura', 'asturias', 'principado de asturias', 'cantabria', 'la rioja', 'navarra', 'región de murcia', 'region de murcia', 'murcia', 'islas baleares', 'baleares', 'canarias'];

function esFueraDeEspana(state: string | null): boolean {
  if (!state) return false;
  const s = state.toLowerCase();
  return PORTUGAL_STATES.some((p) => s.includes(p)) || ['casablanca', 'rabat', 'tánger', 'tanger', 'marrakech', 'fès', 'fes', 'meknès', 'meknes', 'agadir', 'marruecos', 'morocco', 'alger', 'algiers', 'argelia', 'túnez', 'tunis', 'france', 'francia'].some((p) => s.includes(p));
}

interface GeoResult {
  lat: number;
  lon: number;
  match: string;
  comunidad: string | null;
  ciudad: string | null;
}

// Caja de Galicia para priorizar resultados cuando la ciudad es gallega
const GALICIA_BBOX = 'bbox=-9.4,41.7,-6.7,43.9';

// Plataformas que entiende el workflow (Refinar Query Táctica 🎯 añade el filtro site:)
// Google Search no genera filtro site: pero se conserva como etiqueta de canal
const PLATAFORMAS_VALIDAS = ['LinkedIn', 'Social Media', 'Google My Business', 'Google Search'];

const CIUDADES_GALLEGAS = ['santiago de compostela', 'a coruña', 'la coruña', 'vigo', 'ourense', 'orense', 'lugo', 'pontevedra', 'ferrol', 'santiago'];

function normalizarPlataformas(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((p): p is string => typeof p === 'string' && PLATAFORMAS_VALIDAS.includes(p));
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return normalizarPlataformas(parsed);
    } catch {
      // no es JSON: intentar separar por comas
    }
    return value
      .split(',')
      .map((p) => p.trim())
      .filter((p) => PLATAFORMAS_VALIDAS.includes(p));
  }
  return [];
}

function esCiudadGallega(ciudad: string | null): boolean {
  if (!ciudad) return false;
  const c = ciudad.toLowerCase();
  return CIUDADES_GALLEGAS.some((g) => c.includes(g));
}

/** Geocodifica probando varias queries: negocio, negocio+ciudad, dominio+ciudad, ciudad.
 *  Usa Photon (Komoot, OSM, sin API key) con Nominatim como respaldo.
 *  Solo acepta resultados dentro de España (el radar apunta a negocios españoles).
 *  Devuelve también comunidad autónoma y ciudad detectadas para los filtros. */
async function geocode(queries: string[], cityDetectada: string | null = null): Promise<GeoResult | null> {
  const cleanName = (s: string) => s.toLowerCase().replace(/[^a-záéíóúñü\s]/gi, '').trim();
  const knownComunidades = ['galicia', 'país vasco', 'cataluña', 'comunidad de madrid', 'andalucía', 'comunidad valenciana', 'aragón', 'castilla y león', 'castilla-la mancha', 'extremadura', 'asturias', 'cantabria', 'la rioja', 'navarra', 'región de murcia', 'islas baleares', 'canarias'];

  for (const query of queries) {
    // Photon primero (más permisivo, sin rate limit estricto)
    // El radar caza en Galicia: intentar SIEMPRE primero con bbox gallego.
    // Fuera de Galicia solo si el negocio menciona explícitamente otra ciudad
    // (p.ej. "Clínica dental en Madrid"). Sin ciudad conocida → solo Galicia,
    // para no plantar pins falsos en homónimos (Olot/Medina de Pomar).
    const anclajeGalicia =
      /santiago|compostela|galicia|a coruña|vigo|ourense|lugo|pontevedra|ferrol/i.test(query) ||
      (cityDetectada !== null && esCiudadGallega(cityDetectada));
    const otraCiudad = cityDetectada !== null && !esCiudadGallega(cityDetectada);
    const bboxOptions = anclajeGalicia || !otraCiudad ? ['&' + GALICIA_BBOX] : ['&' + GALICIA_BBOX, ''];
    for (const bboxSuffix of bboxOptions) {
      let photonOk = false;
      try {
        const pUrl = `https://photon.komoot.io/api/?limit=5&q=${encodeURIComponent(query)}${bboxSuffix}`;
        const pRes = await fetch(pUrl, {
          headers: { 'User-Agent': 'AgenciAlquimiaPanel/1.0 (admin panel geocoding)' },
          signal: AbortSignal.timeout(6000),
        });
        if (pRes.ok) {
          photonOk = true;
          const pData = (await pRes.json()) as {
            features?: Array<{
              geometry: { coordinates: [number, number] };
              properties?: { city?: string; state?: string; name?: string };
            }>;
          };
          for (const feat of pData.features ?? []) {
            const [lon, lat] = feat?.geometry?.coordinates ?? [0, 0];
            const featState = feat?.properties?.state ?? null;
            if (inSpain(lat, lon) && !esFueraDeEspana(featState)) {
              const comunidadRaw = feat?.properties?.state ?? null;
              const ciudad = feat?.properties?.city ?? null;
              // Normalizar comunidad: Photon devuelve "Galicia" como state
              if (comunidadRaw) {
                const c = cleanName(comunidadRaw);
                const known = knownComunidades.find((k) => c.includes(k) || k.includes(c));
                const comunidad = known ? known.charAt(0).toUpperCase() + known.slice(1) : comunidadRaw;
                return { lat, lon, match: query, comunidad, ciudad };
              }
              return { lat, lon, match: query, comunidad: null, ciudad };
            }
          }
        }
      } catch {
        // siguiente intento
      }
      // Si Photon respondió pero sin resultados válidos en este bbox, probar el siguiente
      if (photonOk) continue;
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=3&q=${encodeURIComponent(query)}`;
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'AgenciAlquimiaPanel/1.0 (admin panel geocoding)' },
          signal: AbortSignal.timeout(6000),
        });
        if (res.ok) {
          const data = (await res.json()) as Array<{
            lat: string;
            lon: string;
            display_name?: string;
          }>;
          for (const item of data) {
            const lat = parseFloat(item.lat);
            const lon = parseFloat(item.lon);
            const dn = item.display_name ?? '';
            if (inSpain(lat, lon) && !esFueraDeEspana(dn)) {
              // Nominatim no da ciudad/comunidad estructurada; intentar inferir del display_name
              const parts = dn.split(',').map((p) => p.trim());
              const ciudad = parts.slice(0, 4).find(
                (p) =>
                  /^(?:Santiago de Compostela|[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)$/.test(p) &&
                  !['España', 'Spain'].includes(p)
              ) ?? null;
              return { lat, lon, match: query, comunidad: null, ciudad };
            }
          }
        }
      } catch {
        // siguiente query
      }
      if (bboxSuffix === '') break;
    }
  }
  return null;
}

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const [leads, objetivos, queries, filtros] = await Promise.all([
      pool.query(
        `SELECT id, empresa, nicho, email, telefono, senal_detectada, estado_caza,
                feedback_cliente, url_web, lat, lon, comunidad, ciudad, created_at
         FROM leads_hunter ORDER BY created_at DESC`
      ),
      pool.query(
        `SELECT id, negocio, fallo_detectado, potencial_venta, url, sector, email, telefono, lat, lon, comunidad, ciudad, created_at
         FROM objetivos_agencia ORDER BY created_at DESC`
      ),
      pool.query(
        `SELECT id, query, sector, activo, plataforma, geo, config
         FROM radar_queries ORDER BY activo DESC, created_at DESC`
      ),
      pool.query(
        `SELECT
           (SELECT array_agg(DISTINCT comunidad) FROM objetivos_agencia WHERE comunidad IS NOT NULL) AS comunidades_obj,
           (SELECT array_agg(DISTINCT ciudad) FROM objetivos_agencia WHERE ciudad IS NOT NULL) AS ciudades_obj,
           (SELECT array_agg(DISTINCT sector) FROM objetivos_agencia WHERE sector IS NOT NULL) AS sectores_obj,
           (SELECT array_agg(DISTINCT nicho) FROM leads_hunter WHERE nicho IS NOT NULL) AS nichos_leads`
      ),
    ]);
    return NextResponse.json({
      leads: leads.rows,
      objetivos: objetivos.rows,
      queries: queries.rows,
      filtros: filtros.rows[0],
    });
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
      // Lote de 30 por llamada para no exceder el tiempo del serverless.
      const objetivos = await pool.query(
        `SELECT id, negocio, url FROM objetivos_agencia
         WHERE lat IS NULL OR lon IS NULL ORDER BY created_at DESC LIMIT 15`
      );
      const leads = await pool.query(
        `SELECT id, empresa, url_web FROM leads_hunter
         WHERE lat IS NULL OR lon IS NULL
         ORDER BY (empresa LIKE '% - %') DESC, created_at DESC
         LIMIT 15`
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
        // Si el nombre menciona Santiago de Compostela, la primera query debe ser
        // negocio + "Santiago de Compostela" para anclar la ciudad exacta
        if (nombre && /santiago de compostela|compostela/i.test(nombre)) {
          queries.push(`${nombre} Santiago de Compostela`);
        }
        if (nombre && city) queries.push(`${nombre} ${city}`);
        if (domain && city) queries.push(`${domain} ${city}`);
        if (nombre) queries.push(nombre);
        if (domain) queries.push(domain);
        if (city) queries.push(city);
        const coords = await geocode(queries, city);
        if (coords) {
          await pool.query(
            isObj
              ? 'UPDATE objetivos_agencia SET lat = $1, lon = $2, comunidad = $3, ciudad = $4 WHERE id = $5'
              : 'UPDATE leads_hunter SET lat = $1, lon = $2, comunidad = $3, ciudad = $4 WHERE id = $5',
            [coords.lat, coords.lon, coords.comunidad, coords.ciudad, row.id]
          );
          updated.push(`${nombre.slice(0, 30)} → ${coords.match}`);
        } else {
          failed.push(nombre.slice(0, 40));
        }
      }
      // Contar cuántos quedan pendientes para orientar al usuario
      const pendientes = await pool.query(
        `SELECT (SELECT count(*) FROM objetivos_agencia WHERE lat IS NULL) +
                (SELECT count(*) FROM leads_hunter WHERE lat IS NULL) AS pendientes`
      );
      const quedan = Number(pendientes.rows[0]?.pendientes ?? 0);
      return NextResponse.json({
        ok: true,
        geocoded: updated.length,
        failed: failed.length,
        updated,
        failed_names: failed,
        pendientes: quedan,
      });
    } catch (err) {
      console.error('hunter geocode error:', err);
      return NextResponse.json({ message: 'Error al geocodificar' }, { status: 500 });
    }
  }

  if (action === 'crear-query' || action === 'actualizar-query' || action === 'eliminar-query') {
    // Gestión de queries del radar (tabla radar_queries). El workflow solo usa
    // las filas con activo = true; las inactivas se conservan para reactivar.
    try {
      if (action === 'crear-query') {
        const q = String((body as { query?: unknown }).query ?? '').trim();
        if (!q) {
          return NextResponse.json({ message: 'La query no puede estar vacía' }, { status: 400 });
        }
        const sector = String((body as { sector?: unknown }).sector ?? '').trim() || null;
        const geo = String((body as { geo?: unknown }).geo ?? '').trim() || null;
        const plataforma = normalizarPlataformas((body as { plataforma?: unknown }).plataforma);
        const activo = (body as { activo?: unknown }).activo !== false;
        const res = await pool.query(
          `INSERT INTO radar_queries (query, sector, geo, plataforma, activo)
           VALUES ($1, $2, $3, $4, $5) RETURNING id, query, sector, geo, plataforma, activo, created_at`,
          [q, sector, geo, plataforma, activo]
        );
        return NextResponse.json({ ok: true, query: res.rows[0] });
      }

      if (action === 'actualizar-query') {
        const id = String((body as { id?: unknown }).id ?? '');
        if (!id) {
          return NextResponse.json({ message: 'Falta el id de la query' }, { status: 400 });
        }
        const q = String((body as { query?: unknown }).query ?? '').trim();
        if (!q) {
          return NextResponse.json({ message: 'La query no puede estar vacía' }, { status: 400 });
        }
        const sector = String((body as { sector?: unknown }).sector ?? '').trim() || null;
        const geo = String((body as { geo?: unknown }).geo ?? '').trim() || null;
        const plataforma = normalizarPlataformas((body as { plataforma?: unknown }).plataforma);
        const activo = (body as { activo?: unknown }).activo !== false;
        await pool.query(
          `UPDATE radar_queries
           SET query = $1, sector = $2, geo = $3, plataforma = $4, activo = $5
           WHERE id = $6`,
          [q, sector, geo, plataforma, activo, id]
        );
        return NextResponse.json({ ok: true });
      }

      // eliminar-query
      const id = String((body as { id?: unknown }).id ?? '');
      if (!id) {
        return NextResponse.json({ message: 'Falta el id de la query' }, { status: 400 });
      }
      await pool.query('DELETE FROM radar_queries WHERE id = $1', [id]);
      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error('hunter query CRUD error:', err);
      return NextResponse.json({ message: 'Error al gestionar la query' }, { status: 500 });
    }
  }

  if (action === 'generar-mensaje') {
    // Genera un mensaje de contacto (WhatsApp o email) para un negocio
    // usando Max (webhook max-panel). El panel muestra el resultado para
    // copiarlo o enviarlo por WhatsApp.
    try {
      const negocio = (body as { negocio?: Record<string, unknown> }).negocio ?? null;
      const tipo = (body as { tipo?: string }).tipo === 'email' ? 'email' : 'whatsapp';
      if (!negocio || !negocio.nombre) {
        return NextResponse.json({ message: 'Falta el negocio' }, { status: 400 });
      }

      const apiUrl = process.env.N8N_API_URL ?? '';
      const webhookBase = apiUrl.replace(/\/api\/v1\/?$/, '');
      const telefonoMatias = process.env.ADMIN_WHATSAPP_DESTINO ?? '34657738334';

      // Contexto del negocio para que Max redacte un mensaje personalizado
      const nombre = String(negocio.nombre ?? '');
      const sector = String(negocio.sector ?? '');
      const ciudad = String(negocio.ciudad ?? '');
      const fallo = String(negocio.fallo ?? '');
      const potencial = String(negocio.potencial ?? '');
      const web = String(negocio.url ?? '');
      const telefonoNegocio = String(negocio.telefono ?? '');
      const emailNegocio = String(negocio.email ?? '');

      const datos = [
        `Negocio: ${nombre}`,
        sector ? `Sector: ${sector}` : null,
        ciudad ? `Ciudad: ${ciudad}` : null,
        fallo && fallo !== 'null' ? `Fallo detectado: ${fallo}` : null,
        potencial && potencial !== 'null' ? `Potencial de venta: ${potencial}` : null,
        web ? `Web: ${web}` : null,
        telefonoNegocio ? `Teléfono: ${telefonoNegocio}` : null,
        emailNegocio ? `Email: ${emailNegocio}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      const prompt =
        tipo === 'email'
          ? `Redacta un CORREO ELECTRÓNICO de venta breve (máx 180 palabras, en español) para el negocio de AgenciAlquimia (agencia de automatización con IA para pymes). Sé concreto: menciona 1 problema que detectamos en su web/negocio y cómo lo resolvería un asistente IA 24/7. Tono profesional y cercano, sin relleno. Firma: Matías, AgenciAlquimia (matiasidiartviera@gmail.com, +34 604 051 111, agencialquimia.com). Asunto incluido en la primera línea con prefijo 'Asunto:'. Devuelve SOLO el correo.

DATOS DEL NEGOCIO:\n${datos}`
          : `Redacta un MENSAJE DE WHATSAPP de venta breve (máx 120 palabras, en español, sin emojis excesivos) para el negocio de AgenciAlquimia (agencia de automatización con IA para pymes). Sé concreto: menciona 1 problema que detectamos en su web/negocio y cómo lo resolvería un asistente IA 24/7. Tono cercano y profesional, con una sola pregunta final para abrir conversación. Firma: Matías, AgenciAlquimia. Devuelve SOLO el mensaje.

DATOS DEL NEGOCIO:\n${datos}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000);
      const res = await fetch(`${webhookBase}/webhook/max-panel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatInput: prompt,
          sessionId: `gen_msg_${Date.now()}`,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        console.error('[hunter/generar] max-panel respondió', res.status);
        return NextResponse.json({ message: `Max respondió ${res.status}` }, { status: 502 });
      }
      const data = await res.json();
      const response =
        typeof data?.output === 'string'
          ? data.output
          : typeof data?.response === 'string'
            ? data.response
            : JSON.stringify(data);
      return NextResponse.json({ ok: true, tipo, response });
    } catch (err) {
      console.error('[hunter/generar] error', err);
      return NextResponse.json({ message: 'Error generando el mensaje con Max' }, { status: 502 });
    }
  }

  return NextResponse.json({ message: 'Acción no soportada' }, { status: 400 });
}
