# Tech Context — AgenciAlquimia 💻

> **Stack tecnológico, dependencias, microservicios, estructura de archivos y entorno de ejecución.**

---

## 1. Stack Tecnológico Principal

* **Frontend:** Next.js 15.1.x (App Router) + React 19 + TypeScript (estricto) + TailwindCSS v4.
* **Backend Sidecar:** FastAPI 0.115.x (Python 3.12, Uvicorn) en `/services/python-core`.
* **Testing:**
  * Vitest 4.1.x + Testing Library en TypeScript (`npm test` — 17/17 tests pasando).
  * Pytest 9.1.x en Python (`pytest` — 14/14 tests pasando).
* **Motor de Automatización:** n8n v1.109+ (Instancia soberana privada en VPS).
* **Despliegue & Servidor:** Coolify + Docker + Traefik en VPS Ubuntu (Santiago de Compostela / Alemania).

---

## 2. Microservicio Python Core (`services/python-core`)

```
services/python-core/
├── dependencies/
│   ├── auth.py                  # Verificación HMAC de cabecera X-Internal-Signature
│   └── cookies.py               # Inyectables get_or_create_visitor_id y require_admin_session
├── lib/
│   └── security_cookies.py      # Firma criptográfica HMAC SHA-256 y tokens JWT
├── routers/
│   ├── hunter.py                # Radar Lead Hunter & Scraping
│   ├── pdf.py                   # Generación de informes con WeasyPrint
│   ├── scoring.py               # Modelo predictivo de conversión
│   └── session.py               # Endpoints /session/login, /session/visitor, /session/logout
├── tests/
│   ├── test_auth.py             # Tests HMAC
│   ├── test_cookies.py          # Tests de cookies, anti-tampering y JWT
│   ├── test_pdf.py              # Tests de compilación PDF
│   └── test_scoring.py          # Tests del modelo de scoring
└── main.py                      # FastAPI Application Instance
```

---

## 3. Utilidades Frontend (`lib/`)

* `lib/visitor-session.ts`: Helper de Server Components para `cookies()` y mapeador amigable de errores.
* `lib/python-client.ts`: Cliente HTTP para llamadas autenticadas con HMAC al sidecar FastAPI.
* `lib/auth.ts`: Utilidades JWT para el panel `/admin`.
* `lib/metadata.ts`: Generador centralizado de metadatos SEO con soporte para favicon SVG neón.
