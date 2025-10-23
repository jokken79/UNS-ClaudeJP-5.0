'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Database, Eye, FileText, AlertTriangle, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
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
              <div className="p-4 rounded-full bg-blue-100">
                <Shield className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Política de Privacidad
            </h1>
            <p className="text-xl text-muted-foreground">
              プライバシーポリシー
            </p>
            <p className="text-sm text-muted-foreground">
              Última actualización: 23 de octubre de 2025
            </p>
          </div>

          {/* Introduction */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                En <strong>UNS HRApp</strong>, respetamos su privacidad y estamos comprometidos con la protección de sus datos personales.
                Esta Política de Privacidad explica cómo recopilamos, usamos, almacenamos y protegemos la información de nuestros usuarios,
                cumpliendo con las regulaciones de protección de datos de Japón y estándares internacionales.
              </p>
            </CardContent>
          </Card>

          {/* Information Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                1. Información que Recopilamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1.1 Información Personal (個人情報)</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Recopilamos la siguiente información personal necesaria para la gestión de recursos humanos:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Datos de identificación: nombre completo, fecha de nacimiento, nacionalidad</li>
                  <li>Información de contacto: dirección, teléfono, correo electrónico</li>
                  <li>Documentos legales: 在留カード (tarjeta de residencia), pasaporte, 履歴書 (CV)</li>
                  <li>Datos laborales: historial de empleo, habilidades, certificaciones</li>
                  <li>Información financiera: datos bancarios para nómina, número de seguro social</li>
                  <li>Registros de asistencia: タイムカード (tarjetas de tiempo), horas trabajadas</li>
                  <li>Fotografías: para identificación y documentación (opcional con consentimiento)</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">1.2 Información de Uso del Sistema</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Recopilamos datos técnicos para mejorar nuestros servicios:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Logs de acceso y actividad en el sistema</li>
                  <li>Dirección IP, navegador, dispositivo utilizado</li>
                  <li>Fecha y hora de acceso al sistema</li>
                  <li>Acciones realizadas (auditoría de seguridad)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Use of Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-600" />
                2. Cómo Usamos su Información
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Utilizamos la información recopilada exclusivamente para los siguientes propósitos legítimos:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>Gestión de procesos de contratación y reclutamiento de 派遣社員 (empleados temporales)</li>
                <li>Administración de contratos laborales y asignación a 派遣先 (empresas cliente)</li>
                <li>Cálculo y procesamiento de 給与 (nómina) y beneficios</li>
                <li>Control de asistencia y horas trabajadas mediante タイムカード</li>
                <li>Cumplimiento de obligaciones legales y fiscales en Japón</li>
                <li>Gestión de solicitudes de empleados (有給, 半休, 一時帰国, etc.)</li>
                <li>Comunicación relacionada con el empleo y actualizaciones del sistema</li>
                <li>Análisis de rendimiento y mejora de servicios (datos anonimizados)</li>
                <li>Seguridad del sistema y prevención de fraudes</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-600" />
                3. Protección y Seguridad de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li><strong>Cifrado:</strong> Todos los datos se transmiten mediante HTTPS/TLS y se almacenan cifrados</li>
                <li><strong>Autenticación:</strong> Sistema de autenticación JWT con contraseñas hash (bcrypt)</li>
                <li><strong>Control de acceso:</strong> Roles y permisos granulares (SUPER_ADMIN, ADMIN, COORDINATOR, etc.)</li>
                <li><strong>Auditoría:</strong> Registro completo de todas las acciones en el sistema (audit log)</li>
                <li><strong>Respaldos:</strong> Copias de seguridad automáticas diarias de la base de datos</li>
                <li><strong>Infraestructura segura:</strong> Servidores protegidos con firewalls y actualizaciones de seguridad</li>
                <li><strong>Acceso limitado:</strong> Solo personal autorizado puede acceder a datos personales</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                4. Compartir Información con Terceros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                No vendemos ni compartimos sus datos personales con terceros, excepto en las siguientes circunstancias:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li><strong>Empresas cliente (派遣先):</strong> Compartimos información laboral necesaria con las fábricas donde trabaja</li>
                <li><strong>Obligaciones legales:</strong> Cuando sea requerido por ley japonesa o autoridades competentes</li>
                <li><strong>Proveedores de servicios:</strong> Servicios técnicos esenciales (hosting, OCR) bajo acuerdos de confidencialidad</li>
                <li><strong>Procesamiento de nómina:</strong> Instituciones financieras para transferencias bancarias</li>
                <li><strong>Con su consentimiento:</strong> Cualquier otro caso requerirá su autorización explícita</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                5. Sus Derechos (権利)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Usted tiene los siguientes derechos sobre sus datos personales:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li><strong>Derecho de acceso:</strong> Puede solicitar una copia de todos sus datos almacenados</li>
                <li><strong>Derecho de rectificación:</strong> Puede corregir datos inexactos o incompletos</li>
                <li><strong>Derecho de eliminación:</strong> Puede solicitar la eliminación de sus datos (sujeto a obligaciones legales)</li>
                <li><strong>Derecho de portabilidad:</strong> Puede solicitar sus datos en formato estructurado (JSON, Excel)</li>
                <li><strong>Derecho de oposición:</strong> Puede oponerse al procesamiento de sus datos en ciertos casos</li>
                <li><strong>Derecho de limitación:</strong> Puede solicitar la restricción temporal del procesamiento</li>
              </ul>
              <Separator />
              <p className="text-sm text-muted-foreground">
                Para ejercer cualquiera de estos derechos, contacte a: <strong>privacy@uns-hrapp.jp</strong>
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-red-600" />
                6. Retención de Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Conservamos sus datos personales durante los siguientes períodos:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li><strong>Durante el empleo activo:</strong> Todos los datos se mantienen actualizados</li>
                <li><strong>Después de la terminación:</strong> 5 años (requisito legal japonés para registros laborales)</li>
                <li><strong>Registros de nómina:</strong> 7 años (requisito fiscal japonés)</li>
                <li><strong>Datos de candidatos no contratados:</strong> 1 año, luego eliminación automática</li>
                <li><strong>Logs de auditoría:</strong> 3 años para seguridad y cumplimiento</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-2">
                    Contacto para Privacidad
                  </p>
                  <p className="text-blue-700 mb-3">
                    Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos,
                    por favor contacte a nuestro Oficial de Protección de Datos:
                  </p>
                  <div className="space-y-1 text-blue-900">
                    <p><strong>Email:</strong> privacy@uns-hrapp.jp</p>
                    <p><strong>Teléfono:</strong> +81 (03) 1234-5678</p>
                    <p><strong>Dirección:</strong> 〒100-0001 東京都千代田区千代田1-1-1</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900 mb-1">
                    Cambios a Esta Política
                  </p>
                  <p className="text-amber-700">
                    Nos reservamos el derecho de actualizar esta Política de Privacidad periódicamente.
                    Le notificaremos sobre cambios significativos mediante correo electrónico o notificación en el sistema.
                    El uso continuado del sistema después de los cambios constituye su aceptación de la política actualizada.
                  </p>
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
              <Link href="/privacy" className="text-primary hover:underline">
                Privacidad
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">
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
