import type { NextConfig } from "next";
import path from "path";

const resolveApiOrigin = (): string => {
  const candidate = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const url = new URL(candidate);
    return url.origin;
  } catch (error) {
    console.warn(`Invalid NEXT_PUBLIC_API_URL '${candidate}', falling back to http://localhost:8000`);
    return "http://localhost:8000";
  }
};

const apiOrigin = resolveApiOrigin();
const connectSrc = new Set<string>(["'self'", apiOrigin]);

if (process.env.NODE_ENV !== "production") {
  connectSrc.add("http://localhost:3000");
  connectSrc.add("http://localhost:8000");
  connectSrc.add("ws://localhost:3000");
  connectSrc.add("ws://localhost:3001");
}

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src ${Array.from(connectSrc).join(' ')}`,
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Origin-Agent-Cluster', value: '?1' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
] satisfies { key: string; value: string }[];

const nextConfig: NextConfig = {
  // Output standalone para Docker
  output: 'standalone',

  // Silenciar warning de workspace root
  outputFileTracingRoot: path.join(__dirname, '../'),
  
  // Optimización de imágenes
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uns-kikaku.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'cloudinary.com',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Rewrite removed - frontend calls backend directly

  // Headers de seguridad con CSP
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  // Compresión habilitada
  compress: true,

  // Configuración de variables de entorno
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? '5.0.0',
    NEXT_PUBLIC_AUTH_TOKEN_MAX_AGE: process.env.NEXT_PUBLIC_AUTH_TOKEN_MAX_AGE ?? String(60 * 60 * 8),
  },

  // Optimizaciones de producción
  reactStrictMode: false, // Deshabilitado para mejor rendimiento en desarrollo
  poweredByHeader: false,

  // Configuración experimental
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    // Aumentar el tiempo de espera para cargar chunks
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Turbopack configuration (Next.js 16 default bundler)
  // Empty config to silence warning - Turbopack works with no configuration
  turbopack: {},

  // Manejo de errores en producción
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Configuración de logging
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
