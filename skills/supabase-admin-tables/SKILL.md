---
name: supabase-admin-tables
description: >-
  Renderizar y conectar en vivo en el panel admin (/admin) las 11 tablas creadas en Supabase
  (leads_agencialquimia, leads_hunter, chat_messages, n8n_chat_histories, etc.) mediante API Routes y DataTable.tsx.
---

# Skill: supabase-admin-tables

## Cuándo usar esta skill

- Conectar el panel de administración (`/admin`) a datos reales en vivo de Supabase (Cloud o self-hosted).
- Listar y explorar cualquiera de las **11 tablas oficiales** del proyecto AgenciAlquimia mediante un menú desplegable interactivo.
- Añadir nuevas vistas genéricas de tablas sin escribir código específico por tabla.

## Contexto del proyecto (Verificado)

- **Panel Admin:** [`app/admin/page.tsx`](file:///root/.openclaw/worktrees/agencialquimia-web/app/admin/page.tsx) — Client component con pestaña "Tablas Supabase" (`FolderGit2`), sidebar y estado de hidratación seguro (`mounted`).
- **Supabase Cloud / VPS:** Proyecto `ybqzcxabblyzqhezanaf` (`https://ybqzcxabblyzqhezanaf.supabase.co`).
- **Variables de Entorno ([`.env.local`](file:///root/.openclaw/worktrees/agencialquimia-web/.env.local)):**
  - `PUBLIC_SUPABASE_URL=https://ybqzcxabblyzqhezanaf.supabase.co`
  - `PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...` (o `eyJhbGciOi...`)
- **Arquitectura Novedosa:** No requiere `@supabase/supabase-js`. Utiliza `fetch` nativo con los encabezados `apikey` y `Authorization: Bearer`.

## Las 11 Tablas Oficiales de AgenciAlquimia

1. `leads_agencialquimia` *(Tabla principal de captación de leads)*
2. `leads_hunter`
3. `chat_messages`
4. `chat_messages_alquimia`
5. `chat_messages_cerebro`
6. `conversaciones_alquimia`
7. `n8n_chat_histories`
8. `control_rutas`
9. `ideas_agencia`
10. `objetivos_agencia`
11. `radar_queries`

## Arquitectura de la Solución

```
Admin Client (/admin)  →  Next.js API Server  →  Supabase PostgREST  →  PostgreSQL DB
```

### 1. Endpoint Proxy de Tablas ([`app/api/admin/tables/route.ts`](file:///root/.openclaw/worktrees/agencialquimia-web/app/api/admin/tables/route.ts))
* Usa `export const dynamic = 'force-dynamic';` para evitar errores de caché.
* Intenta inspeccionar `/rest/v1/` con OpenAPI. Si Supabase requiere clave secreta (401), realiza **sondeos paralelos** sobre la lista de las 11 tablas candidatas.

### 2. Endpoint Proxy de Datos ([`app/api/admin/data/route.ts`](file:///root/.openclaw/worktrees/agencialquimia-web/app/api/admin/data/route.ts))
* Recibe parámetros `?table=leads_agencialquimia&limit=100&offset=0`.
* Normaliza la URL sustituyendo `/rest/v1/` duplicados.
* Retorna `{ success: true, table: "...", data: [...], isFallback: false }`.

### 3. Componente Explorador ([`components/admin/DataTable.tsx`](file:///root/.openclaw/worktrees/agencialquimia-web/components/admin/DataTable.tsx))
* **Menú Desplegable (Dropdown Popover):** Desplegable estilizado en el encabezado para seleccionar fácilmente cualquiera de las 11 tablas.
* **Auto-detección de columnas:** Deriva dinámicamente los campos de la primera fila (`cliente_nombre`, `cliente_correo`, `fecha_cita`, etc.).
* **Protección de Hidratación (React #418):** Incluye la guardia `const [mounted, setMounted] = useState(false)` para garantizar sincronía total entre servidor y cliente.

## Seguridad y Buenas Prácticas

- Usar exclusivamente claves públicas o publishable (`sb_publishable_...` o `anon`). Jamás incluir la clave `service_role` en el cliente.
- Mantener Row Level Security (RLS) activo en las tablas de Supabase.
- En caso de fallo de red o variables no configuradas, el sistema activará automáticamente el banner amarillo de **Modo Vista Previa (Fallback)** sin tirar la página.

## Verificación tras implementar

```bash
# 1. Probar descubrimiento de las 11 tablas
curl -s http://localhost:3000/api/admin/tables

# 2. Probar consulta de datos reales
curl -s "http://localhost:3000/api/admin/data?table=leads_agencialquimia"

# 3. Comprobar suite completa
npx tsc --noEmit && npm run lint && npm test && npm run build
```

## Estado verificado (16 de agosto de 2026)

- **Instancia en uso:** Supabase **Cloud** `ybqzcxabblyzqhezanaf.supabase.co` (los valores reales están en `.env.local`, NO versionado). Existe además una instancia **self-hosted en el VPS** con otras tablas (ver skill `supabase-sql` y `notes/supabase-vps.md`) — no confundirlas.
- **11/11 tablas responden HTTP 200** con la publishable key (`sb_publishable_...`), verificadas una a una.
- **Datos reales:** `leads_agencialquimia` (3 filas, leads reales con `cliente_nombre`, `cliente_correo`, `fecha_cita`, `cliente_telefono`), `radar_queries` (4 filas); `chat_messages`, `n8n_chat_histories`, `ideas_agencia` vacías.
- **Nota sobre descubrimiento:** la spec OpenAPI de `/rest/v1/` no lista tablas con la publishable key (requiere service role) → el código usa correctamente el **fallback de sondas paralelas** sobre las 11 candidatas.
- **Suite completa en verde:** `npx tsc --noEmit` ✓ · `npm run lint` ✓ · `npm test` (6/6) ✓ · `npm run build` ✓.
- **Archivos canónicos (implementación real):** `app/api/admin/tables/route.ts`, `app/api/admin/data/route.ts`, `components/admin/DataTable.tsx`, integración en `app/admin/page.tsx` (pestaña "Tablas Supabase"). Los `examples/` de esta skill quedan como referencia conceptual, superados por la implementación.
