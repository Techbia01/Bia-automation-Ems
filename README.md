# Proyecto Cypress EMS

Proyecto de automatización de pruebas con Cypress para EMS.

## 🚀 Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd EMS-BIA
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crea un archivo `cypress.env.json` en la raíz del proyecto:
```json
{
  "TEST_EMAIL": "tu-email@ejemplo.com",
  "TEST_PASSWORD": "tu-password"
}
```

4. Ejecutar Cypress:
```bash
npm run test:open
```

## 🧪 Tests Disponibles

### Login
- **Login con email/password**: `cypress/e2e/Login/login_correo_*.cy.js`

### Gestión de Usuarios
- **Creación de Usuarios EMS**: `cypress/e2e/UsuariosEms/creacion_usuarios/creacion_usuario_ems/creacion_usuario_ems_happy_path.cy.js`
  - Crea usuario
  - Verifica en API de Members
  - Logout del admin
  - Login con usuario nuevo
  - Cambio de contraseña
  - Verificación de onboarding

## 📝 Comandos Útiles

### Ejecutar tests

```bash
# Abrir Cypress en modo interactivo
npm run test:open

# Ejecutar todos los tests
npm test

# Ejecutar tests de login
npm run test:login

# Ejecutar un test específico
npx cypress run --spec "ruta/al/test.cy.js"
```

### Comandos personalizados disponibles

#### Login tradicional
```javascript
cy.login('email@example.com', 'password123');
```

## ⚙️ Configuración

- **Base URL**: `https://web.dev.bia.app`
- **Viewport**: 1920x1080
- **Videos**: Habilitados
- **Screenshots en fallos**: Habilitados

## 📁 Estructura del Proyecto

```
EMS/
├── cypress/
│   ├── e2e/                    # Tests
│   │   ├── Login/             # Tests de login
│   │   └── UsuariosEms/       # Tests de usuarios
│   ├── fixtures/              # Datos de prueba
│   ├── pages/                 # Page Objects
│   ├── plugins/               # Plugins y configuración
│   └── support/               # Comandos personalizados
├── cypress.config.js          # Configuración de Cypress
└── package.json
```

## 🤖 Automatización CI/CD

Este proyecto incluye configuración para ejecutar las pruebas automáticamente.

### ⚡ GitHub Actions (Recomendado - Gratis)

El proyecto está configurado con **GitHub Actions** para ejecutar las pruebas automáticamente.

#### Características:
- ✅ **Gratis** para repositorios públicos y privados (con límites razonables)
- ✅ **Programación automática**: Las pruebas se ejecutan a horas específicas
- ✅ **Ejecución manual**: Puedes ejecutar las pruebas cuando quieras desde GitHub
- ✅ **Ejecución en push/PR**: Se ejecutan automáticamente al hacer push o crear PRs

#### Configuración Automática:

1. **Sube tu código a GitHub** (si aún no lo has hecho)
2. **Las pruebas se ejecutarán automáticamente**:
   - Al hacer push a `main`, `master` o `develop`
   - Al crear un Pull Request
   - Según el horario programado (actualmente: 6 AM y 6 PM UTC diario)
   - Manualmente desde la pestaña "Actions" en GitHub

#### Programar Horarios Personalizados:

Para cambiar los horarios de ejecución automática:

1. Abre `.github/workflows/cypress-tests.yml`
2. Modifica la sección `schedule:` con tus horarios preferidos
3. Consulta `.github/SCHEDULE_GUIDE.md` para ejemplos y guía completa

**Ejemplo rápido** - Ejecutar todos los días a las 9 AM hora de México:
```yaml
schedule:
  - cron: '0 15 * * *'  # 9 AM México = 3 PM UTC
```

#### Ver Resultados:

1. Ve a la pestaña **Actions** en tu repositorio de GitHub
2. Haz clic en cualquier ejecución para ver los resultados
3. Descarga videos y screenshots si hay fallos

#### 🔔 Notificaciones en Slack:

El proyecto está configurado para enviar notificaciones automáticas a Slack cuando las pruebas se completen.

**Para configurar Slack:**

1. Crea un Webhook en Slack (consulta `.github/SLACK_SETUP.md` para instrucciones detalladas)
2. Agrega el Webhook URL como secret en GitHub:
   - Ve a Settings → Secrets → Actions
   - Crea un nuevo secret llamado `SLACK_WEBHOOK_URL`
   - Pega tu Webhook URL
3. ¡Listo! Recibirás notificaciones automáticas en Slack

Las notificaciones incluyen:
- ✅ Estado de las pruebas (éxito/fallo)
- 📊 Enlace a resultados completos
- 🔗 Información del commit y rama
- 👤 Quién ejecutó las pruebas

### 🔄 Integración con Jenkins (Alternativa)

Este proyecto también incluye un `Jenkinsfile` para ejecutar las pruebas en Jenkins si prefieres esa opción.

### Configuración en Jenkins

1. **Crear un nuevo Pipeline Job**:
   - En Jenkins, crea un nuevo item de tipo "Pipeline"
   - En la configuración, selecciona "Pipeline script from SCM"
   - Elige tu sistema de control de versiones (Git)
   - Especifica la URL del repositorio y la rama
   - El script path debe ser `Jenkinsfile`

2. **Requisitos del servidor Jenkins**:
   - Node.js instalado (versión 18 o superior recomendada)
   - npm instalado
   - Chrome/Chromium instalado para ejecutar Cypress

3. **Configuración opcional**:
   - Puedes ajustar el `NODE_VERSION` en el `Jenkinsfile` según tu entorno
   - Los videos y screenshots se archivan automáticamente como artefactos

4. **Ejecutar el pipeline**:
   - Haz clic en "Build Now" para ejecutar las pruebas
   - Los resultados estarán disponibles en la consola de Jenkins
   - Los artefactos (videos y screenshots) estarán disponibles en la página del build

### Personalización del Pipeline

Si necesitas ejecutar solo ciertos tests, puedes modificar el stage "Ejecutar pruebas Cypress" en el `Jenkinsfile`:

```groovy
sh 'npm run test:login'  // Solo tests de login
```

O ejecutar un test específico:

```groovy
sh 'npx cypress run --spec "cypress/e2e/Login/login_happy_path_con_correo.cy.js"'
```

## 🆘 Soporte

Para problemas con:
- **Tests generales**: Revisa los logs en Cypress
- **GitHub Actions**: Verifica que el workflow esté activo en la pestaña "Actions"
- **Programación de horarios**: Consulta `.github/SCHEDULE_GUIDE.md`
- **Jenkins**: Verifica que Node.js y Chrome estén instalados en el servidor
- **Otros**: Contacta al equipo de QA

