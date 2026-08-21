import hmac
import hashlib
import json

def generate_signature(secret: str, body_bytes: bytes) -> str:
    return hmac.new(secret.encode(), body_bytes, hashlib.sha256).hexdigest()

def test_health_endpoint(client):
    """Verifica que el endpoint de salud /health retorne HTTP 200 y estado healthy."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "agencialquimia-python-core"

def test_auth_missing_signature(client):
    """Verifica que peticiones sin firma retornen error de validación o acceso denegado."""
    response = client.post("/test-auth", json={"msg": "hello"})
    assert response.status_code in (400, 403, 422)

def test_auth_invalid_signature(client):
    """Verifica que peticiones con firma inválida retornen HTTP 403 Forbidden."""
    payload = json.dumps({"msg": "hello"}).encode()
    headers = {
        "Content-Type": "application/json",
        "X-Internal-Signature": "invalid_signature_hash_12345"
    }
    response = client.post("/test-auth", content=payload, headers=headers)
    assert response.status_code == 403

def test_auth_valid_signature(client, secret_key):
    """Verifica que peticiones con firma HMAC SHA-256 válida retornen HTTP 200."""
    payload = json.dumps({"msg": "hello"}).encode()
    sig = generate_signature(secret_key, payload)
    headers = {
        "Content-Type": "application/json",
        "X-Internal-Signature": sig
    }
    response = client.post("/test-auth", content=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["message"] == "Firma interna validada con éxito"
