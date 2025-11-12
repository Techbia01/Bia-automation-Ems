describe('Prueba básica en Cypress', () => {
    it('Visita la página de inicio de Bia', () => {
      cy.visit('https://bia.energy'); // o la URL de tu app de pruebas
      cy.title().should('include', 'Bia'); // cambia según el título esperado
    });
  });
  