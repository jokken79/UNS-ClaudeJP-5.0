'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { NavigationProvider } from '@/contexts/navigation-context';
import { SimpleNavigationProgress } from '@/components/navigation-progress';
import { PageTransition } from '@/components/PageTransition';
import { BreadcrumbNav } from '@/components/breadcrumb-nav';
import { AnimatedLink } from '@/components/animated-link';
import { VisibilityGuard } from '@/components/visibility-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider>
      {/* Top Progress Bar */}
      <SimpleNavigationProgress />

      <div className="flex h-screen overflow-hidden bg-muted/10">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Page Content with Transitions */}
          <main className="flex-1 overflow-y-auto">
            <VisibilityGuard>
              <div className="container mx-auto p-6 space-y-6">
                {/* Breadcrumb Navigation */}
                <BreadcrumbNav showHome={true} maxItems={3} />

                {/* Page Content with Smooth Transitions */}
                <PageTransition variant="fade" duration={0.3}>
                  {children}
                </PageTransition>
              </div>
            </VisibilityGuard>
          </main>

          {/* Footer */}
          <footer className="border-t bg-background px-6 py-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <p>© 2025 UNS HRApp - Sistema de RRHH para agencias japonesas</p>
              <div className="flex items-center gap-4">
                <AnimatedLink
                  href="/privacy"
                  className="hover:text-foreground transition-colors"
                  prefetchOnHover={true}
                >
                  Privacidad
                </AnimatedLink>
                <AnimatedLink
                  href="/terms"
                  className="hover:text-foreground transition-colors"
                  prefetchOnHover={true}
                >
                  Términos
                </AnimatedLink>
                <AnimatedLink
                  href="/support"
                  className="hover:text-foreground transition-colors"
                  prefetchOnHover={true}
                >
                  Soporte
                </AnimatedLink>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </NavigationProvider>
  );
}
