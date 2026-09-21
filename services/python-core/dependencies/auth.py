from fastapi import Header, HTTPException, Request
import hmac
import hashlib
import os
import time

# Obtener secreto interno compartido desde las variables de entorno
ENVIRONMENT = os.getenv("ENVIRONMENT", os.getenv("NODE_ENV", "development"))
PYTHON_INTERNAL_SECRET = os.getenv("PYTHON_INTERNAL_SECRET", "agencialquimia_vps_python_internal_secret_key_2026_super_secure_8877")

# En entorno de producción, fallar críticamente si falta el secreto
if ENVIRONMENT == "production" and (not PYTHON_INTERNAL_SECRET or PYTHON_INTERNAL_SECRET == "secret-dev-key"):
    raise RuntimeError("ERROR CRÍTICO DE SEGURIDAD: PYTHON_INTERNAL_SECRET no está configurado en entorno de producción.")

async def verify_internal_signature(
    request: Request,
    x_internal_signature: str = Header(..., alias="X-Internal-Signature"),
    x_internal_timestamp: str = Header(None, alias="X-Internal-Timestamp")
):
    """
    Verifica que la petición provenga del servidor Next.js de AgenciAlquimia.
    Valida firma HMAC SHA-256 (estructurada y simple), ventana temporal (< 5 min) y límite de memoria (< 2MB).
    """
    # 1. Protección contra DoS de Memoria: Verificar Content-Length (< 2MB)
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > 2 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Payload demasiado grande (límite máximo 2MB)"
        )

    # 2. Protección Anti-Replay: Verificar Timestamp (máx. 5 minutos de diferencia)
    if x_internal_timestamp:
        try:
            req_time = float(x_internal_timestamp)
            if abs(time.time() - req_time) > 300:
                raise HTTPException(
                    status_code=403,
                    detail="Firma expirada: Petición fuera de la ventana de 5 minutos"
                )
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Formato de X-Internal-Timestamp no válido"
            )

    # 3. Consumir el cuerpo del request en memoria (seguro < 2MB)
    body = await request.body()

    # 4. Calcular firmas esperadas
    # A) Firma Estructurada Red-Team (METHOD:PATH:TIMESTAMP:BODY_HASH)
    body_hash = hashlib.sha256(body).hexdigest()
    ts_str = x_internal_timestamp or ""
    structured_msg = f"{request.method.upper()}:{request.url.path}:{ts_str}:{body_hash}"
    structured_expected = hmac.new(
        PYTHON_INTERNAL_SECRET.encode(),
        structured_msg.encode(),
        hashlib.sha256
    ).hexdigest()

    # B) Firma Simple (compatibilidad con firmas directas sobre el body)
    simple_expected = hmac.new(
        PYTHON_INTERNAL_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    # 5. Comparación en tiempo constante para evitar ataques de canal lateral
    valid_structured = hmac.compare_digest(structured_expected, x_internal_signature)
    valid_simple = hmac.compare_digest(simple_expected, x_internal_signature)

    if not (valid_structured or valid_simple):
        raise HTTPException(
            status_code=403,
            detail="Acceso prohibido: Firma interna HMAC no válida o no autorizada"
        )
