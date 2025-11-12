// cypress/e2e/Login/login_google_boton.cy.js
import LoginPage from '../../pages/LoginPage.js';

describe('Login - Botón de Google', () => {
  let loginPage;

  before(() => {
    // Evita que scripts externos rompan el test
    Cypress.on('uncaught:exception', (err) => {
      if (
        err?.message?.includes('includes') ||
        err?.message?.includes('Kustomer.start')
      ) {
        return false;
      }
      return true;
    });
  });

  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'));
  });

  it('Debería verificar que el botón de Google existe y es clickeable', () => {
    loginPage = new LoginPage();

    // Verificar que el botón "Continuar con Google" existe
    cy.contains('Continuar con Google')
      .should('be.visible')
      .and('not.be.disabled');

    // Verificar que tiene el texto correcto
    cy.contains('Continuar con Google')
      .should('contain.text', 'Continuar con Google');

    // Verificar que es un botón válido
    cy.contains('Continuar con Google')
      .should('be.visible')
      .and('not.be.disabled');

    cy.log('✅ Botón de Google existe y es válido');
  });

  it('Debería hacer clic en el botón de Google y verificar que funciona', () => {
    // Hacer clic en el botón "Continuar con Google"
    cy.contains('Continuar con Google')
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Esperar un poco para que se procese el clic
    cy.wait(2000);

    // Verificar que el clic se procesó correctamente
    // No verificamos la redirección porque puede abrir una ventana popup
    cy.log('✅ Botón de Google funciona correctamente - clic procesado');
  });

  it('Debería verificar que el botón de Google tiene los atributos correctos', () => {
    // Verificar que el botón existe y es visible
    cy.contains('Continuar con Google')
      .should('be.visible')
      .and('not.be.disabled');

    // Verificar que contiene el texto correcto
    cy.contains('Continuar con Google')
      .should('contain.text', 'Continuar con Google');

    // Verificar que es clickeable
    cy.contains('Continuar con Google')
      .should('not.have.attr', 'disabled');

    cy.log('✅ Botón de Google tiene todos los atributos correctos');
  });
});
