import crypto from 'crypto';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';
const SECRET = process.env.PYTHON_INTERNAL_SECRET || 'secret-dev-key';

/**
 * ==============================================================================
 * Cliente API de Python: lib/python-client.ts
 * ==============================================================================
 * Descripción:
 *  Cliente para consumir de forma segura el microservicio interno de Python.
 *  Firma las peticiones salientes mediante HMAC SHA-256 utilizando un secreto
 *  compartido inyectado como variable de entorno.
 * ==============================================================================
 */

export async function fetchPythonApi<T>(path: string, payload: unknown): Promise<T> {
  const bodyString = JSON.stringify(payload);
  
  // Generar la firma HMAC SHA-256 a partir del cuerpo del mensaje y el secreto
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(bodyString)
    .digest('hex');

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const targetUrl = `${PYTHON_SERVICE_URL.replace(/\/$/, '')}${cleanPath}`;

  const res = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Signature': signature,
    },
    body: bodyString,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Servicio Python devolvió HTTP ${res.status}: ${errorText}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchPythonApiBuffer(path: string, payload: unknown): Promise<Buffer> {
  const bodyString = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', SECRET).update(bodyString).digest('hex');

  const res = await fetch(`${PYTHON_SERVICE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Signature': signature,
    },
    body: bodyString,
  });

  if (!res.ok) {
    throw new Error(`Python Service error: ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
