// cypress/e2e/MetodosPago/agregar_tarjeta_desde_metodos_pago/agregar_tarjeta_desde_metodos_pago_happy_path.cy.js
import LoginPage from '../../../pages/LoginPage.js';
import AgregarTarjetaPage from '../../../pages/metodos_pago/AgregarTarjetaPage.js';

describe('Agregar Tarjeta desde Métodos de Pago - Happy Path', () => {
  let loginPage;
  let agregarTarjetaPage;
  let tarjetasValidas;
  let datosTitular;
  let nombreTarjeta;
  let usuariosAutomation;

  before(() => {
    // Manejo de excepciones no controladas
    Cypress.on('uncaught:exception', (err) => {
      if (
        err?.message?.includes('includes') ||
        err?.message?.includes('Kustomer.start')
      ) {
        return false;
      }
      return true;
    });
    
    // Cargar datos de prueba
    cy.fixture('metodos_pago.json').then((data) => {
      tarjetasValidas = data.tarjetas_validas;
      datosTitular = data.datos_titular;
      nombreTarjeta = data.nombre_tarjeta_default;
    });

    // Cargar usuarios de automatización
    cy.fixture('usuarios_automation.json').then((data) => {
      usuariosAutomation = data.usuarios_metodos_pago;
    });
  });

  beforeEach(() => {
    // Intercepts para las llamadas API
    cy.intercept('POST', '**/bia-auth/signin').as('signin');
    cy.intercept('GET', '**/ms-users/contracts/**').as('contracts');
    cy.intercept('GET', '**/payment-methods/**').as('getPaymentMethods');
    cy.intercept('POST', '**/payment-methods/**').as('createPaymentMethod');
    cy.intercept('POST', '**/api/payment/**').as('paymentApi');

    cy.viewport(1920, 1080);
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'));
    
    loginPage = new LoginPage();
    agregarTarjetaPage = new AgregarTarjetaPage();
  });

  it('Debería agregar una tarjeta Visa exitosamente', () => {
    // Usar el primer usuario de automatización
    const usuario = usuariosAutomation[0];
    
    // Paso 1: Login
    cy.log(`**Paso 1: Realizar Login con ${usuario.email}**`);
    cy.get(loginPage.emailInput, { timeout: 10000 })
      .should('be.visible')
      .and('be.enabled')
      .clear()
      .type(usuario.email, { delay: 0 });

    cy.get(loginPage.continueButton)
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    cy.get(loginPage.passwordInput, { timeout: 10000 })
      .should('be.visible')
      .and('be.enabled')
      .clear()
      .type(usuario.password, { delay: 0, log: false });

    cy.get(loginPage.loginButton)
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Esperar a que el login sea exitoso
    cy.wait('@signin', { timeout: 20000 });
    cy.url({ timeout: 20000 }).should('include', '/home');
    cy.wait('@contracts', { timeout: 30000 });

    // Paso 2: Navegar a métodos de pago
    cy.log('**Paso 2: Navegar a Métodos de Pago**');
    agregarTarjetaPage.navigateToPaymentMethods();

    // Paso 3: Abrir modal de agregar tarjeta
    cy.log('**Paso 3: Abrir Modal de Agregar Tarjeta**');
    agregarTarjetaPage.openAddPaymentMethodModal();

    // Paso 4: Llenar formulario con tarjeta Visa
    cy.log('**Paso 4: Llenar Formulario de Tarjeta**');
    const cardData = {
      cardNumber: tarjetasValidas[0].cardNumber, // Visa 4111111111111111
      firstName: datosTitular.firstName,
      lastName: datosTitular.lastName,
      expirationDate: agregarTarjetaPage.generateRandomExpirationDate(),
      securityCode: agregarTarjetaPage.generateRandomCVV(),
      customName: nombreTarjeta
    };

    agregarTarjetaPage.fillCardForm(cardData);

    // Esperar validación del formulario
    cy.wait(1000);

    // Paso 5: Enviar formulario
    cy.log('**Paso 5: Guardar Tarjeta**');
    agregarTarjetaPage.submitForm();

    // Esperar a que se complete la creación
    cy.wait('@createPaymentMethod', { timeout: 30000 }).then((interception) => {
      // Verificar que la respuesta sea exitosa
      expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    });

    // Paso 6: Verificar que la tarjeta se agregó correctamente
    cy.log('**Paso 6: Verificar Tarjeta Agregada**');
    agregarTarjetaPage.verifyCardAdded(nombreTarjeta);
    
    // Verificar que seguimos en la página de métodos de pago
    cy.url().should('include', '/invoice/payment-methods');
  });

  it('Debería agregar una tarjeta Mastercard exitosamente', () => {
    // Usar el segundo usuario de automatización
    const usuario = usuariosAutomation[1];
    
    // Login
    cy.log(`**Login con ${usuario.email}**`);
    cy.get(loginPage.emailInput, { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(usuario.email);

    cy.get(loginPage.continueButton).click();
    cy.get(loginPage.passwordInput, { timeout: 10000 })
      .should('be.visible')
      .type(usuario.password, { log: false });

    cy.get(loginPage.loginButton).click();
    cy.wait('@signin', { timeout: 20000 });
    cy.url({ timeout: 20000 }).should('include', '/home');

    // Navegar y agregar tarjeta Mastercard
    agregarTarjetaPage.navigateToPaymentMethods();
    agregarTarjetaPage.openAddPaymentMethodModal();

    const timestamp = Date.now();
    const cardData = {
      cardNumber: tarjetasValidas[2].cardNumber, // Mastercard
      firstName: datosTitular.firstName,
      lastName: datosTitular.lastName,
      expirationDate: agregarTarjetaPage.generateRandomExpirationDate(),
      securityCode: agregarTarjetaPage.generateRandomCVV(),
      customName: `Tarjeta Test ${timestamp}`
    };

    agregarTarjetaPage.fillCardForm(cardData);
    cy.wait(1000);
    agregarTarjetaPage.submitForm();

    cy.wait('@createPaymentMethod', { timeout: 30000 });
    agregarTarjetaPage.verifyCardAdded(cardData.customName);
  });

  it('Debería agregar una tarjeta American Express exitosamente', () => {
    // Usar el tercer usuario de automatización
    const usuario = usuariosAutomation[2];
    
    // Login
    cy.log(`**Login con ${usuario.email}**`);
    cy.get(loginPage.emailInput, { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(usuario.email);

    cy.get(loginPage.continueButton).click();
    cy.get(loginPage.passwordInput, { timeout: 10000 })
      .should('be.visible')
      .type(usuario.password, { log: false });

    cy.get(loginPage.loginButton).click();
    cy.wait('@signin', { timeout: 20000 });
    cy.url({ timeout: 20000 }).should('include', '/home');

    // Navegar y agregar tarjeta Amex (CVV 4 dígitos)
    agregarTarjetaPage.navigateToPaymentMethods();
    agregarTarjetaPage.openAddPaymentMethodModal();

    const cardData = {
      cardNumber: tarjetasValidas[4].cardNumber, // Amex
      firstName: datosTitular.firstName,
      lastName: datosTitular.lastName,
      expirationDate: agregarTarjetaPage.generateRandomExpirationDate(),
      securityCode: '1234', // Amex usa 4 dígitos
      customName: 'Tarjeta Amex Principal'
    };

    agregarTarjetaPage.fillCardForm(cardData);
    cy.wait(1000);
    agregarTarjetaPage.submitForm();

    cy.wait('@createPaymentMethod', { timeout: 30000 });
    agregarTarjetaPage.verifyCardAdded(cardData.customName);
  });
});

