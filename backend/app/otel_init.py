"""Lightweight OpenTelemetry initialisation helpers."""
from __future__ import annotations

import logging
import os

from fastapi import FastAPI

logger = logging.getLogger("app.telemetry")


def init_otel(app: FastAPI) -> None:
    """Initialise OpenTelemetry instrumentation if dependencies are available."""
    endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
    if not endpoint:
        logger.info("OTEL_EXPORTER_OTLP_ENDPOINT not set; skipping OpenTelemetry setup")
        return

    try:
        from opentelemetry import trace
        from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
    except ImportError:
        logger.warning("OpenTelemetry packages not installed; skipping instrumentation")
        return

    resource = Resource.create({"service.name": os.getenv("OTEL_SERVICE_NAME", app.title)})
    provider = TracerProvider(resource=resource)
    span_processor = BatchSpanProcessor(
        OTLPSpanExporter(
            endpoint=endpoint,
            headers=dict(_parse_headers(os.getenv("OTEL_EXPORTER_OTLP_HEADERS", ""))),
            timeout=float(os.getenv("OTEL_EXPORTER_OTLP_TIMEOUT", "10")),
        )
    )
    provider.add_span_processor(span_processor)
    trace.set_tracer_provider(provider)

    FastAPIInstrumentor.instrument_app(app)
    logger.info("OpenTelemetry instrumentation enabled", extra={"endpoint": endpoint})


def _parse_headers(raw_headers: str) -> list[tuple[str, str]]:
    """Parse OTLP headers string into key/value tuples."""
    headers: list[tuple[str, str]] = []
    for entry in raw_headers.split(","):
        if not entry.strip():
            continue
        if "=" not in entry:
            continue
        key, value = entry.split("=", 1)
        headers.append((key.strip(), value.strip()))
    return headers

