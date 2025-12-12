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

// Comando personalizado para hacer clic con resaltado visual
Cypress.Commands.add('clickVisible', { prevSubject: 'element' }, (subject, options = {}) => {
  const { pause = 500, highlight = true } = options;
  
  // Resaltar el elemento antes de hacer clic
  if (highlight) {
    cy.wrap(subject)
      .then(($el) => {
        // Guardar estilos originales
        const originalOutline = $el.css('outline');
        const originalBoxShadow = $el.css('box-shadow');
        
        // Aplicar resaltado visual
        $el.css({
          'outline': '3px solid #00ff00',
          'outline-offset': '2px',
          'box-shadow': '0 0 10px rgba(0, 255, 0, 0.8)',
          'transition': 'all 0.3s ease'
        });
        
        // Esperar un momento para que se vea el resaltado
        cy.wait(pause);
        
        // Restaurar estilos originales antes del clic
        $el.css({
          'outline': originalOutline,
          'box-shadow': originalBoxShadow
        });
      });
  } else {
    cy.wait(pause);
  }
  
  // Hacer el clic
  cy.wrap(subject).click();
  
  // Pequeña pausa después del clic para ver el resultado
  cy.wait(300);
});

// Comando para scroll y clic visible
Cypress.Commands.add('scrollAndClick', { prevSubject: 'element' }, (subject, options = {}) => {
  cy.wrap(subject)
    .scrollIntoView({ duration: 500 })
    .clickVisible(options);
});
