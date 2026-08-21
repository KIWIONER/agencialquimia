import os
import sys
import pytest

# Añadir el directorio raíz de python-core al sys.path para importaciones limpias
PYTHON_CORE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PYTHON_CORE_DIR not in sys.path:
    sys.path.insert(0, PYTHON_CORE_DIR)

# Fijar clave secreta de prueba
os.environ["PYTHON_INTERNAL_SECRET"] = "test-secret-key-12345"

from main import app
from fastapi.testclient import TestClient

@pytest.fixture
def client():
    """Fixture de cliente de pruebas síncrono para FastAPI."""
    return TestClient(app)

@pytest.fixture
def secret_key():
    return "test-secret-key-12345"
