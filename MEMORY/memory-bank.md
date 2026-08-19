# Memory Bank — Banco de Memoria a Largo Plazo: AgenciAlquimia 🧠

Este documento constituye el **Banco de Memoria a Largo Plazo** del proyecto **AgenciAlquimia**. Su propósito es almacenar el contexto del negocio, la arquitectura técnica, las decisiones de diseño, el historial de auditorías y las directivas de desarrollo para garantizar continuidad, estabilidad y cero regresiones en futuras iteraciones.

> **Última actualización:** 16 de agosto de 2026 — registro de la nueva situación actual: despliegue en producción sobre VPS propio y desarrollo vía git worktrees.

---

## 1. Visión del Negocio & Identidad de Marca

* **Nombre Comercial:** AgenciAlquimia
* **Ubicación Base:** Santiago de Compostela, Galicia, España.
* **Propuesta de Valor:** Creación e instalación de ecosistemas de automatización con Inteligencia Artificial para Pymes y negocios locales (atención al cliente 24/7, cualificación de prospectos, agenda automática y procesamiento inteligente de documentos).
* **Público Objetivo:** Clínicas, restaurantes, inmobiliarias, academias, comercios locales y empresas de servicios profesionales en Galicia.
* **Tono de Comunicación:** Comercial, directo, profesional, moderno y fuertemente orientado a resultados y conversión de leads.
* **Teléfono Oficial Corporativo:** `+34 604 051 111` (Matías Idiart)
* **Email Oficial:** `hola@agencialquimia.com`

---

## 2. Situación Actual — Despliegue en VPS Propio (Agosto 2026) 🖥️

> **Cambio fundamental:** el proyecto ya **NO se despliega en Vercel**. Producción corre **24/7 en el VPS propio de AgenciAlquimia** (esta máquina). Todo el desarrollo se realiza directamente en el VPS mediante **git worktrees**.

### Hosting y Ejecución en Producción

* **Servidor:** VPS propio (dominio `agencialquimia.com`; subdominio del agente IA: `cerebro.agencialquimia.com`).
* **Plataforma de despliegue:** **Coolify** (PaaS self-hosted en el VPS). Cada push a `main` dispara la construcción de una imagen Docker etiquetada con el **hash del commit** y el despliegue del contenedor (Next.js v15.5.22 con `next start` dentro del contenedor, cwd `/app`).
* **Proxy reverso:** **Traefik** (`coolify-proxy`) en los puertos **80/443**.
* **Cache de estáticos:** `nginx.conf` del repo — caché inmutable de 1 año (`max-age=31536000, immutable`) para `/assets`, `/images`, `/fonts` y `/videos`.
* **Supabase:** **dos instancias** (ver subsección dedicada abajo):
  - **Supabase Cloud** (`ybqzcxabblyzqhezanaf.supabase.co`) → **es el que usa la web** (datos reales de leads/chat vía el explorador del admin).
  - **Supabase self-hosted en el VPS** (stack docker completo: auth, storage, kong, studio, postgrest...) → instancia separada, la web **no la consume**.
* **Otra infraestructura dockerizada:** n8n (puerto **5678**, expuesto vía `https://cerebro.agencialquimia.com`), PostgreSQL (**5432**).

### Supabase: dos instancias y panel admin conectado (Agosto 2026)

