// cypress/pages/HomePage.js
import { URLS } from './config.js';

class HomePage {
  // Selectores simples
  get facturasSection() { return 'Facturas'; }
  get resumenConsumoSection() { return 'Resumen de consumo'; }

  // Métodos de verificación
  verificarQueCargo() {
    cy.url({ timeout: 15000 }).should('include', URLS.HOME);
    
    // Esperar a que el elemento exista en el DOM (puede estar colapsado inicialmente)
    cy.contains(this.facturasSection, { timeout: 20000 })
      .should('exist');
    
    // Esperar un momento para que la página termine de cargar
    cy.wait(1000);
  }

  verificarQueCargoCompleto() {
    cy.url({ timeout: 15000 }).should('include', URLS.HOME);
    
    // Esperar a que el elemento sea realmente visible (no solo que exista)
    // Verificar que no tenga opacity: 0 y que sea visible
    cy.contains(this.facturasSection, { timeout: 20000 })
      .should('exist')
      .should('be.visible')
      .should('not.have.css', 'opacity', '0');
  }

  verificarUrlHome() {
    cy.url({ timeout: 15000 }).should('include', URLS.HOME);
  }
}

export default HomePage;