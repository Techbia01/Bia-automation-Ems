// cypress/support/helpers.js
// Helpers para debugging y visualización

/**
 * Pausa la ejecución para ver el estado actual
 * Útil para debugging - presiona "Resume" en Cypress para continuar
 */
export const pausar = () => {
  cy.pause();
};

/**
 * Pausa con mensaje descriptivo
 * @param {string} mensaje - Mensaje a mostrar en la consola
 */
export const pausarConMensaje = (mensaje) => {
  cy.log(`⏸️ PAUSA: ${mensaje}`);
  cy.pause();
};

/**
 * Espera un tiempo específico (útil para ver acciones en tiempo real)
 * @param {number} milisegundos - Tiempo a esperar
 */
export const esperarVisual = (milisegundos = 1000) => {
  cy.wait(milisegundos);
};

/**
 * Resalta un elemento específico para debugging
 * @param {string} selector - Selector del elemento a resaltar
 */
export const resaltarElemento = (selector) => {
  cy.get(selector).then(($el) => {
    const originalOutline = $el.css('outline');
    const originalBoxShadow = $el.css('box-shadow');
    
    $el.css({
      'outline': '4px solid #ff0000',
      'outline-offset': '3px',
      'box-shadow': '0 0 15px rgba(255, 0, 0, 1)',
      'transition': 'all 0.3s ease'
    });
    
    cy.wait(2000);
    
    $el.css({
      'outline': originalOutline,
      'box-shadow': originalBoxShadow
    });
  });
};

