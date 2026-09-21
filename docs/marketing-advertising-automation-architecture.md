# Propuesta de Arquitectura: Automatización de Publicidad, Contenidos y Métricas

> **Documento de Referencia e Ideas de Arquitectura para Futuros Planes de Implementación**  
> **Proyecto:** AgenciAlquimia (`agencialquimia-web`)  
> **Fecha:** 2026-09-13  
> **Ubicación:** `docs/marketing-advertising-automation-architecture.md`

---

## 1. Visión General del Proyecto

El objetivo es incorporar en el panel de administración (`/admin`) de AgenciAlquimia un **Centro Integral de Automatización de Marketing y Publicidad**:
1. **Generación y distribución continua de contenidos**: Redacción asistida y autónoma para el Blog corporativo (SEO) y redes sociales (LinkedIn, X/Twitter, Instagram/Facebook).
2. **Automatización de publicidad (Ads)**: Creación de copys y creatividades con IA, control de presupuestos y alertas de rendimiento.
3. **Métricas en tiempo real**: Dashboard unificado con KPIs comerciales, tráfico orgánico, leads captados y rendimiento publicitario (Meta Ads, Google Ads, etc.).

---

## 2. Arquitectura del Sistema

Aprovechando la infraestructura actual (Next.js 15 App Router, React 19, Tailwind v4 con tema Dark Charcoal `#0b0d10`, base de datos y orquestación con n8n):

```text
                  ┌────────────────────────────────────────────────────────┐
                  │                 PANEL ADMIN (/admin)                  │
                  │  - Calendario de Contenidos & Generador IA             │
                  │  - Editor de Campañas y Creatividades                  │
                  │  - Dashboard de Métricas en Tiempo Real                │
                  └───────────────┬────────────────────────┬───────────────┘
                                  │                        │
               Acciones / Creación│                        │ Lectura Métricas
                                  ▼                        ▼
                  ┌────────────────────────┐      ┌────────────────────────┐
                  │ Webhooks n8n (Motor)   │      │ Base de Datos / Cache  │
                  │ - Pipeline de LLM      │      │ - Posts programados    │
                  │ - Conexión con Redes   │      │ - Snapshots de Métricas│
                  │ - Conexión con Ads APIs│      │ - Logs de rendimiento  │
                  └───────────────┬────────┘      └────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
    [Blog Nativo]          [Redes Sociales]        [Campañas Ads]
    (Next.js MDX/CMS)      (LinkedIn, X, IG/FB)   (Meta Ads, Google Ads)
```

---

## 3. Módulos y Funcionalidades

### Módulo A: Motor de Contenidos Autónomo (Blog + Redes)

*Concepto: "Crear una vez, distribuir en todas partes con IA"*

1. **Pipeline de Repurposing de Contenido:**
   - **Entrada única:** Tema central, URL de referencia del sector, o audio dictado.
   - **Orquestación con n8n + LLM:**
     - **Artículo de Blog:** Estructura SEO completa (H1-H3, slug, metadatos, tags y formato MDX).
     - **LinkedIn:** Publicación orientada a toma de decisiones B2B con storytelling y ganchos.
     - **X (Twitter):** Hilo de 3 a 5 tuits directos y con llamadas a la acción.
     - **Instagram / Meta:** Texto para carrusel visual y prompt para generación de imagen.
2. **Modos de Operación:**
   - **Modo Asistido (Human-in-the-Loop - Fase Inicial):** La IA redacta en estado borrador. El usuario revisa en `/admin/marketing/calendar` y aprueba con un clic.
   - **Modo Autónomo (Autopilot):** Publicación automática basada en cadencias semanales preconfiguradas.
3. **Mecanismo de Publicación:**
   - **Blog:** Endpoint interno API de Next.js que persiste el artículo directamente en el sistema de blog.
   - **Redes:** Conexión vía webhook n8n con APIs oficiales o agregadores como Metricool / Buffer / Ayrshare.

---

## 4. Módulo B: Métricas en Tiempo Real & Analítica Unificada

*Concepto: Decisiones basadas en datos sin salir del panel administrativo*

1. **Dashboard de KPIs Clave (`/admin/analytics` o `/admin/marketing`):**
   - **Inversión Publicitaria Total (€):** Consolidado de plataformas activas.
   - **Leads Generados:** Total de conversiones registradas por formulario web y chat comercial IA.
   - **Coste por Adquisición (CPA):** Inversión / leads obtenidos.
   - **Tráfico y Rendimiento Orgánico:** Visitas al blog, impresiones y clics en publicaciones de redes.
2. **Estrategia de Carga Rápida (Sin sobrecargar APIs externas):**
   - **Sincronización en Segundo Plano:** Cronjob en n8n que consulta las métricas de Ads cada 15-30 minutos y guarda snapshots en la base de datos local.
   - **Sincronización Bajo Demanda:** Botón *"Actualizar datos ahora"* en el admin para refrescar en vivo vía webhook.

---

## 5. Módulo C: Automatización y Optimización de Publicidad (Ads)

*Concepto: Pruebas multivariantes y protección automática de presupuesto*

1. **Generador de Creatividades y Copies:**
   - Creación de variaciones de copy enfocadas en perfiles de pymes locales (ahorro de tiempo, digitalización, automatización de ventas).
2. **Reglas de Seguridad y Presupuesto:**
   - n8n evalúa el rendimiento diario:
     - Si el CPA supera el umbral límite configurado durante 48h → Se pausa el anuncio automáticamente y se envía alerta a Telegram/WhatsApp.
     - Si el CTR supera expectativas con bajo CPA → Sugerencia de escalar presupuesto.

---

## 6. Estructura de Rutas y Componentes en `/admin`

Siguiendo el diseño Dark Charcoal (`#0b0d10`) con acentos esmeralda y TailwindCSS v4:

- **`/admin/marketing`**: Vista general y resumen ejecutivo (resumen de métricas, próximas publicaciones, estado de campañas).
- **`/admin/marketing/calendar`**: Calendario interactivo con estados de publicación (`Borrador IA`, `Programado`, `Publicado`).
- **`/admin/marketing/create`**: Generador asistido con previsualización dividida (entrada de prompt/tema a la izquierda, previsualización exacta a la derecha).
- **`/admin/marketing/campaigns`**: Control de anuncios y configuración de reglas automáticas de presupuesto.

---

## 7. Fases de Implementación Futura

1. **Fase 1 (Motor del Blog y Contenido):**
   - Formulario de creación asistida con IA en el panel.
   - Generación de artículos SEO y guardado en el blog.
2. **Fase 2 (Conectores con Redes Sociales):**
   - Webhook n8n para adaptar el artículo de blog y publicar en LinkedIn / X.
   - Calendario editorial en `/admin/marketing/calendar`.
3. **Fase 3 (Dashboard de Métricas):**
   - Integración de API de Meta Ads / Google Ads mediante n8n.
   - Vista de KPIs comerciales y métricas de tráfico en el admin.
4. **Fase 4 (Reglas y Escala de Publicidad):**
   - Automatización de pausas de anuncios por CPA y optimización continua de copys.
