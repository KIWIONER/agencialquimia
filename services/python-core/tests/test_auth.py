import hmac
import hashlib
import json
import time

def generate_structured_signature(secret: str, method: str, path: str, timestamp: str, body_bytes: bytes) -> str:
    body_hash = hashlib.sha256(body_bytes).hexdigest()
    msg = f"{method.upper()}:{path}:{timestamp}:{body_hash}"
    return hmac.new(secret.encode(), msg.encode(), hashlib.sha256).hexdigest()

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

def test_auth_valid_structured_signature(client, secret_key):
    """Verifica que peticiones con firma HMAC estructurada y timestamp válido retornen HTTP 200."""
    payload = json.dumps({"msg": "hello"}).encode()
    ts = str(time.time())
    sig = generate_structured_signature(secret_key, "POST", "/test-auth", ts, payload)
    headers = {
        "Content-Type": "application/json",
        "X-Internal-Signature": sig,
        "X-Internal-Timestamp": ts
    }
    response = client.post("/test-auth", content=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

def test_auth_expired_timestamp(client, secret_key):
    """Verifica que firmas con timestamp mayor a 5 minutos sean rechazadas con HTTP 403."""
    payload = json.dumps({"msg": "hello"}).encode()
    expired_ts = str(time.time() - 600)  # Hace 10 minutos
    sig = generate_structured_signature(secret_key, "POST", "/test-auth", expired_ts, payload)
    headers = {
        "Content-Type": "application/json",
        "X-Internal-Signature": sig,
        "X-Internal-Timestamp": expired_ts
    }
    response = client.post("/test-auth", content=payload, headers=headers)
    assert response.status_code == 403
    assert "expirada" in response.json()["detail"]

def test_auth_payload_too_large(client, secret_key):
    """Verifica que peticiones con Content-Length mayor a 2MB retornen HTTP 413."""
    payload = json.dumps({"msg": "hello"}).encode()
    ts = str(time.time())
    sig = generate_structured_signature(secret_key, "POST", "/test-auth", ts, payload)
    headers = {
        "Content-Type": "application/json",
        "X-Internal-Signature": sig,
        "X-Internal-Timestamp": ts,
        "Content-Length": "3000000"  # 3MB
    }
    response = client.post("/test-auth", content=payload, headers=headers)
    assert response.status_code == 413
