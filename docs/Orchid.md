# 🌸 Orchid.md — Síntesis de Aprendizaje Técnico & Metodología MARCO

> **Documento de Síntesis del Proyecto:** Registro del contraste entre la interpretación inicial, la toma de decisiones arquitectónicas y la solución técnica final implementada para la arquitectura de cookies, autenticación segura y persistencia en **AgenciAlquimia**.

---

## 1. 🔍 Interpretación Inicial vs. Solución Técnica

| Dimensión | Enfoque Tradicional / Inicial | Solución Técnica Implementada (AgenciAlquimia) |
| :--- | :--- | :--- |
| **Almacenamiento de Tokens** | Guardar JWT en `localStorage` por comodidad en llamadas AJAX. | **La Muralla Técnica (`HttpOnly + Secure + Lax`):** Las cookies son invisibles para JavaScript, erradicando el riesgo de robo de sesión mediante ataques XSS. |
| **Identidad de Visitantes** | UUIDs generados en frontend guardados en cookies sin firmar. | **Firma Criptográfica Anti-Tampering:** Cookies con formato `UUID.HMAC_SHA256` en FastAPI; cualquier intento de alteración regenera la sesión automáticamente. |
| **Manejo de Errores en Login** | Mensajes detallados (*"El usuario no existe"*, *"Contraseña incorrecta"*). | **Seguridad por Ambigüedad:** Respuesta HTTP 401 unificada (*"Credenciales inválidas"*), neutralizando la enumeración de cuentas en ataques de fuerza bruta. |
| **Control de Estado en React** | Estados dispersos y botones sin deshabilitar durante `fetch`. | **Patrón Canónico de los 3 Estados (`data`, `error`, `loading`):** Programación defensiva con `try / catch / finally`, bloqueo de doble envío y mapeo amigable de errores. |
| **Protección de Datos en UI** | Ocultar paneles o vistas con CSS (`display: none`). | **Renderizado Condicional Estricto:** Eliminación física de los componentes sensibles del árbol del DOM mediante `{isAuthenticated && <Component />}`. |

---

## 2. 🏛️ Arquitectura de la Solución (Interoperabilidad FastAPI + Next.js)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FLUJO DE IDENTIDAD Y DATOS                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ Navegador Cliente ]                                                      │
│        │                                                                    │
│        │  1. Cookie 'alquimia_visitor' (HttpOnly + HMAC SHA-256)            │
│        ├─────────────────────────────────────────────────────────────┐      │
│        │                                                             │      │
│        ▼                                                             ▼      │
│  [ Next.js 15 App Router ]                                   [ FastAPI Core ]
│  - Server Components (`cookies()`)                           - `get_or_create_visitor_id`
│  - Middleware Route Guards                                   - `require_admin_session`
│  - Renderizado Condicional sin `display:none`                 - Firma HMAC & JWT HS256
│  - Patrón 3 Estados (`try/catch/finally`)                    - Seguridad por Ambigüedad
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 📚 Lecciones Aprendidas y Mejores Prácticas

1. **La Muralla HttpOnly es innegociable:** Los tokens de autenticación y claves de sesión **nunca** deben almacenarse en `localStorage` ni exponerse a `document.cookie`.
2. **Validar antes de Verificar:** Siempre validar esquemas y tipos (con Pydantic en backend y Zod/TS en frontend) antes de consultar bases de datos o verificar hashes.
3. **El bloque `finally` garantiza la estabilidad de la UI:** Desactivar indicadores de carga (`setIsLoading(false)`) en `finally` previene bloqueos de interfaz cuando ocurren fallos de red imprevistos.
4. **Desacoplamiento total entre servicios:** FastAPI expone dependencias puras (`fastapi.Depends()`) que pueden ser consumidas tanto por Next.js como por agentes externos de forma segura e independiente.
