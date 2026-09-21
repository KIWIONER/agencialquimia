# Plan de Implementación: Motor de Contenido y Automatización de Ads

Este plan detalla los pasos para implementar las ideas propuestas en `@motor-contenido-ads.md` y `@marketing-advertising-automation-architecture.md`, integrando la lógica de marketing y publicidad en el panel de administración (`/admin`) de AgenciAlquimia.

## 1. Análisis de Estructuras Existentes

### Frontend (Next.js 15 App Router)
- **Estructura Base:** El panel `/admin` ya existe y está configurado con componentes de UI, Tailwind v4 (tema Dark Charcoal), y autenticación parcial o planeada.
- **Patrones de UI:** Contamos con componentes de tablas de datos (`DataTable`), tarjetas, y vistas modulares. Podemos reusar estos para el Kanban de contenidos y el Dashboard de métricas.
- **Rutas Dinámicas:** Next.js App Router facilita la creación de rutas como `/admin/marketing/calendar` y `/admin/marketing/analytics`.
- **Blog:** No hay una estructura de blog pública (`/blog`) existente orientada a Markdown/MDX renderizado desde base de datos, por lo que requerirá implementarse (Rutas Dinámicas Server-Side).

### Backend / Datos (Supabase)
- **Conexión Existente:** El cliente de Supabase ya está inicializado y operando con otras tablas del negocio.
- **Faltan Tablas:** Necesitamos crear `content_pipeline` y `campaign_metrics` como se describe en la arquitectura.

### Orquestación (n8n)
- **Cerebro Operativo:** n8n ya está en el VPS procesando leads y agentes. Podemos añadir webhooks para que Next.js le mande señales de "Aprobar Post", y configurar cronjobs para extraer métricas de Ads.

---

## 2. Fases de Implementación del Frontend (Panel Admin)

Se crearán las siguientes rutas y componentes bajo `/app/admin/marketing/`:

### Fase 2.1: Layout de Marketing y Dashboard Principal (`/admin/marketing`)
- **Layout (`layout.tsx`):** Un sub-navegador lateral o superior (Tabs) para cambiar entre *Dashboard*, *Calendario de Contenidos*, *Generador IA*, y *Control de Campañas*.
- **Dashboard (`page.tsx`):**
  - Consumo en tiempo real de la tabla `campaign_metrics`.
  - Componentes gráficos simples (barras/líneas) usando `recharts` o componentes Tailwind puros.
  - Tarjetas de KPI (KPI Cards): Inversión Total, CPA, Leads de Ads.

### Fase 2.2: Kanban / Calendario de Contenidos (`/admin/marketing/calendar`)
- **UI:** Una vista de lista o Kanban (Borrador, Aprobado, Publicado) usando los datos de `content_pipeline`.
- **Funcionalidad:**
  - Botón "Generar Nuevo" (Llama a n8n vía Webhook para disparar el prompt de generación).
  - Modal de Edición Rápida: Al hacer clic en un borrador, se abre un modal con el Markdown del Blog, el texto para X, y el texto para LinkedIn.
  - Botón de "Aprobar": Cambia el estado en Supabase, lo cual puede detonar un Webhook hacia n8n para la publicación final.

### Fase 2.3: Configuración de Campañas (`/admin/marketing/campaigns`)
- **UI:** Tabla que lista campañas activas y permite configurar "Reglas" (ej. "Pausar si CPA > 15€").
- **Acción:** Guarda estas configuraciones en Supabase para que el cron de n8n las lea antes de tomar decisiones sobre Ads.

---

## 3. Fase de Implementación del Blog Público (`/blog`)

- **Ruta Lista:** `/app/blog/page.tsx` -> Lista los artículos (`content_pipeline` donde `estado = publicado`).
- **Ruta Artículo:** `/app/blog/[slug]/page.tsx` -> Renderiza el `blog_md` usando `react-markdown` con los plugins de estilos tipográficos de Tailwind (`@tailwindcss/typography`).

---

## 4. Fase de Base de Datos (Supabase DDL)

Se debe ejecutar un script SQL contra Supabase para preparar la estructura (usando el script `/root/scripts/supabase-sql.sh`):

```sql
-- 1. Tabla de Contenidos (El Pilar y sus spin-offs)
CREATE TABLE content_pipeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tema TEXT NOT NULL,
  slug TEXT UNIQUE,
  blog_md TEXT,
  copy_x TEXT,
  copy_fb_linkedin TEXT,
  copy_ig TEXT,
  estado TEXT DEFAULT 'borrador' CHECK (estado IN ('borrador', 'aprobado', 'publicado')),
  fecha_programada TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Métricas de Campañas (El Dashboard ETL)
CREATE TABLE campaign_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plataforma TEXT NOT NULL,
  campana_nombre TEXT NOT NULL,
  gasto NUMERIC DEFAULT 0,
  clics INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  fecha_registro DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plataforma, campana_nombre, fecha_registro)
);
```

---

## 5. Próximos Pasos Recomendados

1. **Paso Inicial:** Crear el esquema SQL detallado arriba en Supabase Cloud.
2. **Paso Dos:** Desarrollar el esqueleto frontend en `/admin/marketing` (Layout y Tabs).
3. **Paso Tres:** Conectar el *Dashboard* y el *Calendario* a las tablas vacías de Supabase para confirmar lectura.
4. **Paso Cuatro:** Armar el primer workflow en n8n ("Motor de Generación") para que empiece a llenar la tabla de borradores automáticamente.
5. **Paso Quinto:** Desarrollar el front-end público del blog.