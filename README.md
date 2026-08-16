# AgenciAlquimia — Web Oficial 🚀

Sitio web oficial de **AgenciAlquimia**, agencia especializada en automatización con Inteligencia Artificial para pymes y negocios locales, con base en Santiago de Compostela (Galicia, España).

Ecosistemas autónomos que atienden clientes, cualifican prospectos, gestionan reservas de citas y procesan información las 24 horas del día.

---

## 🧱 Stack Tecnológico

| Dominio | Tecnología |
| :--- | :--- |
| Framework | Next.js 15 (App Router) |
| UI | React 19 + TypeScript (tipado estricto) |
| Estilos | TailwindCSS v4 + PostCSS |
| Iconos | Lucide React |
| IA | Agente n8n vía proxy seguro (`app/api/chat/route.ts`) |
| Fuentes | Space Grotesk & Inter (`next/font`, precarga WPO) |

## 📁 Estructura

```
agencialquimia/
├── app/                 # App Router (páginas, API routes, robots.ts, sitemap.ts)
│   ├── admin/           # Panel de administración (/admin)
│   ├── api/chat/        # Proxy seguro hacia el webhook de n8n (/api/chat)
│   ├── aviso-legal/     # Página legal
│   └── politica-de-privacidad/
├── components/          # Componentes React TSX (Navbar, Hero, Services, ChatWidget...)
├── lib/                 # Utilidades (metadata.ts para SEO)
├── types/               # Contratos TypeScript (chat.ts)
├── public/              # Assets estáticos (imágenes, favicons)
├── audit/               # Informes de auditoría (AUDIT.md)
├── MEMORY/              # Banco de memoria del proyecto (memory-bank.md)
└── .github/             # Plan de implementación y CI/CD
```

## 🚀 Desarrollo local

```bash
# Requisitos: Node.js 26.7.0 (ver .nvmrc)
nvm use                 # si usas nvm
npm install
npm run dev             # http://localhost:3000
```

## ✅ Verificaciones (antes de cada entrega)

```bash
npx tsc --noEmit        # Tipado estricto, 0 errores
npm run lint            # ESLint (eslint-config-next)
npm run build           # Build de producción
npm test                # Tests (Vitest)
```

## 🖥️ Despliegue en el VPS

El proyecto corre en el **VPS propio** (no Vercel):

1. `npm ci` (instalar dependencias exactas)
2. `npm run build` (build de producción)
3. `next start` (servidor en segundo plano)
4. **nginx** actúa de proxy reverso en los puertos 80/443, con caché inmutable de 1 año para `/assets`, `/images`, `/fonts` y `/videos` (ver `nginx.conf`).

El despliegue automático puede realizarse vía GitHub Actions (`.github/workflows/deploy.yml`) configurando los secrets `VPS_HOST`, `VPS_USER` y `VPS_SSH_KEY` en el repositorio.

## 🔐 Variables de entorno

| Variable | Descripción |
| :--- | :--- |
| `N8N_WEBHOOK_URL` | URL del webhook del agente IA en n8n (proxy `/api/chat`) |

Copia `.env.example` como `.env.local` para desarrollo. **`.env.local` no se sube a git.**

## 🧠 Memoria del proyecto

- `MEMORY/memory-bank.md` — contexto, decisiones, hitos y reglas de desarrollo.
- `CONTEXT.md` — contexto global de negocio y arquitectura.
- `audit/AUDIT.md` — historial de auditorías técnicas.

---

© 2026 AgenciAlquimia. Todos los derechos reservados.
