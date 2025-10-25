import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware para Next.js
 *
 * IMPORTANTE: Este middleware NO valida tokens de autenticación porque
 * usamos localStorage (no accesible desde server-side). La validación
 * de tokens se realiza en el cliente mediante interceptors de Axios.
 *
 * Este middleware solo:
 * - Agrega headers de seguridad
 * - Permite que todas las rutas pasen (la protección se hace en cliente)
 */
export function middleware(request: NextRequest) {
  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Request-ID', crypto.randomUUID());
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
