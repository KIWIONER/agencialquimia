# Plan de Implementación: Unit Testing & Refinamiento del Login Administrativo 🧪🔐

> **Módulo Objetivo:** `app/admin/login/page.tsx` & `app/api/admin/login/route.ts`.  
> **Skill Aplicada:** `skills/code-refinement-suite` (Nivel 2/3: PACK 1 ➔ PACK 2 ➔ PACK 3 ➔ PACK 4).  
> **Fecha de Creación:** 31 de Agosto de 2026.

---

## 📐 PACK 1: ARCHITECT (Ideación & Estrategia de Testing)

### 1.1. Análisis ToT (Estrategia de Pruebas Unitarias para el Login)

| Estrategia | Ventajas | Limitaciones | Veredicto |
| :--- | :--- | :--- | :--- |
| **Opción A: Test Manual en Navegador** | Rápido a corto plazo. | No previene regresiones futuras; propenso a errores humanos. | ❌ Rechazado |
| **Opción B: Test E2E con Navegador Real** | Prueba el navegador completo. | Lento (segundos), requiere servidor corriendo, costoso en CI. | ⚠️ Complementario |
| **Opción C: Unit Testing con Vitest + React Testing Library (Recomendada)** | ⚡ Ejecución en milisegundos, aísla lógica de UI, estados (`loading`, `error`, `success`) y navegación sin dependencias externas. | Requiere simular (*mock*) de `next/navigation` y `fetch`. | ✅ **Aprobado** |

### 1.2. Casos de Prueba Unitarios Requeridos (Patrón AAA)

1. **Test 1 (Render Inicial):** Comprobar que se renderizan los inputs de email, contraseña y el botón de acceso habilitado.
2. **Test 2 (Estado de Carga & Anti-Doble Envío):** Al enviar el formulario, el botón debe quedar `disabled` y mostrar el indicador de carga (*"Iniciando sesión..."*).
3. **Test 3 (Manejo de Errores 401):** Si el servidor responde con credenciales incorrectas, se muestra la alerta `role="alert"` con el mensaje exacto.
4. **Test 4 (Manejo de Error de Red / Offline):** Si ocurre una excepción de red, se muestra el mensaje de conexión amigable.
5. **Test 5 (Camino Feliz - Login Exitoso):** Si la API responde `{ success: true }`, se invoca `router.push('/admin')` y `router.refresh()`.

---

## 📝 PACK 2: PLANNER (Refinamiento del Componente & Contratos)

### 2.1. Mejoras de Ingeniería en `app/admin/login/page.tsx`

* **Accesibilidad WCAG 2.1 AA:**
  * Añadir `aria-invalid={!!error}` a los campos cuando haya fallo.
  * Añadir `role="alert"` y `aria-live="polite"` al contenedor de mensaje de error.
* **Seguridad de Cookies:**
  * Añadir `credentials: 'include'` explícito en la llamada `fetch('/api/admin/login')`.
* **Manejo Defensivo de Errores:**
  * Integrar `mapFriendlyErrorMessage` desde `@/lib/visitor-session` en el bloque `catch`.

---

## 💻 PACK 3: CODER (Especificación de Archivos)

### 1. [NEW] `app/admin/login/page.test.tsx`
* Suite de pruebas unitarias en Vitest + `@testing-library/react` cubriendo los 5 casos críticos con mocks de `useRouter` y `global.fetch`.

### 2. [MODIFY] `app/admin/login/page.tsx`
* Refinamiento de accesibilidad ARIA, `credentials: 'include'` y mapeo defensivo de excepciones.

---

## 🛡️ PACK 4: AUDITOR (Verificación y Calidad)

### 4.1. Verificación Automatizada
```bash
# 1. Ejecutar tests unitarios
npm test

# 2. Comprobar TypeScript
npx tsc --noEmit

# 3. Validar linter
npm run lint
```
