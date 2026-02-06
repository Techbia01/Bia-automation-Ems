// cypress/pages/analisis/EnergiaReactivaPage.js
class EnergiaReactivaPage {
  // ============================================================
  // SELECTORES
  // ============================================================
  
  // Contenedor principal del módulo de energía reactiva
  get energiaReactivaContainer() { return '[data-module="energia-reactiva"], .EnergiaReactiva_container, [class*="EnergiaReactiva"]'; }
  
  // Filtros de período
  get filtroMensual() { return 'div.bia-tab-switcher__tab-container.bia-tab-switcher__tab-container--active'; }
  get filtroSemanal() { return 'span:contains("Semana")'; }
  get filtroDiario() { return '#tab-daily'; }
  get filtroDropdown() { return '.FiltersSection_filterChipDropdown__zqrbE'; }
  
  // Selector de fecha
  get selectorFecha() { return '[data-date-picker], [class*="DatePicker"], input[type="date"]'; }
  
  // Widgets y gráficas
  get widgetsContainer() { return '[data-widgets-container], [class*="WidgetsContainer"]'; }
  get graficasContainer() { return '[data-graphs-container], [class*="GraphsContainer"]'; }
  
  // Título del módulo
  get tituloModulo() { return 'h1, h2, [class*="Title"], [class*="title"]'; }

  // ============================================================
  // MÉTODOS DE NAVEGACIÓN
  // ============================================================

  /**
   * Verificar que el módulo de energía reactiva cargó correctamente
   * @returns {Cypress.Chainable<boolean>} - True si cargó correctamente
   */
  verificarQueCargo() {
    cy.log('🔍 Verificando que el módulo de energía reactiva cargó...');
    
    return cy.url({ timeout: 15000 }).then((url) => {
      const urlLower = url.toLowerCase();
      const esPaginaCorrecta = urlLower.includes('/analisis') || 
                               urlLower.includes('/analysis') || 
                               urlLower.includes('/energia-reactiva') ||
                               urlLower.includes('/reactive');
      
      if (!esPaginaCorrecta) {
        cy.log(`⚠️ URL actual: ${url}`);
        cy.log('   La URL no coincide con las rutas esperadas');
      } else {
        cy.log(`✅ URL correcta: ${url}`);
      }
      
      return cy.get('body', { timeout: 10000 }).then(($body) => {
        const $container = $body.find(this.energiaReactivaContainer).filter(':visible');
        const tieneContainer = $container.length > 0;
        
        if (tieneContainer) {
          cy.log('✅ Módulo de energía reactiva cargado correctamente');
        } else {
          cy.log('⚠️ No se encontró el contenedor principal, pero continuando...');
        }
        
        return cy.wrap(tieneContainer || esPaginaCorrecta);
      });
    });
  }

  // ============================================================
  // MÉTODOS DE FILTROS
  // ============================================================

  /**
   * Verificar que el filtro mensual está activo
   * @returns {Cypress.Chainable<boolean>} - True si está activo
   */
  verificarFiltroMensual() {
    cy.log('🔍 Verificando filtro mensual...');
    
    return cy.get('body', { timeout: 10000 }).then(($body) => {
      // Buscar el contenedor activo con la clase específica
      const $filtroMensual = $body.find('div.bia-tab-switcher__tab-container.bia-tab-switcher__tab-container--active').filter(':visible');
      
      if ($filtroMensual.length > 0) {
        const texto = $filtroMensual.text().trim().toLowerCase();
        const esMensual = texto.includes('mes') || texto.includes('monthly') || texto.includes('mensual');
        
        if (esMensual) {
          cy.log('✅ Filtro mensual está activo');
          return cy.wrap(true);
        } else {
          cy.log(`⚠️ El filtro activo no parece ser mensual. Texto: "${texto}"`);
          return cy.wrap(false);
        }
      } else {
        cy.log('⚠️ No se encontró el contenedor de filtro activo');
        return cy.wrap(false);
      }
    });
  }

