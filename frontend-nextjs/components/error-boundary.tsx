'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // You could also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    // Reload the page
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="text-2xl text-destructive">
                Algo salió mal
              </CardTitle>
              <CardDescription>
                Se ha producido un error inesperado en la aplicación
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-2 text-destructive">
                    Error:
                  </h3>
                  <p className="text-sm font-mono text-muted-foreground break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="bg-muted/50 border border-border rounded-lg p-4">
                  <summary className="cursor-pointer font-semibold text-sm mb-2">
                    Stack Trace (Development Only)
                  </summary>
                  <pre className="text-xs overflow-auto max-h-64 text-muted-foreground mt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-2">
                  Qué puedes hacer:
                </h3>
                <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Intenta volver a cargar la página</li>
                  <li>Verifica tu conexión a internet</li>
                  <li>Si el problema persiste, contacta al soporte técnico</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex gap-3 flex-wrap">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="flex-1 min-w-[140px]"
              >
                Intentar de nuevo
              </Button>
              <Button
                onClick={this.handleReload}
                variant="default"
                className="flex-1 min-w-[140px]"
              >
                Recargar página
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
