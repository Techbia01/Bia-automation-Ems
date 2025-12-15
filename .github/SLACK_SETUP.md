# 🔔 Configuración de Notificaciones Slack

Esta guía te ayudará a configurar las notificaciones de Slack para recibir reportes automáticos de las pruebas de Cypress.

## 📋 Requisitos Previos

- Tener acceso a un workspace de Slack
- Permisos para crear aplicaciones/integraciones en Slack
- Acceso a la configuración de secrets en tu repositorio de GitHub

## 🚀 Pasos para Configurar

### Paso 1: Crear un Webhook en Slack

1. **Ve a tu workspace de Slack** y abre: https://api.slack.com/apps

2. **Crea una nueva aplicación**:
   - Haz clic en "Create New App"
   - Selecciona "From scratch"
   - Dale un nombre (ej: "Cypress Tests Notifications")
   - Selecciona tu workspace
   - Haz clic en "Create App"

3. **Configura Incoming Webhooks**:
   - En el menú lateral, ve a "Incoming Webhooks"
   - Activa "Activate Incoming Webhooks" (toggle ON)
   - Haz clic en "Add New Webhook to Workspace"
   - Selecciona el canal donde quieres recibir las notificaciones (ej: #qa-tests, #dev-notifications)
   - Haz clic en "Allow"

4. **Copia el Webhook URL**:
   - Verás un URL que comienza con `https://hooks.slack.com/services/`
   - El URL completo tendrá un formato similar a: `https://hooks.slack.com/services/T.../B.../...`
   - **¡Guarda este URL completo!** Lo necesitarás en el siguiente paso

### Paso 2: Configurar el Secret en GitHub

1. **Ve a tu repositorio en GitHub**

2. **Ve a Settings** → **Secrets and variables** → **Actions**

3. **Haz clic en "New repository secret"**

4. **Configura el secret**:
   - **Name**: `SLACK_WEBHOOK_URL`
   - **Secret**: Pega el Webhook URL que copiaste en el Paso 1
   - Haz clic en "Add secret"

### Paso 3: Verificar la Configuración

1. **Haz un push a tu repositorio** o ejecuta el workflow manualmente desde GitHub Actions

2. **Revisa el canal de Slack** que configuraste - deberías recibir una notificación

## 📨 Qué Información Recibirás

Las notificaciones incluyen:

- ✅ **Estado de las pruebas** (éxito o fallo)
- 📊 **Enlace a los resultados completos** en GitHub
- 🔗 **Información del commit** y rama
- 👤 **Quién ejecutó las pruebas**
- ⏰ **Timestamp** de la ejecución

### Ejemplo de Notificación Exitosa:

```
🧪 Reporte de Pruebas Cypress

Estado: ✅ Todas las pruebas pasaron exitosamente
Repositorio: tu-usuario/EMS
Rama: main
Commit: abc1234
Ejecutado por: github-actions
Workflow: Ver detalles

📊 Ver resultados completos en GitHub
```

### Ejemplo de Notificación con Fallos:

```
🧪 Reporte de Pruebas Cypress

Estado: ❌ Algunas pruebas fallaron
Repositorio: tu-usuario/EMS
Rama: main
Commit: abc1234
Ejecutado por: github-actions
Workflow: Ver detalles

📊 Ver resultados completos en GitHub
```

## 🎨 Personalización (Opcional)

Si quieres personalizar el mensaje de Slack, puedes editar el archivo `.github/workflows/cypress-tests.yml` y modificar la sección `payload` del paso "Enviar notificación a Slack".

### Ejemplo: Agregar más información

```yaml
payload: |
  {
    "text": "Pruebas completadas",
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*Tests ejecutados:*\n${{ github.event.head_commit.message }}"
        }
      }
    ]
  }
```

## 🔒 Seguridad

- **Nunca compartas tu Webhook URL públicamente**
- El Webhook URL está almacenado como un secret en GitHub
- Si crees que tu Webhook fue comprometido, puedes regenerarlo desde Slack

## 🐛 Solución de Problemas

### No recibo notificaciones

1. **Verifica que el secret esté configurado**:
   - Ve a Settings → Secrets → Actions
   - Confirma que `SLACK_WEBHOOK_URL` existe

2. **Verifica el Webhook URL**:
   - Prueba hacer una petición manual al webhook:
   ```bash
   curl -X POST -H 'Content-type: application/json' \
   --data '{"text":"Test desde terminal"}' \
   TU_WEBHOOK_URL
   ```

3. **Revisa los logs de GitHub Actions**:
   - Ve a la pestaña Actions
   - Abre la ejecución más reciente
   - Busca el paso "Enviar notificación a Slack"
   - Revisa si hay errores

### El webhook dejó de funcionar

- Puede ser que el webhook haya sido revocado
- Ve a Slack → Apps → Tu app → Incoming Webhooks
- Regenera el webhook y actualiza el secret en GitHub

## 📚 Recursos Adicionales

- [Documentación de Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [Documentación de GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder) - Para diseñar mensajes personalizados

