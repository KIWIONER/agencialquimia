# skills/ — Skills del Proyecto · AgenciAlquimia

Esta carpeta aloja **skills reutilizables** del proyecto para agentes IA, siguiendo el formato estándar de OpenClaw / Claude Code.

## Formato de una skill

```
skills/<nombre-de-la-skill>/
├── SKILL.md          # Descripción de la skill (obligatorio)
└── ...               # Archivos de apoyo opcionales (scripts, ejemplos, referencias)
```

`SKILL.md` usa frontmatter YAML con `name` y `description`:

```markdown
---
name: nombre-de-la-skill
description: Cuándo y para qué usar esta skill. Se usa para que el agente decida cuándo cargarla.
---

# Nombre de la Skill

Instrucciones detalladas, pasos, ejemplos y comandos.
```

## Reglas

- **Una skill por carpeta**; el nombre de la carpeta coincide con el `name` del frontmatter.
- La `description` debe indicar **cuándo aplica** (ej.: "Usar al modificar el chat widget o el proxy /api/chat").
- Mantener skills pequeñas y específicas del proyecto; lo genérico vive en `ai-rules.md`.

## Candidatas sugeridas

- `chat-widget` — modificar ChatWidget.tsx y el proxy n8n (`/api/chat`).
- `seo-local` — metadatos, Schema.org LocalBusiness, robots/sitemap.
- `admin-panel` — cambios en `app/admin/` (accesibilidad, rutas, estados).
