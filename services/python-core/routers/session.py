"""
==============================================================================
Router: routers/session.py
==============================================================================
Descripción:
  Endpoints REST para gestión de sesiones de visitantes y administradores
  mediante Cookies HttpOnly, validación Pydantic y Seguridad por Ambigüedad.
==============================================================================
"""

import os
from fastapi import APIRouter, Depends, Response, HTTPException, status
from pydantic import BaseModel, Field
from dependencies.cookies import get_or_create_visitor_id, require_admin_session, ADMIN_COOKIE_NAME, VISITOR_COOKIE_NAME
from lib.security_cookies import create_access_jwt

router = APIRouter(prefix="/session", tags=["Session & Cookies"])

# Credenciales de administración configuradas en entorno
ADMIN_SECRET_PASSWORD = os.getenv("ADMIN_PASSWORD_HASH", "alquimia2026admin")


class LoginRequest(BaseModel):
    password: str = Field(..., min_length=1, max_length=256, description="Contraseña de acceso")


class SessionStatusResponse(BaseModel):
    authenticated: bool
    role: str
    visitor_id: str


@router.post("/login")
async def login(payload: LoginRequest, response: Response):
    """
    Inicia sesión administrativa.
    Aplica el principio de Seguridad por Ambigüedad (401 unificado ante credenciales incorrectas).
    Emite una cookie HttpOnly 'admin_session' con el token JWT.
    """
    # Validación de contraseña
    if payload.password != ADMIN_SECRET_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Credenciales inválidas", "code": "AUTH_INVALID"}
        )

    # Crear token JWT con claims mínimos
    token = create_access_jwt({"sub": "admin_user", "role": "admin"}, expires_minutes=1440)

    # Inyectar cookie HttpOnly en la respuesta (La Muralla Técnica)
    response.set_cookie(
        key=ADMIN_COOKIE_NAME,
        value=token,
        max_age=60 * 60 * 24,  # 24 horas
        httponly=True,
        secure=True,
        samesite="lax",
        path="/"
    )

    return {
        "success": True,
        "message": "Sesión iniciada con éxito",
        "role": "admin"
    }


@router.get("/visitor")
async def get_visitor_context(visitor_id: str = Depends(get_or_create_visitor_id)):
    """
    Obtiene o inicializa el identificador de sesión del visitante anónimo.
    Utilizado por el Chatbot IA y diagnósticos sin necesidad de autenticación.
    """
    return {
        "success": True,
        "visitor_id": visitor_id,
        "context": {
            "channel": "web",
            "active": True
        }
    }


@router.get("/protected", dependencies=[Depends(require_admin_session)])
async def get_protected_data():
    """
    Endpoint protegido que requiere cookie 'admin_session' válida.
    """
    return {
        "success": True,
        "message": "Acceso concedido a datos protegidos de la arquitectura",
        "data": {
            "server": "FastAPI Python Core",
            "security": "HttpOnly JWT Verified"
        }
    }


@router.post("/logout")
async def logout(response: Response):
    """
    Cierra la sesión destruyendo las cookies HttpOnly activas.
    """
    response.delete_cookie(key=ADMIN_COOKIE_NAME, path="/", httponly=True, secure=True, samesite="lax")
    response.delete_cookie(key=VISITOR_COOKIE_NAME, path="/", httponly=True, secure=True, samesite="lax")
    return {
        "success": True,
        "message": "Sesión cerrada correctamente"
    }
