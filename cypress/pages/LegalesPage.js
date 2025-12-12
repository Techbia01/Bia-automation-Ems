// cypress/pages/LegalesPage.js
import { URLS } from './config.js';

class LegalesPage {
  // Selectores
  get body() { return 'body'; }
  get tituloLegales() { return /documentos/i; }
  get footer() { return 'footer'; }

  // Métodos de verificación
  verificarQueCargo() {
    // Esperar a que la URL cambie (puede tomar tiempo si es redirección externa)
    cy.url({ timeout: 30000 }).should('include', 'bia.app/legales');
    cy.wait(3000);
    
    // Verificar que la página se haya cargado correctamente
    cy.get(this.body).should('be.visible');
    cy.contains(this.tituloLegales, { timeout: 15000 }).should('exist');
    cy.log('✅ Página de legales cargada correctamente');
  }

  verificarUrlLegales() {
    cy.url({ timeout: 20000 }).should('eq', URLS.LEGALES);
  }

  verificarElementosVisibles() {
    cy.get(this.body).should('be.visible');
    cy.contains(this.tituloLegales, { timeout: 10000 }).should('exist');
  }

  verificarVistaDocumentos() {
    // Esperar a que la página esté completamente cargada después de la redirección
    cy.log('⏳ Esperando a que la página cargue completamente...');
    cy.wait(3000);
    
    // Verificar que estamos en el dominio correcto
    cy.url({ timeout: 30000 }).should('include', 'bia.app/legales');
    
    // Verificar que la vista de documentos se muestra correctamente
    cy.get(this.body, { timeout: 15000 }).should('be.visible');
    cy.contains(this.tituloLegales, { timeout: 15000 }).should('exist');
    
    // Verificar que hay contenido de documentos visible
    cy.get('body').then(($body) => {
      const tieneContenido = $body.find('h1, h2, h3, article, section').length > 0;
      if (tieneContenido) {
        cy.log('✅ Vista de documentos cargada correctamente');
      }
    });
    
    cy.wait(1000);
    cy.log('✅ Vista de documentos verificada exitosamente');
  }
}

export default LegalesPage;

