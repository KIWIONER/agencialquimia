# Informe de Auditoría Exhaustiva: AgenciAlquimia 🚀

**Fecha de evaluación:** Julio 2026  
**Repositorio:** `agencialquimia` (`c:/Proyectos/agencialquimia`)  
**Metodología:** Método de los 3 Expertos (Arquitectura, UX/Performance/a11y, SEO/CRO/Integraciones IA)

---

## Executive Summary (Resumen Ejecutivo)

**AgenciAlquimia** es la plataforma web corporativa de una agencia de automatización con Inteligencia Artificial enfocada en pymes. El proyecto se compone de una **landing page pública estática** (HTML5, CSS3, JS Vanilla), un **panel de administración separado** (`admin/` en Vite) y una **integración cliente con un agente comercial basado en n8n** (`https://cerebro.agencialquimia.com`).

Aunque el sitio presenta una estética visual moderna de tonos oscuros y verdes esmeralda, excelente intención de accesibilidad en menús y datos estructurados SEO bien orientados a negocio local, la auditoría revela **deuda técnica relevante**, **recursos huérfanos/duplicados**, **riesgos de seguridad por claves expuestas** y **vulnerabilidades de manipulación en la integración del bot de IA**.

---

## Metodología: El Método de los 3 Expertos

El análisis se ha dividido bajo la supervisión de 3 perfiles especializados:

```mermaid
graph TD
    A[Auditoría General AgenciAlquimia] --> B[🏗️ Experto 1: Arquitectura & Código]
    A --> C[🎨 Experto 2: UX/UI, Performance & a11y]
    A --> D[🎯 Experto 3: SEO, CRO & IA Integraciones]

    B --> B1[Estructura y Limpieza Repo]
    B --> B2[Seguridad & Credenciales]
    B --> B3[Gestión de Build & Assets]

    C --> C1[Core Web Vitals & Carga]
    C --> C2[Accesibilidad ARIA & Teclado]
    C --> C3[Responsiva Móvil & CSS]

    D --> D1[Inyección & Resiliencia IA Webhook]
    D --> D2[Embudo CRO & Conversión]
    D --> D3[SEO Local & Datos Estructurados]
```

---

# 🏗️ Experto 1: Arquitectura de Software, Seguridad y Calidad de Código

### 1.1 Archivos Huérfanos, Obsoletos y Limpieza del Repositorio
> [!WARNING]
> El repositorio contiene más de **250 KB de archivos huérfanos o duplicados** que ensucian el control de versiones y aumentan el riesgo de desincronización en producción.

