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
  HOME: '/home',
  INVOICE: 'https://web.dev.bia.app/invoice',
  CONSUMPTION_VARIATIONS: 'https://web.dev.bia.app/home/consumption-variations?currentPage=1',
  TARIFAS: 'https://bia-energy.webflow.io/tarifas',
  LEGALES: 'https://www.bia.app/legales',
  BLOG: 'https://news.bia.app/'
};

export const INTERCEPTS = {
  SIGNIN_FAIL: 'signinFail',
  SIGNIN_SUCCESS: 'signinSuccess',
  SIGNIN: 'signin',
  CONTRACTS: 'contracts',
  CONSUMPTION_DATA: 'consumptionData'
};

// Timeouts configurables
export const TIMEOUTS = {
  SHORT: 2000,
  MEDIUM: 5000,
  LONG: 10000,
  VERY_LONG: 15000,
  EXTRA_LONG: 20000,
  PAGE_LOAD: 30000
};

// Selectores comunes
export const SELECTORS = {
  HOME_GRID: '[data-demo-target="home-grid"]',
  HOME_NAV: '#home',
  GRAPH_CONSUMO: '[data-graph-widget="true"][data-graph-title="Consumo energético"]',
  WIDGET_FACTURAS: '[data-demo-target="facturas"]',
  WIDGET_VARIACIONES: '[data-table-widget="true"][data-table-title="Variaciones de consumo"]',
  BUTTON_IR_FACTURAS: "button.bia-button.bia-button--secondary.bia-button--medium.bia-button--full-width",
  BUTTON_IR_VARIACIONES: "button[aria-label='Ir a Variaciones de consumo']",
  BUTTON_IA_CONSUMO: "button[aria-label='Asistencia de IA para Consumo energético']",
  BUTTON_CERRAR: "button[title='Cerrar']",
  FILTER_CONTAINER: '.FiltersSection_filtersContainer__pU2iQ',
  FILTER_WEEKLY: '#weekly',
  FILTER_DAILY: '#daily'
};

// Textos esperados
export const EXPECTED_TEXTS = {
  FACTURAS: 'Facturas',
  VARIACIONES_CONSUMO: 'Variaciones de consumo',
  CONSUMO_ENERGETICO: 'Consumo energético'
};

// Configuración de esperas para animaciones/transiciones
export const WAIT_TIMES = {
  HOVER_DELAY: 500,
  TOOLTIP_DISPLAY: 2000,
  CLICK_DELAY: 1000,
  PAGE_TRANSITION: 2000,
  MODAL_ANIMATION: 1500,
  TABLE_UPDATE: 3000
};
