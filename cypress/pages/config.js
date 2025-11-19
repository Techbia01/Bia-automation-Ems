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
  },
  PAYMENT_METHODS: {
    VALID_CARDS: [
      '4111111111111111',
      '4444333322221111',
      '5555555555554444',
      '2223003122003222',
      '378282246310005',
      '30569309025904',
      '6759000000000000'
    ],
    CARD_HOLDER: {
      firstName: 'Alejandra',
      lastName: 'Rojas'
    },
    DEFAULT_CARD_NAME: 'Tarjeta principal'
  }
};

export const ERROR_MESSAGES = {
  INCORRECT_PASSWORD: 'Contraseña incorrecta'
};

export const URLS = {
  LOGIN: '/login',
  HOME: '/home',
  PAYMENT_METHODS: '/invoice/payment-methods'
};

export const INTERCEPTS = {
  SIGNIN_FAIL: 'signinFail',
  SIGNIN_SUCCESS: 'signin',
  CONTRACTS: 'contracts',
  CONSUMPTION_DATA: 'consumptionData',
  PAYMENT_METHODS_GET: 'getPaymentMethods',
  PAYMENT_METHODS_CREATE: 'createPaymentMethod',
  PAYMENT_METHODS_UPDATE: 'updatePaymentMethod',
  PAYMENT_METHODS_DELETE: 'deletePaymentMethod'
};

