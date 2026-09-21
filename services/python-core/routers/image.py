from fastapi import APIRouter, HTTPException
import httpx
import os
import google.generativeai as genai
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter(
    prefix="/marketing/image",
    tags=["marketing", "image"]
)

class ImageGenerationRequest(BaseModel):
    draft_id: str
    tema: str

@router.post("/generate")
async def generate_image(req: ImageGenerationRequest) -> Dict[str, Any]:
    """
    Genera una imagen usando Gemini Imagen 3 y la sube a Supabase Storage.
    """
    # Usamos la clave de Gemini del entorno
    api_key = os.getenv("GEMINI_API_KEY")
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("PUBLIC_SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("PUBLIC_SUPABASE_ANON_KEY")

    if not api_key or not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Missing API Keys in environment")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('imagen-3.0-generate-001')
    
    style_prompt = f"Un diseño 3D corporativo, moderno y minimalista, paleta de colores esmeralda y grafito, estilo startup tecnológica, sin texto explícito. Representación visual del siguiente tema: {req.tema}"

    try:
        result = model.generate_images(prompt=style_prompt)
        image_url = result.images[0].url
        
        # Descargar y subir a Supabase
        async with httpx.AsyncClient() as client:
            img_response = await client.get(image_url)
            img_bytes = img_response.content
            
            file_path = f"covers/{req.draft_id}.png"
            storage_url = f"{supabase_url}/storage/v1/object/marketing_assets/{file_path}"
            
            await client.post(
                storage_url,
                headers={
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": "image/png"
                },
                content=img_bytes
            )
            
            public_url = f"{supabase_url}/storage/v1/object/public/marketing_assets/{file_path}"
            
            return {
                "success": True,
                "draft_id": req.draft_id,
                "image_url": public_url
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini/Supabase Error: {str(e)}")
