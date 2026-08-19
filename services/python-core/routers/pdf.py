from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, HttpUrl
from dependencies.auth import verify_internal_signature
from jinja2 import Environment, FileSystemLoader
import io
import os
import weasyprint

router = APIRouter(prefix="/pdf", tags=["PDF"])

# Directorio de templates
TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "templates")
jinja_env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))

class FalloItem(BaseModel):
    nombre: str
    solucion: str

class AuditPDFRequest(BaseModel):
    name: str
    url: str
    sector: str
    ubicacion: str
    score: int
    potencial: str
    fallos: list[FalloItem]

@router.post("/generate", dependencies=[Depends(verify_internal_signature)])
async def generate_audit_pdf(payload: AuditPDFRequest):
    """
    Genera un informe PDF de 2 páginas con diseño premium a partir de datos del lead.
    Retorna el PDF compilado directamente como stream de descarga.
    """
    try:
        # 1. Cargar y renderizar template con Jinja2
        template = jinja_env.get_template("audit.html")
        html_content = template.render(
            name=payload.name,
            url=payload.url,
            sector=payload.sector,
            ubicacion=payload.ubicacion,
            score=payload.score,
            potencial=payload.potencial,
            fallos=[{"nombre": f.nombre, "solucion": f.solucion} for f in payload.fallos]
        )

        # 2. Compilar HTML a PDF usando WeasyPrint en memoria
        pdf_io = io.BytesIO()
        weasyprint.HTML(string=html_content).write_pdf(target=pdf_io)
        pdf_io.seek(0)

        # 3. Retornar streaming HTTP
        filename = f"auditoria_{payload.name.replace(' ', '_')}.pdf"
        headers = {
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
        return StreamingResponse(pdf_io, media_type="application/pdf", headers=headers)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando PDF: {str(e)}")
