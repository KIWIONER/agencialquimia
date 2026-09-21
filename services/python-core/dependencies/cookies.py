"""
==============================================================================
Módulo: dependencies/cookies.py
==============================================================================
Descripción:
  Dependencias de FastAPI para inyección y validación de Cookies HttpOnly y sesiones.
==============================================================================
"""

import uuid
from typing import Annotated, Optional, Dict, Any
from fastapi import Request, Response, Cookie, HTTPException, status
from lib.security_cookies import sign_cookie, verify_cookie, verify_access_jwt

VISITOR_COOKIE_NAME = "alquimia_visitor"
ADMIN_COOKIE_NAME = "admin_session"
COOKIE_MAX_AGE_30_DAYS = 60 * 60 * 24 * 30  # 30 días en segundos


async def get_or_create_visitor_id(request: Request, response: Response) -> str:
    """
    Dependencia que extrae el visitor_id de la cookie firmada 'alquimia_visitor'.
    Si no existe o la firma fue manipulada, genera un nuevo UUID v4 y emite
    la cookie firmada con HttpOnly=True, Secure=True y SameSite='lax'.
    """
    raw_cookie = request.cookies.get(VISITOR_COOKIE_NAME)
    is_valid, visitor_id = verify_cookie(raw_cookie)

    if is_valid and visitor_id:
        return visitor_id

    # Generar nuevo visitor ID seguro
    new_id = f"vis_{uuid.uuid4().hex[:16]}"
    signed_val = sign_cookie(new_id)

    # Inyectar cookie en la respuesta
    response.set_cookie(
        key=VISITOR_COOKIE_NAME,
        value=signed_val,
        max_age=COOKIE_MAX_AGE_30_DAYS,
        httponly=True,
        secure=True,
        samesite="lax",
        path="/"
    )
    return new_id


async def require_admin_session(
    admin_session: Annotated[Optional[str], Cookie(alias=ADMIN_COOKIE_NAME)] = None
) -> Dict[str, Any]:
    """
    Dependencia de seguridad que valida el JWT de la cookie 'admin_session'.
    Aplica el principio de Seguridad por Ambigüedad: devuelve un 401 unificado
    si la cookie no existe, es inválida o expiró.
    """
    if not admin_session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Credenciales inválidas o sesión no encontrada", "code": "AUTH_REQUIRED"}
        )

    is_valid, payload = verify_access_jwt(admin_session)
    if not is_valid or not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Credenciales inválidas o sesión expirada", "code": "AUTH_EXPIRED"}
        )

    return payload
