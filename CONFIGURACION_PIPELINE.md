# Configuración del Pipeline Automatizado de Cypress

## 📋 Resumen

Este proyecto está configurado con un pipeline automatizado en Jenkins que:
- ✅ Ejecuta las pruebas de Cypress automáticamente a una hora programada
- ✅ Genera reportes HTML detallados con resultados de las pruebas
- ✅ Publica los reportes en Jenkins para fácil acceso
- ✅ Archiva videos y screenshots de pruebas fallidas
- ✅ Muestra un resumen de resultados (exitosas, fallidas, pendientes)

## ⏰ Configuración de Ejecución Programada

El pipeline está configurado para ejecutarse automáticamente todos los días a las **2:00 AM**.

### Cambiar la hora de ejecución

Edita el archivo `Jenkinsfile` y modifica la línea del trigger:

```groovy
triggers {
    cron('H 2 * * *')  // Formato: MINUTO HORA DIA MES DIA_SEMANA
}
```

### Ejemplos de horarios:

- `'H 2 * * *'` - Todos los días a las 2:00 AM
- `'H 9 * * 1-5'` - Lunes a Viernes a las 9:00 AM
- `'H */6 * * *'` - Cada 6 horas
- `'H 14 * * *'` - Todos los días a las 2:00 PM
- `'H 9,17 * * 1-5'` - Lunes a Viernes a las 9:00 AM y 5:00 PM

## 📊 Reportes

Los reportes HTML se generan automáticamente después de cada ejecución y están disponibles en:
- **Jenkins**: Sección "Reporte de Pruebas Cypress" en cada build
- **Local**: `cypress/reports/report.html` (si ejecutas `npm run test:report`)

Los reportes incluyen:
- ✅ Resumen de pruebas (total, exitosas, fallidas, pendientes)
- 📸 Screenshots de pruebas fallidas
- 🎥 Videos de las ejecuciones
- 📈 Gráficos y estadísticas

## 📧 Configurar Notificaciones por Email

Para recibir notificaciones cuando las pruebas fallen:

1. **Instalar el plugin Email Extension en Jenkins**:
   - Ve a Jenkins → Manage Jenkins → Manage Plugins
   - Busca "Email Extension Plugin"
   - Instálalo y reinicia Jenkins

2. **Configurar SMTP en Jenkins**:
   - Ve a Jenkins → Manage Jenkins → Configure System
   - Busca la sección "Extended E-mail Notification"
   - Configura tu servidor SMTP (Gmail, Outlook, etc.)

3. **Descomentar las notificaciones en Jenkinsfile**:
   - Abre el archivo `Jenkinsfile`
   - Busca las secciones comentadas con `emailext`
   - Descomenta y configura tu email:
   
   ```groovy
   emailext(
       subject: "❌ Pruebas Cypress - Algunas pruebas fallaron",
       body: "Algunas pruebas automatizadas fallaron. Revisa el reporte en Jenkins.",
       to: "tu-email@ejemplo.com"
   )
   ```

## 🔔 Configurar Notificaciones por Slack

### Paso 1: Crear un Webhook de Slack

1. **Ve a tu workspace de Slack** → https://api.slack.com/apps
2. **Crea una nueva App** o selecciona una existente
3. **Activa "Incoming Webhooks"**:
   - Ve a "Incoming Webhooks" en el menú lateral
   - Activa el toggle "Activate Incoming Webhooks"
4. **Agrega un Webhook a tu canal**:
   - Haz clic en "Add New Webhook to Workspace"
   - Selecciona el canal donde quieres recibir las notificaciones (ej: `#pruebas-automatizadas`)
   - Copia la URL del Webhook (se verá algo como: `https://hooks.slack.com/services/T.../B.../...`)

### Paso 2: Instalar el Plugin en Jenkins

1. **Ve a Jenkins** → Manage Jenkins → Manage Plugins
2. **Busca "Slack Notification"** en la pestaña "Available"
3. **Instálalo** y reinicia Jenkins si es necesario

### Paso 3: Configurar Slack en Jenkins

1. **Ve a Jenkins** → Manage Jenkins → Configure System
2. **Busca la sección "Slack"**
3. **Configura**:
   - **Workspace**: Tu workspace de Slack (ej: `tu-workspace`)
   - **Default channel**: El canal por defecto (ej: `#pruebas-automatizadas`)
   - **Credential**: Crea una nueva credencial con tu Webhook URL:
     - Haz clic en "Add" → "Jenkins"
     - Kind: "Secret text"
     - Secret: Pega tu Webhook URL aquí
     - ID: `slack-webhook` (o el nombre que prefieras)
     - Description: "Slack Webhook URL"
     - Guarda

