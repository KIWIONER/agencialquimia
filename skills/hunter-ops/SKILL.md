---
name: hunter-ops
description: >-
  Operar el Radar Hunter de AgenciAlquimia: workflow n8n hunterops-alquimia (caza de
  objetivos con fallos web en Galicia), tablas Supabase (objetivos_agencia, leads_hunter,
  radar_queries), API /api/admin/hunter y mapa del panel admin. Usar al activar el radar,
  depurar capturas, geocodificar negocios, completar contactos (email/teléfono) o generar
  mensajes de venta con Max.
---

# Skill: hunter-ops

## Cuándo usar esta skill

- **Activar o depurar el radar** de captación de objetivos (workflow `hunterops-alquimia`).
- **Investigar por qué un negocio capturado no tiene email/teléfono** o por qué el radar no inserta nada.
- **Geocodificar** objetivos/leads sin coordenadas (lat/lon NULL) para que aparezcan en el mapa.
- **Generar mensajes de venta** (WhatsApp o email) para un negocio concreto usando Max.
- Tocar **cualquier tabla Hunter** en Supabase (`objetivos_agencia`, `leads_hunter`, `radar_queries`).

## Arquitectura (verificada el 17-ago-2026)

```
[Schedule 12:00 + Webhook hunter-ops] → get querys → Random picker → Refinar Query Táctica 🎯
  → Google Trends Radar → Inteligencia elite → Serper (Radar) → Gemini 2.5 Flash1
  → Extractor de Leads1 → Enriquecer Contacto 🕸️ → Supabase (Postgres)1 [UPSERT objetivos_agencia]
```

- **Workflow n8n:** `hunterops-alquimia`, id `8oKH48VIOr66YIQb` — **ACTIVO, 14 nodos**.
  (cerebro.agencialquimia.com, instancia principal n8n de Coolify).
- **Panel admin:** pestaña "Hunter" → `components/admin/HunterMap.tsx` (Leaflet + OSM, sin API key).
- **API:** `app/api/admin/hunter/route.ts` → GET lista + POST acciones (`radar`, `geocode`, `generar-mensaje`).
- **BD:** Supabase Cloud `ybqzcxabblyzqhezanaf`, pooler `aws-1-eu-west-1.pooler.supabase.com:5432`,
  rol `panel_web.ybqzcxabblyzqhezanaf` (solo lectura/escritura panel; NUNCA DDL con este rol).

## Flujo del workflow (nodo a nodo)

