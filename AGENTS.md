# AGENTS.md — Instrucciones para Agentes IA · AgenciAlquimia

> Archivo de contexto oficial de proyecto según la convención OpenClaw (y compatible con Claude Code, Cursor y otros asistentes). Todo agente que trabaje en este repositorio DEBE leer este archivo y las reglas de `ai-rules.md` antes de tocar código.

## 1. Qué es este proyecto

Sitio web corporativo de **AgenciAlquimia** — agencia de automatización con Inteligencia Artificial para pymes y negocios locales (Santiago de Compostela, Galicia, España). Foco en captación de leads, demos, reservas y conversión comercial.

Para contexto de negocio y arquitectura completo: leer **[CONTEXT.md](CONTEXT.md)**.

## 2. Stack y arquitectura

- **Next.js 15 (App Router) + React 19 + TypeScript estricto + TailwindCSS v4** (tokens esmeralda, tema Dark Charcoal `#0b0d10`).
- Páginas y rutas en `app/`; componentes reutilizables en `components/`; utilidades en `lib/`; contratos TS en `types/`; assets en `public/`.
- Chat/agente comercial IA vía webhook n8n, proxeado de forma segura por `app/api/chat/route.ts` (`N8N_WEBHOOK_URL`).
- Panel de administración en `app/admin/` (ruta protegida).
- SEO nativo: `app/robots.ts`, `app/sitemap.ts`, metadatos en `lib/metadata.ts`.

## 3. Reglas no negociables (detalle en ai-rules.md)

1. **TypeScript estricto** — prohibido `any` sin tipar; contratos en `types/`.
2. **Documentación exhaustiva en código** — bloque JSDoc superior en español + comentarios explicativos en cada función y sección JSX.
3. **Copy de negocio en español de España** — conservar tono comercial, directo y orientado a conversión para pymes; nunca sustituir por copy genérico.
4. **Accesibilidad WCAG 2.1 AA** — ARIA explícito, operabilidad por teclado, contraste ≥ 4.5:1.
5. **WPO** — páginas ligeras, `next/font`, sin scripts bloqueantes, imágenes optimizadas.
6. **Seguridad** — nunca exponer secretos, tokens ni prompts de sistema en código cliente; `.env.local` jamás en git.
7. **Verificación obligatoria antes de entregar** — `npx tsc --noEmit`, `npm run lint`, `npm test` y `npm run build` con 0 errores.

## 4. Flujo de trabajo y despliegue

- **Desarrollo local (VPS):** repo en `/root/.openclaw/worktrees/agencialquimia-web` (alias: `/root/agencialquimia-web`).
- **Git:** rama `main`, remoto `git@github.com:KIWIONER/agencialquimia.git`. Commits en español con prefijo convencional (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `ci:`).
- **Despliegue:** cada push a `main` dispara el build automático de **Coolify** (VPS) — imagen Docker etiquetada con el hash del commit, proxy Traefik en 80/443. El CI de GitHub (`ci.yml`) valida typecheck, lint, tests y build.
- **Respaldo diario:** script `/root/scripts/backup-agencialquimia.sh` (cron 05:00 UTC) → mirror git + snapshot en `/root/backups/agencialquimia/`.

## 5. Memoria y documentación de referencia

| Archivo | Contenido |
| :--- | :--- |
| [MEMORY/memory-bank.md](MEMORY/memory-bank.md) | Banco de memoria a largo plazo: decisiones, hitos, situación actual. **Leer al iniciar sesión de trabajo.** |
| [CONTEXT.md](CONTEXT.md) | Contexto global de negocio, arquitectura y stack. |
| [ai-rules.md](ai-rules.md) | Reglas detalladas de desarrollo para asistentes IA. |
| [audit/AUDIT.md](audit/AUDIT.md) | Historial de auditorías técnicas. |
| [copilot-instruction.md](copilot-instruction.md) | System prompt legacy (superado por AGENTS.md + ai-rules.md, conservado como referencia). |
| `skills/` | Skills del proyecto (formato SKILL.md). |
