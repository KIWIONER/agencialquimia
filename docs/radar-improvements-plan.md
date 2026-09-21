# �� Plan de Mejora del Radar Hunter: Rediseño Visual, Filtro por Sectores y Carencia Digital

Este documento establece el plan de rediseño y evolución técnica para el módulo **Radar Hunter** de AgenciAlquimia.

---

## 1. 🎨 Rediseño UI/UX (Mayor Legibilidad & Menos Fatiga Visual)

### 🔹 Diagnóstico Visual:
- **Problema de Contraste:** Textos en `text-slate-500` y `text-slate-400` sobre fondos oscuros provocaban fatiga visual y baja accesibilidad (WCAG < 4.5:1).
- **Problema de Tamaño:** Abuso de tipografía `text-[10px]` y `text-[11px]` que dificultaba la lectura rápida de datos clave del negocio.
- **Jerarquía Visual:** Carga densa de información sin separadores visuales claros.

### 🔹 Soluciones de Diseño Aplicadas:
- **Aumento de Contraste (WCAG 2.1 AA):** Transición a `text-slate-200`, `text-slate-300` e insignias con fondos luminosos `bg-slate-800 border-slate-700`.
- **Tipografía Legible:** Incremento de tamaño base a `text-xs` (mínimo) y `text-sm` para datos de contacto, nombres y fallos detectados.
- **Espaciado y Tarjetas Suaves:** Bordes `border-slate-800` con efectos hover más claros y respiración entre elementos (`gap-3`, `p-4`).

---

## 2. 🔍 Filtro por Sectores Específicos y Carencia Digital

### 🔹 Filtro de Sector Específico:
Permite filtrar dinámicamente negocios por su categoría o nicho de mercado:
- 🏥 **Salud & Estética** (Clínicas dentales, fisio, estética)
- 🍽️ **Hostelería & Restauración** (Restaurantes, cafeterías, hoteles)
- ⚖️ **Servicios Profesionales** (Abogados, gestorías, consultoras)
- 🏠 **Inmobiliaria & Reformas** (Inmobiliarias, constructores)
- 🛍️ **Comercio & Retail** (Tiendas físicas, distribución)

### 🔹 Filtro por Carencia Digital (Señal de Oportunidad):
- **Todos los negocios**
- 🌐 **Sin sitio web / Web inactiva** (Venta de web + chatbot)
- 💬 **Sin sistema de reservas / WhatsApp** (Venta de agente de reservas)
- ⭐ **Reputación mejorable (< 4.2★)** (Venta de automatización de reseñas)

---

## 3. 🎯 Palabras Clave de Afinado / Inclusión (Refuerzo de Búsqueda)

- Permite definir palabras clave adicionales para acompañar y reforzar la búsqueda principal, afinando los resultados hacia el perfil exacto deseado (ej. `privada`, `centro`, `especialista`, `independiente`, `particular`).

---

**Fecha de Actualización:** 2026-08-22  
**Autor:** Mercurio (Agente IA de OpenClaw)
