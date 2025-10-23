'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Scale, AlertTriangle, CheckCircle, Mail, ArrowLeft, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">UNS HRApp</span>
                <span className="text-xs text-muted-foreground">v4.2</span>
              </div>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-purple-100">
                <Scale className="h-12 w-12 text-purple-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Términos y Condiciones de Uso
            </h1>
            <p className="text-xl text-muted-foreground">
              利用規約
            </p>
            <p className="text-sm text-muted-foreground">
              Última actualización: 23 de octubre de 2025
            </p>
          </div>

          {/* Introduction */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Bienvenido a <strong>UNS HRApp</strong>. Estos Términos y Condiciones ("Términos") rigen su acceso y uso del
                sistema de gestión de recursos humanos para agencias de empleo temporal japonesas (人材派遣会社).
                Al acceder o utilizar nuestro sistema, usted acepta estar sujeto a estos Términos.
                Si no está de acuerdo, por favor no utilice el sistema.
              </p>
            </CardContent>
          </Card>

          {/* Acceptance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                1. Aceptación de los Términos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Al crear una cuenta, iniciar sesión, o utilizar cualquier funcionalidad de UNS HRApp, usted:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>Acepta estos Términos y Condiciones en su totalidad</li>
                <li>Acepta nuestra Política de Privacidad</li>
                <li>Confirma que tiene la autoridad legal para aceptar estos términos</li>
                <li>Confirma que es mayor de 18 años o tiene permiso de su empleador para usar el sistema</li>
                <li>Acepta cumplir con todas las leyes y regulaciones aplicables en Japón</li>
              </ul>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                2. Descripción del Servicio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                UNS HRApp es un sistema integral de gestión de recursos humanos que proporciona:
              </p>
              <div className="grid gap-3">
                <div className="flex gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Gestión de Candidatos (候補者管理):</strong> Registro y procesamiento de 履歴書 (CV),
                    procesamiento OCR de documentos, gestión de aprobaciones
                  </div>
                </div>
                <div className="flex gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Gestión de Empleados (派遣社員管理):</strong> Administración de empleados temporales,
                    contratos, asignaciones a 派遣先 (empresas cliente)
                  </div>
                </div>
                <div className="flex gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Control de Asistencia (タイムカード):</strong> Registro de horas trabajadas,
                    turnos (朝番/昼番/夜番), cálculo de horas extra y nocturnas
                  </div>
                </div>
                <div className="flex gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Gestión de Nómina (給与管理):</strong> Cálculo automático de salarios,
                    deducciones, bonificaciones, generación de reportes
                  </div>
                </div>
                <div className="flex gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Solicitudes de Empleados (申請管理):</strong> Gestión de 有給 (vacaciones pagadas),
                    半休 (medio día), 一時帰国 (retorno temporal), 退社 (renuncia)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Obligations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-purple-600" />
                3. Obligaciones del Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Como usuario del sistema, usted se compromete a:
              </p>

              <div>
                <h3 className="font-semibold mb-2">3.1 Seguridad de la Cuenta</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Mantener la confidencialidad de sus credenciales de acceso</li>
                  <li>No compartir su contraseña con terceros</li>
                  <li>Notificar inmediatamente cualquier acceso no autorizado</li>
                  <li>Cerrar sesión al terminar de usar el sistema en dispositivos compartidos</li>
                  <li>Usar contraseñas seguras y cambiarlas periódicamente</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">3.2 Uso Apropiado</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Usar el sistema solo para propósitos laborales legítimos</li>
                  <li>Proporcionar información veraz y actualizada</li>
                  <li>No intentar acceder a datos fuera de sus permisos</li>
                  <li>No interferir con la operación del sistema</li>
                  <li>No utilizar el sistema para actividades ilegales o fraudulentas</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">3.3 Protección de Datos</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Respetar la privacidad de otros usuarios y empleados</li>
                  <li>No divulgar información confidencial de la empresa</li>
                  <li>Usar datos personales solo para propósitos autorizados</li>
                  <li>Cumplir con la Ley de Protección de Información Personal de Japón (個人情報保護法)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Prohibited Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                4. Actividades Prohibidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Está estrictamente prohibido:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>Intentar obtener acceso no autorizado al sistema o a cuentas de otros usuarios</li>
                <li>Realizar ingeniería inversa, descompilar o intentar extraer el código fuente</li>
                <li>Introducir virus, malware o código malicioso</li>
                <li>Realizar ataques de denegación de servicio (DoS/DDoS)</li>
                <li>Extraer datos masivamente mediante web scraping o automatización no autorizada</li>
                <li>Revender, sublicenciar o transferir acceso al sistema sin autorización</li>
                <li>Modificar, copiar o crear trabajos derivados del software</li>
                <li>Usar el sistema para discriminación, acoso o actividades ilegales</li>
                <li>Falsificar registros de asistencia, nómina o cualquier otro dato</li>
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                5. Propiedad Intelectual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Todos los derechos de propiedad intelectual sobre UNS HRApp, incluyendo pero no limitado a:
                código fuente, diseño, interfaz de usuario, documentación, logotipos y marcas comerciales,
                son propiedad exclusiva de UNS o sus licenciantes.
              </p>
              <p className="text-sm text-muted-foreground">
                No se transfiere ningún derecho de propiedad intelectual mediante estos Términos.
                Se otorga únicamente una licencia limitada, no exclusiva, no transferible y revocable para usar el sistema.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                6. Limitación de Responsabilidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">6.1 Disponibilidad del Servicio</h3>
                <p className="text-sm text-muted-foreground">
                  Nos esforzamos por mantener el sistema disponible 24/7, pero no garantizamos operación ininterrumpida.
                  Puede haber interrupciones por mantenimiento programado, actualizaciones de seguridad o problemas técnicos.
                  Notificaremos sobre mantenimiento planificado con anticipación razonable.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">6.2 Exactitud de Datos</h3>
                <p className="text-sm text-muted-foreground">
                  El sistema realiza cálculos automáticos de nómina y asistencia basados en los datos ingresados.
                  Es responsabilidad del usuario verificar la exactitud de todos los datos antes de procesarlos.
                  UNS HRApp no se hace responsable por errores resultantes de datos incorrectos ingresados por usuarios.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">6.3 Limitación de Daños</h3>
                <p className="text-sm text-muted-foreground">
                  En ningún caso UNS HRApp será responsable por daños indirectos, incidentales, especiales,
                  consecuentes o punitivos, incluyendo pérdida de beneficios, datos o uso,
                  incluso si se ha advertido de la posibilidad de tales daños.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                7. Terminación y Suspensión
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Nos reservamos el derecho de suspender o terminar su acceso al sistema en los siguientes casos:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>Violación de estos Términos y Condiciones</li>
                <li>Uso fraudulento o actividades ilegales</li>
                <li>Falta de pago (si aplica)</li>
                <li>Terminación de su relación laboral con la agencia</li>
                <li>Solicitud de cierre de cuenta por parte del usuario</li>
                <li>Razones de seguridad o protección de datos</li>
              </ul>
              <Separator />
              <p className="text-sm text-muted-foreground">
                Al terminar el servicio, su acceso será revocado. Los datos personales serán retenidos según
                lo establecido en nuestra Política de Privacidad y requisitos legales japoneses.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                8. Modificaciones a los Términos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Nos reservamos el derecho de modificar estos Términos en cualquier momento.
                Los cambios entrarán en vigor inmediatamente después de su publicación en el sistema.
              </p>
              <p className="text-sm text-muted-foreground">
                Notificaremos sobre cambios significativos mediante:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4 mt-2">
                <li>Notificación dentro del sistema</li>
                <li>Correo electrónico a usuarios registrados</li>
                <li>Actualización de la fecha "Última actualización" en esta página</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                El uso continuado del sistema después de los cambios constituye su aceptación de los términos modificados.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-purple-600" />
                9. Ley Aplicable y Jurisdicción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Estos Términos se rigen por las leyes de Japón, sin considerar conflictos de leyes.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Cualquier disputa relacionada con estos Términos o el uso del sistema será sometida a
                la jurisdicción exclusiva de los tribunales de Tokio, Japón.
              </p>
              <p className="text-sm text-muted-foreground">
                Ambas partes acuerdan someterse a la jurisdicción personal de dichos tribunales.
              </p>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-2">
                    Contacto Legal
                  </p>
                  <p className="text-blue-700 mb-3">
                    Si tiene preguntas sobre estos Términos y Condiciones, por favor contacte a:
                  </p>
                  <div className="space-y-1 text-blue-900">
                    <p><strong>Email:</strong> legal@uns-hrapp.jp</p>
                    <p><strong>Teléfono:</strong> +81 (03) 1234-5678</p>
                    <p><strong>Dirección:</strong> 〒100-0001 東京都千代田区千代田1-1-1</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 UNS HRApp. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacidad
              </Link>
              <Link href="/terms" className="text-primary hover:underline">
                Términos
              </Link>
              <Link href="/support" className="text-muted-foreground hover:text-foreground">
                Soporte
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
