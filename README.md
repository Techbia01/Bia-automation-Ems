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

## 🆘 Soporte

Para problemas con:
- **Tests generales**: Revisa los logs en Cypress
- **Otros**: Contacta al equipo de QA

