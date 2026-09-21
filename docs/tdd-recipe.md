# 🍳 Receta Canónica de TDD (Test-Driven Development) & Patrón AAA · AgenciAlquimia

> **Guía Práctica de Desarrollo:** Cómo aplicar el ciclo **Red ➔ Green ➔ Refactor** utilizando la plantilla maestra **AAA (Arrange - Act - Assert)** en TypeScript (Vitest) y Python (Pytest).

---

## 🔄 1. El Ciclo Universal de TDD (Red - Green - Refactor)

```
       ┌─────────────────────────────────────────────────────────┐
       │                                                         │
       ▼                                                         │
  🔴 1. RED               🟢 2. GREEN               🔵 3. REFACTOR
Escribir el Test         Escribir el Código       Limpiar, Optimizar
  (Antes del código)      Mínimo para Aprobar        y Perfeccionar
       │                         ▲                         │
       └─────────────────────────┴─────────────────────────┘
```

---

## 📝 2. La Plantilla Maestra del Test (Patrón AAA)

```typescript
it('debe [comportamiento esperado cuando ocurre una condición]', () => {
  // 1. ARRANGE (Preparar el escenario)
  // Declarar los datos de entrada, parámetros y el resultado esperado.

  // 2. ACT (Ejecutar la acción)
  // Invocar la función o renderizar el componente a probar.

  // 3. ASSERT (Verificar la verdad)
  // Comprobar que el resultado obtenido coincide con el esperado.
});
```

---

## 👨‍🍳 3. La Receta Paso a Paso con un Caso Real

### 🔴 Paso 1: FASE ROJA (Escribir el test que falla primero)

Escribimos la prueba unitaria **antes** de que la función exista:

```typescript
// tests/scoring.test.ts
import { it, expect } from 'vitest';
import { calcularDescuentoPresupuesto } from '@/lib/pricing-utils';

it('aplica un 15% de descuento a proyectos con presupuesto superior a 3.000€', () => {
  // 1. ARRANGE
  const presupuestoOriginal = 4000;
  const resultadoEsperado = 3400;

  // 2. ACT
  const presupuestoFinal = calcularDescuentoPresupuesto(presupuestoOriginal);

  // 3. ASSERT
  expect(presupuestoFinal).toBe(resultadoEsperado);
});
```
> ❌ **Resultado:** `ReferenceError: calcularDescuentoPresupuesto is not defined` (Test en ROJO).

---

### 🟢 Paso 2: FASE VERDE (Escribir el código mínimo para pasar)

Escribimos la función en `lib/pricing-utils.ts` con la lógica justa y necesaria:

```typescript
// lib/pricing-utils.ts
export function calcularDescuentoPresupuesto(presupuesto: number): number {
  if (presupuesto > 3000) {
    return presupuesto * 0.85;
  }
  return presupuesto;
}
```
> ✅ **Resultado:** `✓ tests/scoring.test.ts (1 test passed)` (Test en VERDE).

---

### 🔵 Paso 3: FASE AZUL / REFACTOR (Mejorar sin romper nada)

Optimizamos el código con tipado estricto, constantes declaradas y validación de tipos, con la tranquilidad de que el test nos avisará si algo falla:

```typescript
// lib/pricing-utils.ts (Refactorizado)
const UMBRAL_DESCUENTO_VOLUMEN = 3000;
const FACTOR_DESCUENTO_15 = 0.15;

/**
 * Calcula el presupuesto neto aplicando descuentos por volumen de ingeniería.
 * @param presupuestoBase - Importe en euros antes de impuestos.
 */
export function calcularDescuentoPresupuesto(presupuestoBase: number): number {
  if (typeof presupuestoBase !== 'number' || presupuestoBase < 0) {
    throw new TypeError('El presupuesto base debe ser un número positivo.');
  }

  if (presupuestoBase > UMBRAL_DESCUENTO_VOLUMEN) {
    return Math.round(presupuestoBase * (1 - FACTOR_DESCUENTO_15));
  }

  return presupuestoBase;
}
```
> ✅ **Resultado:** `✓ tests/scoring.test.ts (1 test passed)` (Sigue en VERDE y el código es de nivel producción).

---

## 🌟 4. Reglas de Oro para el Equipo

1. **Nunca escribir código de producción sin un test que haya fallado primero.**
2. **Cada test debe ser independiente:** No compartir estado mutable entre tests.
3. **Nombrar los tests con claridad:** Deben leerse como especificaciones de negocio (*"debe calcular el descuento..."*, *"debe emitir cookie HttpOnly si..."*).
