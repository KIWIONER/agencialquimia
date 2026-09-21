"""
==============================================================================
Test Suite: tests/test_cookies.py
==============================================================================
Descripción:
  Pruebas automatizadas de seguridad para el manejo de Cookies HttpOnly,
  firma HMAC Anti-Tampering, tokens JWT y Seguridad por Ambigüedad.
==============================================================================
"""

import time
import pytest
from fastapi.testclient import TestClient
from main import app
from lib.security_cookies import sign_cookie, verify_cookie, create_access_jwt, verify_access_jwt
from dependencies.cookies import VISITOR_COOKIE_NAME, ADMIN_COOKIE_NAME

client = TestClient(app)


def test_hmac_cookie_signing_and_verification():
    """Verifica que la firma HMAC detecte valores válidos y rechace manipulaciones."""
    original_val = "visitor_12345"
    signed = sign_cookie(original_val)
    
    assert signed.startswith(original_val)
    assert "." in signed

    # Verificación válida
    is_valid, extracted = verify_cookie(signed)
    assert is_valid is True
    assert extracted == original_val

    # Intento de manipulación (Cookie Tampering)
    tampered = signed.replace("12345", "99999")
    is_valid_tampered, val_tampered = verify_cookie(tampered)
    assert is_valid_tampered is False
    assert val_tampered is None

    # Valores nulos o malformados
    assert verify_cookie(None) == (False, None)
    assert verify_cookie("invalid_string_without_dot") == (False, None)


def test_jwt_token_creation_and_expiration():
    """Verifica la anatomía del JWT, firma y expiración temporal."""
    payload = {"sub": "admin_user", "role": "admin"}
    token = create_access_jwt(payload, expires_minutes=10)

    is_valid, claims = verify_access_jwt(token)
    assert is_valid is True
    assert claims["sub"] == "admin_user"
    assert claims["role"] == "admin"
    assert "exp" in claims

    # Token expirado (exp en el pasado)
    expired_token = create_access_jwt(payload, expires_minutes=-5)
    is_valid_exp, claims_exp = verify_access_jwt(expired_token)
    assert is_valid_exp is False
    assert claims_exp is None

    # Token manipulado
    tampered_token = token[:-4] + "abcd"
    assert verify_access_jwt(tampered_token)[0] is False


def test_visitor_cookie_generation_and_persistence():
    """Verifica que el endpoint /session/visitor emita y persista la cookie HttpOnly."""
    # 1. Primera visita: Sin cookie
    response = client.get("/session/visitor")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "visitor_id" in data
    
    # Comprobar cabecera Set-Cookie
    cookies = response.cookies
    assert VISITOR_COOKIE_NAME in cookies
    raw_cookie = cookies[VISITOR_COOKIE_NAME]
    
    # Verificar firma de la cookie
    is_valid, extracted_id = verify_cookie(raw_cookie)
    assert is_valid is True
    assert extracted_id == data["visitor_id"]

    # 2. Segunda visita: Reenviando la cookie obtenida
    response2 = client.get("/session/visitor", cookies={VISITOR_COOKIE_NAME: raw_cookie})
    assert response2.status_code == 200
    assert response2.json()["visitor_id"] == extracted_id


def test_admin_login_security_by_ambiguity_and_cookie():
    """Verifica el login administrativo con Seguridad por Ambigüedad y cookie HttpOnly."""
    # Intento con contraseña incorrecta (debe dar 401 genérico)
    res_fail = client.post("/session/login", json={"password": "wrong_password_123"})
    assert res_fail.status_code == 401
    assert res_fail.json()["detail"]["code"] == "AUTH_INVALID"
    assert ADMIN_COOKIE_NAME not in res_fail.cookies

    # Intento con contraseña correcta
    res_ok = client.post("/session/login", json={"password": "alquimia2026admin"})
    assert res_ok.status_code == 200
    assert res_ok.json()["success"] is True
    assert ADMIN_COOKIE_NAME in res_ok.cookies

    # Probar acceso a endpoint protegido con la cookie emitida
    admin_cookie = res_ok.cookies[ADMIN_COOKIE_NAME]
    res_protected = client.get("/session/protected", cookies={ADMIN_COOKIE_NAME: admin_cookie})
    assert res_protected.status_code == 200
    assert res_protected.json()["success"] is True

    # Probar acceso sin cookie
    res_unauth = client.get("/session/protected")
    assert res_unauth.status_code == 401


def test_session_logout_deletes_cookies():
    """Verifica que /session/logout destruya las cookies con directivas de expiración."""
    response = client.post("/session/logout")
    assert response.status_code == 200
    assert response.json()["success"] is True
