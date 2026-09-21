# AGENT_INSTRUCTIONS.md - Directrices para el Agente (Mercurio) en agencialquimia-web

Este documento contiene directrices y convenciones específicas para el Agente Mercurio al trabajar en el repositorio `agencialquimia-web`.

## 1. Reglas Generales

*   **Idioma:** Comunicación y comentarios en español (España).
*   **Convenciones de Código:** Seguir el estilo y convenciones existentes del proyecto (Next.js 15, React 19, TypeScript estricto, TailwindCSS v4).
*   **Verificación Obligatoria:** Antes de cualquier commit o pull request, ejecutar y asegurar que no haya errores:
    *   `npx tsc --noEmit`
    *   `npm run lint`
    *   `npm test`
    *   `npm run build`
*   **`git push`:** **NUNCA realizar `git push` sin petición explícita y autorización de Matías.** Los commits locales están permitidos.
*   **Preferencias del Cliente:** Siempre priorizar la eficiencia, la seguridad y el rendimiento web (WPO).

## 2. Puntos Clave del Proyecto agencialquimia-web

*   **Propósito:** Página web oficial de AgenciAlquimia, agencia de automatización con IA.
*   **Stack:** Next.js 15 (App Router), React 19, TypeScript estricto, TailwindCSS v4 (tokens esmeralda, tema Dark Charcoal `#0b0d10`).
*   **Despliegue:** Coolify en el VPS (Docker). Cada push a `main` (autorizado) redeploya el contenedor.
*   **Base de Datos:** Supabase Cloud (`ybqzcxabblyzqhezanaf`) para datos de la web y el panel de administración.
*   **Agente IA / Automatización:** Integración con n8n (`https://cerebro.agencialquimia.com`) vía un proxy seguro (`app/api/chat/route.ts`).
*   **Panel de Administración (`/admin`):** Centro de control operativo. Conectado a Supabase Cloud, incluye explorador de tablas, login con JWT nativo, diagrama n8n, pipeline de leads, chat con Max e Inbox de clientes. Para una lista completa de funcionalidades, consultar `docs/admin-panel-features.md`.
*   **Seguridad:**
    *   No exponer secretos, tokens ni prompts de sistema en código cliente.
    *   `.env.local` con credenciales sensibles (jamás versionado).
    *   Row Level Security (RLS) activo en tablas de Supabase.
    *   Auditorías periódicas de accesos y credenciales (ej. rol limitado `n8n_max`, rotación de claves n8n, PIN WhatsApp).

## 3. Tareas recurrentes o de mantenimiento

*   **Revisión de `MEMORY.md`:** Periódicamente, revisar los archivos de memoria diaria y consolidar información relevante en `MEMORY.md`.
*   **Optimización de Código:** Buscar oportunidades para mejorar rendimiento, legibilidad y mantenibilidad del código.
*   **Actualización de Dependencias:** Mantener las dependencias actualizadas (con cautela y previa verificación).

---

**Nota:** Este archivo puede ser actualizado por Matías o por mí mismo (Mercurio) según las necesidades del proyecto.
