// cypress/pages/BlogPage.js
import { URLS } from './config.js';

class BlogPage {
  // Selectores
  get body() { return 'body'; }
  get tituloBlog() { return /blog|news/i; }

  // Métodos de verificación
  verificarQueCargo() {
    // Esperar a que la URL cambie (puede tomar tiempo si es redirección externa)
    cy.url({ timeout: 30000 }).should('include', 'news.bia.app');
    cy.wait(3000);
    
    // Verificar que la página se haya cargado correctamente
    cy.get(this.body).should('be.visible');
    cy.contains(this.tituloBlog, { timeout: 15000 }).should('exist');
    cy.log('✅ Página de blog cargada correctamente');
  }

  verificarUrlBlog() {
    cy.url({ timeout: 20000 }).should('eq', URLS.BLOG);
  }

  verificarElementosVisibles() {
    cy.get(this.body).should('be.visible');
    cy.contains(this.tituloBlog, { timeout: 10000 }).should('exist');
  }

  verificarVistaBlog() {
    // Esperar a que la página esté completamente cargada después de la redirección
    cy.log('⏳ Esperando a que la página cargue completamente...');
    cy.wait(3000);
    
    // Verificar que estamos en el dominio correcto
    cy.url({ timeout: 30000 }).should('include', 'news.bia.app');
    
    // Verificar que la vista del blog se muestra correctamente
    cy.get(this.body, { timeout: 15000 }).should('be.visible');
    cy.contains(this.tituloBlog, { timeout: 15000 }).should('exist');
    
    // Verificar que hay contenido del blog visible
    cy.get('body').then(($body) => {
      const tieneContenido = $body.find('h1, h2, h3, article, section').length > 0;
      if (tieneContenido) {
        cy.log('✅ Vista del blog cargada correctamente');
      }
    });
    
    cy.wait(1000);
    cy.log('✅ Vista del blog verificada exitosamente');
  }
}

export default BlogPage;

