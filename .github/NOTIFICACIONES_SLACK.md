# 🔔 Notificaciones Detalladas en Slack

## ✨ Características

Las notificaciones de Slack ahora incluyen información completa y detallada:

### 📊 Resumen General
- **Total de pruebas** ejecutadas
- **Pruebas exitosas** (✅)
- **Pruebas fallidas** (❌)
- **Pruebas pendientes** (⏸️)

### 📈 Cobertura y Estadísticas
- **Tasa de éxito** calculada automáticamente
- **Estado general** del pipeline
- **Rama** donde se ejecutaron las pruebas
- **Autor** que ejecutó las pruebas

### ❌ Lista Detallada de Pruebas Fallidas
- **Nombre completo** de cada prueba que falló
- **Archivo** donde se encuentra la prueba
- Muestra hasta **15 pruebas fallidas** (si hay más, indica cuántas adicionales)

### ✅ Lista de Pruebas Exitosas
- **Nombre completo** de cada prueba que pasó
- Muestra hasta **10 pruebas exitosas** en el resumen (si hay más, indica cuántas adicionales)

### 🔗 Enlaces Útiles
- Enlace directo a la **ejecución completa** en GitHub Actions
- Enlace para **descargar el reporte HTML**

## 🎨 Formato Visual

Las notificaciones usan bloques de Slack con:
- **Colores** según el resultado:
  - 🟢 Verde (`good`) - Todas las pruebas pasaron
  - 🟡 Amarillo (`warning`) - Algunas pruebas fallaron
  - 🔴 Rojo (`danger`) - Error en la ejecución o no se ejecutaron pruebas
- **Emojis** para fácil identificación visual
- **Formato de código** para las listas de pruebas (fácil de leer)

## 📋 Ejemplo de Notificación

```
✅ Reporte de Pruebas Cypress - EMS

📊 Resumen General
• Total: 15
• ✅ Exitosas: 12
• ❌ Fallidas: 3
• ⏸️ Pendientes: 0

📈 Cobertura
• Tasa de éxito: 80.00%
• Estado: Algunas pruebas fallaron
• Rama: main
• Autor: usuario

─────────────────────────────

❌ Pruebas Fallidas (3):
• Dropdown de navegación - Blog -- Debería redirigir a la página de blog
  _blog.cy.js_
• Dropdown de navegación - Legales -- Debería redirigir a la página de legales
  _legales.cy.js_
• Dropdown de navegación - Tarifas -- Debería redirigir a la página de tarifas
  _tarifas.cy.js_

─────────────────────────────

✅ Pruebas Exitosas (12):
• Login -- Happy path con correo
• Login -- Logout exitoso
• Creación usuario EMS -- Happy path
• ... y 9 más

─────────────────────────────

🔗 Enlaces Útiles:
• 📋 Ver ejecución completa
• 📊 Descargar reporte HTML
```

## 🔧 Configuración

### Paso 1: Crear Webhook de Slack

1. Ve a https://api.slack.com/apps
2. Crea una nueva App o selecciona una existente
3. Activa "Incoming Webhooks"
4. Agrega un Webhook a tu canal
5. Copia la URL del Webhook

### Paso 2: Configurar en GitHub

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Crea un nuevo secret llamado `SLACK_WEBHOOK_URL`
4. Pega tu Webhook URL

### Paso 3: ¡Listo!

Las notificaciones se enviarán automáticamente después de cada ejecución del pipeline.

## 🚀 Cuándo se Envían las Notificaciones

Las notificaciones se envían:
- ✅ Después de cada ejecución del pipeline (exitosa o fallida)
- ✅ Cuando se ejecuta manualmente desde GitHub Actions
- ✅ Cuando se ejecuta automáticamente por horario programado
- ✅ Cuando se ejecuta en push o Pull Request

## 📝 Personalización

Si quieres personalizar el formato de las notificaciones:

1. Edita el archivo `scripts/generate-slack-message.js`
2. Modifica los bloques según tus necesidades
3. Consulta la [documentación de Slack Block Kit](https://api.slack.com/block-kit) para más opciones

## 🐛 Solución de Problemas

### Las notificaciones no se envían

1. Verifica que el secret `SLACK_WEBHOOK_URL` esté configurado correctamente
2. Verifica que el Webhook URL sea válido
3. Revisa los logs de GitHub Actions para ver errores específicos

### Las listas de pruebas están vacías

- Esto puede ocurrir si el reporte JSON no se genera correctamente
- Verifica que las pruebas se ejecuten correctamente
- Revisa que el archivo `cypress/reports/report.json` se genere después de las pruebas

### El formato no se ve bien en Slack

- Asegúrate de que tu workspace de Slack tenga soporte para Block Kit
- Algunos clientes antiguos de Slack pueden no mostrar todos los bloques correctamente





