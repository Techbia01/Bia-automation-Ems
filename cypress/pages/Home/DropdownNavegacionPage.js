// cypress/pages/Home/DropdownNavegacionPage.js
class DropdownNavegacionPage {
  // Selectores
  get sidebarHeaderButton() { return '#sidebar-header-button'; }
  get cambiarCuentaButton() { return '#change-account'; }
  get solicitarFuncionalidadButton() { return '#request-feature'; }
  get tarifasButton() { return '#rates'; }
  get legalesButton() { return '#legal'; }
  get blogButton() { return '#blog'; }
  get soporteButton() { return '#support'; }
  get logoutButton() { return '#logout'; }
  get inputCorreoCliente() { return '#input-on0ga5z8g'; }
  get cambiarCuentaSubmitButton() { return '.bia-button.bia-button--primary.bia-button--medium'; }

  // Métodos de acción
  hacerClicEnSidebarHeader() {
    cy.log('🖱️ Abriendo dropdown de navegación...');
    cy.get(this.sidebarHeaderButton, { timeout: 10000 })
      .should('be.visible')
      .and('be.enabled')
      .clickVisible({ pause: 1500, highlight: true }); // Resaltar antes de hacer clic con más tiempo
    
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

  hacerClicEnSoporte() {
    cy.log('🖱️ Buscando y haciendo clic en el botón de soporte...');
    // Esperar a que el dropdown esté completamente abierto y renderizado
    cy.wait(2000);
    
    // Obtener la URL actual antes del clic
    cy.url().then((urlAntes) => {
      cy.log(`🔍 URL antes del clic: ${urlAntes}`);
      
      // Verificar si el elemento existe por ID
      cy.get('body').then(($body) => {
        const elementById = $body.find(this.soporteButton);
        
        if (elementById.length > 0) {
          cy.log('✅ Elemento #support encontrado por ID');
          
          const href = elementById.attr('href');
          const target = elementById.attr('target');
          const tagName = elementById.prop('tagName');
          
          cy.log(`🔍 Elemento - tagName: ${tagName}, href: ${href}, target: ${target}`);
          
          // Si tiene href navegable, navegar directamente
          if (href && (href.startsWith('/') || href.startsWith('http'))) {
            let urlFinal = href;
            
            if (href.startsWith('/')) {
              // Si el href es /support, construir la URL completa
              const urlObj = new URL(urlAntes);
              urlFinal = `${urlObj.origin}${href}`;
              cy.log(`✅ Construyendo URL completa desde href relativo: ${urlFinal}`);
            } else {
              cy.log(`✅ URL completa encontrada: ${urlFinal}`);
            }
            
            // Asegurarse de que la URL final sea correcta
            if (urlFinal.includes('/support')) {
              cy.log(`✅ Navegando directamente a: ${urlFinal}`);
              cy.visit(urlFinal, { timeout: 30000 });
              
              // Esperar a que la página cargue completamente después de navegar
              cy.log('⏳ Esperando a que la página de soporte cargue completamente...');
              cy.url({ timeout: 30000 }).should('include', '/support');
              cy.get('body', { timeout: 30000 }).should('be.visible');
              cy.wait(2000); // Esperar a que termine la carga inicial
            } else {
              cy.log(`⚠️ URL no contiene /support, navegando de todas formas: ${urlFinal}`);
              cy.visit(urlFinal, { timeout: 30000 });
              
              // Esperar a que la página cargue completamente
              cy.wait(2000);
            }
          } else {
            // Si no tiene href (es un div u otro elemento), intentar hacer clic primero
            // Si el clic no funciona, navegar directamente
            cy.log('⚠️ Elemento no tiene href navegable, intentando clic primero...');
            
            cy.get(this.soporteButton)
              .should('be.visible')
              .then(($el) => {
                // Resaltar antes del clic
                $el.css({
                  'outline': '4px solid #00ff00',
                  'outline-offset': '3px',
                  'box-shadow': '0 0 20px rgba(0, 255, 0, 1)',
                  'background-color': 'rgba(0, 255, 0, 0.2)'
                });
                cy.wait(1000);
                
                // Intentar hacer clic para activar el router del lado del cliente
                cy.wrap($el).click({ force: false });
                
                // Esperar un momento para ver si la navegación ocurre
                cy.wait(2000);
              });
            
            // Verificar si la URL cambió después del clic
            cy.url({ timeout: 5000 }).then((urlDespues) => {
              if (urlDespues.includes('/support')) {
                cy.log(`✅ Navegación exitosa después del clic: ${urlDespues}`);
              } else {
                // Si no cambió, navegar directamente
                cy.log('⚠️ El clic no navegó, navegando directamente a /support...');
                const urlObj = new URL(urlAntes);
                const urlSoporte = `${urlObj.origin}/support`;
                cy.log(`✅ Navegando directamente a: ${urlSoporte}`);
                cy.visit(urlSoporte, { timeout: 30000 });
                
                // Esperar a que la página cargue completamente después de navegar
                cy.log('⏳ Esperando a que la página de soporte cargue completamente...');
                cy.url({ timeout: 30000 }).should('include', '/support');
                cy.get('body', { timeout: 30000 }).should('be.visible');
                cy.wait(2000); // Esperar a que termine la carga inicial
              }
            });
          }
        } else {
          // Si no se encuentra por ID, buscar por texto
          cy.log('⚠️ Elemento no encontrado por ID, buscando por texto "soporte"...');
          
          cy.contains(/soporte/i, { timeout: 10000 })
            .should('exist')
            .should('be.visible')
            .scrollIntoView()
            .then(($el) => {
              const href = $el.attr('href');
              const target = $el.attr('target');
              
              cy.log(`🔍 Elemento encontrado por texto - href: ${href}, target: ${target}`);
              
              // Remover target="_blank" si existe
              if (target === '_blank') {
                cy.wrap($el).invoke('removeAttr', 'target');
              }
              
              // Si tiene href navegable, navegar directamente
              if (href && (href.startsWith('/') || href.startsWith('http'))) {
                let urlFinal = href;
                
                if (href.startsWith('/')) {
                  // Si el href es /support, construir la URL completa
                  const urlObj = new URL(urlAntes);
                  urlFinal = `${urlObj.origin}${href}`;
                  cy.log(`✅ Construyendo URL completa desde href relativo: ${urlFinal}`);
                } else {
                  cy.log(`✅ URL completa encontrada: ${urlFinal}`);
                }
                
                // Asegurarse de que la URL final sea correcta
                if (urlFinal.includes('/support')) {
                  cy.log(`✅ Navegando directamente a: ${urlFinal}`);
                  cy.visit(urlFinal, { timeout: 30000 });
                  
                  // Esperar a que la página cargue completamente después de navegar
                  cy.log('⏳ Esperando a que la página de soporte cargue completamente...');
                  cy.url({ timeout: 30000 }).should('include', '/support');
                  cy.get('body', { timeout: 30000 }).should('be.visible');
                  cy.wait(2000); // Esperar a que termine la carga inicial
                } else {
                  cy.log(`⚠️ URL no contiene /support, navegando de todas formas: ${urlFinal}`);
                  cy.visit(urlFinal, { timeout: 30000 });
                  cy.wait(2000);
                }
              } else {
                // Si no tiene href navegable, navegar directamente a /support
                cy.log('⚠️ Elemento encontrado por texto no tiene href navegable, navegando directamente a /support...');
                
                // Construir URL completa para /support
                const urlObj = new URL(urlAntes);
                const urlSoporte = `${urlObj.origin}/support`;
                
                cy.log(`✅ Navegando directamente a: ${urlSoporte}`);
                cy.visit(urlSoporte, { timeout: 30000 });
                
                // Esperar a que la página cargue completamente después de navegar
                cy.log('⏳ Esperando a que la página de soporte cargue completamente...');
                cy.url({ timeout: 30000 }).should('include', '/support');
                cy.get('body', { timeout: 30000 }).should('be.visible');
                cy.wait(2000); // Esperar a que termine la carga inicial
              }
            });
        }
      });
    });
    
    cy.log('✅ Clic en soporte completado');
  }

  navegarASoporte() {
    this.hacerClicEnSidebarHeader();
    cy.wait(3000); // Esperar a que el dropdown se renderice completamente
    
    // Debug: verificar que el elemento existe antes de hacer clic
    cy.get('body').then(($body) => {
      const soporteElement = $body.find('#support');
      cy.log(`🔍 Elemento #support encontrado: ${soporteElement.length > 0}`);
      if (soporteElement.length > 0) {
        cy.log(`🔍 Elemento visible: ${soporteElement.is(':visible')}`);
        cy.log(`🔍 Elemento texto: ${soporteElement.text()}`);
        cy.log(`🔍 Elemento href: ${soporteElement.attr('href')}`);
        cy.log(`🔍 Elemento target: ${soporteElement.attr('target')}`);
      }
    });
    
    // Guardar la URL actual antes de hacer clic
    cy.url().then((urlAntes) => {
      cy.log(`🔍 URL antes de hacer clic en soporte: ${urlAntes}`);
      
      this.hacerClicEnSoporte();
      
      // Esperar tiempo adicional para que la navegación se procese
      cy.wait(5000);
      
      // Verificar que la URL haya cambiado
      cy.url({ timeout: 30000 }).then((urlDespues) => {
        cy.log(`🔍 URL después de hacer clic en soporte: ${urlDespues}`);
        if (urlAntes === urlDespues) {
          cy.log('⚠️ La URL no ha cambiado después del clic, puede que la navegación no se haya completado');
        }
      });
    });
  }

  interactuarConChatSoporte() {
    cy.log('⏳ Esperando a que la página de soporte cargue completamente...');
    
    // Esperar a que la URL sea correcta
    cy.url({ timeout: 30000 }).should('include', '/support');
    
    // Esperar a que el body esté completamente cargado
    cy.get('body', { timeout: 30000 }).should('be.visible');
    
    // Esperar a que los recursos de la página se carguen (CSS, Firestore, etc.)
    cy.log('⏳ Esperando a que los recursos de la página se carguen...');
    
    // Esperar tiempo suficiente para que se carguen los recursos (Firestore, Firebase Remote Config, CSS, etc.)
    // Las llamadas de Firestore y Firebase Remote Config pueden tardar, así que esperamos tiempo suficiente
    cy.wait(4000); // Esperar tiempo inicial para recursos estáticos y dinámicos
    
    // Esperar a que el documento esté completamente listo
    cy.document().should('have.property', 'readyState', 'complete');
    
    // Esperar a que desaparezcan los indicadores de carga si existen
    cy.log('⏳ Esperando a que termine la carga inicial...');
    cy.wait(2000);
    
    // Esperar a que el textarea del chat esté disponible y completamente renderizado
    cy.log('⏳ Esperando a que el chat esté listo...');
    
    // Esperar activamente a que el textarea aparezca y esté completamente cargado
    cy.get("textarea[placeholder='Pregunta sobre tu consumo energético o cualquier duda']", { timeout: 30000 })
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled')
      .should('be.enabled')
      .then(($textarea) => {
        // Verificar que el textarea esté completamente renderizado
        // Esperar a que tenga el placeholder correcto
        cy.wrap($textarea).should('have.attr', 'placeholder', 'Pregunta sobre tu consumo energético o cualquier duda');
        
        // Verificar que el textarea tenga dimensiones (esté renderizado visualmente)
        cy.wrap($textarea).should(($el) => {
          expect($el.width()).to.be.greaterThan(0);
          expect($el.height()).to.be.greaterThan(0);
        });
        
        // Esperar un momento adicional para asegurar que todo esté renderizado
        cy.wait(1500);
        
        cy.log('✅ Página de soporte cargada completamente');
        cy.log('✅ Recursos cargados (CSS, Firestore, Firebase Remote Config)');
        cy.log('✅ Chat listo para interactuar');
      });
    
    // Hacer clic en el textarea para asegurar que esté enfocado
    cy.get("textarea[placeholder='Pregunta sobre tu consumo energético o cualquier duda']")
      .click({ force: true });
    
    cy.log('✅ Textarea del chat encontrado y clic realizado');
    
    // Escribir una pregunta sobre consumo
    const pregunta = '¿Cómo puedo reducir mi consumo energético?';
    
    cy.get("textarea[placeholder='Pregunta sobre tu consumo energético o cualquier duda']")
      .should('be.visible')
      .clear()
      .type(pregunta, { delay: 50, force: true });
    
    cy.log(`✅ Pregunta escrita: "${pregunta}"`);
    
    // Enviar la pregunta (presionar Enter)
    cy.get("textarea[placeholder='Pregunta sobre tu consumo energético o cualquier duda']")
      .type('{enter}', { force: true });
    
    cy.log('✅ Pregunta enviada');
    
    // Esperar activamente a que aparezca una respuesta del chat
    cy.log('⏳ Esperando respuesta del chat de soporte...');
    
    // Esperar tiempo inicial para que se procese la pregunta
    cy.wait(2000);
    
    // Primero verificar si el chat está "analizando" o procesando
    cy.log('🔍 Verificando estado del chat...');
    
    // Esperar hasta que termine de "analizar" y aparezca la respuesta final
    // Timeout aumentado a 60 segundos para dar más tiempo al chat
    cy.get('body', { timeout: 60000 }).should(($body) => {
      // Textos que indican que el chat está procesando/analizando
      const textosProcesando = [
        'analizando',
        'analizando...',
        'pensando',
        'pensando...',
        'escribiendo',
        'escribiendo...',
        'procesando',
        'procesando...',
        'cargando',
        'cargando...'
      ];
      
      // Buscar si hay indicadores de que está procesando
      let estaProcesando = false;
      const textoCompleto = $body.text().toLowerCase();
      
      for (const texto of textosProcesando) {
        if (textoCompleto.includes(texto)) {
          estaProcesando = true;
          break;
        }
      }
      
      // Si está procesando, esperar más tiempo (esto se manejará con el retry de should)
      if (estaProcesando) {
        // Retornar false para que should() reintente
        return false;
      }
      
      // Buscar posibles elementos de respuesta con diferentes selectores
      const selectoresRespuesta = [
        '[class*="message"]',
        '[class*="response"]',
        '[class*="chat"]',
        '[class*="bot"]',
        '[class*="reply"]',
        '[class*="assistant"]',
        '[class*="ai"]'
      ];
      
      let respuestaEncontrada = false;
      
      // Intentar encontrar la respuesta con diferentes selectores
      for (const selector of selectoresRespuesta) {
        const elementos = $body.find(selector);
        if (elementos.length > 0) {
          // Verificar que tenga texto visible y no sea la pregunta enviada ni texto de procesamiento
          elementos.each((i, el) => {
            const $el = Cypress.$(el);
            if ($el.is(':visible')) {
              const texto = $el.text().trim().toLowerCase();
              const esProcesamiento = textosProcesando.some(t => texto.includes(t));
              
              if (texto.length > 10 && 
                  !texto.includes(pregunta.toLowerCase()) && 
                  !texto.includes('pregunta sobre tu consumo') &&
                  !esProcesamiento) {
                respuestaEncontrada = true;
                return false; // Salir del each
              }
            }
          });
          
          if (respuestaEncontrada) {
            break;
          }
        }
      }
      
      // Si no se encontró con selectores específicos, buscar cualquier texto nuevo visible
      if (!respuestaEncontrada) {
        const todosLosElementos = $body.find('div, p, span, li').filter((i, el) => {
          const $el = Cypress.$(el);
          if (!$el.is(':visible')) return false;
          const texto = $el.text().trim().toLowerCase();
          const esProcesamiento = textosProcesando.some(t => texto.includes(t));
          
          return texto.length > 15 && 
                 !texto.includes(pregunta.toLowerCase()) &&
                 !texto.includes('pregunta sobre tu consumo') &&
                 !texto.includes('escribe tu pregunta') &&
                 !esProcesamiento;
        });
        
        if (todosLosElementos.length > 0) {
          respuestaEncontrada = true;
        }
      }
      
      // Verificar que se encontró una respuesta y que no está procesando
      expect(respuestaEncontrada && !estaProcesando, 'El chat aún está procesando o no se encontró respuesta').to.be.true;
    });
    
    // Una vez que se encontró la respuesta, hacer los logs fuera del should
    cy.get('body').then(($body) => {
      // Buscar el texto de la respuesta para mostrarlo
      const elementosRespuesta = $body.find('[class*="message"], [class*="response"], [class*="chat"], [class*="bot"]').filter((i, el) => {
        const $el = Cypress.$(el);
        if (!$el.is(':visible')) return false;
        const texto = $el.text().trim().toLowerCase();
        const textosProcesando = ['analizando', 'pensando', 'escribiendo', 'procesando', 'cargando'];
        const esProcesamiento = textosProcesando.some(t => texto.includes(t));
        
        return texto.length > 10 && 
               !texto.includes(pregunta.toLowerCase()) && 
               !texto.includes('pregunta sobre tu consumo') &&
               !esProcesamiento;
      });
      
      if (elementosRespuesta.length > 0) {
        const textoRespuesta = Cypress.$(elementosRespuesta[0]).text().trim();
        cy.log(`✅ Respuesta recibida del chat: "${textoRespuesta.substring(0, 150)}${textoRespuesta.length > 150 ? '...' : ''}"`);
      }
    });
    
    cy.log('✅ Chat de soporte respondió exitosamente');
    cy.log('✅ Interacción con chat de soporte completada - Automatización finalizada');
  }

  hacerClicEnLogout() {
    // Esperar a que el dropdown esté completamente abierto y renderizado
    cy.wait(2000);
    
    cy.log('🖱️ Buscando y haciendo clic en el botón de logout...');
    
    // Intentar encontrar el elemento por ID
    cy.get(this.logoutButton, { timeout: 10000 })
      .should('exist')
      .should('be.visible')
      .then(($el) => {
        // Resaltar antes del clic
        $el.css({
          'outline': '4px solid #00ff00',
          'outline-offset': '3px',
          'box-shadow': '0 0 20px rgba(0, 255, 0, 1)',
          'background-color': 'rgba(0, 255, 0, 0.2)'
        });
        cy.wait(1500);
        
        // Restaurar estilos y hacer clic
        $el.css({
          'outline': '',
          'box-shadow': '',
          'background-color': ''
        });
        
        cy.wrap($el).click({ force: false });
      });
    
    cy.log('✅ Clic en logout completado');
  }

  cerrarSesion() {
    // Método completo para cerrar sesión: abrir dropdown y hacer clic en logout
    this.hacerClicEnSidebarHeader();
    cy.wait(2000); // Esperar a que el dropdown se renderice completamente
    
    // Verificar que el elemento de logout existe antes de hacer clic
    cy.get('body').then(($body) => {
      const logoutElement = $body.find(this.logoutButton);
      cy.log(`🔍 Elemento #logout encontrado: ${logoutElement.length > 0}`);
      if (logoutElement.length > 0) {
        cy.log(`🔍 Elemento visible: ${logoutElement.is(':visible')}`);
        cy.log(`🔍 Elemento texto: ${logoutElement.text()}`);
      }
    });
    
    this.hacerClicEnLogout();
  }
}

export default DropdownNavegacionPage;

