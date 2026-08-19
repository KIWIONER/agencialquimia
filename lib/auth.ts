/**
 * ==============================================================================
 * Archivo: lib/auth.ts
 * ==============================================================================
 * Descripción:
 *  Utilidad nativa Web Crypto API (HMAC SHA-256) para la firma y verificación
 *  de Tokens JWT de sesión de administración en Next.js.
 * 
 * Ventajas:
 *  - 100% Nativo en Node.js 18+ y Next.js Middleware (0 dependencias externas).
 * ==============================================================================
 */

const DEFAULT_SECRET = 'agencialquimia_vps_admin_jwt_secret_key_2026_super_secure_998877';

function getSecretKey(): Uint8Array<ArrayBuffer> {
  const secretStr = process.env.ADMIN_JWT_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secretStr);
}

function base64UrlEncode(str: string | Uint8Array): string {
  const buf = typeof str === 'string' ? new TextEncoder().encode(str) : str;
  let base64 = '';
  if (typeof btoa === 'function') {
    let binary = '';
    const bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    base64 = btoa(binary);
  } else {
    base64 = Buffer.from(buf).toString('base64');
  }
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  if (typeof atob === 'function') {
    return atob(base64);
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

async function getCryptoKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    getSecretKey(),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export interface AdminJwtPayload {
  email: string;
  nombre?: string;
  role: 'admin';
  iat: number;
  exp: number;
}

/** Firma y genera un JWT válido por 12 horas */
export async function createAdminToken(payload: Omit<AdminJwtPayload, 'iat' | 'exp'>): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: AdminJwtPayload = {
    ...payload,
    iat: now,
    exp: now + 12 * 60 * 60, // 12 horas
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = base64UrlEncode(new Uint8Array(signatureBuffer));
  return `${signatureInput}.${encodedSignature}`;
}

/** Verifica un token JWT y devuelve su payload si es válido */
export async function verifyAdminToken(token: string): Promise<{ valid: boolean; payload?: AdminJwtPayload }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    // Validar firma
    const key = await getCryptoKey();
    const signatureBuffer = Uint8Array.from(atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      new TextEncoder().encode(signatureInput)
    );

    if (!isValid) return { valid: false };

    // Validar expiración
    const payload: AdminJwtPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { valid: false }; // Expirado
    }

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}
