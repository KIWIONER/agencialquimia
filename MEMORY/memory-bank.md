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
│   ├── globals.css             # Hojas de estilo globales y tokens de TailwindCSS v4
│   ├── layout.tsx              # Root Layout con fuentes optimizadas y marcado JsonLd
│   └── page.tsx                # Landing Page Principal en Dark Charcoal Theme (#0b0d10)
├── components/                 # Componentes React TSX Modulares (Navbar, Hero, Services, etc.)
├── public/                     # Recursos estáticos servidos nativamente por Next.js (assets, favicons)
├── lib/                        # Utilidades centralizadas (metadata.ts para SEO)
├── types/                      # Interfaces TypeScript estrictas (chat.ts)
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
| **Tipografía** | Google Fonts via `next/font` | *Space Grotesk* (Titulares), *Inter* (Cuerpo) |

---

## 3. Sistema de Diseño Visual (Dark Charcoal Theme)

El diseño visual sigue la estética **Dark Charcoal Premium**:

* **Fondo Principal:** `#0b0d10` (negro-grisáceo carbón profundo) con entramado radial esmeralda (`rgba(16, 185, 129, 0.12)`).
* **Tarjetas y Módulos:** `#161a22` (`glass-card-dark`) con desenfoque de fondo (`backdrop-blur`) y bordes de cristal (`rgba(255, 255, 255, 0.08)`).
* **Acentos de Marca Neón:** `#10b981` (verde esmeralda) y `#34d399` (verde neón brillante).
* **Textos:** `#ffffff` en encabezados y `#9ca3af` / `#f3f4f6` en textos descriptivos.
* **Barra de Navegación (`Navbar.tsx`):** Glassmorphism fijo con botón de enlace al **Panel Admin** (`/admin`) y botón CTA **Chat IA 24/7**.

---

## 4. Soluciones de Seguridad & Auditoría Resueltas

1. **Proxy Backend Seguro para IA (`/api/chat`):**
   - Parametrizado con `process.env.N8N_WEBHOOK_URL`.
   - Elimina la inyección de prompts en el navegador cliente.
   - Aplica un timeout de 8 segundos y ofrece botones de resiliencia CRO hacia WhatsApp en caso de fallo.
2. **Acceso a Lectores de Pantalla (`aria-live="polite"`):**
   - El widget [ChatWidget.tsx](file:///c:/Proyectos/agencialquimia/components/ChatWidget.tsx) incluye regiones vivas ARIA y control por teclado (`Escape`).
3. **Páginas Legales Nativas:**
   - Creados los componentes `/aviso-legal` y `/politica-de-privacidad` en Next.js, eliminando errores 404 en el footer.
4. **Estructura de Recursos Estáticos (`public/`):**
   - Creado el directorio `public/assets/`, `public/favicon.ico` y `public/favicon.svg` para servir imágenenes e iconos nativamente sin roturas.
5. **SEO Local Auténtico:**
   - Corrección del teléfono falso en Schema.org `LocalBusiness` ([components/JsonLd.tsx](file:///c:/Proyectos/agencialquimia/components/JsonLd.tsx)) asignando `+34604051111`.
6. **Limpieza de Código Huérfano:**
   - Purga completa de `live_site.html`, `dashboard/`, `_astro/`, `js/js/`, `css/css/`, `admin/` legado e `index.html` estático.

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
| **Julio 2026** | Ejecución de la Fase 5: Estructuración `/public`, páginas legales y `.env.local`. | ✅ 8/8 páginas compiladas en 2.5s |