* **Instancia principal (producción web):** Supabase **Cloud** `https://ybqzcxabblyzqhezanaf.supabase.co` — **11 tablas** expuestas vía PostgREST, todas verificadas con HTTP 200 con la publishable key (`sb_publishable_...`, en `.env.local` como `PUBLIC_SUPABASE_URL`/`PUBLIC_SUPABASE_ANON_KEY`). Datos reales: `leads_agencialquimia` (3 filas), `radar_queries` (4), resto vacías.
* **Las 11 tablas:** `leads_agencialquimia`, `leads_hunter`, `chat_messages`, `chat_messages_alquimia`, `chat_messages_cerebro`, `conversaciones_alquimia`, `n8n_chat_histories`, `control_rutas`, `ideas_agencia`, `objetivos_agencia`, `radar_queries`.
* **Explorador en el panel admin:** pestaña "Tablas Supabase" en `app/admin/page.tsx` → API routes server-side `app/api/admin/tables/route.ts` (descubrimiento por OpenAPI + sondas paralelas + fallback) y `app/api/admin/data/route.ts` (filas paginadas con `Prefer: count=exact` + fallback mock) → componente `components/admin/DataTable.tsx` (dropdown de tablas, columnas auto-detectadas, badges, estado de carga, banner de Modo Vista Previa si falla la conexión). Sin `@supabase/supabase-js` (fetch nativo).
* **Instancia secundaria (VPS):** stack docker en Coolify `jo0oosc8c0k088gg0kowokco` con tablas en esquema `public` (`leads_agencialquimia` 2 filas, `chat_messages` 126, `objetivos_agencia` 0) y `fruteria` (demo). Acceso y credenciales: `notes/supabase-vps.md` + skill `supabase-sql`.
* **⚠️ Incidente de borrado periódico (16-ago):** Descubierto un proceso externo que borra sistemáticamente las subcarpetas del worktree a las HH:41:44. Defensa activa implementada: `auditd` para capturar el PID/comando, y rsync periódico a `/root/backups/agencialquimia/proteccion/` (máx. 10 min de pérdida). Recuperación exitosa probada restaurando el código.

### Repositorio y Flujo de Trabajo

* **Remoto:** `git@github.com:KIWIONER/agencialquimia.git` — rama `main`, sincronizada con `origin/main`.
* **Worktree de desarrollo (este repo):** `/root/.openclaw/worktrees/agencialquimia-web`.
* **Proyecto hermano:** `/root/agencialquimia-agent` — agente/automatización n8n asociada a la web.
* **Entorno:** `.env.local` con `N8N_WEBHOOK_URL=https://cerebro.agencialquimia.com/webhook/v1/agente/consulta` (proxy `/api/chat` → n8n, timeout 8s y resiliencia CRO a WhatsApp).

### Nota sobre rutas antiguas

* Las rutas estilo `c:/Proyectos/agencialquimia/` (Windows) que aparecen en secciones posteriores están **obsoletas**: la ubicación real del código es la del worktree en el VPS indicada arriba.

---

## 3. Arquitectura de Software & Stack Tecnológico

El proyecto se encuentra 100% migrado, corregido y unificado bajo un único ecosistema **Next.js (App Router)**:

```
/root/.openclaw/worktrees/agencialquimia-web/   # Worktree en el VPS
├── app/                        # Next.js App Router (Páginas, Rutas de API y Layouts)
│   ├── admin/                  # Dashboard de Administración unificado (/admin)
│   ├── api/chat/               # Backend Proxy Seguro para el agente de n8n (/api/chat)
│   ├── aviso-legal/            # Página legal nativa en TypeScript (/aviso-legal)
│   ├── politica-de-privacidad/ # Página legal nativa en TypeScript (/politica-de-privacidad)
│   ├── robots.ts               # Generador dinámico nativo de robots.txt (/robots.txt)
│   ├── sitemap.ts              # Generador dinámico nativo de sitemap.xml (/sitemap.xml)
│   ├── globals.css             # Estilos globales con fallbacks WPO y tokens de TailwindCSS v4
│   ├── layout.tsx              # Root Layout con fuentes precargadas (WPO), JsonLd y Preconnect
│   └── page.tsx                # Landing Page Principal en Dark Charcoal Theme (#0b0d10)
├── components/                 # Componentes React TSX Modulares (Navbar, Hero, Services, Demos, etc.)
├── public/                     # Recursos estáticos servidos nativamente por Next.js (assets, favicons)
├── lib/                        # Utilidades centralizadas (metadata.ts para SEO)
├── types/                      # Interfaces TypeScript strictly (chat.ts)
├── services/                   # Microservicios auxiliares sidecar de AgenciAlquimia
│   └── python-core/            # Microservicio FastAPI de alto rendimiento (scraping, scoring)
├── docs/                       # Documentación y planos detallados de integración
├── next.config.mjs             # Configuración de compilación SWC y compresión Brotli/Gzip
├── .env.local / .env.example   # Variables de entorno parametrizadas (N8N_WEBHOOK_URL)
├── .github/                    # Planes de implementación (implementation-plan.md)
├── audit/                      # Auditoría técnica detallada (AUDIT.md)
└── MEMORY/                     # Banco de memoria a largo plazo (memory-bank.md)
```

