# Page Object Model (POM) - Cypress

Este directorio contiene la implementación del Page Object Model para los tests de Cypress.

## Estructura

```
cypress/pages/
├── LoginPage.js      # Página de login con selectores y métodos
├── HomePage.js       # Página de home con selectores y métodos
├── config.js         # Configuración y constantes centralizadas
└── README.md         # Este archivo
```

## Uso

### LoginPage
Contiene todos los selectores y métodos relacionados con la página de login:

```javascript
import LoginPage from '../pages/LoginPage.js';

const loginPage = new LoginPage();
loginPage.visit();
loginPage.loginWithCredentials('email@test.com', 'password');
```

### HomePage
Contiene los selectores y métodos para la página de home:

```javascript
import HomePage from '../pages/HomePage.js';

const homePage = new HomePage();
homePage.verifyUserIsLoggedIn();
```

### Configuración
El archivo `config.js` centraliza todas las constantes:

```javascript
import { TEST_DATA, ERROR_MESSAGES, URLS } from '../pages/config.js';
```

## Beneficios del POM

1. **Mantenibilidad**: Los selectores están centralizados
2. **Reutilización**: Los métodos pueden ser reutilizados en múltiples tests
3. **Legibilidad**: Los tests son más fáciles de leer y entender
4. **Escalabilidad**: Fácil agregar nuevas páginas y funcionalidades

