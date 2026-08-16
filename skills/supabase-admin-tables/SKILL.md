---
name: supabase-admin-tables
description: Renderizar en el panel admin (/admin) las tablas creadas en Supabase (self-hosted en el VPS). Usar para conectar el admin a datos reales, sustituir los leads mock o añadir vistas de tablas sin código específico.
---

# Skill: supabase-admin-tables

## Cuándo usar esta skill

- Conectar el panel de administración (`/admin`) a datos reales de Supabase.
- Sustituir los leads mock de `app/admin/page.tsx` por los de una tabla real.
- Añadir una vista genérica de cualquier tabla (leads, clientes, mensajes...) sin escribir código específico por tabla.

## Contexto del proyecto (verificado)

- **Panel admin:** `app/admin/page.tsx` — client component con sidebar y tabs (`dashboard | leads | trainer | settings`); los leads son un array mock hardcodeado; solo visible en desktop (bloqueo móvil).
- **Supabase:** self-hosted en el VPS (docker, proyecto Coolify `jo0oosc8c0k088gg0kowokco`). Datos de conexión en `notes/supabase-vps.md` y en la skill `supabase-sql`.
- **API:** PostgREST vía Kong. URL y anon key ya inyectadas por Coolify en el env del contenedor web:
  - `PUBLIC_SUPABASE_URL` (ej. `http://supabasekong-*.195.201.118.14.sslip.io`)
  - `PUBLIC_SUPABASE_ANON_KEY` (pública por diseño)
- **⚠️ Importante:** `@supabase/supabase-js` **no está instalado** (se retiró en el saneo de agosto 2026). Usar `fetch` nativo en server (API route o server component). Si se prefiere el SDK, reinstalar: `npm i @supabase/supabase-js`.

## Arquitectura recomendada

```
Admin (/admin)  →  API route Next (server)  →  PostgREST (Kong)  →  Supabase DB
```

1. **Server-side siempre**: las llamadas a Kong van en API routes o server components; el cliente solo consume la API route del propio Next. La anon key es pública, pero centralizar en server evita duplicar lógica y facilita añadir auth real luego.
2. **Descubrimiento de tablas** (sin SQL): `GET {PUBLIC_SUPABASE_URL}/rest/v1/` con cabeceras `apikey` + `Authorization: Bearer` devuelve la **spec OpenAPI** de PostgREST — los paths `/rest/v1/<tabla>` listan las tablas expuestas.
3. **Datos de una tabla**: `GET {PUBLIC_SUPABASE_URL}/rest/v1/{tabla}?select=*&limit=100&offset=0&order=<columna>.asc`.
4. **Render genérico**: componente `DataTable` que deriva columnas de la primera fila (o del schema OpenAPI), con estados loading/error, badges para valores de estado y celdas JSON colapsadas.

## Pasos de implementación

1. **Env**: confirmar `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` en el contenedor (inyectadas por Coolify). Añadir ambos a `.env.example` como documentación.
2. **API route**: crear `app/api/admin/tables/route.ts` (lista de tablas vía OpenAPI) y `app/api/admin/data/route.ts` (filas de una tabla, con `limit/offset/order` por query params). Seguir el patrón de `app/api/chat/route.ts` (timeout, manejo de errores).
3. **Componente**: `components/admin/DataTable.tsx` — tabla genérica con las columnas detectadas; estilos con los tokens del admin (`slate-950`, `slate-900`, acento `emerald-500`).
4. **Integración**: en `app/admin/page.tsx`, sustituir el array mock de `leads` por el fetch de la tabla configurada (ej. `leads`) usando la API route; mantener los badges de estado (`Pendiente | Enviado a IA | Finalizado`).
5. **Verificación obligatoria**: `npx tsc --noEmit` · `npm run lint` · `npm test` · `npm run build` — 0 errores.

## Seguridad

- **Solo anon key en este patrón**; la service role key jamás en el cliente ni en la web.
- **RLS**: las tablas expuestas deben tener Row Level Security activo; conceder solo lo necesario: `GRANT SELECT ON public.<tabla> TO anon, authenticated;` (y UPDATE/INSERT solo si el admin los necesita).
- El panel `/admin` hoy **no tiene autenticación real** (solo es una ruta). No añadir datos sensibles vía esta skill sin planificar auth (fuera de su alcance; avisar al responsable).
- No loguear filas con datos personales.

## Verificación tras implementar

- `curl -H "apikey: $ANON" "$PUBLIC_SUPABASE_URL/rest/v1/"` → 200 con spec OpenAPI.
- API route local: `curl http://localhost:3000/api/admin/tables` → 200 con JSON.
- En el admin: la tabla renderiza columnas reales, paginación y estados de error visibles.
- `npm run build` → 0 errores (y Coolify desplegará en el push).

## Archivos de ejemplo

- `examples/route.ts` — API route genérica (tablas + datos).
- `examples/DataTable.tsx` — componente de tabla genérico.
