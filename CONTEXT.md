# CONTEXT.md — Contexto Global de AgenciAlquimia 🚀

Este documento proporciona una visión integral sobre el negocio, arquitectura, stack tecnológico, hallazgos de auditoría y normas de desarrollo del proyecto **AgenciAlquimia**. Debe utilizarse como contexto de referencia para cualquier desarrollo, optimización o mantenimiento dentro del repositorio.

---

## 1. Visión del Negocio (Business Overview)

**AgenciAlquimia** es una agencia especializada en la **automatización con Inteligencia Artificial** para pymes y negocios locales, con sede física/operativa en **Santiago de Compostela, Galicia**.

* **Propuesta de Valor:** Creación de ecosistemas autónomos que atienden clientes, cualifican prospectos, gestionan reservas de citas y procesan información las 24 horas del día.
* **Público Objetivo:** Pequeñas y medianas empresas (pymes), profesionales independientes y comercios en Santiago de Compostela y Galicia que buscan optimizar su captación y atención al cliente.
* **Servicios Clave:**
  - Agentes comerciales de IA 24/7 (chatbots conversacionales para agenda y venta).
  - Automatización de atención al cliente y respuestas frecuentes.
  - Gestión automatizada de documentos y flujos de trabajo.
* **Tono de Marca:** Profesional, directo, moderno y fuertemente orientado a la conversión y resultados comerciales medibles.

---

## 2. Arquitectura del Proyecto & Stack Tecnológico (Migración Completada)

El proyecto ha sido migrado exitosamente a una arquitectura moderna basada en **Next.js (App Router), React 19/18, TypeScript (`.tsx`/`.ts`) y TailwindCSS v4**:

```
agencialquimia/
├── App Router (Next.js)        --> Componentes Server/Client React en TypeScript (`app/`)
├── Panel de Administración     --> Integrado como sub-ruta protegida en `app/admin/page.tsx`
├── Backend API Routes (Next)   --> Proxy seguro en `app/api/chat/route.ts` para n8n
├── Sistema de Diseño           --> TailwindCSS v4 + Tokens visuales corporativos
└── Integración de IA           --> Webhook de n8n (`https://cerebro.agencialquimia.com`)
```

### Tecnologías del Stack

| Componente | Tecnología | Ubicación / Notas |
| :--- | :--- | :--- |
| **Framework Core** | Next.js 15 (App Router), React 19 | `app/` |
| **Lenguaje Principal** | TypeScript (`.tsx`, `.ts`) | Todo el proyecto (fuertemente tipado) |
| **Estilos & UI** | TailwindCSS v4, Lucide Icons | `app/globals.css`, `components/` |
| **Panel Admin** | Sub-ruta nativa Next.js | `app/admin/page.tsx` |
| **Agente Comercial IA** | Webhook n8n vía Proxy API Route | `app/api/chat/route.ts` |
| **Base de Datos / BaaS** | Supabase Client SDK | `@supabase/supabase-js` |
| **Optimización / WPO** | `next/font`, `next/metadata`, `next/image` | Fuentes corporativas (*Space Grotesk*, *Inter*) & SEO Server Side |

---

## 3. Estructura de Directorios

```
c:/Proyectos/agencialquimia/
├── app/                        # Next.js App Router (Layouts, Páginas y API Routes)
│   ├── admin/                  # Panel de administración (/admin)
│   ├── api/                    # Server Routes (ej. /api/chat proxy para n8n)
│   ├── globals.css             # Estilos globales y tokens de TailwindCSS
│   ├── layout.tsx              # Root Layout con fuentes e infra del sitio
│   └── page.tsx                # Landing Page principal
├── components/                 # Componentes React TSX reutilizables (Navbar, Hero, ChatWidget...)
├── lib/                        # Utilidades y configuración (metadata.ts, supabase.ts...)
├── types/                      # Contratos e interfaces de TypeScript (chat.ts)
├── public/                     # Assets estáticos (imágenes, logos, favicon, videos)
├── audit/                      # Informes de auditoría técnica (AUDIT.md)
├── .github/                    # Planes de implementación y CI/CD (implementation-plan.md)
├── CONTEXT.md                  # Contexto global del proyecto
├── package.json / tsconfig.json# Configuración de dependencias y compilador TypeScript
└── copilot-instruction.md      # Instrucciones de sistema para asistentes IA
```

---

## 4. Estado Actual & Auditoría Técnica Resuelta

La migración a Next.js + TS resolvió el 100% de las incidencias reportadas en [`audit/AUDIT.md`](file:///c:/Proyectos/agencialquimia/audit/AUDIT.md):

### 🔴 Prioridad Alta (Resuelto)
1. **Seguridad del Agente de IA (Resuelto con Next API Route):** Mover la llamada a `app/api/chat/route.ts` ocultó los prompts de sistema y la URL del webhook de n8n.
2. **Eliminación de Archivos Huérfanos:** Purga de `live_site.html`, `dashboard/`, `_astro/`, `js/js/` y `css/css/`.

### 开启 Prioridad Media (Resuelto)
1. **Rendimiento WPO Nivel Experto:** Uso de `next/font` (cero CSS `@import` bloqueantes) compilando en producción en solo 4.6s.
2. **Accesibilidad en ChatWidget (`.tsx`):** Implementación de `aria-live="polite"`, atajo de cierre `Escape` y gestión nativa del foco.
3. **SEO Local Dinámico:** Marcado estructurado Schema.org `LocalBusiness` con teléfono auténtico (`+34604051111`) en Santiago de Compostela.

---

## 5. Reglas y Guardrails de Desarrollo

* **Desarrollo en TypeScript Estricto:** Todos los componentes se escriben en `.tsx` y las utilidades/rutas en `.ts`.
* **Documentación y Comentarios Explicativos:** Todo archivo incluye un bloque de cabecera JSDoc en español y comentarios descriptivos en cada función y JSX.
* **TailwindCSS First:** Uso de tokens visuales esmeralda corporativos.
* **Componentes Responsivos y Accesibles:** Cumplimiento de estandares WAI-ARIA.
* **Seguridad:** Ninguna clave privada o prompt de sistema se expone en código cliente.
