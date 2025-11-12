# Proyecto Cypress EMS

Proyecto de automatización de pruebas con Cypress para EMS.

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/karendiaz-creator/EMS-BIA.git
cd EMS-BIA
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar Cypress:
```bash
npm run test:open
```

## Tests Disponibles

- **Creación de Usuarios EMS**: `cypress/e2e/UsuariosEms/creacion_usuarios/creacion_usuario_ems/creacion_usuario_ems_happy_path.cy.js`
- **Login**: `cypress/e2e/Login/`

## Comandos Útiles

```bash
# Abrir Cypress en modo interactivo
npm run test:open

# Ejecutar todos los tests
npm test

# Ejecutar un test específico
npx cypress run --spec "ruta/al/test.cy.js"
```

## Configuración

El proyecto está configurado para ejecutarse contra: `https://web.dev.bia.app`