### Tabla de Tecnologías

| Dominio | Tecnología Seleccionada | Versión / Estado |
| :--- | :--- | :--- |
| **Framework Base** | Next.js (App Router) | v15.5.22 |
| **Biblioteca UI** | React | v19.0.0 |
| **Lenguaje Oficial** | TypeScript (`.tsx`, `.ts`) | v5.7.3 (Tipado estricto con 0 errores) |
| **Sistema de Estilos** | TailwindCSS v4 + PostCSS | v4.0.0 (`@tailwindcss/postcss`) |
| **Iconografía** | Lucide React | v0.474.0 |
| **Integración IA** | Webhook n8n vía API Proxy | Parametrizado vía `process.env.N8N_WEBHOOK_URL` |
| **Base de Datos / BaaS** | — | Sin BaaS en uso (Supabase retirado en agosto 2026: dependencia sin uso) |
| **Tipografía** | Google Fonts via `next/font` | *Space Grotesk* & *Inter* (Precarga WPO habilitada) |

---

## 4. Sistema de Diseño Visual, Accesibilidad & WPO (Dark Charcoal Theme)

* **Fondo Principal:** `#0b0d10` (negro-grisáceo carbón profundo) con entramado radial esmeralda (`rgba(16, 185, 129, 0.12)`).
* **Tarjetas y Módulos:** `#161a22` (`glass-card-dark`) con desenfoque de fondo (`backdrop-blur`) y bordes de cristal (`rgba(255, 255, 255, 0.08)`).
* **Acentos de Marca Neón:** `#10b981` (verde esmeralda) y `#34d399` (verde neón brillante).
* **Cumplimiento Accesibilidad WCAG 2.1 AA:** Ratios de contraste > 5.5:1 en todos los textos (`text-gray-200`, `text-emerald-300`).
* **Optimización WPO (Zero FOIT):** Pila de fuentes del sistema (`system-ui`, `-apple-system`, `Roboto`, `sans-serif`) como fallback directo mientras carga la fuente `.woff2` en paralelo.

---

## 5. Soluciones de Auditoría & WPO Resueltas

1. **Ajuste de Ratios de Contraste WCAG 2.1 AA:**
   - Elevados los textos secundarios en [components/Demos.tsx](components/Demos.tsx), [components/Footer.tsx](components/Footer.tsx) y [components/Services.tsx](components/Services.tsx) a `text-gray-200` y `text-emerald-300`, superando la exigencia de contraste 4.5:1 en Lighthouse.
2. **Compresión SWC y Minificación de JS:**
   - Creado [next.config.mjs](next.config.mjs) habilitando compresión global y limpieza de `console.log` en producción.
3. **Motores Dinámicos de SEO Nativo:**
   - Creados [app/robots.ts](app/robots.ts) y [app/sitemap.ts](app/sitemap.ts).
4. **Eliminación de la Cadena Crítica LCP Bloqueante:**
   - Habilitado `preload: true` en `next/font/google` e inyectadas etiquetas `preconnect`.
5. **Proxy Backend Seguro para IA (`/api/chat`):**
   - Parametrizado con `process.env.N8N_WEBHOOK_URL` y timeout de 8s con resiliencia CRO a WhatsApp.

---

## 6. Reglas & Directivas de Desarrollo Permanentes

* **Tipado TypeScript Estricto:** Prohibido el uso de `any` no tipado. Definir contratos en `types/`.
* **Comentarios y Documentación Exhaustiva:** Todo archivo nuevo o modificado DEBE incluir un bloque de comentarios superior JSDoc en español y comentarios explicativos en cada función y sección JSX.
* **Verificación Automatizada:** Antes de dar por finalizada una tarea, se debe verificar `npx tsc --noEmit` y `npm run build` con 0 errores.
* **Preservación del Negocio:** Conservar todo el copy comercial orientado a pymes en español de España.

---

## 7. Historial de Hitos y Estado de Compilación