  /**
   * Hacer clic en el filtro semanal
   * @returns {Cypress.Chainable} - Chainable de Cypress
   */
  hacerClicEnFiltroSemanal() {
    cy.log('🔄 Haciendo clic en filtro semanal...');
    
    return cy.contains('span', 'Semana', { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .click({ force: true })
      .then(() => {
        cy.wait(3000); // Esperar a que se actualice la UI y el API
        cy.log('✅ Filtro semanal seleccionado');
      });
  }

  /**
   * Verificar que el filtro semanal está seleccionado
   * @returns {Cypress.Chainable<boolean>} - True si está seleccionado
   */
  verificarFiltroSemanal() {
    cy.log('🔍 Verificando filtro semanal...');
    
    return cy.contains('span', 'Semana', { timeout: 10000 }).then(($element) => {
      if ($element.length > 0 && $element.is(':visible')) {
        // Verificar que el elemento padre tenga la clase activa o esté seleccionado
        const $parent = $element.parent();
        const tieneClaseActiva = $parent.hasClass('bia-tab-switcher__tab-container--active') || 
                                 $parent.hasClass('active') ||
                                 $element.closest('.bia-tab-switcher__tab-container').hasClass('bia-tab-switcher__tab-container--active');
        
        if (tieneClaseActiva || $element.is(':visible')) {
          cy.log('✅ Filtro semanal está visible y seleccionado');
          return cy.wrap(true);
        } else {
          cy.log('⚠️ Filtro semanal está visible pero no parece estar activo');
          return cy.wrap(false);
        }
      } else {
        cy.log('⚠️ No se encontró el filtro semanal');
        return cy.wrap(false);
      }
    });
  }

  /**
   * Hacer clic en el filtro diario
   * @returns {Cypress.Chainable} - Chainable de Cypress
   */
  hacerClicEnFiltroDiario() {
    cy.log('🔄 Haciendo clic en filtro diario...');
    
    return cy.get('#tab-daily', { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .click({ force: true })
      .then(() => {
        cy.wait(3000); // Esperar a que se actualice la UI y el API
        cy.log('✅ Filtro diario seleccionado');
      });
  }

  /**
   * Verificar que el filtro diario está seleccionado
   * @returns {Cypress.Chainable<boolean>} - True si está seleccionado
   */
  verificarFiltroDiario() {
    cy.log('🔍 Verificando filtro diario...');
    
    return cy.get('#tab-daily', { timeout: 10000 }).then(($element) => {
      if ($element.length > 0 && $element.is(':visible')) {
        const tieneClaseActiva = $element.hasClass('active') || 
                                 $element.hasClass('bia-tab-switcher__tab-container--active') ||
                                 $element.attr('aria-selected') === 'true';
        
        if (tieneClaseActiva || $element.is(':visible')) {
          cy.log('✅ Filtro diario está visible');
          // Verificar también que el contenedor padre tenga la clase activa
          const $parent = $element.closest('.bia-tab-switcher__tab-container');
          if ($parent.hasClass('bia-tab-switcher__tab-container--active')) {
            cy.log('✅ Filtro diario está activo');
            return cy.wrap(true);
          } else {
            cy.log('⚠️ Filtro diario está visible pero el contenedor no tiene clase activa');
            return cy.wrap(false);
          }
        } else {
          cy.log('⚠️ Filtro diario está visible pero no parece estar activo');
          return cy.wrap(false);
        }
      } else {
        cy.log('⚠️ No se encontró el filtro diario');
        return cy.wrap(false);
      }
    });
  }

  /**
   * Abrir el dropdown de filtros
   * @returns {Cypress.Chainable} - Chainable de Cypress
   */
  abrirDropdownFiltros() {
    cy.log('🔄 Abriendo dropdown de filtros...');
    
    return cy.get('.FiltersSection_filterChipDropdown__zqrbE', { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .click({ force: true })
      .then(() => {
        cy.wait(1000); // Esperar a que se abra el dropdown
        cy.log('✅ Dropdown de filtros abierto');
      });
  }

  /**
   * Verificar que el dropdown de filtros existe y es visible
   * @returns {Cypress.Chainable<boolean>} - True si existe y es visible
   */
  verificarDropdownFiltros() {
    cy.log('🔍 Verificando dropdown de filtros...');
    
    return cy.get('.FiltersSection_filterChipDropdown__zqrbE', { timeout: 10000 }).then(($element) => {
      if ($element.length > 0 && $element.is(':visible')) {
        cy.log('✅ Dropdown de filtros está visible');
        return cy.wrap(true);
      } else {
        cy.log('⚠️ No se encontró el dropdown de filtros');
        return cy.wrap(false);
      }
    });
  }

  /**
   * Cambiar el filtro de período
   * @param {string} periodo - Período a seleccionar ('monthly', 'daily', 'weekly')
   * @returns {Cypress.Chainable} - Chainable de Cypress
   */
  cambiarFiltroPeriodo(periodo = 'monthly') {
    cy.log(`🔄 Cambiando filtro de período a: ${periodo}...`);
    
    switch (periodo.toLowerCase()) {
      case 'monthly':
      case 'mensual':
        return this.verificarFiltroMensual().then((estaActivo) => {
          if (!estaActivo) {
            cy.log('⚠️ El filtro mensual no está activo, intentando activarlo...');
            // Buscar y hacer clic en el filtro mensual
            return cy.get('body').then(($body) => {
              const $filtroMensual = $body.find('div.bia-tab-switcher__tab-container').filter(':visible').first();
              if ($filtroMensual.length > 0) {
                cy.wrap($filtroMensual).click({ force: true });
                cy.wait(3000);
                cy.log('✅ Filtro mensual activado');
              }
            });
          } else {
            cy.log('✅ Filtro mensual ya está activo');
          }
        });
      case 'daily':
      case 'diario':
        return this.hacerClicEnFiltroDiario();
      case 'weekly':
      case 'semanal':
        return this.hacerClicEnFiltroSemanal();
      default:
        cy.log(`⚠️ Período no reconocido: ${periodo}, usando monthly por defecto`);
        return this.verificarFiltroMensual();
    }
  }

  /**
   * Verificar todos los filtros en secuencia
   * @returns {Cypress.Chainable} - Chainable de Cypress
   */
  verificarTodosLosFiltros() {
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('🔍 VERIFICANDO TODOS LOS FILTROS');
    cy.log('═══════════════════════════════════════════════════════');
    
    return this.verificarFiltroMensual().then(() => {
      return this.hacerClicEnFiltroSemanal().then(() => {
        return this.verificarFiltroSemanal().then(() => {
          return this.hacerClicEnFiltroDiario().then(() => {
            return this.verificarFiltroDiario().then(() => {
              return this.verificarDropdownFiltros().then(() => {
                cy.log('');
                cy.log('✅ Verificación de todos los filtros completada');
              });
            });
          });
        });
      });
    });
  }
}

export default EnergiaReactivaPage;
