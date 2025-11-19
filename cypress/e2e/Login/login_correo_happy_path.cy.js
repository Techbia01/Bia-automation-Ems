// cypress/e2e/login_correo_happy_path.cy.js
describe('Login exitoso (Happy Path)', () => {
  // ⚠️ Temporal: evita que scripts externos o el bug de "includes" rompan el test
  before(() => {
    Cypress.on('uncaught:exception', (err) => {
      if (
        err?.message?.includes('includes') ||
        err?.message?.includes('Kustomer.start')
      ) {
        return false; // no fallar el test por esto
      }
      // para cualquier otro error, sí rompemos
      return true;
    });
  });

  beforeEach(() => {
    // Intercept del login
    cy.intercept('POST', '**/bia-auth/signin').as('signin');

    cy.viewport(1920, 1080);
    // Aumentar timeout para la carga inicial de la página
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'), {
      timeout: 60000,
      failOnStatusCode: false
    });
  });

  it('Debería loguearse correctamente con credenciales válidas', () => {
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

    // Password
    cy.get('#password-input', { timeout: 10000 })
      .should('be.visible')
      .and('be.enabled')
      .clear()
      .type('Akamaru123*', { delay: 0, log: false });

    cy.get('#login-button')
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Esperar que el login se complete
    cy.wait('@signin', { timeout: 20000 });
    
    // Verificar que llegó al home - aquí termina la automatización
    cy.url({ timeout: 20000 }).should('include', '/home');
    
    cy.log('✅ Login exitoso - Usuario en el home');
  });
});
