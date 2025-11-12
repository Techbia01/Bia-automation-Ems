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
    // Intercepts antes de visitar (para que Cypress los capture)
    cy.intercept('POST', '**/bia-auth/signin').as('signin');
    cy.intercept('GET', '**/ms-users/contracts/**').as('contracts');
    cy.intercept('GET', '**/ms-energy-insights/dashboard/v3/consumption-data').as('consumptionData');

    cy.viewport(1920, 1080);
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'));
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

    // Espera a las llamadas clave que pueblan el Home
    cy.wait('@signin', { timeout: 20000 });
    cy.url({ timeout: 20000 }).should('include', '/home');
    cy.wait(['@contracts', '@consumptionData'], { timeout: 30000 });

    // Aserciones estables en Home
    // (idealmente cambia por data-cy: [data-cy=card-facturas], [data-cy=summary-consumption])
    cy.contains('Facturas', { timeout: 15000 }).should('be.visible');
    cy.contains('Resumen de consumo', { timeout: 15000 }).should('be.visible');
  });
});
