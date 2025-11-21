// cypress/e2e/MetodosPago/agregar_pse_desde_facturas/agregar_pse_desde_facturas_happy_path.cy.js
import LoginPage from '../../../pages/LoginPage.js';
import FacturasPage from '../../../pages/FacturasPage.js';
import AgregarPSEPage from '../../../pages/metodos_pago/AgregarPSEPage.js';

describe('Agregar PSE desde Facturas - Happy Path', () => {
  let loginPage;
  let facturasPage;
  let agregarPSEPage;
  let bancos;
  let tiposDocumento;
  let documentosValidos;
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
    
    // Cargar datos de prueba PSE
    cy.fixture('metodos_pago_pse.json').then((data) => {
      bancos = data.bancos;
      tiposDocumento = data.tipos_documento;
      documentosValidos = data.documentos_validos;
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
    agregarPSEPage = new AgregarPSEPage();
  });

  it('Debería agregar PSE exitosamente desde Pagos → Facturas', () => {
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
    cy.log('**Paso 2: Navegar a Métodos de Pago desde Pagos → Facturas**');
    facturasPage.navigateToPaymentMethodsFromFacturas();

    // Paso 3: Abrir modal PSE (incluye selección de radio button si no tiene métodos)
    cy.log('**Paso 3: Abrir Modal PSE**');
    agregarPSEPage.openAddPSEModal();

    // Paso 4: Llenar formulario PSE
    cy.log('**Paso 4: Llenar Formulario PSE**');
    const pseData = {
      bank: bancos[0], // Se seleccionará aleatoriamente
      documentType: tiposDocumento[0], // CC
      documentNumber: documentosValidos[0] // 123456789
    };

    agregarPSEPage.fillPSEForm(pseData);

    // Esperar validación del formulario
    cy.wait(1000);

    // Paso 5: Enviar formulario
    cy.log('**Paso 5: Guardar PSE**');
    agregarPSEPage.submitForm();

    // Esperar a que se complete la creación
    cy.wait('@createPaymentMethod', { timeout: 30000 });

    // Paso 6: Verificar que PSE se agregó o detectó duplicado
    cy.log('**Paso 6: Verificar resultado (PSE nuevo o duplicado)**');
    agregarPSEPage.verifyPSEAddedOrDuplicate();
    
    cy.log('**✅ Flujo PSE desde Facturas completado exitosamente**');
  });

  it('Debería agregar PSE con banco aleatorio desde Facturas', () => {
    // Usar el segundo usuario
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

    // Navegar desde Pagos
    facturasPage.navigateToPaymentMethodsFromFacturas();
    agregarPSEPage.openAddPSEModal();

    // Llenar con datos diferentes
    const pseData = {
      bank: 'Banco aleatorio',
      documentType: tiposDocumento[0],
      documentNumber: documentosValidos[1] // 987654321
    };

    agregarPSEPage.fillPSEForm(pseData);
    cy.wait(1000);
    agregarPSEPage.submitForm();

    cy.wait('@createPaymentMethod', { timeout: 30000 });
    agregarPSEPage.verifyPSEAddedOrDuplicate();
  });
});

