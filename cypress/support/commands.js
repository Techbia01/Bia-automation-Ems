// Comando personalizado para login
Cypress.Commands.add('login', (email, password) => {
  cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath')); // Ir a la página de login

  // Ingresar correo
  cy.get('#email-input')
    .type(email)
    .should('have.value', email);

  cy.get('#continue-button-login').click();

  // Esperar campo de contraseña
  cy.get('#password-input', { timeout: 10000 }).should('be.visible');

  // Ingresar contraseña
  cy.get('#password-input')
    .type(password)
    .should('have.value', password);

  // Click en iniciar sesión
  cy.get('#login-button').click();

  // Validar que llegó al home
  cy.url({ timeout: 15000 }).should('include', '/home');
  cy.contains('Facturas', { timeout: 15000 }).should('be.visible');
});
