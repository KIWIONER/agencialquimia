# Arquitectura: Motor de Contenido y Ads Automatizado (AgenciAlquimia)

Este documento detalla la estructura y el flujo de trabajo para el sistema de automatización de marketing de AgenciAlquimia, diseñado para generar contenido omnicanal y monitorizar campañas publicitarias utilizando el stack actual (n8n, Supabase, Next.js).

## 1. Filosofía Central: "Pillar Content" (Contenido Pilar)

En lugar de generar publicaciones aisladas, el sistema funciona como una fábrica en cascada. Se crea una pieza de contenido extensa y de alto valor (el Pilar), de la cual se extraen fragmentos adaptados para diferentes redes sociales (el Despiece). Esto asegura coherencia de marca, eficiencia en el consumo de tokens de IA y una estrategia SEO sólida.

## 2. El Cerebro de Generación (n8n + Gemini 2.5 Pro)

El workflow en n8n actúa como la línea de ensamblaje.

*   **Paso 1: Ideación (La Semilla):** El flujo arranca a partir de temas clave predefinidos en la base de datos o propuestos mediante investigación automática (tendencias, noticias del sector).
*   **Paso 2: El Pilar (Blog):** Un nodo de IA redacta un artículo de ~1000 palabras estructurado para SEO (H1, H2, H3, viñetas, CTA). El formato de salida es **Markdown** para facilitar el renderizado en Next.js.
*   **Paso 3: El Despiece (Spin-offs):** El artículo pilar se procesa en paralelo por nodos especializados:
    *   **X (Twitter):** Extracción de la idea más fuerte para generar un hilo o un post de impacto.
    *   **Facebook / LinkedIn:** Adaptación a un tono profesional y conversacional que invite a leer el artículo completo.
    *   **Instagram:** Creación de guiones para Reels o estructuras para Carruseles educativos (separados por "slides").
*   **Paso 4: Almacenamiento:** El contenido empaquetado se inserta en Supabase con el estado `borrador`.

## 3. Base de Datos (Supabase Cloud)

Se requieren nuevas tablas para soportar este flujo:

### Tabla: `content_pipeline`
Almacena todo el contenido generado y su estado de publicación.
*   `id` (uuid, PK)
*   `tema` (text)
*   `blog_md` (text) - Contenido Markdown del artículo.
*   `copy_x` (text)
*   `copy_fb_linkedin` (text)
*   `copy_ig` (text)
*   `estado` (enum: 'borrador', 'aprobado', 'publicado')
*   `fecha_programada` (timestamptz)

### Tabla: `campaign_metrics`
Almacena el rendimiento de los anuncios (actualizado periódicamente por n8n).
*   `id` (uuid, PK)
*   `plataforma` (text) - Ej. 'Meta', 'Google'
*   `campana_nombre` (text)
*   `gasto` (numeric)
*   `clics` (integer)
*   `leads` (integer)
*   `fecha_registro` (date)

## 4. El Front-End (Next.js 15)

### Panel Administrativo (`/admin/marketing`)
*   **Kanban de Contenidos:** Interfaz para revisar los registros en estado `borrador`. Permite edición manual y aprobación.
*   **Dashboard Analítico:** Visualización de métricas de ads (ROAS, gasto, CTR) consumiendo directamente de la tabla `campaign_metrics` para latencia cero.
*   **Trigger de Publicación:** Al cambiar el estado a `aprobado`, un webhook avisa a n8n para que despache el contenido a las APIs de redes sociales.

### El Blog Público (`/blog`)
*   **`/blog`:** Listado de artículos publicados.
*   **`/blog/[slug]`:** Ruta dinámica que consume la columna `blog_md` de Supabase y la renderiza usando librerías como `react-markdown` y `@tailwindcss/typography` para asegurar un diseño impecable acorde al sitio web.

## 5. Integración de Ads (ETL con n8n)

Para evitar la saturación de llamadas a las APIs de publicidad desde el frontend:
1.  Un flujo de n8n se ejecuta en intervalos regulares (ej. cada hora).
2.  Extrae las métricas directamente de Meta Ads y Google Ads.
3.  Actualiza (Upsert) los datos en la tabla `campaign_metrics` de Supabase.
4.  El panel de Next.js simplemente lee esta base de datos, garantizando una carga rápida y sin bloqueos de API.