'use client';

import { ReactNode } from 'react';
import { ErrorBoundary } from './error-boundary';

export function ErrorBoundaryWrapper({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
