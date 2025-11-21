// cypress/e2e/MetodosPago/agregar_tarjeta_desde_metodos_pago/agregar_tarjeta_desde_metodos_pago_validaciones.cy.js
import LoginPage from '../../../pages/LoginPage.js';
import AgregarTarjetaPage from '../../../pages/metodos_pago/AgregarTarjetaPage.js';

describe('Agregar Tarjeta desde Métodos de Pago - Validaciones', () => {
  let loginPage;
  let agregarTarjetaPage;
  let usuariosAutomation;

  before(() => {
    Cypress.on('uncaught:exception', (err) => {
      if (
        err?.message?.includes('includes') ||
        err?.message?.includes('Kustomer.start')
      ) {
        return false;
      }
      return true;
    });

    // Cargar usuarios de automatización
    cy.fixture('usuarios_automation.json').then((data) => {
      usuariosAutomation = data.usuarios_metodos_pago;
    });
  });

  beforeEach(() => {
    cy.intercept('POST', '**/bia-auth/signin').as('signin');
    cy.intercept('GET', '**/ms-users/contracts/**').as('contracts');

    cy.viewport(1920, 1080);
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'));
    
    loginPage = new LoginPage();
    agregarTarjetaPage = new AgregarTarjetaPage();

    // Login automático - Usa el primer usuario para todos los tests de validación
    const usuario = usuariosAutomation[0];
    cy.log(`**Login con ${usuario.email}**`);
    
    cy.get(loginPage.emailInput, { timeout: 10000 })
      .should('be.visible')
      .type(usuario.email);
    cy.get(loginPage.continueButton).click();
    cy.get(loginPage.passwordInput, { timeout: 10000 })
      .should('be.visible')
      .type(usuario.password, { log: false });
    cy.get(loginPage.loginButton).click();
    cy.wait('@signin', { timeout: 20000 });
    cy.url({ timeout: 20000 }).should('include', '/home');

    // Navegar a métodos de pago y abrir modal de agregar tarjeta
    agregarTarjetaPage.navigateToPaymentMethods();
    agregarTarjetaPage.openAddPaymentMethodModal();
  });

  it('No debería permitir enviar el formulario con campos vacíos', () => {
    cy.log('**Verificar validación de campos vacíos**');
    
    // Intentar hacer click en guardar sin llenar nada
    cy.get(agregarTarjetaPage.saveButton)
      .should('be.visible')
      .click();
    
    // Verificar que seguimos en el modal (no se envió)
    cy.get(agregarTarjetaPage.cardNumberInput).should('be.visible');
    
    // Verificar que aparecen mensajes de error o el botón está deshabilitado
    cy.get(agregarTarjetaPage.saveButton).should('be.disabled');
  });

  it('No debería aceptar un número de tarjeta inválido', () => {
    cy.log('**Verificar validación de número de tarjeta**');
    
    const invalidCardData = {
      cardNumber: '1234567890123456', // Número inválido
      firstName: 'Alejandra',
      lastName: 'Rojas',
      expirationDate: '1225',
      securityCode: '123',
      customName: 'Tarjeta Test'
    };

    agregarTarjetaPage.fillCardForm(invalidCardData);
    cy.wait(1000);
    
    // El botón debería estar deshabilitado o mostrar error
    cy.get(agregarTarjetaPage.saveButton).then(($btn) => {
      if ($btn.is(':enabled')) {
        cy.wrap($btn).click();
        // Debería mostrar un mensaje de error
        cy.contains(/inválid|error/i, { timeout: 5000 }).should('be.visible');
      } else {
        // El botón está deshabilitado correctamente
        expect($btn).to.be.disabled;
      }
    });
  });

  it('No debería aceptar una fecha de expiración pasada', () => {
    cy.log('**Verificar validación de fecha de expiración**');
    
    const expiredCardData = {
      cardNumber: '4111111111111111',
      firstName: 'Alejandra',
      lastName: 'Rojas',
      expirationDate: '0120', // Fecha pasada
      securityCode: '123',
      customName: 'Tarjeta Expirada'
    };

    agregarTarjetaPage.fillCardForm(expiredCardData);
    cy.wait(1000);
    
    cy.get(agregarTarjetaPage.saveButton).then(($btn) => {
      if ($btn.is(':enabled')) {
        cy.wrap($btn).click();
        cy.contains(/expirad|inválid/i, { timeout: 5000 }).should('be.visible');
      } else {
        expect($btn).to.be.disabled;
      }
    });
  });

  it('Debería validar longitud mínima del CVV', () => {
    cy.log('**Verificar validación de CVV**');
    
    const shortCVVData = {
      cardNumber: '4111111111111111',
      firstName: 'Alejandra',
      lastName: 'Rojas',
      expirationDate: '1225',
      securityCode: '12', // CVV muy corto
      customName: 'Tarjeta Test'
    };

    // Llenar solo hasta el CVV
    cy.get(agregarTarjetaPage.cardNumberInput).clear().type(shortCVVData.cardNumber);
    cy.get(agregarTarjetaPage.firstNameInput).clear().type(shortCVVData.firstName);
    cy.get(agregarTarjetaPage.lastNameInput).clear().type(shortCVVData.lastName);
    cy.get(agregarTarjetaPage.expirationDateInput).clear().type(shortCVVData.expirationDate);
    cy.get(agregarTarjetaPage.securityCodeInput).clear().type(shortCVVData.securityCode);
    cy.get(agregarTarjetaPage.customNameInput).clear().type(shortCVVData.customName);
    
    // El botón debería estar deshabilitado
    cy.get(agregarTarjetaPage.saveButton).should('be.disabled');
  });
});

