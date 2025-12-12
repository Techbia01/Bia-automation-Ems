// cypress/pages/TarifasPage.js
import { URLS } from './config.js';

class TarifasPage {
  // Selectores
  get body() { return 'body'; }
  get tituloTarifas() { return /tarifas/i; }

  // Métodos de verificación
  verificarQueCargo() {
    // Esperar a que la URL cambie (puede tomar tiempo si es redirección externa)
    cy.url({ timeout: 30000 }).should('include', 'bia-energy.webflow.io/tarifas');
    cy.wait(3000);
    
    // Verificar que la página se haya cargado correctamente
    cy.get(this.body).should('be.visible');
    cy.contains(this.tituloTarifas, { timeout: 15000 }).should('exist');
    cy.log('✅ Página de tarifas cargada correctamente');
  }

  verificarUrlTarifas() {
    cy.url({ timeout: 20000 }).should('eq', URLS.TARIFAS);
  }

  verificarElementosVisibles() {
    cy.get(this.body).should('be.visible');
    cy.contains(this.tituloTarifas, { timeout: 10000 }).should('exist');
  }
}

export default TarifasPage;

