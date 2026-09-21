# System Patterns — AgenciAlquimia 🏛️

> **Patrones de arquitectura, flujo de datos, seguridad, convenciones de diseño y ciclo de vida de peticiones.**

---

## 1. Arquitectura General del Sistema

AgenciAlquimia opera como una plataforma desacoplada de alto rendimiento y soberanía de datos:

```
┌─────────────────────────┐          ┌──────────────────────────┐          ┌──────────────────────────┐
│   Frontend Next.js 15   │ ◄──────► │    FastAPI Python Core   │ ◄──────► │     Motor n8n Privado    │
│  (React 19 / SSR / WPO) │          │  (HMAC / Cookies / RAG)  │          │   (Workflows / Webhooks) │
└─────────────────────────┘          └──────────────────────────┘          └──────────────────────────┘
```

---

## 2. Patrones de Seguridad y Autenticación

### A. La Muralla Técnica (`HttpOnly` + `Secure` + `SameSite=Lax`)
* **Prohibición de `LocalStorage`:** Los tokens JWT y datos de sesión **nunca** se guardan en `localStorage` (para evitar robo mediante XSS).
* **Cookies de Sesión:** Viajan exclusivamente en las cabeceras HTTP de red (`admin_session` y `alquimia_visitor`).

### B. Firma Criptográfica Anti-Tampering (`lib/security_cookies.py`)
* Las cookies emitidas a visitantes anónimos llevan formato `UUID.HMAC_SHA256`.
* La verificación utiliza `hmac.compare_digest` para eliminar vectores de ataque por temporización (*Timing Attacks*).

### C. Seguridad por Ambigüedad (Anti-Fuerza Bruta)
* Los endpoints de login (`/api/admin/login` y `/session/login`) responden siempre con un error unificado `401 Unauthorized` (*"Credenciales inválidas"*), impidiendo determinar si el error fue el usuario o la contraseña.

### D. Renderizado Condicional Estricto
* ⚠️ **Prohibido ocultar componentes sensibles con CSS (`display: none` o `hidden`).**
* Se utiliza renderizado condicional `{isAuthenticated && <AdminPanel />}` para eliminar físicamente los nodos del árbol del DOM.

---

## 3. Patrón Reactivo de los 3 Estados (Frontend React 19)

Todas las llamadas asíncronas a APIs internas o microservicios siguen la estructura canónica:

```tsx
const [data, setData] = useState<T | null>(null);
const [error, setError] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState<boolean>(false);

const execute = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const res = await fetch('/api/...');
    if (!res.ok) throw new Error(mapFriendlyErrorMessage(res.status));
    setData(await res.json());
  } catch (err: unknown) {
    setError(mapFriendlyErrorMessage(err));
  } finally {
    setIsLoading(false); // Siempre se desactiva el loader en 'finally'
  }
};
```

---

## 4. Metodología MARCO (Marco de IA Estratégica)

1. **ASK (Interpretar antes de actuar):** Analizar y razonar el requerimiento antes de proponer código.
2. **PLAN (Auditar la estrategia):** Validar el diseño técnico y los 3 estados de ejecución.
3. **AGENT (Ejecución controlada):** Implementar con verificación estricta de tipos y pruebas automatizadas.
4. **ORCHID (Documentar el aprendizaje):** Sintetizar el contraste entre la interpretación inicial y la solución técnica en `docs/Orchid.md`.
