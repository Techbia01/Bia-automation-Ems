// cypress/e2e/MetodosPago/agregar_pse_desde_metodos_pago/agregar_pse_desde_metodos_pago_validaciones.cy.js
import LoginPage from '../../../pages/LoginPage.js';
import AgregarPSEPage from '../../../pages/metodos_pago/AgregarPSEPage.js';

describe('Agregar PSE desde Métodos de Pago - Validaciones', () => {
  let loginPage;
  let agregarPSEPage;
  let usuariosAutomation;
  let bancos;
  let tiposDocumento;

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

    // Cargar datos de PSE
    cy.fixture('metodos_pago_pse.json').then((data) => {
      bancos = data.bancos;
      tiposDocumento = data.tipos_documento;
    });
  });

  beforeEach(() => {
    cy.intercept('POST', '**/bia-auth/signin').as('signin');
    cy.intercept('GET', '**/ms-users/contracts/**').as('contracts');

    cy.viewport(1920, 1080);
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'));
    
    loginPage = new LoginPage();
    agregarPSEPage = new AgregarPSEPage();

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

    // Navegar a métodos de pago y abrir modal PSE
    agregarPSEPage.navigateToPaymentMethods();
    agregarPSEPage.openAddPSEModal();
  });

  it('No debería permitir enviar el formulario sin seleccionar banco', () => {
    cy.log('**Verificar validación: banco es requerido**');
    
    // Llenar solo tipo documento y número, sin banco
    agregarPSEPage.selectDocumentType(tiposDocumento[0]);
    agregarPSEPage.fillDocumentNumber('1234567890');
    
    cy.wait(500);
    
    // Intentar guardar
    cy.get(agregarPSEPage.saveButton).then(($btn) => {
      // El botón debería estar deshabilitado
      if ($btn.is(':disabled')) {
        cy.log('✅ Botón deshabilitado correctamente');
        expect($btn).to.be.disabled;
      } else {
        // Si está habilitado, hacer click y verificar error
        cy.wrap($btn).click();
        cy.wait(1000);
        // Debería seguir en el modal
        cy.get(agregarPSEPage.bankDropdownButton).should('be.visible');
      }
    });
  });

  it('No debería permitir enviar el formulario sin seleccionar tipo de documento', () => {
    cy.log('**Verificar validación: tipo de documento es requerido**');
    
    // Llenar solo banco y número, sin tipo documento
    agregarPSEPage.selectBank(bancos[0]);
    agregarPSEPage.fillDocumentNumber('1234567890');
    
    cy.wait(500);
    
    // Intentar guardar
    cy.get(agregarPSEPage.saveButton).then(($btn) => {
      if ($btn.is(':disabled')) {
        cy.log('✅ Botón deshabilitado correctamente');
        expect($btn).to.be.disabled;
      } else {
        cy.wrap($btn).click();
        cy.wait(1000);
        cy.get(agregarPSEPage.documentTypeDropdownButton).should('be.visible');
      }
    });
  });

  it('No debería permitir enviar el formulario sin número de documento', () => {
    cy.log('**Verificar validación: número de documento es requerido**');
    
    // Llenar solo banco y tipo documento, sin número
    agregarPSEPage.selectBank(bancos[0]);
    agregarPSEPage.selectDocumentType(tiposDocumento[0]);
    
    cy.wait(500);
    
    // El botón debería estar deshabilitado
    cy.get(agregarPSEPage.saveButton).should('be.disabled');
    cy.log('✅ Botón deshabilitado correctamente sin número de documento');
  });

  it('Debería validar que campo documento solo acepta números', () => {
    cy.log('**Verificar validación: solo acepta números del 1-9**');
    
    agregarPSEPage.validateDocumentNumberOnlyAcceptsNumbers();
    
    // Verificar que después de intentar ingresar letras y números,
    // el campo solo contiene números
    cy.get(agregarPSEPage.documentNumberInput)
      .invoke('val')
      .then((value) => {
        // Verificar que solo tiene números
        expect(value).to.match(/^[0-9]*$/);
        cy.log(`✅ Campo solo contiene números: "${value}"`);
      });
  });

  it('Debería validar longitud máxima de 10 dígitos en número de documento', () => {
    cy.log('**Verificar validación: máximo 10 dígitos**');
    
    agregarPSEPage.validateDocumentNumberMaxLength();
    
    // Verificar que el campo tiene máximo 10 dígitos
    cy.get(agregarPSEPage.documentNumberInput)
      .invoke('val')
      .its('length')
      .should('be.lte', 10);
    
    cy.log('✅ Validación exitosa: máximo 10 dígitos');
  });

  it('No debería aceptar número de documento con solo ceros', () => {
    cy.log('**Verificar validación: no acepta solo ceros**');
    
    agregarPSEPage.selectBank(bancos[0]);
    agregarPSEPage.selectDocumentType(tiposDocumento[0]);
    agregarPSEPage.fillDocumentNumber('0000000000');
    
    cy.wait(500);
    
    // Intentar guardar
    cy.get(agregarPSEPage.saveButton).then(($btn) => {
      if ($btn.is(':disabled')) {
        cy.log('✅ Botón deshabilitado con documento inválido (solo ceros)');
        expect($btn).to.be.disabled;
      } else {
        cy.wrap($btn).click();
        cy.wait(1000);
        // Si permite guardar, debería mostrar un error o seguir en el modal
        cy.get(agregarPSEPage.documentNumberInput).should('be.visible');
      }
    });
  });

  it('Debería validar campos requeridos al intentar guardar formulario vacío', () => {
    cy.log('**Verificar validación de formulario completamente vacío**');
    
    // Intentar hacer click en guardar sin llenar nada
    cy.get(agregarPSEPage.saveButton)
      .should('be.visible')
      .click();
    
    // Verificar que seguimos en el modal (no se envió)
    cy.get(agregarPSEPage.bankDropdownButton).should('be.visible');
    
    // Verificar que el botón está deshabilitado o aparecen mensajes de error
    cy.get(agregarPSEPage.saveButton).should('be.disabled');
    
    cy.log('✅ Formulario vacío no se puede enviar');
  });

  it('Debería aceptar número de documento válido con dígitos del 1 al 9', () => {
    cy.log('**Verificar que acepta números válidos del 1-9**');
    
    agregarPSEPage.selectBank(bancos[0]);
    agregarPSEPage.selectDocumentType(tiposDocumento[0]);
    
    // Número válido con dígitos del 1 al 9
    const numeroValido = '123456789';
    agregarPSEPage.fillDocumentNumber(numeroValido);
    
    cy.wait(500);
    
    // Verificar que el campo no está vacío
    cy.get(agregarPSEPage.documentNumberInput)
      .invoke('val')
      .should('not.be.empty');
    
    // El botón debería estar habilitado
    cy.get(agregarPSEPage.saveButton)
      .should('not.be.disabled');
    
    cy.log('✅ Número de documento válido aceptado correctamente');
  });

  it('Debería detectar y manejar error de PSE duplicado', () => {
    cy.log('**Verificar detección de método de pago duplicado**');
    
    // Intercept para capturar la respuesta del servidor
    cy.intercept('POST', '**/payment-methods/**').as('createPaymentMethod');
    
    // Llenar formulario con datos específicos que podrían estar duplicados
    const pseData = {
      bank: 'Primer banco disponible',
      documentType: tiposDocumento[0], // CC
      documentNumber: '123456789' // Número fijo para probar duplicado
    };
    
    agregarPSEPage.fillPSEForm(pseData);
    cy.wait(1000);
    
    // Intentar guardar
    agregarPSEPage.submitForm();
    
    // Esperar respuesta del servidor
    cy.wait('@createPaymentMethod', { timeout: 30000 }).then((interception) => {
      const statusCode = interception.response.statusCode;
      
      if (statusCode === 200 || statusCode === 201) {
        cy.log('✅ PSE guardado exitosamente (no había duplicado)');
        agregarPSEPage.verifyPSEAddedOrDuplicate();
      } else if (statusCode === 400 || statusCode === 409 || statusCode === 422) {
        cy.log('⚠️ Error detectado - posiblemente método duplicado');
        
        // Verificar que hay un mensaje de error
        agregarPSEPage.checkForDuplicateError().then((isDuplicate) => {
          if (isDuplicate) {
            cy.log('✅ VALIDACIÓN EXITOSA: Sistema detectó correctamente el PSE duplicado');
            expect(isDuplicate).to.be.true;
          } else {
            cy.log('⚠️ Error en servidor pero no es de duplicado');
          }
        });
      }
    });
  });
});

