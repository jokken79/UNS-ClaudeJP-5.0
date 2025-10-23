import type { NextConfig } from "next";
import path from "path";

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

  // Headers de seguridad (CSP removido para desarrollo)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },

  // Compresión habilitada
  compress: true,

  // Configuración de variables de entorno
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_VERSION: '4.0.0',
  },

  // Optimizaciones de producción
  reactStrictMode: true,
  poweredByHeader: false,

  // Configuración experimental
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    // Aumentar el tiempo de espera para cargar chunks
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Increase chunk loading timeout to 5 minutes (300000ms)
    config.output = {
      ...config.output,
      chunkLoadTimeout: 300000,
    };

    // Mejorar manejo de errores de carga de chunks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Optimización para desarrollo
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }

    return config;
  },

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
