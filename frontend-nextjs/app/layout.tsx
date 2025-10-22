import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper";

export const metadata: Metadata = {
  title: {
    default: "JPUNS - Sistema de Gestión de RRHH",
    template: "%s | JPUNS"
  },
  description: "Sistema de gestión de recursos humanos para empresas japonesas",
  keywords: ["RRHH", "gestión", "empleados", "candidatos", "recursos humanos"],
  authors: [{ name: "JPUNS Team" }],
  creator: "JPUNS",
  openGraph: {
    type: "website",
    locale: "es_ES",
    alternateLocale: "ja_JP",
    url: "https://jpuns.com",
    title: "JPUNS - Sistema de Gestión de RRHH",
    description: "Sistema de gestión de recursos humanos para empresas japonesas",
    siteName: "JPUNS",
  },
  twitter: {
    card: "summary_large_image",
    title: "JPUNS - Sistema de Gestión de RRHH",
    description: "Sistema de gestión de recursos humanos para empresas japonesas",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ErrorBoundaryWrapper>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}
