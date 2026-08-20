import hmac
import hashlib
import json

def generate_signature(secret: str, body_bytes: bytes) -> str:
    return hmac.new(secret.encode(), body_bytes, hashlib.sha256).hexdigest()

def test_generate_pdf_report(client, secret_key):
    """Verifica que el generador de PDF retorne un stream de tipo application/pdf válido."""
    payload_dict = {
        "name": "Restaurante O Lado",
        "url": "https://olado.gal",
        "sector": "Restauración",
        "ubicacion": "Santiago de Compostela, Galicia",
        "score": 82,
        "potencial": "Oportunidad alta para automatizar reservas por WhatsApp.",
        "fallos": [
            {"nombre": "Sin chatbot de reservas", "solucion": "Integrar agente Max para reservas 24/7"}
        ]
    }
    payload_bytes = json.dumps(payload_dict).encode()
    sig = generate_signature(secret_key, payload_bytes)
    
    headers = {
        "Content-Type": "application/json",
        "X-Internal-Signature": sig
    }
    response = client.post("/pdf/generate", content=payload_bytes, headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF-")
    assert len(response.content) > 5000
