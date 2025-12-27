import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = '__session';

// Request logging configuration
const ENABLE_REQUEST_LOGGING = process.env.NODE_ENV === 'development' || process.env.ENABLE_REQUEST_LOGGING === 'true';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/drives',
  '/applications',
  '/profile',
  '/offers',
  '/onboarding',
];

const ADMIN_ROUTES = [
  '/admin',
];

const AUTH_ROUTES = [
  '/login',
  '/register',
];

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/api/health',
];

// Generate unique request ID for tracing
function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

// Log request details
function logRequest(
  requestId: string,
  method: string,
  pathname: string,
  userId: string | null,
  duration: number,
  statusCode?: number
) {
  if (!ENABLE_REQUEST_LOGGING) return;
  
  const logEntry = {
    requestId,
    method,
    path: pathname,
    userId: userId || 'anonymous',
    duration: `${duration}ms`,
    status: statusCode,
    timestamp: new Date().toISOString(),
  };
  
  // Structured logging for production, readable for development
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(logEntry));
  } else {
    console.log(`[${logEntry.timestamp}] ${method} ${pathname} - ${userId || 'anon'} - ${duration}ms`);
  }
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const { pathname } = request.nextUrl;
  
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/public')
  ) {
    // Skip logging for static assets
    return NextResponse.next();
  }

  // Helper to log and return response
  const respond = (response: NextResponse, statusCode: number = 200, userId: string | null = null) => {
    if (ENABLE_REQUEST_LOGGING) {
      const duration = Date.now() - startTime;
      logRequest(requestId, request.method, pathname, userId, duration, statusCode);
    }
    response.headers.set('x-request-id', requestId);
    return response;
  };

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if (!sessionCookie) {
    if (isPublicRoute || isAuthRoute) {
      return respond(NextResponse.next());
    }

    if (isProtectedRoute || isAdminRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return respond(NextResponse.redirect(loginUrl), 302);
    }

    return respond(NextResponse.next());
  }

  try {
    const claims = await verifySessionOptimistic(sessionCookie);

    if (!claims) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(SESSION_COOKIE_NAME);
      return respond(response, 302);
    }

    if (isAuthRoute) {
      const redirectUrl = claims.role === 'student' 
        ? '/dashboard' 
        : '/admin';
      return respond(NextResponse.redirect(new URL(redirectUrl, request.url)), 302);
    }

    if (isAdminRoute) {
      if (claims.role !== 'admin' && claims.role !== 'tpo') {
        return respond(NextResponse.redirect(new URL('/dashboard', request.url)), 302);
      }
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', claims.uid);
    requestHeaders.set('x-user-role', claims.role ?? 'student');
    if (claims.email) {
      requestHeaders.set('x-user-email', claims.email);
    }

    return respond(NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    }));
  } catch (error) {
    console.error('[MIDDLEWARE] Session verification failed:', error);
    
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return respond(response, 302);
  }
}

async function verifySessionOptimistic(sessionCookie: string): Promise<{
  uid: string;
  email?: string;
  role?: 'admin' | 'tpo' | 'student';
} | null> {
  try {
    const payload = decodeJWT(sessionCookie);
    
    if (!payload) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return {
      uid: payload.sub ?? payload.user_id ?? '',
      email: payload.email,
      role: payload.role as 'admin' | 'tpo' | 'student' | undefined,
    };
  } catch {
    return null;
  }
}

interface JWTPayload {
  sub?: string;
  user_id?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');  
    const paddedBase64 = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const jsonPayload = atob(paddedBase64);
    
    return JSON.parse(jsonPayload) as JWTPayload;
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