| Fecha | Hito Alcanzado | Estado de Validación |
| :--- | :--- | :---: |
| **Julio 2026** | Creación de `CONTEXT.md` y auditoría inicial `AUDIT.md`. | ✅ Verificado |
| **Julio 2026** | Migración completa a Next.js 15, React 19, TS y Tailwind v4 (5 Fases). | ✅ `npx tsc --noEmit`: 0 Errores |
| **Julio 2026** | Aplicación del Tema Negro-Grisáceo (`#0b0d10`) y botón `/admin` en `Navbar`. | ✅ `npm run build`: 2.6s Éxito |
| **Julio 2026** | Creación de `MEMORY/memory-bank.md` para persistencia a largo plazo. | ✅ Registrado |
| **Julio 2026** | Ejecución de la Fase 5: Estructuración `/public`, páginas legales y `.env.local`. | ✅ 8/8 páginas compiladas |
| **Julio 2026** | Optimización WPO LCP: Precarga WOFF2, `preconnect` e inyección fallback Zero FOIT. | ✅ 8/8 páginas en 3.0s |
| **Julio 2026** | Creación de `next.config.mjs`, `app/robots.ts` y `app/sitemap.ts` nativos. | ✅ 10/10 rutas en 5.0s |
| **Julio 2026** | Corrección de Contraste WCAG 2.1 AA en `Demos.tsx`, `Footer.tsx` y `Services.tsx`. | ✅ 10/10 rutas en 2.5s |
| **Agosto 2026** | Despliegue en producción sobre **VPS propio** (nginx + `next start`) y desarrollo vía **git worktrees** (`/root/.openclaw/worktrees/agencialquimia-web`). | ✅ En producción |
| **Agosto 2026** | Conexión en vivo con **Supabase Cloud** (`ybqzcxabblyzqhezanaf`): explorador de las **11 tablas** en el admin (`/admin` → pestaña Tablas Supabase) con API routes server-side y DataTable.tsx. Verificado: 11/11 tablas HTTP 200 + tsc/lint/test/build OK. | ✅ En producción |
| **Agosto 2026** | **Seguridad del Panel Admin:** Implementación de Login (`/admin/login`) mediante JWT nativo (`crypto.subtle`), validado por Next.js Middleware y guardado en cookie segura `HttpOnly`. 0 dependencias externas. | ✅ En producción |
| **Agosto 2026** | **Panel admin avanzado:** diagrama n8n drag & drop con Guardar funcional (PUT `{name,nodes,connections,settings}`), detalle de nodos, pipeline kanban de leads (columna `etapa`), chat con **Max** (webhook `max-whatsapp`, Gemini 2.5 Pro + memoria) e historial de ejecuciones. | ✅ tsc/build OK |
| **Agosto 2026** | **Auditoría de seguridad + 4 arreglos:** ① rol Postgres de Max → rol limitado `n8n_max` (Supabase Cloud); ② PIN 2 pasos del número WhatsApp activado; ③ clave de cifrado de n8n rotada (15/15 credenciales re-cifradas + 5 API keys JWT re-firmadas + SSH key sourceControl); ④ token System User documentado con rotación manual. Detalle en `notes/permisos-whatsapp.md`. | ✅ API 200 + 7 workflows activos |
| **Agosto 2026** | **Seguridad de APIs & Resiliencia:** Blindaje de todas las APIs admin (`/api/admin/*`) mediante JWT y cookie HttpOnly. Implementación de Rate Limiting por IP (15 req/min) en `/api/chat/route.ts` contra denegación de servicio. | ✅ Completado (0 lints/0 tsc/build OK) |
| **Agosto 2026** | **Integración de Python (Fase 1):** Creación del plan completo de integración de Python (FastAPI sidecar) y estructuración de la Fase 1 (creación de directorios, `pyproject.toml`, `Dockerfile`, `main.py`, entorno virtual y dependencias). | ✅ Fase 1 Completada (Health check listo) |
| **Agosto 2026** | **Integración de Python (Fase 2):** Módulo de seguridad inter-servicio: `dependencies/auth.py` con verificación HMAC SHA-256 en FastAPI + `lib/python-client.ts` cliente firmador en Next.js. Tests: health 200 OK, firma válida 200 OK, firma inválida 403 Forbidden. | ✅ Fase 2 Completada (Push OK python-core) |

