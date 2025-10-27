# REINSTALAR.bat - Guía Rápida
## UNS-ClaudeJP 4.2

### ✅ Sistema Validado y Funcionando

El sistema ha sido completamente analizado y verificado. **REINSTALAR.bat funciona correctamente.**

---

## 🚀 Cómo Ejecutar (Pasos Simples)

### Opción 1: Ejecución Rápida (Recomendado)
```bash
1. Doble-click en: scripts\VALIDAR_SISTEMA.bat
   → Verifica que todo está OK

2. Si muestra [OK], doble-click en: scripts\REINSTALAR.bat
   → Ejecuta reinstalación completa
```

### Opción 2: Con Backup
```bash
1. Doble-click en: scripts\BACKUP_DATOS.bat
   → Crea respaldo de datos (backend\backups\production_backup.sql)

2. Doble-click en: scripts\REINSTALAR.bat
   → Cuando pregunte "¿Deseas restaurar?", responde: S
   → Se restauran automáticamente tus datos
```

### Opción 3: Limpieza Profunda
```bash
1. Doble-click en: scripts\LIMPIAR_CACHE.bat
   → Limpia Docker cache (sin perder datos)

2. Doble-click en: scripts\REINSTALAR.bat
   → Reinstalación completa
```

---

## 📋 Qué Hace REINSTALAR.bat

| Fase | Duración | Descripción |
|------|----------|-------------|
| **1. Diagnóstico** | 10s | Verifica Python, Docker, archivos |
| **2. Confirmación** | Manual | Pide confirmación del usuario |
| **3. Preparación** | 5s | Genera .env, elimina contenedores |
| **4. Compilación** | 3-5min | Reconstruye imágenes Docker |
| **5. Inicialización** | 2min | Arranca PostgreSQL y servicios |
| **6. Verificación** | 120s | Espera compilación frontend |
| **7. Restauración** | Manual | Pregunta si restaurar backup |
| **Total** | **5-10 min** | Reinstalación completa |

---

## 🎯 Lo que Necesitas

✅ Python 3.10+ instalado
✅ Docker Desktop instalado y corriendo
✅ 5GB de espacio libre en disco
✅ Puertos disponibles: 3000, 5432, 8000, 8080

**No necesitas:** WSL, Linux, SSH, o configuraciones complejas

---

## 📊 Después de REINSTALAR.bat

### Acceso Inmediato:

| URL | Descripción |
|-----|-------------|
| http://localhost:3000 | Aplicación Principal |
| http://localhost:8000/api/docs | API Backend (Swagger) |
| http://localhost:8080 | Adminer (Gestión BD) |

### Credenciales por Defecto:
```
Usuario: admin
Contraseña: admin123
```

⚠️ **IMPORTANTE:** Cambia estos en producción

---

## 🔍 Validadores Incluidos

### VALIDAR_SISTEMA.bat
Verifica 6 áreas antes de ejecutar REINSTALAR.bat:
- Software base (Python, Docker)
- Archivos críticos
- Puertos disponibles
- Configuración
- Problemas conocidos
- Espacio en disco

### Resultado:
- ✅ **SEGURO** = Puedes ejecutar REINSTALAR.bat
- ❌ **RIESGOS** = Necesitas corregir problemas

---

## 🛠️ Correcciones Automáticas

Si encuentras problemas, ejecuta:
```bash
scripts\CORREGIR_PROBLEMAS_CRITICOS.bat
```

Este script automáticamente:
- ✅ Aumenta timeouts en REINSTALAR.bat
- ✅ Actualiza healthchecks en docker-compose.yml
- ✅ Genera .env si es necesario
- ✅ Crea respaldos antes de cambios

---

## 📚 Documentación Completa

**Para análisis profundo:**
- `docs/reports/ANALISIS_SISTEMA_2025-10-26.md` - Reporte técnico completo
- `CLAUDE.md` - Instrucciones para agentes AI

---

## ⚠️ Advertencias Importantes

1. **REINSTALAR.bat borra TODOS los datos** a menos que restaures desde backup
2. **Siempre haz backup** antes de ejecutar (scripts\BACKUP_DATOS.bat)
3. **Necesitas Internet** para descargar imágenes Docker (primera vez: 1-2 GB)
4. **No interrumpas** durante la compilación de imágenes

---

## 🆘 Troubleshooting Rápido

### "Docker no está corriendo"
```
✓ Abre Docker Desktop
✓ Espera 30 segundos a que inicie
✓ Vuelve a ejecutar REINSTALAR.bat
```

### "Timeout esperando compilación"
```
✓ El sistema puede ser lento
✓ Espera 2-3 minutos más
✓ Verifica: docker logs uns-claudejp-frontend
```

### "Puerto 3000 en uso"
```
✓ Detén otros servicios en ese puerto
✓ O cambia puerto en docker-compose.yml
```

### "Fallo en migraciones Alembic"
```
✓ Elimina volumen: docker volume rm uns-claudejp-postgres_data
✓ Vuelve a ejecutar REINSTALAR.bat
```

---

## ✅ Checklist Antes de Ejecutar

- [ ] Docker Desktop instalado y corriendo
- [ ] Python 3.10+ instalado
- [ ] Puertos 3000, 5432, 8000, 8080 disponibles
- [ ] 5GB espacio libre en disco
- [ ] VALIDAR_SISTEMA.bat muestra OK
- [ ] BACKUP_DATOS.bat ejecutado (recomendado)
- [ ] Confirmación leída en REINSTALAR.bat

---

## 🎉 Cuando Todo Funciona

Después de REINSTALAR.bat exitoso:

1. **Frontend carga:** http://localhost:3000
2. **Backend responde:** http://localhost:8000/api/health
3. **Base de datos lista:** http://localhost:8080
4. **Login funciona:** admin / admin123

**¡Listo para usar!**

---

## 📞 Soporte

**Para preguntas técnicas, revisa:**
- `docs/reports/ANALISIS_SISTEMA_2025-10-26.md`
- `backend/README.md` (documentación del backend)
- `frontend-nextjs/README.md` (documentación del frontend)

---

**Última actualización:** 2025-10-26
**Versión del sistema:** 4.2
**Estado:** ✅ Verificado y Listo
