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

// Comando personalizado para hacer clic con resaltado visual mejorado
Cypress.Commands.add('clickVisible', { prevSubject: 'element' }, (subject, options = {}) => {
  const { pause = 1000, highlight = true } = options;
  
  // Resaltar el elemento antes de hacer clic
  if (highlight) {
    cy.wrap(subject)
      .then(($el) => {
        // Guardar estilos originales
        const originalOutline = $el.css('outline');
        const originalBoxShadow = $el.css('box-shadow');
        const originalBackground = $el.css('background-color');
        const originalZIndex = $el.css('z-index');
        const originalPosition = $el.css('position');
        
        // Aplicar resaltado visual más visible
        $el.css({
          'outline': '4px solid #00ff00',
          'outline-offset': '3px',
          'box-shadow': '0 0 20px rgba(0, 255, 0, 1), 0 0 40px rgba(0, 255, 0, 0.6)',
          'background-color': 'rgba(0, 255, 0, 0.2)',
          'transition': 'all 0.3s ease',
          'z-index': '99999',
          'position': 'relative'
        });
        
        // Log para indicar que se está resaltando
        cy.log(`🖱️ Resaltando elemento antes del clic (pausa: ${pause}ms)`);
        
        // Esperar un momento para que se vea el resaltado
        cy.wait(pause);
        
        // Restaurar estilos originales antes del clic
        $el.css({
          'outline': originalOutline,
          'box-shadow': originalBoxShadow,
          'background-color': originalBackground,
          'z-index': originalZIndex,
          'position': originalPosition
        });
      });
  } else {
    cy.wait(pause);
  }
  
  // Log antes del clic
  cy.log('🖱️ Realizando clic en el elemento...');
  
  // Hacer el clic
  cy.wrap(subject).click();
  
  // Pausa después del clic para ver el resultado
  cy.wait(500);
  
  cy.log('✅ Clic completado');
});

// Comando para scroll y clic visible con resaltado mejorado
Cypress.Commands.add('scrollAndClick', { prevSubject: 'element' }, (subject, options = {}) => {
  cy.log('📜 Desplazando al elemento y haciendo clic...');
  cy.wrap(subject)
    .scrollIntoView({ duration: 800, easing: 'swing' }) // Animación más suave y visible
    .clickVisible(options);
});
