'use client';

import { useEffect } from 'react';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { ZoneContextManager } from '@opentelemetry/context-zone';

let telemetryStarted = false;

export const useTelemetry = () => {
  useEffect(() => {
    if (telemetryStarted || typeof window === 'undefined') {
      return;
    }

    const serviceName = process.env.NEXT_PUBLIC_APP_NAME ?? 'uns-claudejp-frontend';
    const serviceVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? '5.0.1';
    const exporterUrl = process.env.NEXT_PUBLIC_OTEL_EXPORTER_URL ?? 'http://localhost:4318/v1/traces';

    const provider = new WebTracerProvider({
      resource: new Resource({
        'service.name': serviceName,
        'service.version': serviceVersion,
      }),
    });

    provider.addSpanProcessor(
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: exporterUrl,
        }),
      ),
    );

    provider.register({
      contextManager: new ZoneContextManager(),
    });

    registerInstrumentations({
      instrumentations: [
        new FetchInstrumentation({
          propagateTraceHeaderCorsUrls: [/.*/],
          clearTimingResources: true,
        }),
      ],
    });

    telemetryStarted = true;

    return () => {
      void provider.shutdown();
      telemetryStarted = false;
    };
  }, []);
};
