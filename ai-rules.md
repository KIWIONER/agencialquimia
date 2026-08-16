# ai-rules.md — Reglas de Desarrollo para Asistentes IA · AgenciAlquimia

Reglas detalladas que todo agente IA (OpenClaw, Claude Code, Cursor, Copilot...) debe seguir al trabajar en este repositorio. Complementa a `AGENTS.md`.

---

## 1. Estilo de código

- **TypeScript estricto**: prohibido el uso de `any` no tipado. Definir contratos e interfaces en `types/`.
- **Componentes funcionales React** con Hooks nativos y manipulación limpia de estado.
- **Sin importaciones muertas**: limpiar imports y dependencias no usadas.
- **Nombres descriptivos** en inglés para código, textos visibles siempre en español de España.

## 2. Documentación en código (obligatoria)

- Todo archivo nuevo o modificado DEBE incluir un **bloque de comentario superior JSDoc en español** describiendo el propósito del archivo.
- Comentarios explicativos en cada función, prop y sección JSX con responsabilidad y comportamiento.
- Mantener la documentación sincronizada con el código (nada de comentarios obsoletos).

## 3. UI / Sistema de diseño

- **Tokens visuales existentes**: fondo `#0b0d10` (Dark Charcoal), tarjetas `#161a22` (glass-card-dark), acentos esmeralda `#10b981` / `#34d399`, fuentes *Space Grotesk* e *Inter* (vía `next/font`).
- **TailwindCSS first**: reutilizar clases y tokens existentes; evitar CSS suelto salvo necesidad real.
- **Responsive**: móvil primero; probar breakpoints.
- **Accesibilidad WCAG 2.1 AA**:
  - `aria-label`, `aria-expanded`, `aria-controls`, `aria-live="polite"` donde aplique.
  - Operabilidad por teclado: foco visible, orden de tabulación coherente, cierre con `Escape`.
  - Contraste de texto ≥ 4.5:1 (secundarios `text-gray-200`, `text-emerald-300`).

## 4. Rendimiento (WPO)

- Páginas ligeras: mínimo JavaScript, cero scripts bloqueantes.
- Imágenes con `next/image` (formato webp, dimensiones correctas) o estáticas optimizadas.
- No duplicar fuentes ni assets; precarga vía `next/font` (preload + preconnect).
- No añadir dependencias sin justificación; antes de añadir una, revisar si ya existe solución en el repo.

## 5. Seguridad

- **Nunca** exponer secretos, tokens, URLs internas ni prompts de sistema en código cliente (Server Components/API Routes son el límite).
- `.env.local` y variables reales: jamás commiteadas; usar `.env.example` con placeholders.
- No loguear datos sensibles en consola ni en respuestas.

## 6. Copy de negocio

- **Preservar el copy comercial**: español de España, tono profesional, directo y orientado a conversión y resultados medibles para pymes.
- No sustituir textos existentes por copy genérico ni traducir a otros idiomas sin petición explícita.
- Mantener datos de contacto oficiales: teléfono `+34 604 051 111`, email `hola@agencialquimia.com`, datos Schema.org `LocalBusiness`.

## 7. Verificación antes de entregar (obligatoria)

```bash
npx tsc --noEmit     # 0 errores de tipos
npm run lint         # 0 problemas ESLint
npm test             # todos los tests en verde
npm run build        # build de producción exitoso
```

Cualquier cambio que rompa estas comprobaciones NO se entrega.

## 8. Git y commits

- Mensajes de commit **en español**, prefijo convencional: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `ci:`, `refactor:`.
- Cambios pequeños y coherentes; un commit por objetivo.
- Rama `main` con push directo (el CI valida y Coolify despliega). No fuerce push (`--force`).

## 9. Flujo de trabajo recomendado

1. Leer `AGENTS.md` + `MEMORY/memory-bank.md` (estado actual del proyecto).
2. Identificar el cambio mínimo que resuelve el objetivo.
3. Implementar con documentación en código.
4. Ejecutar las 4 verificaciones de la sección 7.
5. Commit convencional en español + push.
6. Verificar despliegue (Coolify) si aplica.
