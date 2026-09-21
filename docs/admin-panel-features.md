# 📋 Funcionalidades del Panel Administrativo de AgenciAlquimia

Este documento lista las funcionalidades clave, tanto actuales como planificadas, del panel administrativo (`/admin`) de AgenciAlquimia, sirviendo como una referencia consolidada del alcance y las capacidades del sistema de gestión.

---

### 📋 Funcionalidades Actuales y Planificadas del Panel Administrativo (`/admin`)

**1. Acceso y Seguridad (Panel Core):**

*   **Login Administrativo:**
    *   Mediante JWT nativo (`crypto.subtle`).
    *   Validado por Next.js Middleware.
    *   Guardado en cookie segura `HttpOnly`.
    *   **¡Mejora Planificada!** (Ver `docs/admin-login-implementation-plan.md`):
        *   **Candados visuales:** En inputs de email y contraseña para indicar acceso restringido.
        *   **Mensaje explicativo:** Debajo del formulario de login, educando al usuario externo sobre la política de acceso y canalizándolo hacia la "primera llamada/chat de registro".
        *   **Llamada a la acción (CTA):** Enlaces directos al chat o sistema de agendamiento de llamadas.
*   **Blindaje de API Routes:** Todas las APIs admin (`/api/admin/*`) protegidas con JWT y cookie `HttpOnly`.
*   **Rate Limiting:** Implementación de Rate Limiting por IP (15 req/min) en `/api/chat/route.ts` (prevención DoS).

**2. Explorador y Gestión de Datos (Supabase Cloud):**

*   **Explorador de Tablas Supabase:**
    *   Pestaña "Tablas Supabase" en `app/admin/page.tsx`.
    *   Descubrimiento de tablas por OpenAPI + sondas paralelas + fallback.
    *   API routes server-side (`app/api/admin/tables/route.ts`).
    *   Componente `components/admin/DataTable.tsx` (dropdown de tablas, columnas auto-detectadas, badges, estado de carga, banner de Modo Vista Previa).
    *   Acceso a las 11 tablas de Supabase Cloud (`leads_agencialquimia`, `leads_hunter`, `chat_messages`, `chat_messages_alquimia`, `chat_messages_cerebro`, `conversaciones_alquimia`, `n8n_chat_histories`, `control_rutas`, `ideas_agencia`, `objetivos_agencia`, `radar_queries`).
    *   Listado de filas paginadas con `Prefer: count=exact`.

**3. Gestión de Leads y Prospección (Radar Hunter):**

*   **Pipeline Kanban de Leads:**
    *   Visualización de leads en un formato Kanban con columna `etapa`.
    *   **¡Mejora Planificada!** (Parte del `python-integration-plan.md` y `admin-panel-design-implementation-plan.md`):
        *   **Scoring Predictivo de Prospectos (Lead Scoring ML):** Cálculo de un puntaje del 1 al 100 basado en sector, web, fallos detectados, tamaño (con `scikit-learn` en FastAPI).
        *   **Generador de Auditorías IA en PDF:** Transformación de datos de leads en informes PDF diseñados (con `WeasyPrint` / `Jinja2` en FastAPI).
        *   Botón para descargar/enviar por WhatsApp la auditoría del lead.
*   **Operación del Radar Hunter:**
    *   Activación de la funcionalidad de "Activar Radar" con mapa (Leaflet/OSM).
    *   API `/api/admin/hunter` (GET/POST para radar/geocode con Photon+Nominatim filtrado a España).
    *   Columnas lat/lon en `leads_hunter`/`objetivos_agencia`.
    *   Workflow n8n `hunterops-alquimia` (gestión de queries, geocodificación, extracción de contactos).
    *   **¡Mejora Planificada!** (Parte del `python-integration-plan.md`):
        *   **Extractor Asíncrono de Contactos para Lead Hunter:** Lógica pesada de extracción web con `Playwright-stealth` y `selectolax` en el microservicio Python de FastAPI.

**4. Monitoreo y Entrenamiento del Agente IA (Max):**

*   **Chat con Max:**
    *   Interfaz de chat con el asistente comercial Max (webhook `max-whatsapp`, Gemini 2.5 Pro + memoria).
    *   Historial de ejecuciones reales de Max (`MaxChat.tsx`).
*   **Inbox de Clientes:**
    *   Pestaña "Clientes" en el panel.
    *   Tabla `mensajes_panel` para registrar mensajes entrantes.
    *   Workflows n8n `panel-log-wa` (log entrantes) y `panel-enviar-wa` (envío WhatsApp).
    *   API `/api/admin/inbox` y componente `ClientInbox.tsx`.
*   **¡Mejora Planificada!** (Parte del `python-integration-plan.md`):
    *   **Búsqueda Semántica RAG para Max:** Permitir a Max consultar manuales de ventas y servicios vectorizados en una base local ultra-rápida (`FAISS`) usando el microservicio Python.

**5. Gestión y Configuración (Panel Core):**

*   **Diagrama n8n Drag & Drop:**
    *   Funcionalidad para guardar (`PUT {name,nodes,connections,settings}`).
    *   Detalle de nodos.

**6. Estructura y Estilo General (Panel Core):**

*   **Layout base:** Next.js App Router, React 19, TypeScript, Tailwind v4.
*   **Tema:** Dark Charcoal (#0b0d10) con acentos esmeralda.
*   **Componentes reutilizables:** Navbar, Hero, Services, Demos.
*   **¡Mejora Planificada!** (Ver `docs/admin-panel-design-implementation-plan.md`):
    *   **Diseño general del panel:** Layout responsivo y modular con navegación lateral persistente (`Sidebar`), Dashboard inicial con métricas clave, y componentes de UI genéricos (`DataTable`, `Form`, `Modal`, `Button`).
*   **¡Mejora Planificada!** (Ver `docs/elegant-buttons-implementation-plan.md`):
    *   **Diseño de Botones Elegantes:** Componente `Button.tsx` centralizado con estilos refinados, micro-interacciones (hover, active), variantes (`primary`, `secondary`, `outline`, `ghost`), y soporte para `size`, `icon`, `disabled`, `loading`).

---

**Fecha de Creación:** 2026-08-22
**Autor:** Mercurio (Agente IA de OpenClaw)
