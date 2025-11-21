// cypress/pages/HomePage.js
import { URLS } from './config.js';

class HomePage {
  // Selectores simples
  get facturasSection() { return 'Facturas'; }
  get resumenConsumoSection() { return 'Resumen de consumo'; }

  // Métodos de verificación
  verificarQueCargo() {
    cy.url({ timeout: 15000 }).should('include', URLS.HOME);
    cy.contains(this.facturasSection, { timeout: 15000 }).should('be.visible');
  }

  verificarUrlHome() {
    cy.url({ timeout: 15000 }).should('include', URLS.HOME);
  }
}

export default HomePage;