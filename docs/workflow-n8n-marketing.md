# Guía de Construcción: Workflow Generador de Contenidos (n8n)

Este documento detalla cómo armar el workflow en tu instancia de n8n para que funcione como el "Cerebro de Generación" y envíe borradores a la tabla `content_pipeline` en Supabase.

## 1. Estructura del Workflow

El flujo se compone de 6 nodos principales conectados en serie (o con el nodo de IA conversacional si prefieres la versión de "Agente").

### Nodo 1: Webhook (El Gatillo)
*   **Tipo:** Webhook
*   **Method:** `POST`
*   **Path:** `generar-borrador-marketing`
*   **Respond:** `Immediately`
*   *Nota:* Desde Next.js haremos un POST a `https://cerebro.agencialquimia.com/webhook/generar-borrador-marketing` enviando un JSON con el `tema`.

### Nodo 2: Set (Variables)
*   **Tipo:** Set
*   **Values:** 
    *   `tema` = `{{ $json.body.tema }}`

### Nodo 3: Google Gemini (El Pilar - Blog)
*   **Tipo:** Google Gemini (Chat Model)
*   **Model:** `gemini-2.5-pro` (o el que uses habitualmente)
*   **System Message:** "Eres el Content Manager de AgenciAlquimia, experto en SEO y automatización con IA para pymes."
*   **Message:** 
    ```text
    Escribe un artículo para el blog sobre: "{{ $json.tema }}".
    El artículo debe tener unas 800-1000 palabras.
    Usa formato Markdown.
    Incluye un título H1 atractivo.
    Usa subtítulos H2 y H3.
    Termina con un Call to Action (CTA) invitando a agendar una llamada con AgenciAlquimia para automatizar su negocio.
    ```
*   **Salida esperada:** Se guardará temporalmente como `blog_md`.

### Nodo 4: Google Gemini (Despiece - Twitter/X)
*   **Tipo:** Google Gemini
*   **Message:** 
    ```text
    Basado en el siguiente artículo de blog, extrae la idea más provocadora o el dato más útil y redacta un Tweet (X) de máximo 280 caracteres. Que sea directo, sin hashtags aburridos.
    Artículo: {{ $json.response }}
    ```

### Nodo 5: Google Gemini (Despiece - LinkedIn/Facebook)
*   **Tipo:** Google Gemini
*   **Message:** 
    ```text
    Basado en el mismo artículo, redacta un post para LinkedIn/Facebook.
    Tono: Profesional, orientado a dueños de negocios locales o pymes.
    Estructura: Gancho inicial, desarrollo del problema, la solución (agentes de IA) y llamada a la acción para leer el blog.
    Artículo: {{ $node["El Pilar - Blog"].json.response }}
    ```

### Nodo 6: Postgres / Supabase (Guardar Borrador)
*   **Tipo:** Postgres (o Supabase)
*   **Operation:** Insert
*   **Table:** `content_pipeline`
*   **Columns:**
    *   `tema`: `{{ $node["Set"].json.tema }}`
    *   `blog_md`: `{{ $node["El Pilar - Blog"].json.response }}`
    *   `copy_x`: `{{ $node["Despiece - Twitter"].json.response }}`
    *   `copy_fb_linkedin`: `{{ $node["Despiece - LinkedIn"].json.response }}`
    *   `estado`: `borrador`

---

## 2. Siguientes Pasos en el Panel Admin

Una vez que tengas este workflow activo en n8n:
1. Copia la URL de producción del Webhook (ej. `https://cerebro.agencialquimia.com/webhook/generar-borrador-marketing`).
2. La añadiremos al botón **"✨ Generar Nuevo Tema"** que creamos en el componente `MarketingDashboard.tsx`.