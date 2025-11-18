// cypress/e2e/login_correo_fallido.cy.js
describe('Login fallido', () => {
  before(() => {
    // (Temporal) Evita que scripts externos rompan el test
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
    // Intercepta el login (credenciales inválidas -> 400)
    cy.intercept('POST', '**/accounts:signInWithPassword*').as('signinFail');

    cy.viewport(1920, 1080);
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'));
  });

  it('Debería mostrar mensaje "Contraseña incorrecta" con credenciales inválidas', () => {
    // Email
    cy.get('#email-input', { timeout: 10000 })
      .should('be.visible')
      .and('be.enabled')
      .clear()
      .type('astrid.tovar@bia.app', { delay: 0 });

    cy.get('#continue-button-login')
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Password incorrecta
    cy.get('#password-input', { timeout: 10000 })
      .should('be.visible')
      .and('be.enabled')
      .clear()
      .type('Claveincorrecta', { delay: 0 });

    cy.get('#login-button')
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Espera explícita a la respuesta 400
    cy.wait('@signinFail', { timeout: 15000 })
      .its('response.statusCode')
      .should('eq', 400);

    // Mensaje de error (usa selector estable si existe)
    cy.get('.bia-input__error', { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', 'Contraseña incorrecta');

    // Fallback en caso de otra UI:
    // cy.contains('Contraseña incorrecta', { timeout: 10000 }).should('be.visible');

    // Sigue en /login
    cy.url().should('include', '/login');
  });
});
