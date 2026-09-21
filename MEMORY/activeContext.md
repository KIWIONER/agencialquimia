# Active Context — AgenciAlquimia 🧠

> **Estado de la sesión activa, foco actual, decisiones recientes y próximos pasos.**

---

## 🎯 Foco Actual
* **Arquitectura de Cookies Seguras, JWT y Sesiones en FastAPI y Next.js 15:**
  * Implementación completa de la Metodología MARCO (*Ask ➔ Plan ➔ Agent ➔ Orchid*).
  * Creación del módulo de firma HMAC anti-tampering y gestión JWT en FastAPI Core.
  * Inyección de dependencias `get_or_create_visitor_id` y `require_admin_session`.
  * Creación de utilidades de sesión para Server Components y documentación de síntesis en `docs/Orchid.md`.

---

## 🏗️ Decisiones Técnicas Recientes

1. **La Muralla Técnica (`HttpOnly + Secure + Lax`):**
   * Eliminado cualquier uso de `localStorage` para tokens de sesión para blindar la aplicación contra ataques XSS.
2. **Seguridad por Ambigüedad (Anti-Fuerza Bruta):**
   * Endpoint de login administrativo responde con código genérico 401 sin revelar si el error fue el usuario o la contraseña.
3. **Validación Pydantic vs Verificación Criptográfica:**
   * Esquemas fuertemente tipados en FastAPI combinados con comparaciones en tiempo constante (`hmac.compare_digest`).
4. **Patrón Canónico de los 3 Estados en React (`data`, `error`, `loading`):**
   * Encapsulamiento en `try / catch / finally` con desactivación garantizada del loader y renderizado condicional estricto (cero `display: none` en datos sensibles).

---

## 🧪 Estado de Calidad
* **Pytest (FastAPI Core):** 14/14 tests pasando (100%).
* **Vitest (Next.js):** 17/17 tests pasando (100%).
* **TypeScript & ESLint:** 0 errores y 0 warnings.