| # | Nodo | Tipo | Qué hace |
|---|------|------|----------|
| 1 | `Schedule Trigger` | scheduleTrigger | Ejecución diaria 12:00 |
| 2 | `Webhook` | webhook | POST `/webhook/hunter-ops` — disparo manual (panel/API) |
| 3 | `get querys` | supabase | SELECT `radar_queries` WHERE `activo = true` |
| 4 | `Random picker` | code | Elige 1 query aleatoria de las activas |
| 5 | `Refinar Query Táctica 🎯` | code | Normaliza query, añade `geo` si no la menciona, y añade filtros `site:` según `plataforma` (LinkedIn → `site:linkedin.com`; Social Media → `site:instagram.com OR site:tiktok.com OR site:facebook.com`; Google My Business → `site:google.com/maps`). Detecta si viene del Webhook (`$json.body`) o de BD. |
| 6 | `Google Trends Radar` | httpRequest | Serper search de la query (solo `{q}`) para sacar relatedSearches |
| 7 | `Inteligencia elite` | code | Fusiona query original + primera búsqueda relacionada → `queryElite`; pasa `sector` y `market_intent` |
| 8 | `Serper (Radar)` | httpRequest | POST `https://google.serper.dev/search` con `{q, gl:'es', hl:'es'}` + header `X-API-KEY` (Serper, secreto en el nodo) |
| 9 | `Gemini 2.5 Flash1` | httpRequest | POST Gemini `generateContent` (key AIza… en el nodo, secreto). Prompt: analiza `organic[{title, link}]` del Serper y devuelve SOLO JSON `[{negocio, fallo_detectado, potencial_venta, url}]` |
| 10 | `Extractor de Leads1` | code | Parsea el JSON de Gemini, limpia ```` ```json ````, filtra degenerados (`Escáner`, `análisis no realizado`, `n/a`, `no especificado`, `sin datos`), mapea a `{negocio, fallo_detectado, potencial_venta, url, sector}`. **Si Gemini devuelve `[]` → no produce items → el flujo acaba sin insertar** (comportamiento esperado cuando la query no da negocios válidos). |
| 11 | **`Enriquecer Contacto 🕸️`** | code | **NUEVO (17-ago).** Por cada item: `fetch` de `url` real (UA Chrome, timeout 8s con AbortController), extrae emails con regex y teléfonos españoles (de `tel:` links y texto), filtra falsos, prioriza móvil → fijo gallego → resto, y **solo rellena si Gemini no trajo** (`item.json.email || scraped`). Web inaccesible → deja NULL (no inventa). |
| 12 | `Supabase (Postgres)1` | postgres | **UPSERT** en `objetivos_agencia` con matching por `negocio`; escribe `negocio, fallo_detectado, potencial_venta, url, sector` **+ `email, telefono`** (añadidos 17-ago — antes el mapeo no los incluía y los contactos solo se rellenaban manualmente) |

> ⚠️ **Nodos huérfanos (NO conectados al flujo, no tocar):** `Selector de Diana1` (lista estática de búsquedas antigua) y `Edit Fields1` (set de campos que ya hace el Extractor). El flujo real va `Extractor de Leads1 → Enriquecer Contacto 🕸️ → Supabase (Postgres)1`.

## Tablas Supabase

### `objetivos_agencia` — dianas del radar (12 filas en 17-ago)
| columna | tipo | notas |
|---|---|---|
| id | bigint | PK |
| negocio | text | nombre; **matching del UPSERT** |
| fallo_detectado | text | qué falla en su web/atención |
| potencial_venta | text | por qué venderle |
| url | text | web real |
| sector | text | sector del negocio |
| email, telefono | text | contacto extraído (web scrape) |
| lat, lon | double | coords para el mapa |
| comunidad, ciudad | text | para filtros del panel |
| hunter_id | uuid | vínculo opcional a leads_hunter |

### `leads_hunter` — capturas del radar anterior (6 filas)
`id (uuid), empresa, nicho, email, telefono, senal_detectada, estado_caza, feedback_cliente, url_web, lat, lon, comunidad, ciudad`

Estados `estado_caza`: `pendiente → contactado → en conversacion → ganado | descartado` (colores en `HunterMap.tsx`).

### `radar_queries` — queries del radar
`id (uuid), query, sector, activo (bool), plataforma (array: LinkedIn/Social Media/Google My Business…), config (jsonb), geo (text, ej. "Galicia, España")`

> Solo las filas con `activo = true` las coge el workflow.

## API `/api/admin/hunter`

**GET** → `{ leads, objetivos, queries, filtros }` (leads/objetivos con email/telefono/lat/lon/comunidad/ciudad). Auth: cookie `admin_session` (JWT firmado).

**POST** (body `{ action }`, mismo auth):
- `{action:'radar'}` → POST al webhook n8n `hunter-ops` `{trigger:'manual', source:'panel-admin'}`. Timeout 30s. El radar tarda **unos minutos** (Serper + Gemini + fetch de webs).
- `{action:'geocode'}` → geocodifica lotes de 15 objetivos + 15 leads sin coords (Photon bbox Galicia primero → Nominatim solo si Photon falla). Timeout por query 6s, sin `sleep`. Actualiza `lat/lon/comunidad/ciudad`.
- `{action:'generar-mensaje', tipo:'whatsapp'|'email', negocio:{...}}` → manda el contexto del negocio al webhook `max-panel` (Max, mismo cerebro que el chat) con prompt de venta (WhatsApp ≤120 palabras / email ≤180 con asunto). Timeout 90s. Devuelve `{ok, tipo, response}`.

## Reglas de geocodificación (críticas, aprendidas con errores reales)

1. **Galicia-first SIEMPRE**: bbox `-9.4,41.7,-6.7,43.9`. El radar caza en Galicia; sin bbox, Photon devuelve homónimos de otros países (Olot, Medina de Pomar…).
2. **Fuera de Galicia solo si** el nombre menciona otra ciudad explícita ("Clínica dental en Madrid" → Madrid).
3. **`esFueraDeEspana()`**: rechaza estados portugueses (Viseu, Lisboa, Porto…), Marruecos, Argelia, Túnez, Francia.
4. Queries en orden de precisión: `negocio+ciudad → dominio+ciudad → negocio → dominio → ciudad`.
5. Si nada coincide → **NULL, no pin falso** ("mejor sin pin que pin falso").
6. Coordenadas manuales OK para casos especiales (ej. clinicavilarsancho.com → Santiago 42.8805, -8.5457).

## Reglas de extracción de contactos (Enriquecer Contacto 🕸️ y scripts)

1. **El contacto se extrae de la web real, NO de Gemini** — Serper solo pasa `{nombre, enlace}` a Gemini, que no puede inventar email/teléfono sin alucinar.
2. Regex: `EMAIL_RE` estándar; `TEL_RE` para patrones españoles (+34/9 dígitos, con separadores); `TEL_LINK_RE` para `tel:`.
3. **Filtrar falsos**: emails con `example/sentry/wixpress/godaddy/squarespace/test/noreply` o extensión de imagen; teléfonos con 5+ dígitos repetidos (`66666667`, `99999999` — plantillas).
4. **Prioridad teléfono**: móvil (6/7) → fijo gallego (981/982/986/987/881/886/887/888) → resto. Evita coger fijos de Madrid/Barcelona de plantillas.
5. **Negocio sin contacto real → NULL, no inventar** (ej. Liseth Medina web 404, European Coffee Trip blog, Doctoralia listado).
6. Script de referencia standalone: `/tmp/extraer-contacto.py` (misma lógica, urllib).

## Operaciones frecuentes

### Activar el radar manualmente
```bash
# Desde el panel: botón "🎯 Activar Radar" (pestaña Hunter).
# O vía API con JWT:
TOKEN=$(node --experimental-strip-types /tmp/gen-token.mjs | tail -1)
curl -s -X POST -H "Cookie: admin_session=$TOKEN" -H 'Content-Type: application/json' \
  -d '{"action":"radar"}' http://localhost:3100/api/admin/hunter
