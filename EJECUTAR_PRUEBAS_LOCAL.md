# 🚀 Ejecutar Pruebas Localmente con Notificación a Slack

Esta guía te explica cómo ejecutar todas las pruebas localmente, generar reportes y recibir notificaciones en Slack automáticamente.

## 📋 Requisitos Previos

1. Tener configurado el Webhook URL de Slack
2. Crear un archivo `.env` en la raíz del proyecto con tu Webhook URL

## 🔧 Configuración Inicial

### Paso 1: Crear archivo `.env`

Crea un archivo llamado `.env` en la raíz del proyecto con el siguiente contenido:

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../...
```

**⚠️ Importante:** Reemplaza la URL con tu Webhook URL real de Slack.

### Paso 2: Obtener el Webhook URL de Slack

Si aún no tienes el Webhook URL:

1. Ve a https://api.slack.com/apps
2. Selecciona tu app o crea una nueva
3. Ve a "Incoming Webhooks"
4. Activa los webhooks y crea uno nuevo
5. Copia la URL del webhook

## 🎯 Comandos Disponibles

### Opción 1: Ejecutar pruebas sin visualización (headless)

```bash
npm run test:full
```

Este comando:
- ✅ Ejecuta todas las pruebas de Cypress
- ✅ Genera los reportes (JSON y HTML)
- ✅ Envía notificación a Slack automáticamente

### Opción 2: Ejecutar pruebas con visualización (headed)

```bash
npm run test:full -- --headed
```

O usando el comando directo:

```bash
npm run test:headed:full
```

Este comando:
- ✅ Ejecuta todas las pruebas con el navegador visible
- ✅ Puedes ver las pruebas ejecutándose en tiempo real
- ✅ Genera los reportes después
- ✅ Envía notificación a Slack automáticamente

### Opción 3: Solo enviar notificación (si ya ejecutaste las pruebas)

Si ya ejecutaste las pruebas y solo quieres enviar la notificación:

```bash
npm run send:slack
```

## 📊 Dónde Encontrar los Reportes

Después de ejecutar las pruebas, encontrarás:

- **Reporte HTML:** `cypress/reports/report.html`
- **Reporte JSON:** `cypress/reports/report.json`
- **Videos:** `cypress/videos/` (si alguna prueba falló)
- **Screenshots:** `cypress/screenshots/` (si alguna prueba falló)

## 🔔 Notificaciones en Slack

Las notificaciones incluyen:

- ✅ Estado de las pruebas (éxito o fallo)
- 📊 Resumen con totales, exitosas, fallidas y pendientes
- 📝 Lista de pruebas fallidas (si las hay)
- 📝 Lista de pruebas exitosas
- 📁 Información sobre dónde encontrar los reportes locales

## 🐛 Solución de Problemas

### Error: "SLACK_WEBHOOK_URL no está configurado"

**Solución:** Asegúrate de tener un archivo `.env` en la raíz del proyecto con tu Webhook URL.

### Error: "No se pudo enviar la notificación"

**Soluciones:**
1. Verifica que el Webhook URL sea correcto
2. Verifica que tengas conexión a internet
3. Revisa que el webhook esté activo en Slack

### Las pruebas fallan pero quiero ver el reporte

No te preocupes, los reportes se generan siempre, incluso si las pruebas fallan. Busca el archivo `cypress/reports/report.html` y ábrelo en tu navegador.

## 💡 Consejos

1. **Ejecuta primero en modo visual** para ver qué está pasando:
   ```bash
   npm run test:full -- --headed
   ```

2. **Para pruebas rápidas sin notificación**, usa:
   ```bash
   npm run test
   ```

3. **Para ver solo los reportes**, ejecuta:
   ```bash
   npm run test:report
   ```

4. **El archivo `.env` está en `.gitignore`**, así que no se subirá al repositorio (es seguro).

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:
1. Revisa que el archivo `.env` esté en la raíz del proyecto
2. Verifica que el Webhook URL sea correcto
3. Ejecuta `npm run send:slack` para probar solo la notificación

