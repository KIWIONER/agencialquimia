from fastapi import Header, HTTPException, Request
import hmac
import hashlib
import os

# Obtener secreto interno compartido desde las variables de entorno
PYTHON_INTERNAL_SECRET = os.getenv("PYTHON_INTERNAL_SECRET", "secret-dev-key")

async def verify_internal_signature(request: Request, x_internal_signature: str = Header(...)):
    """
    Verifica que la petición provenga del servidor Next.js de AgenciAlquimia.
    Valida la firma HMAC SHA-256 usando el cuerpo de la petición y el secreto compartido.
    """
    body = await request.body()
    expected_signature = hmac.new(
        PYTHON_INTERNAL_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(expected_signature, x_internal_signature):
        raise HTTPException(
            status_code=403,
            detail="Acceso prohibido: Firma interna no válida o no autorizada"
        )
