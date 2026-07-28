# Memory Bank — Banco de Memoria a Largo Plazo: AgenciAlquimia 🧠

Este documento constituye el **Banco de Memoria a Largo Plazo** del proyecto **AgenciAlquimia**. Su propósito es almacenar el contexto del negocio, la arquitectura técnica, las decisiones de diseño, el historial de auditorías y las directivas de desarrollo para garantizar continuidad, estabilidad y cero regresiones en futuras iteraciones.

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

## 2. Arquitectura de Software & Stack Tecnológico

El proyecto se encuentra 100% migrado, corregido y unificado bajo un único ecosistema **Next.js (App Router)**:

```
agencialquimia/
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
├── components/                 # Componentes React TSX Modulares (Navbar, Hero, Services, etc.)
├── public/                     # Recursos estáticos servidos nativamente por Next.js (assets, favicons)
├── lib/                        # Utilidades centralizadas (metadata.ts para SEO)
├── types/                      # Interfaces TypeScript estrictas (chat.ts)
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
| **Base de Datos / BaaS** | Supabase JS Client | `@supabase/supabase-js` v2.48.1 |
| **Tipografía** | Google Fonts via `next/font` | *Space Grotesk* & *Inter* (Precarga WPO habilitada) |

---

## 3. Sistema de Diseño Visual & WPO (Dark Charcoal Theme)

* **Fondo Principal:** `#0b0d10` (negro-grisáceo carbón profundo) con entramado radial esmeralda (`rgba(16, 185, 129, 0.12)`).
* **Tarjetas y Módulos:** `#161a22` (`glass-card-dark`) con desenfoque de fondo (`backdrop-blur`) y bordes de cristal (`rgba(255, 255, 255, 0.08)`).
* **Acentos de Marca Neón:** `#10b981` (verde esmeralda) y `#34d399` (verde neón brillante).
* **Optimización WPO (Zero FOIT):** Pila de fuentes del sistema (`system-ui`, `-apple-system`, `Roboto`, `sans-serif`) como fallback directo mientras carga la fuente `.woff2` en paralelo.

---

## 4. Soluciones de Auditoría & WPO Resueltas

1. **Compresión SWC y Minificación de JS:**
   - Creado [next.config.mjs](file:///c:/Proyectos/agencialquimia/next.config.mjs) habilitando compresión global y limpieza de `console.log` en producción.
2. **Motores Dinámicos de SEO Nativo:**
   - Creado [app/robots.ts](file:///c:/Proyectos/agencialquimia/app/robots.ts) para generar `/robots.txt` (eliminando errores 404).
   - Creado [app/sitemap.ts](file:///c:/Proyectos/agencialquimia/app/sitemap.ts) para generar `/sitemap.xml`.
3. **Eliminación de la Cadena Crítica LCP Bloqueante:**
   - Habilitado `preload: true` en `next/font/google` ([app/layout.tsx](file:///c:/Proyectos/agencialquimia/app/layout.tsx)).
   - Inyectadas etiquetas `preconnect` a Google Fonts y `dns-prefetch` al servidor de n8n.
4. **Proxy Backend Seguro para IA (`/api/chat`):**
   - Parametrizado con `process.env.N8N_WEBHOOK_URL`.
   - Elimina la inyección de prompts en el navegador cliente y aplica timeout de 8s con resiliencia CRO a WhatsApp.
5. **Páginas Legales Nativas & Assets Estáticos:**
   - Componentes `/aviso-legal` y `/politica-de-privacidad` en Next.js.
   - Recursos servidos nativamente desde la carpeta `public/`.

---

## 5. Reglas & Directivas de Desarrollo Permanentes

* **Tipado TypeScript Estricto:** Prohibido el uso de `any` no tipado. Definir contratos en `types/`.
* **Comentarios y Documentación Exhaustiva:** Todo archivo nuevo o modificado DEBE incluir un bloque de comentarios superior JSDoc en español y comentarios explicativos en cada función y sección JSX.
* **Verificación Automatizada:** Antes de dar por finalizada una tarea, se debe verificar `npx tsc --noEmit` y `npm run build` con 0 errores.
* **Preservación del Negocio:** Conservar todo el copy comercial orientado a pymes en español de España.

---

## 6. Historial de Hitos y Estado de Compilación

| Fecha | Hito Alcanzado | Estado de Validación |
| :--- | :--- | :---: |
| **Julio 2026** | Creación de `CONTEXT.md` y auditoría inicial `AUDIT.md`. | ✅ Verificado |
| **Julio 2026** | Migración completa a Next.js 15, React 19, TS y Tailwind v4 (5 Fases). | ✅ `npx tsc --noEmit`: 0 Errores |
| **Julio 2026** | Aplicación del Tema Negro-Grisáceo (`#0b0d10`) y botón `/admin` en `Navbar`. | ✅ `npm run build`: 2.6s Éxito |
| **Julio 2026** | Creación de `MEMORY/memory-bank.md` para persistencia a largo plazo. | ✅ Registrado |
| **Julio 2026** | Ejecución de la Fase 5: Estructuración `/public`, páginas legales y `.env.local`. | ✅ 8/8 páginas compiladas |
| **Julio 2026** | Optimización WPO LCP: Precarga WOFF2, `preconnect` e inyección fallback Zero FOIT. | ✅ 8/8 páginas en 3.0s |
| **Julio 2026** | Creación de `next.config.mjs`, `app/robots.ts` y `app/sitemap.ts` nativos. | ✅ 10/10 rutas en 5.0s |
