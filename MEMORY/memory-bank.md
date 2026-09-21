# Memory Bank — Banco de Memoria a Largo Plazo: AgenciAlquimia 🧠

Este documento constituye el **Banco de Memoria a Largo Plazo** del proyecto **AgenciAlquimia**. Su propósito es almacenar el contexto del negocio, la arquitectura técnica, las decisiones de diseño, el historial de auditorías y las directivas de desarrollo para garantizar continuidad, estabilidad y cero regresiones en futuras iteraciones.

> **Última actualización:** 30 de agosto de 2026 — registro de dinamización del Hero banner, depuración de n8n webhook/Gemini rate limits, y resolución de hidratación/CSS tras recompilación.

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

> **Cambio fundamental:** el proyecto ya **NO se despliega en Vercel**. Todo corre sobre un **VPS propio con Coolify**, Docker y Traefik.

### Hosting y Ejecución en Producción
* **Servidor VPS:** `195.201.118.14` (Ubuntu / Debian).
* **Plataforma de Despliegue:** **Coolify** — gestión de contenedores Docker, variables de entorno, SSL automático (Let's Encrypt) y proxy inverso Traefik.
* **Dominio Principal:** `agencialquimia.com` (producción) y subdominios `cerebro.agencialquimia.com` (n8n), etc.
* **Pipeline de CI/CD:** cada `git push` a `main` dispara el webhook de Coolify → pull del código → build de la imagen Docker etiquetada con el hash del commit → despliegue sin caída de servicio (zero-downtime).
* **CI de Validación:** `.github/workflows/ci.yml` ejecuta typecheck (`tsc`), linter (`eslint`), tests (`vitest`) y build de Next.js en cada PR/push a `main`.

### Supabase: dos instancias y panel admin conectado (Agosto 2026)
* **Instancia Cloud (Legacy):** `aebewqtzmtyffsfsrbfd.supabase.co` — retiene leads históricos y el proyecto original.
* **Instancia Local en VPS (Producción):** desplegada en Coolify vía Docker (`195.201.118.14:8000`), con PostgreSQL nativo en puerto `5432` (`postgres://postgres:pw_...@195.201.118.14:5432/postgres`).
* **Panel Administrativo:** `/admin` conecta directamente a la base de datos PostgreSQL de Supabase en el VPS mediante el cliente `pg` (`lib/db.ts`) y variables `PANEL_DB_*` en `.env.local`.

### Repositorio y Flujo de Trabajo
* **Repositorio Git:** `git@github.com:KIWIONER/agencialquimia.git` (rama activa: `main`).
* **Entorno de Trabajo Local en VPS:** `/root/.openclaw/worktrees/agencialquimia-web` (alias symlink en `/root/agencialquimia-web`).
* **Protocolo de Push:** **NUNCA realizar `git push` sin confirmación explícita del usuario.**
* **Copias de Seguridad:** `/root/scripts/backup-agencialquimia.sh` (cron diario 05:00 UTC) genera snapshots y mirror del repositorio en `/root/backups/agencialquimia/`.

### Nota sobre rutas antiguas
Cualquier referencia en documentación anterior a `/home/mati/` o despliegues directos en Vercel queda obsoleta. Las rutas activas son exclusivamente las del VPS (`/root/.openclaw/worktrees/...`).

---

## 3. Arquitectura de Software & Stack Tecnológico

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            NAVEGADOR CLIENTE                            │
│  Next.js 15 (React 19) · TailwindCSS v4 · Space Grotesk · Inter         │
└──────────────┬─────────────────────────────┬─────────────────────────────┘
               │ HTTPS                       │ HTTPS (Proxy Next.js)
               ▼                             ▼
┌──────────────────────────────┐   ┌───────────────────────────────────────┐
│     Next.js App Router       │   │           n8n Webhook / API           │
│   (SSR / SSG / RSC / APIs)   │   │     cerebro.agencialquimia.com        │
│   /admin · /api/admin/*      │   │   Agente Maestro IA (Alex / Max)      │
└──────────────┬───────────────┘   └───────────────────┬───────────────────┘
               │                                       │
               ├───────────────────┬───────────────────┤
               ▼                   ▼                   ▼
┌──────────────────────────┐ ┌──────────────┐ ┌─────────────────────────────┐
│  PostgreSQL (Supabase)   │ │ FastAPI Core │ │  LLMs Externos (Gemini,    │
│  leads_agencialquimia    │ │ (Python 3.12)│ │  Anthropic Claude, Ollama)  │
│  conversaciones_alquimia │ │  Sidecar     │ └─────────────────────────────┘
└──────────────────────────┘ └──────────────┘
```

### Tabla de Tecnologías
| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework Web** | Next.js 15.1 (App Router) | Renderizado híbrido SSR/SSG, enrutamiento, Server Actions y APIs. |
| **Biblioteca UI** | React 19 + TypeScript (Strict) | Componentes tipados, interactividad y cero `any`. |
| **Estilos & Diseño** | TailwindCSS v4 + CSS Tokens | Tema Dark Charcoal (`#0b0d10`), tokens esmeralda y animaciones GPU. |
| **Orquestador IA** | n8n (`cerebro.agencialquimia.com`) | Flujos de cualificación de leads, agentes comerciales y WhatsApp. |
| **Microservicio Core** | FastAPI (Python 3.12 Sidecar) | Scraping asíncrono (Hunter), scoring predictivo ML y PDFs. |
| **Base de Datos** | PostgreSQL (Supabase VPS) | Almacén persistente de leads, sesiones de chat y métricas CRM. |
| **Testing** | Vitest + Testing Library | Suite de pruebas unitarias y de integración de componentes. |

---

## 4. Sistema de Diseño Visual, Accesibilidad & WPO (Dark Charcoal Theme)

* **Fondo Principal:** `#0b0d10` (Dark Charcoal).
* **Fondo de Tarjetas:** `#161a22` (`glass-card-dark`, blur `12px`).
* **Acentos Neón:** `#10b981` (Esmeralda Principal) y `#34d399` (Glow / Shimmer).
* **Tipografías:** *Space Grotesk* (titulares) e *Inter* (cuerpo y datos) precargadas vía `next/font`.
* **Accesibilidad:** Cumplimiento estricto WCAG 2.1 AA (contraste ≥ 4.5:1, etiquetas ARIA, navegación por teclado, regiones vivas `aria-live="polite"`).

---

## 5. Soluciones de Auditoría & WPO Resueltas

1. **Zero FOIT / FOUT:** Fuentes optimizadas con `next/font` y fallbacks del sistema.
2. **Animaciones Aceleradas por Hardware:** Uso exclusivo de `transform: translate3d(...)`, `opacity` y `will-change` para 60fps constantes sin repintados de layout.
3. **Seguridad Inter-Servicio:** Tokens JWT en cookies HttpOnly y firmas HMAC SHA-256 (`X-Internal-Signature`) para la comunicación con microservicios internos.

---

## 6. Reglas & Directivas de Desarrollo Permanentes

1. **PROHIBIDO GIT PUSH SIN PERMISO EXPLÍCITO:** Preguntar siempre al usuario antes de enviar cambios al remoto.
2. **TypeScript Estricto:** Tipado 100% explícito, contratos en `types/`.
3. **Documentación JSDoc en Español:** Cada archivo y componente debe incluir su cabecera explicativa.
4. **Verificación Cuádruple Obligatoria:** `npx tsc --noEmit`, `npm run lint`, `npm test` y `npm run build` deben pasar con 0 errores antes de entregar código.

---

## 7. Historial de Hitos y Registro de Cambios

| Fecha | Hito / Cambio | Validación Técnica |
| :--- | :--- | :--- |
| **Agosto 2026** | **Despliegue inicial en VPS propio con Coolify:** Migración desde Vercel a infraestructura Docker + Traefik con Supabase local en el servidor `195.201.118.14`. | ✅ CI/CD y despliegues OK |
| **Agosto 2026** | **Implementación del Sistema de Autenticación HMAC Red-Team en FastAPI:** Dependencia `verify_internal_signature` inyectable vía `fastapi.Depends()`, timestamps anti-replay y cliente `lib/python-client.ts`. | ✅ 9/9 pytest + 6/6 vitest + 0 lints |
| **Agosto 2026** | **Rediseño UI/UX y Filtros del Radar Hunter:** Filtros por sector, carencias digitales y palabras clave de exclusión con diseño WCAG 2.1 AA. | ✅ 0 lints / 0 tsc / Vitest OK |
| **30 Agosto 2026** | **Dinamización y Animaciones GPU del Hero Banner:** Orbes de luz flotantes multicapa (`@keyframes hero-float-1/2/3`), spotlight reactivo al cursor (`mousePos`), haz de escaneo continuo tipo radar y shimmer lumínico en "Solo.". | ✅ 13/13 vitest + 0 tsc / build OK |
| **30 Agosto 2026** | **Depuración y Hotfix del Chatbot IA (n8n Webhook & Fallback):** Corrección del error silencioso de respuesta `...` provocado por rate limits en Google Gemini (HTTP 429). Eliminado el fallback `'...'` en el nodo web de n8n e inyectado fallback conversacional profesional. Z-Index del widget elevado a `z-[9999]`. | ✅ API Route 200 OK + Flujo reactivo |
| **30 Agosto 2026** | **Reposicionamiento a Estudio de Arquitectura Web & Ecosistemas IA:** Actualización completa de Hero, Servicios (4 Pilares + Tabla Comparativa vs SaaS), Tarifas e Infraestructura Soberana. | ✅ 13/13 vitest + 0 lints / build OK |
| **30 Agosto 2026** | **Integración de las 6 Demos en Producción (incluyendo KineKids):** Incorporadas las 6 aplicaciones interactivas en vivo por sector (*Mercado La Galiciana*, *Frutería Nexus*, *Centro Melros*, *Portal Inmobiliario*, *Campus LMS*, *KineKids*). | ✅ Grid 3 col WCAG 2.1 AA |
| **30 Agosto 2026** | **Nuevo Favicon e Iconos Neón Vectoriales SVG:** Diseño de matraz/prisma alquímico con circuitos IA (`favicon.svg?v=2`, `app/icon.svg` y `favicon.ico`) con cache-busting. | ✅ HTTP 200 en navegadores |
| **31 Agosto 2026** | **Arquitectura de Cookies Seguras & Sesiones (FastAPI + Next.js):** Aplicación de la Metodología MARCO y Code Refinement Suite Nivel 3. La Muralla Técnica `HttpOnly`, firma HMAC anti-tampering, Seguridad por Ambigüedad (401 unificado), ciclo defensivo de 3 estados en React y creación de `docs/Orchid.md`. | ✅ 14/14 pytest + 17/17 vitest |
| **30 Agosto 2026** | **Resolución de Hidratación React y Servidor Dev (`next dev`):** Identificación y corrección de 404 en scripts de desarrollo (`main-app.js`, `polyfills.js`) por solapamiento de `next build`. Reinicio limpio y verificación de todas las rutas (`/`, `/admin`, `/api/chat`). | ✅ Todas las rutas 200 OK |

---

## 8. Reflexiones y Decisiones Clave Recientes (30 de Agosto de 2026) 📝

### 8.1. Dinamización Estética del Banner Principal
* **Problema:** El fondo del banner Hero presentaba un diseño estático que no transmitía el dinamismo y la vanguardia de una agencia de automatización con IA.
* **Solución Técnica:** Se implementó una arquitectura visual por capas:
  1. Fondo ambiental de puntos neón con haz de escaneo continuo (`animate-scan-line`).
  2. Tres orbes de luz líquida orgánica (`blur-[130px]` a `blur-[160px]`) animados con CSS puro y aceleración por GPU.
  3. Foco de luz interactivo (*Spotlight*) que calcula las coordenadas del cursor del usuario en tiempo real.
  4. Efecto de brillo metálico animado (*Shimmer*) para acentuar el término comercial "Solo." y aro pulsante en el badge corporativo.
* **Resultado:** Estética premium, fluida a 60fps sin sobrecargar la CPU ni aumentar el bundle de JavaScript.

### 8.2. Diagnóstico de Rate Limits y Fallbacks en el Webhook de n8n
* **Problema:** Los usuarios al interactuar con el chat recibían únicamente tres puntos `...` como respuesta.
* **Causa Raíz:** 
  1. La API Key de Google Gemini configurada en n8n (`lwiywrx976Ev9exU`) superó la cuota de peticiones gratuitas (`"The service is receiving too many requests from you"` - HTTP 429).
  2. El nodo de código `📤 Formatear Respuesta Web` en n8n tenía programado: `const output = $input.first()?.json?.output || '...';`, enviando `'...'` como respuesta válida HTTP 200 al frontend Next.js.
* **Solución Técnica:**
  1. Se actualizó el workflow de n8n (`7nM4PGPa5AqQJWbH`) mediante la API oficial para modificar la lógica del nodo `📤 Formatear Respuesta Web`, garantizando que ante cualquier fallo de la IA se entregue un mensaje empático y comercial.
  2. Se blindó el componente `ChatWidget.tsx` con capa `z-[9999]` y `pointer-events-auto` para evitar bloqueos táctiles o de clics.

### 8.3. Gestión de Caché `.next` y Concurrencia en Entorno de Desarrollo
* **Problema:** Pérdida momentánea de CSS (página en blanco) y enlaces inertes en el navegador (ni `/admin` ni el botón de chat abrían).
* **Causa Raíz:** La ejecución de `next build` en segundo plano mientras `next dev` seguía activo sobreescribió la carpeta `.next/` con manifiestos de producción, haciendo que `next dev` respondiese con `404` en los chunks `main-app.js` y `app-pages-internals.js`. Sin estos scripts, React no lograba hidratar el DOM y ningún manejador `onClick` se enlazaba.
* **Solución Técnica:**
  1. Terminación del proceso huérfano en el puerto 3000 (`fuser -k 3000/tcp`).
  2. Limpieza del directorio `.next/` y arranque limpio del servidor en modo daemon.
  3. Comprobación exhaustiva de que todos los chunks devuelven `HTTP 200 OK` y el CSS de 112 KB se inyecta con éxito.


### 8.4. Arquitectura de Cookies Seguras, Metodología MARCO y Sesiones en FastAPI
* **Objetivo:** Establecer una gestión de identidad y sesiones impenetrable frente a vulnerabilidades XSS y ataques de fuerza bruta, garantizando la interoperabilidad fluida entre Next.js 15 y el microservicio FastAPI Core.
* **Decisiones Arquitectónicas Adoptadas:**
  1. **La Muralla Técnica (`HttpOnly` + `Secure` + `SameSite=Lax`):** Prohibición absoluta de almacenar tokens JWT o identificadores en `localStorage` (vulnerables a robo por XSS). Las cookies solo viajan en las cabeceras HTTP del protocolo.
  2. **Firma Criptográfica Anti-Tampering (`lib/security_cookies.py`):** Las cookies de visitantes anónimos (`alquimia_visitor`) se emiten en formato `UUID.HMAC_SHA256`. Cualquier intento de manipulación en el cliente es detectado de inmediato, regenerando la sesión de forma limpia.
  3. **Seguridad por Ambigüedad en Autenticación:** Respuestas HTTP 401 unificadas (`"Credenciales inválidas"`) en los endpoints de login (`/api/admin/login` y `/session/login`), imposibilitando la enumeración de usuarios en ataques de fuerza bruta.
  4. **Patrón Reactivo de los 3 Estados (`data`, `error`, `isLoading`):** Encapsulación con `try / catch / finally` donde el bloque `finally` desactiva siempre los spinners de carga y se bloquean dobles envíos mediante `disabled={isLoading}`.
  5. **Documentación de Aprendizaje (`docs/Orchid.md`):** Creación del documento de síntesis MARCO para contrastar la interpretación inicial del requerimiento con la solución técnica implementada.
