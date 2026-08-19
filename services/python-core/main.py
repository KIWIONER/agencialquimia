"""
AgenciAlquimia Python Core - FastAPI Sidecar
=============================================
Microservicio interno para procesamiento pesado (scraping, scoring, PDF, RAG).
Comunicación segura con Next.js mediante HMAC SHA-256 por cabecera X-Internal-Signature.
"""
import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dependencies.auth import verify_internal_signature
from routers.hunter import router as hunter_router

app = FastAPI(
    title="AgenciAlquimia Python Core API",
    description="Servicio interno sidecar de Python para procesamiento pesado y automatización",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers registrados
app.include_router(hunter_router)

@app.get("/health")
async def health_check():
    """Endpoint de salud para verificar que el servicio está activo."""
    return {
        "status": "healthy",
        "service": "agencialquimia-python-core",
        "version": "1.0.0"
    }

@app.post("/test-auth", dependencies=[Depends(verify_internal_signature)])
async def test_auth():
    """Endpoint de prueba para verificar que la firma HMAC funciona."""
    return {
        "success": True,
        "message": "Firma interna validada con éxito"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PYTHON_SERVICE_PORT", 8005))
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=True)
