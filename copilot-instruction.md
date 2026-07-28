# System Prompt del Proyecto: AgenciAlquimia

Usa este contexto como instruccion de sistema para cualquier tarea dentro de este repositorio. Prioriza cambios pequenos, coherentes con el sitio actual y orientados a conversion, rendimiento y estabilidad en produccion.

## 1. Perfil y Stack Tecnologico

AgenciAlquimia es un sitio web corporativo en espanol para una agencia de automatizacion con IA, con foco en captacion de leads, demos y contacto comercial.

- El frontend principal utiliza Next.js (App Router), React, TypeScript (`.tsx`/`.ts`) y TailwindCSS v4.
- Los componentes y rutas viven en `app/`, `components/`, `lib/` y `types/`.
- Existe integracion cliente/servidor con un webhook externo de n8n para el chat/agente comercial desde un proxy seguro en Next.js (`/api/chat`).
- **REGLA DE DOCUMENTACIÓN EN CÓDIGO:** Siempre añade comentarios claros, estructurados y explicativos en el código de cada archivo que describan minuciosamente el funcionamiento global del archivo, sus componentes, props y cada una de sus funciones.

## 2. Reglas de Estilo y Rendimiento

### Estilo de codigo

- Mantener TypeScript estricto sin uso de `any` no tipado.
- Seguir la convencion de componentes funcionales React, Hooks nativos y manipulacion limpia de estado.
- Conservar el idioma espanol en el copy visible al usuario, mensajes de interfaz, CTAs y textos de negocio.
- Reutilizar variables CSS, paletas esmeralda y tipografias existentes (*Space Grotesk* e *Inter*).
- Preservar la identidad visual ya observable: tonos verdes premium, contraste alto, enfoque comercial y apariencia moderna.
- **Comentarios explicativos en cada archivo:** Todo archivo nuevo o modificado debe contener un bloque de comentario superior JSDoc/Markdown y comentarios en línea explicando la responsabilidad de cada función/sección.

### Rendimiento y experiencia

- Priorizar paginas ligeras, carga rapida y bajo costo de JavaScript.
- No bloquear el renderizado con scripts o estilos evitables.
- Integrar estandares ARIA de forma explicita en componentes interactivos: usar `aria-label`, `aria-expanded`, `aria-controls`, `aria-live="polite"` y roles donde cierren una brecha de accesibilidad.
- Asegurar accesibilidad operable por teclado: foco visible, orden de tabulacion coherente, activacion por teclado (`Escape`, `Enter`).

## 3. Restricciones (Guardrails del Desarrollador)

- No exponer secretos, tokens o endpoints sensibles en codigo cliente.
- No sustituir textos de negocio por copy generico; mantener tono comercial, directo y orientado a conversion para pymes.
- Documentar exhaustivamente cada componente con comentarios explicativos.