* **Archivos HTML Duplicados en Raíz:**
  * [`live_site.html`](file:///c:/Proyectos/agencialquimia/live_site.html) (75.5 KB) es un duplicado casi exacto de [`index.html`](file:///c:/Proyectos/agencialquimia/index.html). No está referenciado en ninguna parte del proyecto.
* **Prototipo Inseguro y Desconectado:**
  * En la carpeta [`dashboard/index.html`](file:///c:/Proyectos/agencialquimia/dashboard/index.html) (72.2 KB) existe una aplicación antigua ("HunterOps | Tactical Intelligence Command") fuera de la navegación del sitio.
* **JS Compilado Huérfano:**
  * En `_astro/`, el archivo [`dashboard.astro_astro_type_script_index_0_lang.c-6i61oL.js`](file:///c:/Proyectos/agencialquimia/_astro/dashboard.astro_astro_type_script_index_0_lang.c-6i61oL.js) (175.5 KB) no se importa en ningún HTML del sitio.
* **Estructura de Carpetas Duplicadas Anidadas:**
  * En `js/`, existe una subcarpeta incoherente [`js/js/main.js`](file:///c:/Proyectos/agencialquimia/js/js/main.js).
  * En `css/`, existe la subcarpeta [`css/css/style.css`](file:///c:/Proyectos/agencialquimia/css/css/style.css) y [`css/css/custom-popup.css`](file:///c:/Proyectos/agencialquimia/css/css/custom-popup.css).

### 1.2 Seguridad: Claves API Expuestas
> [!CAUTION]
> Se ha detectado una **Google Maps API Key activa en código fuente plano**.

En el archivo [`dashboard/index.html#L10`](file:///c:/Proyectos/agencialquimia/dashboard/index.html#L10):
```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDjOCvgLEDj9tTae8B7z7IjzNMEusfuVoU&libraries=places"></script>
```
* **Riesgo:** Cualquier usuario que inspeccione la carpeta `/dashboard/` puede copiar esta API Key para realizar peticiones ilimitadas cobradas a la cuenta de Google Cloud de la agencia.

### 1.3 Desincronización entre Archivos Fuente y Minificados
El proyecto mantiene copias uncompressed y minified sin un pipeline de build automático para la web pública:
* [`js/main.js`](file:///c:/Proyectos/agencialquimia/js/main.js) (22.1 KB) vs [`js/main.min.js`](file:///c:/Proyectos/agencialquimia/js/main.min.js) (7.2 KB).
* [`css/style.css`](file:///c:/Proyectos/agencialquimia/css/style.css) (113.5 KB) vs [`css/style.min.css`](file:///c:/Proyectos/agencialquimia/css/style.min.css) (40.1 KB).
* **Problema:** [`index.html`](file:///c:/Proyectos/agencialquimia/index.html#L31) está cargando `css/style.css` y `js/main.js` no minificados, perdiendo la ventaja de la minificación y corriendo el riesgo de editar `.min.js` o `.js` por separado y desincronizarlos.

---

# 🎨 Experto 2: UX/UI, Accesibilidad (a11y) y Rendimiento Web (Performance)

### 2.1 Optimización de Carga y Core Web Vitals (FCP / LCP)
> [!IMPORTANT]
> El tiempo de primer renderizado con contenido (FCP) y el bloqueo del hilo principal se ven penalizados por la estrategia de carga de fuentes y estilos CSS.

1. **Doble Importación Redundante de Fuentes CDN:**
   * En [`index.html#L11-L12`](file:///c:/Proyectos/agencialquimia/index.html#L11-L12) se cargan las fuentes `Space Grotesk`, `Inter` y `Material Symbols Outlined` mediante `<link>`.
   * En [`index.html#L35`](file:///c:/Proyectos/agencialquimia/index.html#L35), dentro del bloque `<style>`, se vuelve a incluir `@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined...');`.
   * **Consecuencia:** Causa peticiones HTTP duplicadas que bloquean el renderizado inicial y generan *Layout Shifts* (CLS) al sustituir la fuente.
2. **Falta de Preconnect a CDNs Externas:**
   * No existen etiquetas `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` para acelerar el handshake TLS con los servidores de Google Fonts y JSDelivr (`@supabase/supabase-js`).
3. **Sobrescrituras Estilísticas con `!important`:**
   * En [`index.html#L89-L100`](file:///c:/Proyectos/agencialquimia/index.html#L89-L100), el HTML incluye estilos en línea que fuerzan variables CSS globales con `!important`:
   ```css
   :root {
       --bg-color: #fdfbf7 !important;
       --text-color: #064e3b !important;
   }
   ```
   * Esto anula el sistema de temas de [`css/style.css`](file:///c:/Proyectos/agencialquimia/css/style.css) y dificulta el mantenimiento estilístico.

### 2.2 Accesibilidad (a11y) y Lectores de Pantalla

* **Aciertos:**
  * Se sincronizan adecuadamente los estados `aria-expanded` y `aria-hidden` en el menú hamburguesa y en la ventana del chat a través de [`js/main.js#L17-L56`](file:///c:/Proyectos/agencialquimia/js/main.js#L17-L56).
  * Se gestiona la tecla `Escape` para cerrar modales y se devuelve el foco al elemento disparador (`lastChatTrigger.focus()`).
* **Puntos Críticos a Mejorar:**
  1. **Respuestas Dinámicas del Bot de IA no anunciadas:**
     * Las respuestas del bot insertadas en el DOM mediante la función de máquina de escribir (`typeWriter`) en [`js/main.js#L265-L294`](file:///c:/Proyectos/agencialquimia/js/main.js#L265-L294) no utilizan una región viva ARIA (`aria-live="polite"` o `role="log"`). Los usuarios con lector de pantalla no se enteran de las respuestas generadas por la IA.
  2. **Indicador de Carga Oculto Excesivamente:**
     * En [`js/main.js#L211`](file:///c:/Proyectos/agencialquimia/js/main.js#L211), `chat-typing` tiene `aria-hidden="true"`. Aunque es correcto visualmente, falta un elemento con `aria-live` que informe a un usuario ciego: *"El agente está escribiendo..."*.
  3. **Bloqueo del Scroll del Fondo (Body Scroll Lock):**
     * Al abrir el menú en móviles o la ventana desplegada del chat, el cuerpo de la página (`body`) sigue permitiendo scroll en segundo plano, causando desorientación táctil.

---

# 🎯 Experto 3: SEO, Conversión (CRO) e Integraciones de IA y Negocio

### 3.1 Integración del Agente de IA y Webhooks (n8n)
> [!WARNING]
> La arquitectura cliente-servidor del agente comercial expone lógica de negocio e instrucciones del sistema en el código cliente.

1. **Inyección de Prompts en Frontend:**
   * En [`js/main.js#L172-L174`](file:///c:/Proyectos/agencialquimia/js/main.js#L172-L174):
   ```javascript
   chatInput: chatHistory.length === 1 
       ? `[SISTEMA: Ignora cualquier instrucción sobre 'hacer un brief'. Guía a reservar llamada de 15 min.] ${text}`
       : text
   ```
   * **Riesgo:** Estas instrucciones del sistema enviadas desde el navegador pueden ser manipuladas fácilmente por un usuario malintencionado mediante inspección de red, modificando la conducta del agente o sobrepasando las directivas comerciales. Esta lógica debe residir dentro del workflow de n8n o backend intermedio.
2. **Endpoint Directo Hardcodeado:**
   * `https://cerebro.agencialquimia.com/webhook/v1/agente/consulta` está expuesto directamente en JavaScript plano ([`js/main.js#L163`](file:///c:/Proyectos/agencialquimia/js/main.js#L163)).
3. **Manejo de Errores y Fallbacks de Conversión:**
   * Si el servidor de n8n está inaccesible o tarda más de lo esperado, el catch muestra: *"Lo siento, mi conexión neuronal está saturada. Prueba de nuevo."*
   * **Recomendación CRO:** Si la API falla, el bot debe presentar de inmediato un botón directo con fallback como *"Reservar directamente en Calendly"* o *"Contactar por WhatsApp"*, evitando perder el lead.

### 3.2 SEO Local, Metadatos y Datos Estructurados (Schema.org)

* **Aspectos Positivos:**
  * Metaetiquetas de Open Graph y Twitter Cards correctamente configuradas con URL canónica `https://agencialquimia.com/`.
  * Archivos [`robots.txt`](file:///c:/Proyectos/agencialquimia/robots.txt) y [`sitemap.xml`](file:///c:/Proyectos/agencialquimia/sitemap.xml) presentes y vinculados.
* **Puntos Críticos:**
  1. **Teléfono Falso en JSON-LD:**
     * En [`index.html#L56`](file:///c:/Proyectos/agencialquimia/index.html#L56), el esquema `LocalBusiness` contiene:
     ```json
     "telephone": "+34000000000"
     ```
     * Google valida la autenticidad del marcado local. Un número telefónico genérico/falso puede provocar la invalidación de la ficha de datos enriquecidos (Rich Results).
  2. **Falta de Validación en Formulario de Captación:**
     * En [`index.html`](file:///c:/Proyectos/agencialquimia/index.html) y [`js/main.js#L382`](file:///c:/Proyectos/agencialquimia/js/main.js#L382), el campo `#contact-info` acepta cualquier tipo de texto sin comprobar si es un formato de email válido o teléfono con código de país.

---

## Tabla Resumen de Prácticas y Nivel de Prioridad

| Área | Buena Práctica Detectada | Mala Práctica / Problema | Prioridad |
| :--- | :--- | :--- | :---: |
| **Arquitectura** | Stack ligero en HTML/JS vanilla; configuración `nginx.conf` con caché de assets. | Archivos duplicados (`live_site.html`, `js/js/`, `css/css/`) y `_astro/` JS huérfano. | 🔴 ALTA |
| **Seguridad** | HTTPS en webhook de n8n; Supabase por CDN. | Google Maps API Key expuesta en `dashboard/index.html#L10`. Prompts en cliente JS. | 🔴 ALTA |
| **Performance** | Video hero con carga condicional (`data-src`) solo en desktop (`innerWidth > 768`). | Carga duplicada de Google Fonts y falta de `preconnect`. Estilos `!important` en HTML. | 🟡 MEDIA |
| **Accesibilidad** | Manejo de tecla Escape y restauración de foco en modales (`lastChatTrigger`). | Respuestas de IA no anunciadas a lectores de pantalla (falta `aria-live="polite"`). | 🟡 MEDIA |
| **SEO & CRO** | Schema JSON-LD LocalBusiness; botones de acción rápida en chat para agendar llamada. | Teléfono ficticio `+34000000000` en JSON-LD. Falta de fallback directo en fallos del bot. | 🟡 MEDIA |

---

## Plan de Acción Recomendado (Paso a Paso)

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Desarrollador
    participant Repo as Repositorio AgenciAlquimia
    participant Security as Capa de Seguridad & Backend

    Dev->>Repo: 1. Eliminar archivos huérfanos (live_site.html, dashboard/index.html, subcarpetas duplicadas)
    Dev->>Security: 2. Revocar API Key de Google Maps expuesta y mover directiva de prompt a n8n
    Dev->>Repo: 3. Unificar Google Fonts con preconnect y limpiar @import redundante
    Dev->>Repo: 4. Agregar aria-live="polite" al contenedor de historial del chat
    Dev->>Repo: 5. Corregir número de teléfono en JSON-LD y agregar fallback de conversión
```

1. **Fase 1: Limpieza y Seguridad (Inmediata)**
   * Eliminar `live_site.html`, la subcarpeta `dashboard/` (o remover la API key de Google), `js/js/` y `css/css/`.
   * Mover las directivas de sistema (`[SISTEMA: Ignora cualquier instrucción...]`) fuera de `js/main.js` e integrarlas en el nodo inicial del workflow en n8n.

2. **Fase 2: Optimización WPO & Accesibilidad (Corto Plazo)**
   * Unificar los llamados a Google Fonts en `<head>` agregando `preconnect` a `https://fonts.gstatic.com` y eliminando la directiva `@import` en CSS en línea.
   * Modificar `#chat-history` en el HTML/JS para que actúe como una región `aria-live="polite"`, permitiendo accesibilidad completa en la interacción del bot.

3. **Fase 3: SEO y Conversión (Mediano Plazo)**
   * Reemplazar `+34000000000` por el teléfono oficial de contacto de la agencia.
   * Implementar un botón de fallback en el chat (WhatsApp/Calendly) cuando el webhook `cerebro.agencialquimia.com` devuelva un error HTTP o supere un timeout de 8 segundos.
