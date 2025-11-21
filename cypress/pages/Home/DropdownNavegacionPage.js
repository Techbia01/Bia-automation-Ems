// cypress/pages/Home/DropdownNavegacionPage.js
class DropdownNavegacionPage {
  // Selectores
  get sidebarHeaderButton() { return '#sidebar-header-button'; }
  get cambiarCuentaButton() { return '#change-account'; }
  get solicitarFuncionalidadButton() { return '#request-feature'; }
  get inputCorreoCliente() { return '#input-on0ga5z8g'; }
  get cambiarCuentaSubmitButton() { return '.bia-button.bia-button--primary.bia-button--medium'; }

  // Métodos de acción
  hacerClicEnSidebarHeader() {
    cy.get(this.sidebarHeaderButton, { timeout: 10000 })
      .should('be.visible')
      .and('be.enabled')
      .click();
    
    // Esperar a que el dropdown se abra completamente
    cy.wait(2000);
    
    // Depuración: verificar qué elementos están disponibles en el dropdown
    cy.get('body').then(($body) => {
      // Buscar el elemento por ID
      const changeAccountById = $body.find('#change-account').length;
      cy.log(`🔍 Elementos con ID #change-account encontrados: ${changeAccountById}`);
      
      // Buscar elementos que contengan "cambiar" o "cuenta"
      const allLinks = $body.find('a, button, [role="button"]');
      const matchingText = Array.from(allLinks).filter(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('cambiar') || text.includes('cuenta');
      });
      cy.log(`🔍 Elementos con texto relacionado encontrados: ${matchingText.length}`);
      
      // Buscar dentro de posibles contenedores del dropdown
      const dropdownContainers = $body.find('[role="menu"], [role="listbox"], .dropdown, [class*="menu"], [class*="dropdown"]');
      cy.log(`🔍 Contenedores de dropdown encontrados: ${dropdownContainers.length}`);
    });
  }

  hacerClicEnCambiarCuenta() {
    // Esperar a que el dropdown esté completamente abierto y renderizado
    cy.wait(2000);
    
    // Intentar primero con el ID, si falla usar texto como alternativa
    // Usar una estrategia que maneje ambos casos
    cy.get(this.cambiarCuentaButton, { timeout: 25000 })
      .should('exist')
      .should('be.visible')
      .and('not.be.disabled')
      .click({ timeout: 25000 });
  }

  hacerClicEnCambiarCuentaPorTexto() {
    // Método alternativo usando texto si el ID no funciona
    cy.contains(/cambiar cuenta/i, { timeout: 25000 })
      .should('be.visible')
      .click();
  }

  verificarPantallaCambioCuenta() {
    // Esperar a que la pantalla de cambio de cuenta se cargue
    cy.url({ timeout: 15000 }).should('include', '/change-account');
    cy.wait(2000);
    
    // Buscar el input de forma flexible (el ID puede ser dinámico)
    // Intentar primero con el ID específico, luego buscar por atributos comunes
    cy.get('body').then(($body) => {
      const inputById = $body.find('#input-on0ga5z8g');
      if (inputById.length > 0) {
        cy.get('#input-on0ga5z8g', { timeout: 10000 }).should('be.visible');
      } else {
        // Buscar input que tenga ID que empiece con "input-"
        cy.get('input[id^="input-"]', { timeout: 15000 })
          .first()
          .should('be.visible');
      }
    });
  }

  ingresarCorreoCliente(correo) {
    // Buscar el input de forma flexible
    cy.get('body').then(($body) => {
      const inputById = $body.find('#input-on0ga5z8g');
      if (inputById.length > 0 && inputById.is(':visible')) {
        cy.get('#input-on0ga5z8g', { timeout: 10000 })
          .should('be.visible')
          .and('be.enabled')
          .clear()
          .type(correo, { delay: 0 });
      } else {
        // Buscar input que tenga ID que empiece con "input-" (patrón común de IDs dinámicos)
        cy.get('input[id^="input-"]', { timeout: 15000 })
          .first()
          .should('be.visible')
          .and('be.enabled')
          .clear()
          .type(correo, { delay: 0 });
      }
    });
  }

  seleccionarResultadoBuscador(correo) {
    // Espera a que aparezca el resultado en el buscador y hace clic
    cy.contains(correo, { timeout: 10000 })
      .should('be.visible')
      .click();
  }

  hacerClicEnCambiarDeCuenta() {
    cy.get(this.cambiarCuentaSubmitButton, { timeout: 10000 })
      .should('be.visible')
      .and('not.be.disabled')
      .click();
  }

  cambiarCuentaCompleto(correo) {
    this.hacerClicEnSidebarHeader();
    this.hacerClicEnCambiarCuenta();
    this.verificarPantallaCambioCuenta();
    this.ingresarCorreoCliente(correo);
    this.seleccionarResultadoBuscador(correo);
    this.hacerClicEnCambiarDeCuenta();
  }

  hacerClicEnSolicitarFuncionalidad() {
    // Esperar a que el dropdown esté completamente abierto y renderizado
    cy.wait(2000);
    
    // Intentar primero con el ID, si falla usar texto como alternativa
    cy.get(this.solicitarFuncionalidadButton, { timeout: 25000 })
      .should('exist')
      .should('be.visible')
      .and('not.be.disabled')
      .click({ timeout: 25000 });
  }

  verificarRedireccionTypeform() {
    // El elemento es un div con onClick, no un enlace
    // Este método se llama después de hacer clic, la verificación real está en el test
    cy.log('✅ Método de verificación de Typeform llamado');
  }

  solicitarFuncionalidadCompleto() {
    this.hacerClicEnSidebarHeader();
    this.hacerClicEnSolicitarFuncionalidad();
    this.verificarRedireccionTypeform();
  }
}

export default DropdownNavegacionPage;

