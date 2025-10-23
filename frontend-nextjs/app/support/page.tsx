'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Headphones,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  FileQuestion,
  Send,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Video,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    priority: 'normal',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Support ticket submitted:', formData);
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: '',
        priority: 'normal',
        subject: '',
        message: '',
      });
    }, 3000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-green-100">
                <Headphones className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Centro de Soporte Técnico
            </h1>
            <p className="text-xl text-muted-foreground">
              サポートセンター
            </p>
            <p className="text-muted-foreground">
              ¿Necesitas ayuda? Estamos aquí para asistirte con cualquier problema o pregunta sobre UNS HRApp
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Mail className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Correo Electrónico</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      support@uns-hrapp.jp
                    </p>
                    <Badge variant="outline">Respuesta en 24-48h</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-green-100">
                    <Phone className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Teléfono</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      +81 (03) 1234-5678
                    </p>
                    <Badge variant="outline">Lun-Vie 9:00-18:00 JST</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-purple-100">
                    <MessageCircle className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Chat en Vivo</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Asistencia inmediata
                    </p>
                    <Badge variant="outline">Disponible 24/7</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Support Ticket Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileQuestion className="h-5 w-5 text-primary" />
                Crear Ticket de Soporte
              </CardTitle>
              <CardDescription>
                Completa el formulario y nuestro equipo te contactará lo antes posible
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">¡Ticket Enviado Exitosamente!</h3>
                  <p className="text-muted-foreground">
                    Hemos recibido tu solicitud. Te contactaremos pronto.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo *</Label>
                      <Input
                        id="name"
                        placeholder="田中 太郎 / Tanaka Taro"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu.email@ejemplo.jp"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+81 90-1234-5678"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleChange('category', value)} required>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Problema Técnico</SelectItem>
                          <SelectItem value="login">Acceso / Login</SelectItem>
                          <SelectItem value="candidate">Gestión de Candidatos</SelectItem>
                          <SelectItem value="employee">Gestión de Empleados</SelectItem>
                          <SelectItem value="timercard">タイムカード / Asistencia</SelectItem>
                          <SelectItem value="payroll">給与 / Nómina</SelectItem>
                          <SelectItem value="ocr">OCR / Escaneo de Documentos</SelectItem>
                          <SelectItem value="reports">Reportes</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioridad</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baja - Consulta general</SelectItem>
                          <SelectItem value="normal">Normal - Problema no urgente</SelectItem>
                          <SelectItem value="high">Alta - Afecta operaciones</SelectItem>
                          <SelectItem value="urgent">Urgente - Sistema caído</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto *</Label>
                    <Input
                      id="subject"
                      placeholder="Breve descripción del problema"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      required
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Descripción Detallada *</Label>
                    <Textarea
                      id="message"
                      placeholder="Por favor describe tu problema o pregunta en detalle. Incluye pasos para reproducir el error si aplica."
                      className="min-h-[150px]"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Tip: Cuanta más información proporciones, más rápido podremos ayudarte
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" size="lg" className="w-full gap-2">
                    <Send className="h-4 w-4" />
                    Enviar Ticket de Soporte
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Quick Help Resources */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Preguntas Frecuentes
                </CardTitle>
                <CardDescription>
                  Encuentra respuestas rápidas a problemas comunes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">¿No puedo iniciar sesión?</p>
                      <p className="text-xs text-muted-foreground">
                        Verifica usuario/contraseña o solicita recuperación
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">¿Cómo registro タイムカード?</p>
                      <p className="text-xs text-muted-foreground">
                        Ve a Asistencia → Nuevo Registro → Completa datos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">¿Error en cálculo de nómina?</p>
                      <p className="text-xs text-muted-foreground">
                        Verifica タイムカード y tarifas de la fábrica
                      </p>
                    </div>
                  </div>
                </div>
                <Link href="/help">
                  <Button variant="outline" className="w-full mt-4 gap-2">
                    Ver Todas las FAQs
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-purple-600" />
                  Tutoriales en Video
                </CardTitle>
                <CardDescription>
                  Aprende a usar el sistema paso a paso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <Video className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Registro de Candidatos con OCR</p>
                      <p className="text-xs text-muted-foreground">8 min • Básico</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Video className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Cálculo de Nómina Mensual</p>
                      <p className="text-xs text-muted-foreground">12 min • Intermedio</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Video className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Gestión de 派遣社員</p>
                      <p className="text-xs text-muted-foreground">15 min • Completo</p>
                    </div>
                  </div>
                </div>
                <Link href="/help">
                  <Button variant="outline" className="w-full mt-4 gap-2">
                    Ver Todos los Tutoriales
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Status & Hours */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-900 mb-1">
                      Estado del Sistema: Operativo
                    </p>
                    <p className="text-green-700">
                      Todos los servicios funcionando correctamente. Última verificación: hace 5 minutos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">
                      Horario de Atención
                    </p>
                    <p className="text-blue-700">
                      Soporte telefónico: Lun-Vie 9:00-18:00 JST<br />
                      Chat en vivo: Disponible 24/7<br />
                      Email: Respuesta en 24-48 horas laborables
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Support */}
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-900 mb-2">
                    Soporte de Emergencia (24/7)
                  </p>
                  <p className="text-red-700 mb-3">
                    Para problemas críticos que afecten las operaciones del negocio (sistema caído, errores graves de nómina,
                    violaciones de seguridad), contacta nuestro soporte de emergencia inmediatamente:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="destructive" className="gap-2">
                      <Phone className="h-4 w-4" />
                      +81 (080) 9999-9999
                    </Button>
                    <Button variant="outline" className="gap-2 border-red-300 text-red-900 hover:bg-red-100">
                      <Mail className="h-4 w-4" />
                      emergency@uns-hrapp.jp
                    </Button>
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
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                Términos
              </Link>
              <Link href="/support" className="text-primary hover:underline">
                Soporte
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
