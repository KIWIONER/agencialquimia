"""
==============================================================================
Módulo: lib/security_cookies.py
==============================================================================
Descripción:
  Módulo criptográfico para firma y verificación de cookies seguras (Anti-Tampering)
  y gestión de tokens JWT con claims mínimos para AgenciAlquimia FastAPI Core.
==============================================================================
"""

import os
import hmac
import hashlib
import time
import json
import base64
from typing import Tuple, Optional, Dict, Any

# Secreto interno para firma criptográfica
DEFAULT_SECRET = os.getenv("PYTHON_INTERNAL_SECRET", "agencialquimia-dev-secret-key-32chars-min!!")


def _get_secret(secret: Optional[str] = None) -> bytes:
    s = secret or os.getenv("PYTHON_INTERNAL_SECRET", DEFAULT_SECRET)
    return s.encode("utf-8")


def sign_cookie(value: str, secret: Optional[str] = None) -> str:
    """
    Firma un valor de cookie con HMAC SHA-256 para prevenir manipulaciones.
    Formato de salida: {value}.{signature_hex}
    """
    key = _get_secret(secret)
    signature = hmac.new(key, value.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{value}.{signature}"


def verify_cookie(signed_value: Optional[str], secret: Optional[str] = None) -> Tuple[bool, Optional[str]]:
    """
    Verifica la firma criptográfica de una cookie firmada.
    Devuelve (True, original_value) si es auténtica, o (False, None) si fue manipulada o es inválida.
    """
    if not signed_value or "." not in signed_value:
        return False, None

    try:
        value, signature = signed_value.rsplit(".", 1)
        key = _get_secret(secret)
        expected = hmac.new(key, value.encode("utf-8"), hashlib.sha256).hexdigest()

        # Comparación en tiempo constante para prevenir ataques de temporización (Timing Attacks)
        if hmac.compare_digest(signature, expected):
            return True, value
        return False, None
    except Exception:
        return False, None


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _base64url_decode(data: str) -> bytes:
    rem = len(data) % 4
    if rem > 0:
        data += "=" * (4 - rem)
    return base64.urlsafe_b64decode(data.encode("utf-8"))


def create_access_jwt(
    payload: Dict[str, Any],
    secret: Optional[str] = None,
    expires_minutes: int = 1440
) -> str:
    """
    Crea un token JWT con claims mínimos seguros (sub, role, iat, exp).
    """
    now = int(time.time())
    header = {"alg": "HS256", "typ": "JWT"}
    
    body = payload.copy()
    body.setdefault("iat", now)
    body.setdefault("exp", now + (expires_minutes * 60))

    header_b64 = _base64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _base64url_encode(json.dumps(body, separators=(",", ":")).encode("utf-8"))

    signing_input = f"{header_b64}.{payload_b64}"
    key = _get_secret(secret)
    sig = hmac.new(key, signing_input.encode("utf-8"), hashlib.sha256).digest()
    sig_b64 = _base64url_encode(sig)

    return f"{signing_input}.{sig_b64}"


def verify_access_jwt(token: Optional[str], secret: Optional[str] = None) -> Tuple[bool, Optional[Dict[str, Any]]]:
    """
    Verifica un token JWT. Comprueba firma y fecha de expiración.
    Devuelve (True, payload) si es válido, o (False, None) si falló o expiró.
    """
    if not token or token.count(".") != 2:
        return False, None

    try:
        header_b64, payload_b64, sig_b64 = token.split(".")
        signing_input = f"{header_b64}.{payload_b64}"
        key = _get_secret(secret)
        expected_sig = hmac.new(key, signing_input.encode("utf-8"), hashlib.sha256).digest()
        actual_sig = _base64url_decode(sig_b64)

        if not hmac.compare_digest(expected_sig, actual_sig):
            return False, None

        payload_bytes = _base64url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))

        now = int(time.time())
        exp = payload.get("exp")
        if exp and now > exp:
            return False, None  # Token expirado

        return True, payload
    except Exception:
        return False, None
