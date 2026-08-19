from fastapi import APIRouter, Depends
from pydantic import BaseModel
from dependencies.auth import verify_internal_signature

router = APIRouter(prefix="/scoring", tags=["Scoring"])

class ScoringRequest(BaseModel):
    negocio: str
    url: str | None = None
    sector: str | None = None
    email: str | None = None
    telefono: str | None = None
    fallos_detectados: list[str] = []
    tech_stack: list[str] = []

class ScoringResult(BaseModel):
    score: int
    grade: str
    recomendaciones: list[str]
    potencial_venta: str

@router.post("/calculate", response_model=ScoringResult, dependencies=[Depends(verify_internal_signature)])
async def calculate_lead_score(payload: ScoringRequest):
    """
    Motor heurístico avanzado de scoring de leads.
    Analiza la calidad digital y determina el potencial de venta y acciones de mejora.
    """
    score = 100
    recs = []
    
    # 1. Analizar Web
    if not payload.url or payload.url.strip() == "" or payload.url.lower() == "null":
        score -= 40
        recs.append("El negocio no dispone de sitio web activo. Urgente: Crear Landing Page optimizada.")
    else:
        # Si tiene web, evaluar fallos
        if any("lento" in f.lower() or "velocidad" in f.lower() for f in payload.fallos_detectados):
            score -= 10
            recs.append("Optimizar rendimiento WPO: La web actual tarda demasiado en cargar.")
        
        # Evaluar falta de chat
        has_chat = any("chat" in f.lower() or "bot" in f.lower() for f in payload.fallos_detectados)
        if not has_chat:
            score -= 15
            recs.append("Integrar Agente IA (Max): Fuga de leads por falta de atención 24/7 en vivo.")

    # 2. Analizar Datos de Contacto
    if not payload.email or "@" not in payload.email:
        score -= 10
        recs.append("Completar correo electrónico: Falta canal de captación por Email Marketing.")
    
    if not payload.telefono or len(payload.telefono.strip()) < 9:
        score -= 10
        recs.append("Completar número telefónico: Freno en el cierre de ventas por falta de WhatsApp directo.")

    # 3. Analizar Tecnologías
    if "Wix" in payload.tech_stack:
        score -= 10
        recs.append("Migrar de Wix a Next.js/React: Plataforma lenta y limitada para SEO profesional.")

    # Ajustes por Sector de Alto Valor (Prioritarios para automatizaciones de AgenciAlquimia)
    sectores_clave = ["dental", "inmobiliaria", "salud", "wellness", "clínica", "restaurante", "estética"]
    es_clave = False
    if payload.sector:
        s_lower = payload.sector.lower()
        es_clave = any(x in s_lower for x in sectores_clave)
        if es_clave:
            score += 10

    # Asegurar límites del score
    score = max(1, min(100, score))

    # Determinar Grado de Eficiencia
    if score >= 90:
        grade = "A"
        potencial_venta = "Eficiencia digital alta. Potencial enfocado únicamente en optimización de CRM o APIs avanzadas."
    elif score >= 75:
        grade = "B"
        potencial_venta = "Eficiencia media-alta. Buen candidato para implementar WhatsApp Automático y notificaciones."
    elif score >= 50:
        grade = "C"
        potencial_venta = "Eficiencia media. Oportunidad idónea para instalar Chatbot Max e inyectar leads automatizados."
    elif score >= 30:
        grade = "D"
        potencial_venta = "Eficiencia baja. Negocio con severas deficiencias de conversión. Prioridad alta de contacto comercial."
    else:
        grade = "F"
        potencial_venta = "Presencia digital crítica o nula. Requiere re-estructuración completa de web y canales de captación."

    return ScoringResult(
        score=score,
        grade=grade,
        recomendaciones=recs if recs else ["Mantener monitoreado. Todos los canales base están optimizados."],
        potencial_venta=potencial_venta
    )
