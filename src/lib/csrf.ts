import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_COOKIE_NAME = '__csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';
const TOKEN_EXPIRY_MS = 3600000;

interface CSRFTokenPayload {
  token: string;
  timestamp: number;
}

export function generateCSRFToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now();
  const payload: CSRFTokenPayload = { token, timestamp };
  const payloadString = JSON.stringify(payload);
  
  const hmac = crypto.createHmac('sha256', CSRF_SECRET);
  hmac.update(payloadString);
  const signature = hmac.digest('hex');
  
  return Buffer.from(`${payloadString}|${signature}`).toString('base64');
}

export function verifyCSRFToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [payloadString, signature] = decoded.split('|');
    
    if (!payloadString || !signature) {
      return false;
    }
    
    const hmac = crypto.createHmac('sha256', CSRF_SECRET);
    hmac.update(payloadString);
    const expectedSignature = hmac.digest('hex');
    
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return false;
    }
    
    const payload: CSRFTokenPayload = JSON.parse(payloadString);
    const now = Date.now();
    
    if (now - payload.timestamp > TOKEN_EXPIRY_MS) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

export async function setCSRFToken(): Promise<string> {
  const token = generateCSRFToken();
  const cookieStore = await cookies();
  
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: TOKEN_EXPIRY_MS / 1000,
  });
  
  return token;
}

export async function getCSRFToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value;
}

export async function validateCSRFRequest(request: Request): Promise<boolean> {
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  
  if (!headerToken || !cookieToken) {
    return false;
  }
  
  return headerToken === cookieToken && verifyCSRFToken(headerToken);
}

export function createCSRFMiddleware() {
  return async (request: Request): Promise<{ valid: boolean; error?: string }> => {
    const method = request.method.toUpperCase();
    
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return { valid: true };
    }
    
    const isValid = await validateCSRFRequest(request);
    
    if (!isValid) {
      return { 
        valid: false, 
        error: 'Invalid or missing CSRF token' 
      };
    }
    
    return { valid: true };
  };
}

export function getClientCSRFToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const match = document.cookie.match(new RegExp(`${CSRF_COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}

export function createCSRFFetch(baseToken?: string) {
  return async (url: string | URL, init?: RequestInit): Promise<Response> => {
    const token = baseToken || getClientCSRFToken();
    
    const headers = new Headers(init?.headers);
    if (token) {
      headers.set(CSRF_HEADER_NAME, token);
    }
    
    return fetch(url, {
      ...init,
      headers,
    });
  };
}
