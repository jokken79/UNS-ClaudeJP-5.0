import { registerOTel } from '@vercel/otel';

export function register() {
  registerOTel({
    serviceName: process.env.NEXT_PUBLIC_APP_NAME ?? 'uns-claudejp-frontend',
    serviceVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? '5.0.1',
  });
}
