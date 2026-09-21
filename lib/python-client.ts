import crypto from 'crypto';

const PYTHON_SERVICE_URL = (process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8005').replace(/\/$/, '');
const SECRET = process.env.PYTHON_INTERNAL_SECRET || 'agencialquimia_vps_python_internal_secret_key_2026_super_secure_8877';

/**
 * ==============================================================================
 * Cliente API de Python: lib/python-client.ts
 * ==============================================================================
 * Descripción:
 *  Cliente para consumir de forma segura el microservicio interno de Python.
 *  Firma las peticiones salientes mediante HMAC SHA-256 (con timestamp y hash de body)
 *  utilizando un secreto compartido inyectado como variable de entorno.
 * ==============================================================================
 */

function generateHmacHeaders(method: string, path: string, bodyString: string) {
  const timestamp = (Date.now() / 1000).toFixed(3);
  const bodyHash = crypto.createHash('sha256').update(bodyString).digest('hex');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const structuredMessage = `${method.toUpperCase()}:${cleanPath}:${timestamp}:${bodyHash}`;

  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(structuredMessage)
    .digest('hex');

  return {
    'Content-Type': 'application/json',
    'X-Internal-Signature': signature,
    'X-Internal-Timestamp': timestamp,
  };
}

export async function fetchPythonApi<T>(path: string, payload: unknown): Promise<T> {
  const bodyString = JSON.stringify(payload);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const targetUrl = `${PYTHON_SERVICE_URL}${cleanPath}`;
  const headers = generateHmacHeaders('POST', cleanPath, bodyString);

  const res = await fetch(targetUrl, {
    method: 'POST',
    headers,
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
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const targetUrl = `${PYTHON_SERVICE_URL}${cleanPath}`;
  const headers = generateHmacHeaders('POST', cleanPath, bodyString);

  const res = await fetch(targetUrl, {
    method: 'POST',
    headers,
    body: bodyString,
  });

  if (!res.ok) {
    throw new Error(`Python Service error: ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
