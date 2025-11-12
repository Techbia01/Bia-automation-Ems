// cypress/pages/config.js
export const TEST_DATA = {
  VALID_USER: {
    email: Cypress.env('TEST_EMAIL') || 'usuario@ejemplo.com',
    password: Cypress.env('TEST_PASSWORD') || 'password123'
  },
  INVALID_USER: {
    email: Cypress.env('TEST_EMAIL') || 'usuario@ejemplo.com',
    password: 'Claveincorrecta'
  },
  NEW_USER: {
    nombre: 'test robot',
    apellido: 'test',
    correo: 'usuario.test@bia.app',
    telefono: '3113073199',
    areaRol: 'tech, qa'
  }
};

export const ERROR_MESSAGES = {
  INCORRECT_PASSWORD: 'Contraseña incorrecta'
};

export const URLS = {
  LOGIN: '/login',
  HOME: '/home'
};

export const INTERCEPTS = {
  SIGNIN_FAIL: 'signinFail',
  SIGNIN_SUCCESS: 'signin',
  CONTRACTS: 'contracts',
  CONSUMPTION_DATA: 'consumptionData'
};