### Paso 4: Habilitar Notificaciones en el Jenkinsfile

1. **Abre el archivo `Jenkinsfile`**
2. **Busca las secciones comentadas con `slackSend`** (en la sección `post`)
3. **Descomenta las líneas** y configura tu canal:

```groovy
slackSend(
    channel: '#pruebas-automatizadas',  // Cambia por tu canal
    color: 'good',  // 'good' (verde), 'warning' (amarillo), 'danger' (rojo)
    message: slackMessage
)
```

**Ejemplo completo** para la sección `unstable`:
```groovy
unstable {
    script {
        def slackMessage = """
⚠️ *Pruebas Cypress - Algunas pruebas fallaron*

📊 *Resumen:*
• Total de pruebas: ${env.TOTAL_TESTS}
• ✅ Exitosas: ${env.PASSED_TESTS}
• ❌ Fallidas: ${env.FAILED_TESTS}
• 📈 Tasa de éxito: ${env.SUCCESS_RATE}%

🔗 Ver reporte: ${env.BUILD_URL}HTML_20Report/
"""
        slackSend(
            channel: '#pruebas-automatizadas',
            color: 'warning',
            message: slackMessage
        )
    }
}
```

### Colores Disponibles

- `'good'` - Verde (para éxito)
- `'warning'` - Amarillo (para advertencias/pruebas fallidas)
- `'danger'` - Rojo (para errores críticos)

### Personalizar el Mensaje

Puedes personalizar los mensajes editando las variables `slackMessage` en cada sección (`success`, `failure`, `unstable`) del `Jenkinsfile`.

## 🚀 Comandos Disponibles

- `npm test` - Ejecuta las pruebas sin generar reporte HTML
- `npm run test:report` - Ejecuta las pruebas y genera reporte HTML completo
- `npm run merge:reports` - Combina múltiples reportes JSON
- `npm run generate:report` - Genera el reporte HTML final

## 📁 Estructura de Reportes

```
cypress/
├── reports/
│   ├── report.json          # Datos JSON del reporte
│   ├── report.html          # Reporte HTML principal
│   └── *.json               # Reportes individuales por spec
├── videos/                  # Videos de las ejecuciones
└── screenshots/             # Screenshots de fallos
```

## 🔧 Requisitos en Jenkins

Asegúrate de tener instalados estos plugins:
- ✅ Pipeline Plugin
- ✅ HTML Publisher Plugin (para publicar reportes HTML)
- ✅ Slack Notification Plugin (para notificaciones por Slack)
- ✅ Email Extension Plugin (opcional, para notificaciones por email)

## 📝 Próximos Pasos

1. **Configurar el job en Jenkins**:
   - Crea un nuevo Pipeline job
   - Conecta el repositorio de GitHub
   - Selecciona el archivo `Jenkinsfile` como definición del pipeline

2. **Ejecutar manualmente la primera vez**:
   - Haz clic en "Build Now" para probar que todo funciona

3. **Verificar los reportes**:
   - Después de la ejecución, busca la sección "Reporte de Pruebas Cypress"
   - Revisa los resultados y estadísticas

4. **Configurar notificaciones** (opcional):
   - Sigue las instrucciones arriba para configurar email o Slack

## 🐛 Solución de Problemas

### El pipeline no se ejecuta automáticamente
- Verifica que el trigger cron esté correctamente configurado
- Asegúrate de que Jenkins tenga permisos para ejecutar jobs programados

### Los reportes no se generan
- Verifica que las dependencias estén instaladas: `npm install`
- Revisa los logs del pipeline para ver errores específicos

### Las notificaciones no llegan

**Para Slack:**
- Verifica que el plugin "Slack Notification" esté instalado
- Confirma que la URL del Webhook sea correcta
- Verifica que el canal existe en Slack (debe empezar con `#`)
- Revisa los logs de Jenkins para ver errores específicos
- Prueba el Webhook manualmente desde la configuración de Slack en Jenkins

**Para Email:**
- Verifica la configuración SMTP en Jenkins
- Revisa que el plugin Email Extension esté instalado
- Comprueba que el email esté correctamente configurado en el Jenkinsfile

