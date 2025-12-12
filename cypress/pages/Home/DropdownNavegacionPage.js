// cypress/pages/Home/DropdownNavegacionPage.js
class DropdownNavegacionPage {
  // Selectores
  get sidebarHeaderButton() { return '#sidebar-header-button'; }
  get cambiarCuentaButton() { return '#change-account'; }
  get solicitarFuncionalidadButton() { return '#request-feature'; }
  get tarifasButton() { return '#rates'; }
  get legalesButton() { return '#legal'; }
  get blogButton() { return '#blog'; }
  get inputCorreoCliente() { return '#input-on0ga5z8g'; }
  get cambiarCuentaSubmitButton() { return '.bia-button.bia-button--primary.bia-button--medium'; }

  // Métodos de acción
  hacerClicEnSidebarHeader() {
    cy.get(this.sidebarHeaderButton, { timeout: 10000 })
      .should('be.visible')
      .and('be.enabled')
      .clickVisible({ pause: 800, highlight: true }); // Resaltar antes de hacer clic
    
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

  hacerClicEnTarifas() {
    // Esperar a que el dropdown esté completamente abierto y renderizado
    cy.wait(2000);
    
    // Intentar encontrar el elemento por ID primero
    cy.get('body').then(($body) => {
      const elementById = $body.find(this.tarifasButton);
      
      if (elementById.length > 0) {
        cy.log('✅ Elemento #rates encontrado por ID');
        
        const href = elementById.attr('href');
        const target = elementById.attr('target');
        const isVisible = elementById.is(':visible');
        
        cy.log(`🔍 href: ${href}, target: ${target}, visible: ${isVisible}`);
        
        // Si tiene href, usar ese para navegar
        if (href) {
          if (target === '_blank') {
            cy.log('⚠️ Enlace tiene target="_blank", removiendo...');
            cy.get(this.tarifasButton)
              .invoke('removeAttr', 'target')
              .clickVisible({ pause: 1000, highlight: true });
          } else {
            cy.log('✅ Haciendo clic en enlace...');
            cy.get(this.tarifasButton)
              .should('be.visible')
              .clickVisible({ pause: 1000, highlight: true });
          }
        } else {
          // Si no tiene href, hacer clic normal con resaltado visual
          cy.log('✅ Elemento sin href, haciendo clic normal...');
          if (isVisible) {
            cy.get(this.tarifasButton)
              .clickVisible({ pause: 1000, highlight: true });
          } else {
            cy.get(this.tarifasButton)
              .scrollAndClick({ pause: 1000, highlight: true });
          }
        }
      } else {
        // Si no se encuentra por ID, buscar por texto
        cy.log('⚠️ Elemento no encontrado por ID, buscando por texto...');
        cy.contains(/tarifas/i, { timeout: 10000 })
          .should('exist')
          .scrollIntoView()
          .then(($el) => {
            const href = $el.attr('href');
            const target = $el.attr('target');
            
          if (href) {
            if (target === '_blank') {
              cy.wrap($el).invoke('removeAttr', 'target').clickVisible({ pause: 1000, highlight: true });
            } else {
              cy.wrap($el).clickVisible({ pause: 1000, highlight: true });
            }
          } else {
            cy.wrap($el).clickVisible({ pause: 1000, highlight: true });
          }
          });
      }
    });
    
    // Esperar un momento para que la navegación se procese
    cy.wait(3000);
  }

  navegarATarifas() {
    this.hacerClicEnSidebarHeader();
    cy.wait(3000); // Esperar a que el dropdown se renderice completamente
    
    // Debug: verificar que el elemento existe antes de hacer clic
    cy.get('body').then(($body) => {
      const ratesElement = $body.find('#rates');
      cy.log(`🔍 Elemento #rates encontrado: ${ratesElement.length > 0}`);
      if (ratesElement.length > 0) {
        cy.log(`🔍 Elemento visible: ${ratesElement.is(':visible')}`);
        cy.log(`🔍 Elemento texto: ${ratesElement.text()}`);
        cy.log(`🔍 Elemento href: ${ratesElement.attr('href')}`);
      }
    });
    
    // Opcional: Descomentar la siguiente línea para pausar aquí y ver el estado
    // cy.pause(); // Presiona "Resume" en Cypress para continuar
    
    this.hacerClicEnTarifas();
  }

  hacerClicEnLegales() {
    // Esperar a que el dropdown esté completamente abierto y renderizado
    cy.wait(2000);
    
    // Intentar encontrar el elemento por ID primero
    cy.get('body').then(($body) => {
      const elementById = $body.find(this.legalesButton);
      
      if (elementById.length > 0) {
        cy.log('✅ Elemento #legal encontrado por ID');
        
        const href = elementById.attr('href');
        const target = elementById.attr('target');
        const isVisible = elementById.is(':visible');
        
        cy.log(`🔍 href: ${href}, target: ${target}, visible: ${isVisible}`);
        
        // Si tiene href, usar ese para navegar
        if (href) {
          if (target === '_blank') {
            cy.log('⚠️ Enlace tiene target="_blank", removiendo...');
            cy.get(this.legalesButton)
              .invoke('removeAttr', 'target')
              .clickVisible({ pause: 1000, highlight: true });
          } else {
            cy.log('✅ Haciendo clic en enlace...');
            cy.get(this.legalesButton)
              .should('be.visible')
              .clickVisible({ pause: 1000, highlight: true });
          }
        } else {
          // Si no tiene href, hacer clic normal con resaltado visual
          cy.log('✅ Elemento sin href, haciendo clic normal...');
          if (isVisible) {
            cy.get(this.legalesButton)
              .clickVisible({ pause: 1000, highlight: true });
          } else {
            cy.get(this.legalesButton)
              .scrollAndClick({ pause: 1000, highlight: true });
          }
        }
      } else {
        // Si no se encuentra por ID, buscar por texto
        cy.log('⚠️ Elemento no encontrado por ID, buscando por texto...');
        cy.contains(/legales/i, { timeout: 10000 })
          .should('exist')
          .scrollIntoView()
          .then(($el) => {
            const href = $el.attr('href');
            const target = $el.attr('target');
            
            if (href) {
              if (target === '_blank') {
                cy.wrap($el).invoke('removeAttr', 'target').clickVisible({ pause: 1000, highlight: true });
              } else {
                cy.wrap($el).clickVisible({ pause: 1000, highlight: true });
              }
            } else {
              cy.wrap($el).clickVisible({ pause: 1000, highlight: true });
            }
          });
      }
    });
    
    // Esperar un momento para que la navegación se procese
    cy.wait(3000);
  }

  navegarALegales() {
    this.hacerClicEnSidebarHeader();
    cy.wait(3000); // Esperar a que el dropdown se renderice completamente
    
    // Debug: verificar que el elemento existe antes de hacer clic
    cy.get('body').then(($body) => {
      const legalElement = $body.find('#legal');
      cy.log(`🔍 Elemento #legal encontrado: ${legalElement.length > 0}`);
      if (legalElement.length > 0) {
        cy.log(`🔍 Elemento visible: ${legalElement.is(':visible')}`);
        cy.log(`🔍 Elemento texto: ${legalElement.text()}`);
        cy.log(`🔍 Elemento href: ${legalElement.attr('href')}`);
      }
    });
    
    this.hacerClicEnLegales();
  }

  hacerClicEnBlog() {
    // Esperar a que el dropdown esté completamente abierto y renderizado
    cy.wait(2000);
    
    // Intentar encontrar el elemento por ID primero
    cy.get('body').then(($body) => {
      const elementById = $body.find(this.blogButton);
      
      if (elementById.length > 0) {
        cy.log('✅ Elemento #blog encontrado por ID');
        
        const href = elementById.attr('href');
        const target = elementById.attr('target');
        const isVisible = elementById.is(':visible');
        
        cy.log(`🔍 href: ${href}, target: ${target}, visible: ${isVisible}`);
        
        // Si tiene href, usar ese para navegar
        if (href) {
          if (target === '_blank') {
            cy.log('⚠️ Enlace tiene target="_blank", removiendo...');
            cy.get(this.blogButton)
              .invoke('removeAttr', 'target')
              .clickVisible({ pause: 1000, highlight: true });
          } else {
            cy.log('✅ Haciendo clic en enlace...');
            cy.get(this.blogButton)
              .should('be.visible')
              .clickVisible({ pause: 1000, highlight: true });
          }
        } else {
          // Si no tiene href, hacer clic normal con resaltado visual
          cy.log('✅ Elemento sin href, haciendo clic normal...');
          if (isVisible) {
            cy.get(this.blogButton)
              .clickVisible({ pause: 1000, highlight: true });
          } else {
            cy.get(this.blogButton)
              .scrollAndClick({ pause: 1000, highlight: true });
          }
        }
      } else {
        // Si no se encuentra por ID, buscar por texto
        cy.log('⚠️ Elemento no encontrado por ID, buscando por texto...');
        cy.contains(/blog/i, { timeout: 10000 })
          .should('exist')
          .scrollIntoView()
          .then(($el) => {
            const href = $el.attr('href');
            const target = $el.attr('target');
            
            if (href) {
              if (target === '_blank') {
                cy.wrap($el).invoke('removeAttr', 'target').clickVisible({ pause: 1000, highlight: true });
              } else {
                cy.wrap($el).clickVisible({ pause: 1000, highlight: true });
              }
            } else {
              cy.wrap($el).clickVisible({ pause: 1000, highlight: true });
            }
          });
      }
    });
    
    // Esperar un momento para que la navegación se procese
    cy.wait(3000);
  }

  navegarABlog() {
    this.hacerClicEnSidebarHeader();
    cy.wait(3000); // Esperar a que el dropdown se renderice completamente
    
    // Debug: verificar que el elemento existe antes de hacer clic
    cy.get('body').then(($body) => {
      const blogElement = $body.find('#blog');
      cy.log(`🔍 Elemento #blog encontrado: ${blogElement.length > 0}`);
      if (blogElement.length > 0) {
        cy.log(`🔍 Elemento visible: ${blogElement.is(':visible')}`);
        cy.log(`🔍 Elemento texto: ${blogElement.text()}`);
        cy.log(`🔍 Elemento href: ${blogElement.attr('href')}`);
      }
    });
    
    this.hacerClicEnBlog();
  }
}

export default DropdownNavegacionPage;

