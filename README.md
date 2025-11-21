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

### Métodos de Pago

#### Agregar Tarjeta desde Métodos de Pago
- **Tests Happy Path**: `cypress/e2e/MetodosPago/agregar_tarjeta_desde_metodos_pago/agregar_tarjeta_desde_metodos_pago_happy_path.cy.js`
  - Visa, Mastercard, American Express
  - Maneja escenarios con/sin métodos de pago existentes
- **Tests de Validaciones**: `cypress/e2e/MetodosPago/agregar_tarjeta_desde_metodos_pago/agregar_tarjeta_desde_metodos_pago_validaciones.cy.js`
  - Campos requeridos
  - Validación de número de tarjeta
  - Validación de CVV

#### Agregar PSE desde Métodos de Pago
- **Tests Happy Path**: `cypress/e2e/MetodosPago/agregar_pse_desde_metodos_pago/agregar_pse_desde_metodos_pago_happy_path.cy.js`
  - Diferentes bancos (Bogotá, Bancolombia, BBVA, etc.)
  - Diferentes tipos de documento (CC, CE, NIT)
  - Maneja escenarios con/sin métodos de pago existentes
  - **CRÍTICO**: Selección automática de radio button PSE cuando usuario no tiene métodos
- **Tests de Validaciones**: `cypress/e2e/MetodosPago/agregar_pse_desde_metodos_pago/agregar_pse_desde_metodos_pago_validaciones.cy.js`
  - Campos requeridos
  - Solo acepta números (1-9)
  - Máximo 10 dígitos

#### Agregar Tarjeta desde Facturas
- **Tests Happy Path**: `cypress/e2e/MetodosPago/agregar_tarjeta_desde_facturas/agregar_tarjeta_desde_facturas_happy_path.cy.js`
  - Navegación: Pagos → Facturas → Métodos de Pago
  - Reutiliza lógica de `AgregarTarjetaPage`

#### Agregar PSE desde Facturas
- **Tests Happy Path**: `cypress/e2e/MetodosPago/agregar_pse_desde_facturas/agregar_pse_desde_facturas_happy_path.cy.js`
  - Navegación: Pagos → Facturas → Métodos de Pago
  - Reutiliza lógica de `AgregarPSEPage`

## 📝 Comandos Útiles

### Ejecutar tests

```bash
# Abrir Cypress en modo interactivo
npm run test:open

# Ejecutar todos los tests
npm test

# Ejecutar tests de login
npm run test:login

# Ejecutar todos los tests de métodos de pago
npm run test:metodos-pago
npm run test:metodos-pago-open

# Ejecutar tests de agregar tarjeta
npm run test:agregar-tarjeta
npm run test:agregar-tarjeta-open
npm run test:agregar-tarjeta-happy
npm run test:agregar-tarjeta-validations

# Ejecutar tests de agregar PSE (desde Métodos de Pago)
npm run test:agregar-pse
npm run test:agregar-pse-open
npm run test:agregar-pse-happy
npm run test:agregar-pse-validations

# Ejecutar tests desde Facturas
npm run test:agregar-tarjeta-facturas
npm run test:agregar-tarjeta-facturas-open
npm run test:agregar-pse-facturas
npm run test:agregar-pse-facturas-open

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
│   ├── e2e/                                    # Tests
│   │   ├── Login/                             # Tests de login
│   │   ├── UsuariosEms/                       # Tests de usuarios
│   │   └── MetodosPago/                       # Tests de métodos de pago
│   │       ├── agregar_tarjeta_desde_metodos_pago/
│   │       ├── agregar_pse_desde_metodos_pago/
│   │       ├── agregar_tarjeta_desde_facturas/
│   │       └── agregar_pse_desde_facturas/
│   ├── fixtures/                              # Datos de prueba
│   │   ├── metodos_pago.json                 # Datos de tarjetas
│   │   ├── metodos_pago_pse.json             # Datos de PSE
│   │   └── usuarios_automation.json           # Usuarios de automatización
│   ├── pages/                                 # Page Objects
│   │   ├── metodos_pago/
│   │   │   ├── AgregarTarjetaPage.js
│   │   │   └── AgregarPSEPage.js
│   │   └── ...
│   ├── plugins/                               # Plugins y configuración
│   └── support/                               # Comandos personalizados
├── cypress.config.js                          # Configuración de Cypress
└── package.json
```

## 🆘 Soporte

Para problemas con:
- **Tests generales**: Revisa los logs en Cypress
- **Otros**: Contacta al equipo de QA

