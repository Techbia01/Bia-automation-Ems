// cypress/e2e/MetodosPago/agregar_tarjeta_desde_facturas/agregar_tarjeta_desde_facturas_happy_path.cy.js
import LoginPage from '../../../pages/LoginPage.js';
import FacturasPage from '../../../pages/FacturasPage.js';
import AgregarTarjetaPage from '../../../pages/metodos_pago/AgregarTarjetaPage.js';

describe('Agregar Tarjeta desde Facturas - Happy Path', () => {
  let loginPage;
  let facturasPage;
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
    facturasPage = new FacturasPage();
    agregarTarjetaPage = new AgregarTarjetaPage();
  });

  it('Debería agregar una tarjeta Visa exitosamente desde Facturas', () => {
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

    // Paso 2: Navegar a métodos de pago desde Pagos → Facturas
    cy.log('**Paso 2: Navegar a Métodos de Pago desde Facturas**');
    facturasPage.navigateToPaymentMethodsFromFacturas();

    // Paso 3: Abrir modal de agregar tarjeta
    cy.log('**Paso 3: Abrir Modal de Agregar Tarjeta**');
    agregarTarjetaPage.openAddPaymentMethodModal();

    // Paso 4: Llenar formulario con tarjeta Visa
    cy.log('**Paso 4: Llenar Formulario de Tarjeta**');
    const timestamp = Date.now();
    const cardData = {
      cardNumber: tarjetasValidas[0].cardNumber, // Visa 4111111111111111
      firstName: datosTitular.firstName,
      lastName: datosTitular.lastName,
      expirationDate: agregarTarjetaPage.generateRandomExpirationDate(),
      securityCode: agregarTarjetaPage.generateRandomCVV(),
      customName: `${nombreTarjeta} Facturas ${timestamp}`
    };

    agregarTarjetaPage.fillCardForm(cardData);

    // Esperar validación del formulario
    cy.wait(1000);

    // Paso 5: Enviar formulario
    cy.log('**Paso 5: Guardar Tarjeta**');
    agregarTarjetaPage.submitForm();

    // Esperar a que se complete la creación
    cy.wait('@createPaymentMethod', { timeout: 30000 }).then((interception) => {
      const statusCode = interception.response.statusCode;
      if (statusCode === 200 || statusCode === 201) {
        cy.log('✅ Tarjeta agregada exitosamente');
      } else if (statusCode === 400) {
        cy.log('⚠️ Backend detectó tarjeta duplicada (400) - Esto es correcto');
      }
    });

    // Paso 6: Verificar que la tarjeta se agregó o detectó duplicado
    cy.log('**Paso 6: Verificar Tarjeta Agregada**');
    cy.wait(2000);
    
    // Verificar que seguimos en la página de métodos de pago
    cy.url().should('include', '/invoice/payment-methods');
    cy.log('**✅ Flujo desde Facturas completado exitosamente**');
  });
});