```

### Ver si el radar ejecutó bien
```bash
/root/scripts/n8n-api.sh GET "executions?workflowId=8oKH48VIOr66YIQb&limit=5"
# Detalle de una ejecución (runData por nodo):
/root/scripts/n8n-api.sh GET "executions/<ID>?includeData=true"
```
- `Extractor de Leads1` con **0 items** = Gemini devolvió `[]` para esa query (p.ej. `site:google.com/maps` sin orgánicos) — no es un fallo del nodo nuevo.
- `Enriquecer Contacto 🕸️` solo se ejecuta si hay items del Extractor.

### Consultar la BD Hunter
```bash
/root/scripts/supabase-sql.sh "SELECT id, negocio, email, telefono, lat, lon FROM objetivos_agencia ORDER BY created_at DESC;"
/root/scripts/supabase-sql.sh "SELECT id, empresa, email, telefono, estado_caza FROM leads_hunter ORDER BY created_at DESC;"
```

### Backup SIEMPRE antes de tocar datos
```bash
# vía psql con pooler (conninfo como UN solo string; \copy a CSV)
/root/scripts/supabase-sql.sh "SELECT * FROM objetivos_agencia;"  # para inspección
# Para backup real: psql "postgresql://panel_web....@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require" \
#   -c "\copy objetivos_agencia TO '/root/backups/supabase-cloud/objetivos_agencia-$(date +%Y%m%d-%H%M%S).csv' CSV HEADER"
```

### Generar mensaje de venta para un negocio
Panel Hunter → clic en negocio (drawer lateral z-[1200]) → "Generar mensaje con Max" → WhatsApp o Email → copiar o abrir `mailto:`/WhatsApp.

## Lecciones / trampas conocidas

1. **NUNCA DELETE contra producción** (ya pasó con un workflow n8n; recuperado vía heap de Postgres).
2. **El mapeo de columnas de `Supabase (Postgres)1` YA incluye `email`/`telefono`** (actualizado 17-ago 01:23, PUT con `--data-binary @archivo`; backup `wf-hunterops-after-email-node-20260817-0123.json`). El workflow ahora escribe los contactos de Enriquecer Contacto 🕸️ en cada captura nueva.
3. **PUT a n8n**: body solo `{name, nodes, connections, settings}` con `settings: {executionOrder: 'v1'}`; sin `id`/`active`; **backup JSON SIEMPRE antes**; nodos Code sin `webhookId` (si no, PUT falla con `request/body/nodes/N/webhookId must be string`). ⚠️ **el helper `n8n-api.sh` NO sirve para PUT con JSON que contenga emojis/unicode** (falla "Failed to parse request body") → usar `curl --data-binary @archivo` directo con la key.
4. **Geocode en rutas síncronas**: lotes pequeños (15+15 ≈ 2-17s); sin `sleep` entre queries; `AbortSignal.timeout(6000)`.
5. **Radar crea basura si la query es mala** → filtro en Extractor + queries en `radar_queries` revisadas. `site:google.com/maps` da pocos orgánicos (candidato a revisión).
6. **Serper key vive en el nodo Serper del workflow** (secreto, no versionar). Gemini key en el nodo Gemini (secreto, no versionar). Las credenciales n8n están en `/root/.openclaw/workspace/notes/` (600).
7. Los **5 commits Hunter** (`7856e3d, 562fc2e, fd4be35, 0418822` + contacto) se subieron a GitHub el 17-ago **sin redeploy** (auto-deploy de Coolify desactivado temporalmente en `application_settings.is_auto_deploy_enabled`). La web en producción sigue en el commit anterior hasta que se despliegue.

## Archivos clave

- Workflow: n8n `hunterops-alquimia` (`8oKH48VIOr66YIQb`) — backups en `/root/backups/agencialquimia/n8n/wf-hunterops*.json`
- API: `app/api/admin/hunter/route.ts` (413 líneas)
- Panel: `components/admin/HunterMap.tsx` (951 líneas)
- Scripts: `/root/scripts/supabase-sql.sh`, `/root/scripts/n8n-api.sh`
- Memoria/incidentes: `/root/.openclaw/workspace/memory/2026-08-16.md`, `/root/.openclaw/workspace/notes/`
