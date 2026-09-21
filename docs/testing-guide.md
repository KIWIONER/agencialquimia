# 🧪 Guía Maestra de Testing: Estrategia de Calidad y Verificación · AgenciAlquimia

> **Documento de Referencia Técnica:** Explicación conceptual, arquitectura de pruebas, tipología y valor estratégico del Testing Automatizado en el stack Full-Stack (Next.js 15 + React 19 + FastAPI + n8n).

---

## 1. 📖 ¿Qué es Unit Testing (Pruebas Unitarias)?

Un **Unit Test (Prueba Unitaria)** es un bloque de código automatizado que evalúa de forma **completamente aislada e independiente** la unidad más pequeña de software (una función pura, un hook personalizado o una utilidad).

### 🎯 Principio Fundamental:
> *"Dada una entrada específica (Input), la función debe devolver siempre la salida esperada (Output), sin depender de servidores externos, bases de datos o conexión a internet."*

### 📐 El Patrón Universal de las 3 "A" (AAA):
1. **Arrange (Preparar):** Declarar las variables de entrada y datos de prueba.
2. **Act (Actuar):** Ejecutar la función o componente que se desea probar.
3. **Assert (Afirmar / Verificar):** Comprobar que el resultado coincida exactamente con lo esperado (`expect(resultado).toBe(...)`).

---

## 2. 🏛️ Los 4 Tipos de Testing en Ingeniería de Software

```
           / \
          / 4 \  ⚡ PERFORMANCE TESTING (WPO, Core Web Vitals, Latencia)
         /-----\
        /   3   \  🎯 FUNCIONES COMPLETAS / E2E (Flujo de Usuario de Extremo a Extremo)
       /---------\
      /     2     \  🔗 INTEGRATION TESTING (Comunicación entre Módulos y APIs)
     /-------------\
    /       1       \  🧪 UNIT TESTING (Funciones y Utilidades Aisladas)
   /-----------------\
```

---

### Tipo 1: 🧪 Unit Testing (Pruebas Unitarias)
* **¿Qué prueba?** Funciones atómicas, validaciones y transformaciones de datos aisladas.
* **¿Para qué sirve?** Asegurar que la lógica matemática, criptográfica o de formato nunca falle.
* **Ejemplos en AgenciAlquimia:**
  * Probar que `sign_cookie("visitor_123")` genere una firma HMAC SHA-256 válida.
  * Probar que `mapFriendlyErrorMessage(401)` devuelva *"Credenciales inválidas o sesión expirada"*.
* **Herramientas:** **Vitest** (en Next.js / TypeScript) y **Pytest** (en FastAPI / Python).
* **Velocidad:** Ultra-rápida (1 a 5 milisegundos por test).

---

### Tipo 2: 🔗 Integration Testing (Pruebas de Integración)
* **¿Qué prueba?** La interacción y paso de mensajes entre dos o más módulos diferentes.
* **¿Para qué sirve?** Garantizar que cuando el Frontend llama al Backend, ambos hablen el mismo protocolo y entiendan los contratos de datos.
* **Ejemplos en AgenciAlquimia:**
  * Probar que `lib/python-client.ts` firme la cabecera `X-Internal-Signature` y que FastAPI la acepte mediante `verify_internal_signature`.
  * Probar que el endpoint `/session/login` reciba las credenciales en JSON y emita la cookie `HttpOnly` con el JWT correspondiente.
* **Herramientas:** **FastAPI TestClient** y **Testing Library con Mock Service Worker (MSW)**.

---

### Tipo 3: 🎯 Funciones Completas / E2E (End-to-End Testing)
* **¿Qué prueba?** El flujo de negocio completo simulando las acciones de un usuario real en el navegador.
* **¿Para qué sirve?** Validar que la experiencia del usuario no se rompa de principio a fin antes de lanzar una versión a producción.
* **Ejemplos en AgenciAlquimia:**
  * **Flujo de Acceso:** Un administrador entra a `/admin/login`, escribe sus credenciales, pulsa el botón, el spinner se activa, se recibe la cookie y la pantalla cambia al Dashboard `/admin` mostrando los leads.
  * **Flujo de Chat:** Un visitante abre el `ChatWidget`, envía un mensaje, el webhook de n8n responde y el mensaje aparece en la burbuja de chat.
* **Herramientas:** **Playwright**, **Cypress** o agentes de navegación automatizada.

---

### Tipo 4: ⚡ Performance Testing (Rendimiento & WPO)
* **¿Qué prueba?** La velocidad de carga, tiempos de respuesta (TTFB), fluidez visual (60fps) y consumo de memoria.
* **¿Para qué sirve?** Mejorar el SEO en Google, evitar que los usuarios abandonen la web por lentitud y asegurar que el servidor soporte picos de tráfico.
* **Ejemplos en AgenciAlquimia:**
  * **Core Web Vitals:** Medir LCP (*Largest Contentful Paint* < 1.2s) y CLS (*Cumulative Layout Shift* = 0).
  * **Carga de Microservicios:** Medir que la generación de PDFs con WeasyPrint en FastAPI no sature la CPU del VPS.
* **Herramientas:** **Lighthouse**, `next/bundle-analyzer`, y benchmarks de servidor.

---

## 3. 🚀 ¿Por qué Beneficia Directamente al Proyecto AgenciAlquimia?

| Beneficio Estratégico | Impacto Real en el Negocio y en el Código |
| :--- | :--- |
| **1. Confianza Total para Refactorizar** | Permite actualizar librerías (ej. React 19, Next.js 15) o rediseñar componentes sin miedo a romper funcionalidades existentes; si algo falla, el test avisa en milisegundos. |
| **2. Prevención Radical de Regresiones** | Si un error fue corregido en el pasado, se crea un test para ese caso. El error **nunca volverá a ocurrir en producción**. |
| **3. Ahorro Masivo de Tiempo y Dinero** | Encontrar un bug en fase de desarrollo cuesta 1 minuto. Encontrar un bug cuando un cliente real está intentando contratar un servicio puede costar miles de euros. |
| **4. Documentación Viva e Incorruptible** | El código de los tests describe exactamente cómo deben funcionar las APIs y los componentes. A diferencia de un PDF de documentación, los tests nunca mienten. |
| **5. Seguridad y Blindaje Anti-Ataques** | Las pruebas de integración simulan ataques (alteración de cookies, inyección de tokens corruptos) para garantizar que el servidor siempre responda con código seguro. |
