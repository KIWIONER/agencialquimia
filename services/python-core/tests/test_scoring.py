import hmac
import hashlib
import json

def generate_signature(secret: str, body_bytes: bytes) -> str:
    return hmac.new(secret.encode(), body_bytes, hashlib.sha256).hexdigest()

def test_calculate_scoring_high_quality(client, secret_key):
    """Verifica que un lead con datos completos y sector clave obtenga puntuación alta."""
    payload_dict = {
        "negocio": "Clínica Dental Compostela",
        "url": "https://clinicacompostela.es",
        "sector": "Dental",
        "email": "contacto@clinicacompostela.es",
        "telefono": "+34604000111",
        "fallos_detectados": [],
        "tech_stack": ["WordPress"]
    }
    payload_bytes = json.dumps(payload_dict).encode()
    sig = generate_signature(secret_key, payload_bytes)
    
    headers = {
        "Content-Type": "application/json",
        "X-Internal-Signature": sig
    }
    response = client.post("/scoring/calculate", content=payload_bytes, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["score"] >= 90
    assert data["grade"] == "A"
    assert "potencial_venta" in data

def test_calculate_scoring_missing_data(client, secret_key):
    """Verifica que la falta de web e información de contacto aplique deducciones correctamente."""
    payload_dict = {
        "negocio": "Negocio Incompleto",
        "url": "",
        "sector": "General",
        "email": "",
        "telefono": "",
        "fallos_detectados": ["carga lenta", "sin chatbot"],
        "tech_stack": ["Wix"]
    }
    payload_bytes = json.dumps(payload_dict).encode()
    sig = generate_signature(secret_key, payload_bytes)
    
    headers = {
        "Content-Type": "application/json",
        "X-Internal-Signature": sig
    }
    response = client.post("/scoring/calculate", content=payload_bytes, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["score"] < 60
    assert len(data["recomendaciones"]) > 0
