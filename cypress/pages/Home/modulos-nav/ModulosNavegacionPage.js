// cypress/pages/Home/modulos-nav/ModulosNavegacionPage.js
class ModulosNavegacionPage {
  // Selectores para módulos de navegación
  get sidebarMenu() { return '#sidebar-menu, [class*="sidebar"], [role="navigation"]'; }
  get menuItems() { return '[class*="menu-item"], [class*="nav-item"], [role="menuitem"]'; }
  get homeModule() { return '#home'; }
  get notificationsModule() { return '#notifications'; }
  get analysisModule() { return '#analysis'; }
  get consumptionTab() { return '#consumption'; }
  get reactiveTab() { return '#reactive'; }
  get biamonitorsTab() { return '#biamonitors'; }
  get energyIntensityTab() { return '#energy-intensity'; }
  get powerQualityTab() { return '#power-quality'; }
  get forecastTab() { return '#forecast'; }
  get paymentsModule() { return '#payments'; }
  get invoicesOption() { return '#invoices'; }
  get co2Tab() { return '#co2'; }
  get recsTab() { return '#recs'; }
  get energySolutionsModule() { return '#energy-solutions'; }
  get visitsHeadquartersModule() { return '#visits-headquarters'; }
  get settingsModule() { return '#settings'; }
  get usersOption() { return '#users'; }
  get sitesOption() { return '#sites'; }
  get contributionOption() { return '#contribution'; }
  get accountOption() { return '#account'; }
  get apiOption() { return '#api'; }
  get paymentMethodsOption() { return '#payment-methods'; }

  /**
   * Esperar a que el menú de navegación esté visible
   */
  esperarMenuNavegacion() {
    cy.log('⏳ Esperando a que el menú de navegación esté visible...');
    cy.get(this.sidebarMenu, { timeout: 10000 })
      .should('be.visible')
      .should('exist');
    cy.log('✅ Menú de navegación visible');
  }

  /**
   * Obtener todos los módulos disponibles en el menú
   * @returns {Cypress.Chainable<Array>} - Array con los módulos encontrados
   */
  obtenerModulosDisponibles() {
    cy.log('📋 Obteniendo módulos disponibles en el menú...');
    
    return cy.get('body').then(($body) => {
      const modulos = [];
      
      // Buscar elementos de menú
      const $menuItems = $body.find(this.menuItems).filter(':visible');
      
      $menuItems.each((i, el) => {
        const $el = Cypress.$(el);
        const texto = $el.text().trim();
        const href = $el.attr('href') || '';
        const id = $el.attr('id') || '';
        const dataModule = $el.attr('data-module') || '';
        
        if (texto.length > 0 || href || id || dataModule) {
          modulos.push({
            texto: texto,
            href: href,
            id: id,
            dataModule: dataModule,
            elemento: $el
          });
        }
      });
      
      cy.log(`✅ Se encontraron ${modulos.length} módulo(s) en el menú`);
      modulos.forEach((modulo, index) => {
        cy.log(`   ${index + 1}. ${modulo.texto || modulo.id || modulo.dataModule || 'Sin texto'}`);
      });
      
      return cy.wrap(modulos);
    });
  }

  /**
   * Verificar que un módulo específico existe en el menú
   * @param {string} nombreModulo - Nombre del módulo a verificar
   * @returns {Cypress.Chainable<boolean>} - True si existe, false si no
   */
  verificarModuloExiste(nombreModulo) {
    cy.log(`🔍 Verificando si el módulo "${nombreModulo}" existe...`);
    
    return cy.get('body').then(($body) => {
      const nombreLower = nombreModulo.toLowerCase();
      
      // Buscar por texto, href, id o data-module
      const $modulo = $body.find(this.menuItems).filter((i, el) => {
        const $el = Cypress.$(el);
        const texto = $el.text().trim().toLowerCase();
        const href = ($el.attr('href') || '').toLowerCase();
        const id = ($el.attr('id') || '').toLowerCase();
        const dataModule = ($el.attr('data-module') || '').toLowerCase();
        
        return $el.is(':visible') && (
          texto.includes(nombreLower) ||
          href.includes(nombreLower) ||
          id.includes(nombreLower) ||
          dataModule.includes(nombreLower)
        );
      });
      
      const existe = $modulo.length > 0;
      
      if (existe) {
        cy.log(`✅ Módulo "${nombreModulo}" encontrado`);
      } else {
        cy.log(`⚠️ Módulo "${nombreModulo}" no encontrado`);
      }
      
      return cy.wrap(existe);
    });
  }

  /**
   * Hacer clic en un módulo específico
   * @param {string} nombreModulo - Nombre del módulo en el que hacer clic
   */
  hacerClickEnModulo(nombreModulo) {
    cy.log(`🖱️ Haciendo clic en el módulo "${nombreModulo}"...`);
    
    cy.get('body').then(($body) => {
      const nombreLower = nombreModulo.toLowerCase();
      
      // Buscar el módulo
      const $modulo = $body.find(this.menuItems).filter((i, el) => {
        const $el = Cypress.$(el);
        const texto = $el.text().trim().toLowerCase();
        const href = ($el.attr('href') || '').toLowerCase();
        const id = ($el.attr('id') || '').toLowerCase();
        const dataModule = ($el.attr('data-module') || '').toLowerCase();
        
        return $el.is(':visible') && (
          texto.includes(nombreLower) ||
          href.includes(nombreLower) ||
          id.includes(nombreLower) ||
          dataModule.includes(nombreLower)
        );
      });
      
      if ($modulo.length > 0) {
        const $elemento = $modulo.first();
        const href = $elemento.attr('href');
        const target = $elemento.attr('target');
        
        // Si tiene href, verificar si es navegable
        if (href && (href.startsWith('/') || href.startsWith('http'))) {
          if (target === '_blank') {
            cy.wrap($elemento).invoke('removeAttr', 'target');
          }
          cy.wrap($elemento)
            .should('be.visible')
            .clickVisible({ pause: 1000, highlight: true });
        } else {
          cy.wrap($elemento)
            .should('be.visible')
            .clickVisible({ pause: 1000, highlight: true });
        }
        
        cy.log(`✅ Clic realizado en el módulo "${nombreModulo}"`);
      } else {
        cy.log(`⚠️ No se pudo encontrar el módulo "${nombreModulo}"`);
      }
    });
  }

  /**
   * Verificar que la navegación a un módulo fue exitosa
   * @param {string} nombreModulo - Nombre del módulo al que se navegó
   */
  verificarNavegacionExitosa(nombreModulo) {
    cy.log(`✅ Verificando navegación exitosa al módulo "${nombreModulo}"...`);
    
    const nombreLower = nombreModulo.toLowerCase();
    const rutasEsperadas = {
      'home': '/home',
      'facturas': '/facturas',
      'consumo': '/consumo',
      'usuarios': '/usuarios',
      'configuracion': '/configuracion'
    };
    
    const rutaEsperada = rutasEsperadas[nombreLower] || `/${nombreLower}`;
    
    cy.url({ timeout: 15000 }).should('include', rutaEsperada);
    cy.wait(2000); // Esperar a que la página cargue
    
    cy.log(`✅ Navegación exitosa a "${nombreModulo}"`);
  }

  /**
   * Verificar que todos los módulos esperados están presentes
   * @param {Array<string>} modulosEsperados - Array con los nombres de los módulos esperados
   */
  verificarModulosEsperados(modulosEsperados) {
    cy.log(`🔍 Verificando que todos los módulos esperados estén presentes...`);
    
    return this.obtenerModulosDisponibles().then((modulos) => {
      const modulosEncontrados = modulos.map(m => m.texto.toLowerCase() || m.id.toLowerCase() || m.dataModule.toLowerCase());
      const modulosFaltantes = [];
      
      modulosEsperados.forEach(moduloEsperado => {
        const moduloLower = moduloEsperado.toLowerCase();
        const encontrado = modulosEncontrados.some(modulo => 
          modulo.includes(moduloLower) || moduloLower.includes(modulo)
        );
        
        if (!encontrado) {
          modulosFaltantes.push(moduloEsperado);
        }
      });
      
      if (modulosFaltantes.length === 0) {
        cy.log(`✅ Todos los módulos esperados están presentes`);
      } else {
        cy.log(`⚠️ Módulos faltantes: ${modulosFaltantes.join(', ')}`);
      }
      
      return cy.wrap(modulosFaltantes.length === 0);
    });
  }

  /**
   * Chequear estado de todos los módulos (visibilidad, habilitación, etc.)
   * @returns {Cypress.Chainable<Object>} - Objeto con el estado de cada módulo
   */
  chequearEstadoModulos() {
    cy.log('🔍 Chequeando estado de todos los módulos...');
    
    return this.obtenerModulosDisponibles().then((modulos) => {
      const estadoModulos = {};
      
      modulos.forEach((modulo, index) => {
        const nombre = modulo.texto || modulo.id || modulo.dataModule || `Módulo ${index + 1}`;
        
        cy.wrap(modulo.elemento).then(($el) => {
          estadoModulos[nombre] = {
            visible: $el.is(':visible'),
            habilitado: !$el.is(':disabled'),
            tieneHref: !!modulo.href,
            texto: modulo.texto,
            href: modulo.href
          };
        });
      });
      
      cy.log('📊 Estado de módulos:');
      Object.keys(estadoModulos).forEach(nombre => {
        const estado = estadoModulos[nombre];
        cy.log(`   - ${nombre}: visible=${estado.visible}, habilitado=${estado.habilitado}`);
      });
      
      return cy.wrap(estadoModulos);
    });
  }

  /**
   * Flujo completo: verificar y navegar a un módulo
   * @param {string} nombreModulo - Nombre del módulo
   */
  verificarYNavegarAModulo(nombreModulo) {
    cy.log(`🚀 Iniciando flujo completo para el módulo "${nombreModulo}"...`);
    
    // 1. Esperar menú
    this.esperarMenuNavegacion();
    
    // 2. Verificar que existe
    this.verificarModuloExiste(nombreModulo).then((existe) => {
      if (existe) {
        // 3. Hacer clic
        this.hacerClickEnModulo(nombreModulo);
        
        // 4. Verificar navegación
        this.verificarNavegacionExitosa(nombreModulo);
      } else {
        cy.log(`⚠️ No se puede navegar al módulo "${nombreModulo}" porque no existe`);
      }
    });
  }

  /**
   * Hacer clic en el módulo de inicio (home)
   */
  hacerClickEnInicio() {
    cy.log('🖱️ Haciendo clic en el módulo de inicio...');
    cy.get(this.homeModule, { timeout: 10000 })
      .should('be.visible')
      .should('exist')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en inicio');
  }

  /**
   * Verificar que el módulo de inicio muestra información y no tiene errores
   */
  verificarInicioCargado() {
    cy.log('🔍 Verificando que el módulo de inicio esté cargado correctamente...');
    
    // Esperar a que la página cargue completamente
    cy.wait(3000);
    
    // Verificar que no hay pantallas negras o errores visibles
    cy.get('body').then(($body) => {
      // Buscar elementos que indiquen error (pantallas negras, mensajes de error, etc.)
      const $errores = $body.find('[class*="error"], [class*="Error"], [class*="fail"], [class*="Fail"]').filter(':visible');
      const $pantallasNegras = $body.find('[style*="background: black"], [style*="background-color: black"], [style*="background:#000"]').filter(':visible');
      
      if ($errores.length > 0) {
        cy.log(`⚠️ Se encontraron ${$errores.length} elemento(s) de error visible(s)`);
      }
      
      if ($pantallasNegras.length > 0) {
        cy.log(`⚠️ Se encontraron ${$pantallasNegras.length} elemento(s) con fondo negro`);
      }
      
      // Verificar que hay contenido visible (no solo el menú lateral)
      const $contenidoPrincipal = $body.find('main, [class*="main"], [class*="content"], [class*="home"], [class*="dashboard"]').filter(':visible');
      const textoBody = $body.text().trim();
      
      // Verificar que hay contenido significativo (más de solo el menú)
      const tieneContenido = $contenidoPrincipal.length > 0 || textoBody.length > 500;
      
      if (tieneContenido) {
        cy.log('✅ El módulo de inicio muestra información');
      } else {
        cy.log('⚠️ El módulo de inicio no muestra suficiente información');
      }
      
      // Verificar que no hay indicadores de carga activos
      cy.get('body').then(($body) => {
        const $loaders = $body.find('[class*="loading"], [class*="spinner"], [class*="loader"], [class*="Loading"]').filter(':visible');
        if ($loaders.length === 0) {
          cy.log('✅ La información ha terminado de cargar');
        } else {
          cy.log(`⏳ Aún hay ${$loaders.length} indicador(es) de carga activo(s)`);
          // Esperar un poco más si aún hay loaders
          cy.wait(2000);
        }
      });
    });
    
    cy.log('✅ Verificación del módulo de inicio completada');
  }

  /**
   * Flujo completo para el módulo de inicio
   */
  navegarAInicioYVerificar() {
    cy.log('🚀 Iniciando flujo completo para el módulo de inicio...');
    
    // 1. Hacer clic en inicio
    this.hacerClickEnInicio();
    
    // 2. Verificar que cargó correctamente
    this.verificarInicioCargado();
  }

  /**
   * Hacer clic en el módulo de notificaciones
   */
  hacerClickEnNotificaciones() {
    cy.log('🔔 Haciendo clic en el módulo de notificaciones...');
    cy.get(this.notificationsModule, { timeout: 10000 })
      .should('be.visible')
      .should('exist')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en notificaciones');
  }

  /**
   * Verificar que se muestra un listado de notificaciones
   * @returns {Cypress.Chainable<boolean>} - True si hay notificaciones, false si no
   */
  verificarListadoNotificaciones() {
    cy.log('🔍 Verificando que se muestre el listado de notificaciones...');
    
    // Esperar a que cargue el contenido
    cy.wait(2000);
    
    return cy.get('body').then(($body) => {
      // Buscar elementos que puedan ser notificaciones en la lista
      // Excluir el menú lateral con id="notifications"
      const $notificaciones = $body.find('li, [role="listitem"], [class*="notification"], [class*="item"]').filter((i, el) => {
        const $el = Cypress.$(el);
        // Filtrar elementos visibles que no sean el menú lateral
        return $el.is(':visible') && 
               !$el.closest('[id="notifications"]').length &&
               $el.text().trim().length > 0 &&
               ($el.parent().is('ul, [role="list"], [class*="list"]') || 
                $el.closest('ul, [role="list"], [class*="list"]').length > 0);
      });
      
      const hayNotificaciones = $notificaciones.length > 0;
      
      if (hayNotificaciones) {
        cy.log(`✅ Se encontraron ${$notificaciones.length} notificación(es) en el listado`);
        
        // Mostrar información de las primeras notificaciones
        $notificaciones.slice(0, 3).each((i, el) => {
          const texto = Cypress.$(el).text().trim();
          cy.log(`   ${i + 1}. ${texto.substring(0, 50)}${texto.length > 50 ? '...' : ''}`);
        });
      } else {
        cy.log('ℹ️ No se encontraron notificaciones en el listado');
      }
      
      return cy.wrap(hayNotificaciones);
    });
  }

  /**
   * Flujo completo para el módulo de notificaciones
   * @returns {Cypress.Chainable<boolean>} - True si hay notificaciones disponibles
   */
  navegarANotificacionesYVerificar() {
    cy.log('🚀 Iniciando flujo completo para el módulo de notificaciones...');
    
    // 1. Hacer clic en notificaciones
    this.hacerClickEnNotificaciones();
    
    // 2. Verificar que se muestra el listado
    return this.verificarListadoNotificaciones().then((hayNotificaciones) => {
      if (hayNotificaciones) {
        cy.log('✅ Hay notificaciones disponibles, se puede continuar con la automatización');
      } else {
        cy.log('ℹ️ No hay notificaciones disponibles');
      }
      
      return cy.wrap(hayNotificaciones);
    });
  }

  /**
   * Hacer clic en el módulo de análisis
   */
  hacerClickEnAnalisis() {
    cy.log('📊 Haciendo clic en el módulo de análisis...');
    cy.get(this.analysisModule, { timeout: 10000 })
      .should('be.visible')
      .should('exist')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en análisis');
  }

  /**
   * Hacer clic en la pestaña de consumo general
   */
  hacerClickEnConsumoGeneral() {
    cy.log('⚡ Haciendo clic en consumo general...');
    cy.get(this.consumptionTab, { timeout: 10000 })
      .should('be.visible')
      .should('exist')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en consumo general');
  }

  /**
   * Verificar que se muestran widgets, gráficas y filtros en la vista
   */
  verificarWidgetsGraficasYFiltros() {
    cy.log('🔍 Verificando que se muestren widgets, gráficas y filtros...');
    
    // Esperar a que cargue el contenido
    cy.wait(3000);
    
    return cy.get('body').then(($body) => {
      // Buscar widgets
      const $widgets = $body.find('[class*="widget"], [class*="card"], [class*="metric"], [data-testid*="widget"]').filter(':visible');
      
      // Buscar gráficas
      const $graficas = $body.find('canvas, svg, [class*="chart"], [class*="graph"], [class*="graphic"]').filter(':visible');
      
      // Buscar filtros
      const $filtros = $body.find('[class*="filter"], [class*="Filter"], select, [role="combobox"], [class*="select"]').filter(':visible');
      
      const tieneWidgets = $widgets.length > 0;
      const tieneGraficas = $graficas.length > 0;
      const tieneFiltros = $filtros.length > 0;
      
      if (tieneWidgets) {
        cy.log(`✅ Se encontraron ${$widgets.length} widget(s)`);
      } else {
        cy.log('⚠️ No se encontraron widgets visibles');
      }
      
      if (tieneGraficas) {
        cy.log(`✅ Se encontraron ${$graficas.length} gráfica(s)`);
      } else {
        cy.log('⚠️ No se encontraron gráficas visibles');
      }
      
      if (tieneFiltros) {
        cy.log(`✅ Se encontraron ${$filtros.length} filtro(s)`);
      } else {
        cy.log('⚠️ No se encontraron filtros visibles');
      }
      
      const todoCorrecto = tieneWidgets && tieneGraficas && tieneFiltros;
      
      if (todoCorrecto) {
        cy.log('✅ Widgets, gráficas y filtros se muestran correctamente');
      } else {
        cy.log('⚠️ Algunos elementos no se están mostrando correctamente');
      }
      
      return cy.wrap(todoCorrecto);
    });
  }

  /**
   * Verificar que no hay pantallas negras ni errores
   */
  verificarSinErrores() {
    cy.log('🔍 Verificando que no haya pantallas negras ni errores...');
    
    return cy.get('body').then(($body) => {
      // Buscar elementos que indiquen error
      const $errores = $body.find('[class*="error"], [class*="Error"], [class*="fail"], [class*="Fail"], [class*="exception"]').filter(':visible');
      
      // Buscar pantallas negras (elementos con fondo negro que ocupan mucho espacio)
      const $pantallasNegras = $body.find('*').filter((i, el) => {
        const $el = Cypress.$(el);
        if (!$el.is(':visible')) return false;
        
        const bgColor = $el.css('background-color');
        const bgImage = $el.css('background-image');
        const width = parseInt($el.width());
        const height = parseInt($el.height());
        
        // Verificar si tiene fondo negro y ocupa un área significativa
        const esNegro = bgColor && (
          bgColor.includes('rgb(0, 0, 0)') || 
          bgColor.includes('rgba(0, 0, 0') ||
          bgColor === '#000000' ||
          bgColor === 'black'
        );
        
        return esNegro && width > 200 && height > 200;
      });
      
      // Verificar también por estilos inline
      const $elementosConEstiloNegro = $body.find('[style*="background: black"], [style*="background-color: black"], [style*="background:#000"], [style*="background-color:#000"]').filter(':visible');
      
      const hayErrores = $errores.length > 0;
      const hayPantallasNegras = $pantallasNegras.length > 0 || $elementosConEstiloNegro.length > 0;
      
      if (hayErrores) {
        cy.log(`⚠️ Se encontraron ${$errores.length} elemento(s) de error visible(s)`);
        $errores.slice(0, 3).each((i, el) => {
          const texto = Cypress.$(el).text().trim();
          if (texto.length > 0) {
            cy.log(`   Error ${i + 1}: ${texto.substring(0, 100)}`);
          }
        });
      }
      
      if (hayPantallasNegras) {
        cy.log(`⚠️ Se encontraron ${$pantallasNegras.length + $elementosConEstiloNegro.length} elemento(s) con pantalla negra`);
      }
      
      const sinErrores = !hayErrores && !hayPantallasNegras;
      
      if (sinErrores) {
        cy.log('✅ No se encontraron pantallas negras ni errores');
      } else {
        cy.log('⚠️ Se encontraron errores o pantallas negras');
      }
      
      return cy.wrap(sinErrores);
    });
  }

  /**
   * Hacer clic en la pestaña de energía reactiva
   */
  hacerClickEnEnergiaReactiva() {
    cy.log('⚡ Haciendo clic en energía reactiva...');
    cy.get(this.reactiveTab, { timeout: 10000 })
      .should('be.visible')
      .should('exist')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en energía reactiva');
  }

  /**
   * Verificar que la información de energía reactiva cargó correctamente
   */
  verificarEnergiaReactivaCargada() {
    cy.log('🔍 Verificando que la información de energía reactiva cargó correctamente...');
    
    // Esperar a que cargue el contenido
    cy.wait(3000);
    
    // Verificar que no hay errores ni pantallas negras
    return this.verificarSinErrores().then((sinErrores) => {
      if (sinErrores) {
        cy.log('✅ La información de energía reactiva cargó correctamente');
      } else {
        cy.log('⚠️ Se detectaron problemas al cargar la información de energía reactiva');
      }
      
      // Verificar también que hay contenido visible
      cy.get('body').then(($body) => {
        const $contenidoPrincipal = $body.find('main, [class*="main"], [class*="content"], [class*="reactive"]').filter(':visible');
        const textoBody = $body.text().trim();
        
        const tieneContenido = $contenidoPrincipal.length > 0 || textoBody.length > 500;
        
        if (tieneContenido) {
          cy.log('✅ Se muestra contenido en la vista de energía reactiva');
        } else {
          cy.log('⚠️ No se muestra suficiente contenido en la vista de energía reactiva');
        }
      });
      
      return cy.wrap(sinErrores);
    });
  }

  /**
   * Flujo completo para el módulo de análisis: consumo general
   */
  navegarAConsumoGeneralYVerificar() {
    cy.log('🚀 Iniciando flujo completo para consumo general...');
    
    // 1. Hacer clic en análisis
    this.hacerClickEnAnalisis();
    
    // Esperar a que cargue el módulo
    cy.wait(2000);
    
    // 2. Hacer clic en consumo general
    this.hacerClickEnConsumoGeneral();
    
    // 3. Verificar widgets, gráficas y filtros
    return this.verificarWidgetsGraficasYFiltros().then((todoCorrecto) => {
      if (todoCorrecto) {
        cy.log('✅ Consumo general cargado correctamente con todos los elementos');
      } else {
        cy.log('⚠️ Algunos elementos no se están mostrando en consumo general');
      }
      
      return cy.wrap(todoCorrecto);
    });
  }

  /**
   * Flujo completo para cambiar a energía reactiva
   */
  cambiarAEnergiaReactivaYVerificar() {
    cy.log('🚀 Cambiando a energía reactiva y verificando...');
    
    // 1. Hacer clic en energía reactiva
    this.hacerClickEnEnergiaReactiva();
    
    // 2. Verificar que cargó correctamente
    return this.verificarEnergiaReactivaCargada();
  }

  /**
   * Hacer clic en la pestaña de en vivo (biamonitors)
   */
  hacerClickEnEnVivo() {
    cy.log('📡 Haciendo clic en en vivo (biamonitors)...');
    cy.get(this.biamonitorsTab, { timeout: 10000 })
      .should('be.visible')
      .should('exist')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en en vivo');
  }

  /**
   * Verificar que se muestra el mensaje de selección de biamonitor
   */
  verificarMensajeSeleccionBiamonitor() {
    cy.log('🔍 Verificando mensaje de selección de biamonitor...');
    
    // Esperar a que cargue el contenido
    cy.wait(2000);
    
    return cy.get('body').then(($body) => {
      const textoEsperado = 'selecciona un biamonitor para visualizar su consumo en vivo';
      const textoBody = $body.text().toLowerCase();
      
      const mensajeEncontrado = textoBody.includes(textoEsperado.toLowerCase());
      
      if (mensajeEncontrado) {
        cy.log('✅ Se muestra el mensaje de selección de biamonitor');
      } else {
        cy.log('⚠️ No se encontró el mensaje esperado');
        cy.log(`   Texto buscado: "${textoEsperado}"`);
        cy.log(`   Texto encontrado en página: "${textoBody.substring(0, 200)}..."`);
      }
      
      return cy.wrap(mensajeEncontrado);
    });
  }

  /**
   * Flujo completo para en vivo
   */
  navegarAEnVivoYVerificar() {
    cy.log('🚀 Navegando a en vivo y verificando...');
    
    // 1. Hacer clic en en vivo
    this.hacerClickEnEnVivo();
    
    // 2. Verificar mensaje
    return this.verificarMensajeSeleccionBiamonitor();
  }

  /**
   * Hacer clic en la pestaña de intensidad energética
   */
  hacerClickEnIntensidadEnergetica() {
    cy.log('⚡ Haciendo clic en intensidad energética...');
    cy.get(this.energyIntensityTab, { timeout: 10000 })
      .should('be.visible')
      .should('exist')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en intensidad energética');
  }

  /**
   * Verificar que se muestran widgets y gráficas en intensidad energética
   */
  verificarIntensidadEnergeticaCargada() {
    cy.log('🔍 Verificando que intensidad energética muestre widgets y gráficas...');
    
    // Esperar a que cargue el contenido
    cy.wait(3000);
    
    return cy.get('body').then(($body) => {
      // Buscar widgets
      const $widgets = $body.find('[class*="widget"], [class*="card"], [class*="metric"], [data-testid*="widget"]').filter(':visible');
      
      // Buscar gráficas
      const $graficas = $body.find('canvas, svg, [class*="chart"], [class*="graph"], [class*="graphic"]').filter(':visible');
      
      const tieneWidgets = $widgets.length > 0;
      const tieneGraficas = $graficas.length > 0;
      
      if (tieneWidgets) {
        cy.log(`✅ Se encontraron ${$widgets.length} widget(s)`);
      } else {
        cy.log('⚠️ No se encontraron widgets visibles');
      }
      
      if (tieneGraficas) {
        cy.log(`✅ Se encontraron ${$graficas.length} gráfica(s)`);
      } else {
        cy.log('⚠️ No se encontraron gráficas visibles');
      }
      
      const todoCorrecto = tieneWidgets && tieneGraficas;
      
      if (todoCorrecto) {
        cy.log('✅ Intensidad energética muestra widgets y gráficas correctamente');
      } else {
        cy.log('⚠️ Algunos elementos no se están mostrando en intensidad energética');
      }
      
      return cy.wrap(todoCorrecto);
    });
  }

  /**
   * Flujo completo para intensidad energética
   */
  navegarAIntensidadEnergeticaYVerificar() {
    cy.log('🚀 Navegando a intensidad energética y verificando...');
    
    // 1. Hacer clic en intensidad energética
    this.hacerClickEnIntensidadEnergetica();
    
    // 2. Verificar widgets y gráficas
    return this.verificarIntensidadEnergeticaCargada();
  }

  /**
   * Hacer clic en la pestaña de calidad energética
   */
  hacerClickEnCalidadEnergetica() {
    cy.log('🔌 Haciendo clic en calidad energética...');
    cy.get(this.powerQualityTab, { timeout: 10000 })
      .should('be.visible')
      .should('exist')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en calidad energética');
  }

  /**
   * Verificar que se muestran varias gráficas y filtros en calidad energética
   */
  verificarCalidadEnergeticaCargada() {
    cy.log('🔍 Verificando que calidad energética muestre gráficas y filtros...');
    
    // Esperar a que cargue el contenido
    cy.wait(3000);
    
    return cy.get('body').then(($body) => {
      // Buscar gráficas (debe haber varias)
      const $graficas = $body.find('canvas, svg, [class*="chart"], [class*="graph"], [class*="graphic"]').filter(':visible');
      
      // Buscar filtros
      const $filtros = $body.find('[class*="filter"], [class*="Filter"], select, [role="combobox"], [class*="select"]').filter(':visible');
      
      const tieneGraficas = $graficas.length > 0;
      const tieneVariasGraficas = $graficas.length >= 2; // Varias gráficas
      const tieneFiltros = $filtros.length > 0;
      
      if (tieneGraficas) {
        cy.log(`✅ Se encontraron ${$graficas.length} gráfica(s)`);
        if (tieneVariasGraficas) {
          cy.log('✅ Se encontraron varias gráficas como se esperaba');
        } else {
          cy.log('⚠️ Se esperaba encontrar varias gráficas');
        }
      } else {
        cy.log('⚠️ No se encontraron gráficas visibles');
      }
      
      if (tieneFiltros) {
        cy.log(`✅ Se encontraron ${$filtros.length} filtro(s)`);
      } else {
        cy.log('⚠️ No se encontraron filtros visibles');
      }
      
      const todoCorrecto = tieneGraficas && tieneFiltros;
      
      if (todoCorrecto) {
        cy.log('✅ Calidad energética muestra gráficas y filtros correctamente');
      } else {
        cy.log('⚠️ Algunos elementos no se están mostrando en calidad energética');
      }
      
      return cy.wrap(todoCorrecto);
    });
  }

  /**
   * Flujo completo para calidad energética
   */
  navegarACalidadEnergeticaYVerificar() {
    cy.log('🚀 Navegando a calidad energética y verificando...');
    
    // 1. Hacer clic en calidad energética
    this.hacerClickEnCalidadEnergetica();
    
    // 2. Verificar gráficas y filtros
    return this.verificarCalidadEnergeticaCargada();
  }

  /**
   * Hacer clic en la pestaña de pronóstico
   */
  hacerClickEnPronostico() {
    cy.log('🔮 Haciendo clic en pronóstico...');
    cy.get(this.forecastTab, { timeout: 10000 })
      .should('be.visible')
      .should('exist')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en pronóstico');
  }

  /**
   * Verificar el estado de la pantalla de pronóstico
   * @returns {Cypress.Chainable<Object>} - Objeto con información sobre el estado
   */
  verificarPronostico() {
    cy.log('🔍 Verificando pantalla de pronóstico...');
    
    // Esperar a que cargue el contenido
    cy.wait(3000);
    
    return cy.get('body').then(($body) => {
      // Buscar gráficas
      const $graficas = $body.find('canvas, svg, [class*="chart"], [class*="graph"], [class*="graphic"]').filter(':visible');
      
      // Buscar widgets o información
      const $widgets = $body.find('[class*="widget"], [class*="card"], [class*="metric"]').filter(':visible');
      
      // Obtener todo el texto de la página
      const textoBody = $body.text().trim();
      
      // Verificar si hay información (gráficas o widgets)
      const tieneInformacion = $graficas.length > 0 || $widgets.length > 0;
      
      // Verificar si hay un mensaje de "no se ha subido información"
      // El usuario mencionó que hay un copy específico pero no lo especificó exactamente
      // Buscaremos patrones comunes de mensajes de "sin datos" o "sin información"
      const patronesSinDatos = [
        'no se ha subido',
        'no se ha subido información',
        'sin información',
        'sin datos',
        'no hay información',
        'no hay datos'
      ];
      
      const tieneMensajeSinDatos = patronesSinDatos.some(patron => 
        textoBody.toLowerCase().includes(patron.toLowerCase())
      );
      
      if (tieneInformacion) {
        cy.log('✅ La pantalla de pronóstico muestra información y gráficas');
        cy.log(`   - Gráficas encontradas: ${$graficas.length}`);
        cy.log(`   - Widgets encontrados: ${$widgets.length}`);
      } else if (tieneMensajeSinDatos) {
        cy.log('ℹ️ La pantalla de pronóstico muestra mensaje de que no se ha subido información');
        // Buscar el texto exacto del mensaje
        patronesSinDatos.forEach(patron => {
          if (textoBody.toLowerCase().includes(patron.toLowerCase())) {
            const indice = textoBody.toLowerCase().indexOf(patron.toLowerCase());
            const mensaje = textoBody.substring(Math.max(0, indice - 20), Math.min(textoBody.length, indice + 100));
            cy.log(`   Mensaje encontrado: "${mensaje.substring(0, 80)}..."`);
          }
        });
      } else {
        cy.log('⚠️ No se pudo determinar el estado de la pantalla de pronóstico');
        cy.log(`   Texto encontrado: "${textoBody.substring(0, 200)}..."`);
      }
      
      return cy.wrap({
        tieneInformacion: tieneInformacion,
        tieneMensajeSinDatos: tieneMensajeSinDatos,
        numeroGraficas: $graficas.length,
        numeroWidgets: $widgets.length
      });
    });
  }

  /**
   * Flujo completo para pronóstico
   * @returns {Cypress.Chainable<Object>} - Información sobre el estado de pronóstico
   */
  navegarAPronosticoYVerificar() {
    cy.log('🚀 Navegando a pronóstico y verificando...');
    
    // 1. Hacer clic en pronóstico
    this.hacerClickEnPronostico();
    
    // 2. Verificar estado
    return this.verificarPronostico();
  }

  /**
   * Hacer clic en el módulo de pagos
   */
  hacerClickEnPagos() {
    cy.log('💳 Haciendo clic en pagos...');
    cy.get(this.paymentsModule, { timeout: 10000 })
      .should('be.visible')
      .should('exist')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en pagos');
    
    // Esperar a que se despliegue el menú
    cy.wait(1500);
  }

  /**
   * Hacer clic en la opción de facturas dentro de pagos
   */
  hacerClickEnFacturas() {
    cy.log('📄 Haciendo clic en facturas...');
    cy.get(this.invoicesOption, { timeout: 10000 })
      .should('be.visible')
      .should('exist')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en facturas');
  }

  /**
   * Verificar que se muestra la pantalla de facturas con estados y opciones de pago
   */
  verificarPantallaFacturas() {
    cy.log('🔍 Verificando pantalla de facturas...');
    
    // Esperar a que cargue el contenido
    cy.wait(3000);
    
    return cy.get('body').then(($body) => {
      // Buscar facturas (pueden estar en tablas, listas, cards, etc.)
      const $facturas = $body.find('[class*="invoice"], [class*="factura"], [class*="bill"], table tr, [class*="card"]').filter(':visible');
      
      // Buscar estados de facturas (comúnmente: pendiente, pagada, vencida, etc.)
      const textoBody = $body.text().toLowerCase();
      const estadosComunes = ['pendiente', 'pagada', 'vencida', 'por vencer', 'pago', 'paid', 'pending', 'overdue'];
      const tieneEstados = estadosComunes.some(estado => textoBody.includes(estado));
      
      // Buscar opciones para ir a pagar (botones, enlaces, etc.)
      const $botonesPagar = $body.find('button, a, [class*="pay"], [class*="pagar"], [class*="button"]').filter((i, el) => {
        const $el = Cypress.$(el);
        const texto = $el.text().toLowerCase();
        return texto.includes('pagar') || texto.includes('pay') || texto.includes('pago');
      });
      
      const tieneFacturas = $facturas.length > 0;
      const tieneOpcionesPago = $botonesPagar.length > 0;
      
      if (tieneFacturas) {
        cy.log(`✅ Se encontraron elementos de facturas (${$facturas.length} elementos)`);
      } else {
        cy.log('⚠️ No se encontraron elementos de facturas visibles');
      }
      
      if (tieneEstados) {
        cy.log('✅ Se encontraron estados de facturas en la pantalla');
      } else {
        cy.log('⚠️ No se encontraron estados de facturas claramente');
      }
      
      if (tieneOpcionesPago) {
        cy.log(`✅ Se encontraron ${$botonesPagar.length} opción(es) para pagar`);
      } else {
        cy.log('⚠️ No se encontraron opciones para pagar');
      }
      
      const todoCorrecto = tieneFacturas && tieneEstados && tieneOpcionesPago;
      
      if (todoCorrecto) {
        cy.log('✅ La pantalla de facturas muestra facturas en varios estados y opciones para pagar');
      } else {
        cy.log('⚠️ Algunos elementos esperados no se están mostrando en la pantalla de facturas');
      }
      
      return cy.wrap(todoCorrecto);
    });
  }

  /**
   * Flujo completo para pagos y facturas
   */
  navegarAFacturasYVerificar() {
    cy.log('🚀 Navegando a facturas y verificando...');
    
    // 1. Hacer clic en pagos
    this.hacerClickEnPagos();
    
    // 2. Hacer clic en facturas
    this.hacerClickEnFacturas();
    
    // 3. Verificar pantalla
    return this.verificarPantallaFacturas();
  }

  /**
   * Hacer clic en la pestaña de sostenibilidad (CO2)
   */
  hacerClickEnSostenibilidad() {
    cy.log('🌱 Haciendo clic en sostenibilidad (CO2)...');
    cy.get(this.co2Tab, { timeout: 10000 })
      .should('be.visible')
      .should('exist')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en sostenibilidad');
  }

  /**
   * Verificar que se muestran gráficas en sostenibilidad
   */
  verificarSostenibilidadCargada() {
    cy.log('🔍 Verificando que sostenibilidad muestre gráficas...');
    
    // Esperar a que cargue el contenido
    cy.wait(3000);
    
    return cy.get('body').then(($body) => {
      // Buscar gráficas
      const $graficas = $body.find('canvas, svg, [class*="chart"], [class*="graph"], [class*="graphic"]').filter(':visible');
      
      const tieneGraficas = $graficas.length > 0;
      
      if (tieneGraficas) {
        cy.log(`✅ Se encontraron ${$graficas.length} gráfica(s) en sostenibilidad`);
      } else {
        cy.log('⚠️ No se encontraron gráficas visibles en sostenibilidad');
      }
      
      // Verificar también que no hay errores
      return this.verificarSinErrores().then((sinErrores) => {
        if (sinErrores && tieneGraficas) {
          cy.log('✅ Sostenibilidad muestra gráficas correctamente');
        } else {
          cy.log('⚠️ Algunos elementos no se están mostrando correctamente en sostenibilidad');
        }
        
        return cy.wrap(tieneGraficas && sinErrores);
      });
    });
  }

  /**
   * Flujo completo para sostenibilidad
   */
  navegarASostenibilidadYVerificar() {
    cy.log('🚀 Navegando a sostenibilidad y verificando...');
    
    // 1. Hacer clic en sostenibilidad
    this.hacerClickEnSostenibilidad();
    
    // 2. Verificar gráficas
    return this.verificarSostenibilidadCargada();
  }

  /**
   * Hacer clic en la pestaña de RECs
   */
  hacerClickEnRecs() {
    cy.log('📜 Haciendo clic en RECs...');
    cy.get(this.recsTab, { timeout: 10000 })
      .should('be.visible')
      .should('exist')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en RECs');
  }

  /**
   * Verificar el estado de la pantalla de RECs
   * @returns {Cypress.Chainable<Object>} - Información sobre el estado de RECs
   */
  verificarRecs() {
    cy.log('🔍 Verificando pantalla de RECs...');
    
    // Esperar a que cargue el contenido
    cy.wait(3000);
    
    return cy.get('body').then(($body) => {
      const textoBody = $body.text();
      const textoBodyLower = textoBody.toLowerCase();
      
      // Texto esperado cuando no hay RECs
      const copyEsperado = [
        'certificados de energía renovable',
        'suscríbete para recibir tu certificado de energía renovable todos los meses'
      ];
      
      // Verificar si muestra el copy de "no tiene RECs"
      const tieneCopySinRecs = copyEsperado.every(texto => 
        textoBodyLower.includes(texto.toLowerCase())
      );
      
      // Buscar tabla con valores (si tiene RECs)
      const $tablas = $body.find('table, [class*="table"], [class*="Table"]').filter(':visible');
      const $filasTabla = $tablas.find('tr, [class*="row"], [class*="Row"]').filter(':visible');
      
      // Verificar si la tabla tiene contenido (más de solo encabezados)
      let tieneTablaConValores = false;
      if ($tablas.length > 0 && $filasTabla.length > 1) {
        // Verificar que las filas tienen datos (números, fechas, etc.)
        const filasConDatos = $filasTabla.filter((i, el) => {
          const texto = Cypress.$(el).text().trim();
          // Buscar números, fechas u otros datos
          return texto.length > 10 && (
            /\d/.test(texto) || // Contiene números
            /\d{2}\/\d{2}\/\d{4}/.test(texto) || // Contiene fechas
            texto.split(/\s+/).length > 3 // Tiene varias palabras
          );
        });
        tieneTablaConValores = filasConDatos.length > 0;
      }
      
      if (tieneCopySinRecs) {
        cy.log('ℹ️ La pantalla de RECs muestra el mensaje de suscripción (no tiene RECs)');
        cy.log('   Copy encontrado: "Certificados de Energía Renovable"');
        cy.log('   "Suscríbete para recibir tu certificado de energía renovable todos los meses."');
      } else if (tieneTablaConValores) {
        cy.log(`✅ La pantalla de RECs muestra una tabla con valores (${$filasTabla.length} filas)`);
      } else {
        cy.log('⚠️ No se pudo determinar el estado de la pantalla de RECs');
        cy.log(`   Texto encontrado: "${textoBody.substring(0, 200)}..."`);
      }
      
      return cy.wrap({
        tieneRecs: tieneTablaConValores,
        noTieneRecs: tieneCopySinRecs,
        numeroTablas: $tablas.length,
        numeroFilas: $filasTabla.length
      });
    });
  }

  /**
   * Flujo completo para RECs
   * @returns {Cypress.Chainable<Object>} - Información sobre el estado de RECs
   */
  navegarARecsYVerificar() {
    cy.log('🚀 Navegando a RECs y verificando...');
    
    // 1. Hacer clic en RECs
    this.hacerClickEnRecs();
    
    // 2. Verificar estado
    return this.verificarRecs();
  }

  /**
   * Hacer clic en el módulo de soluciones energéticas
   */
  hacerClickEnSolucionesEnergeticas() {
    cy.log('💡 Haciendo clic en soluciones energéticas...');
    cy.get(this.energySolutionsModule, { timeout: 10000 })
      .should('be.visible')
      .should('exist')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en soluciones energéticas');
  }

  /**
   * Verificar que se muestra la pantalla de soluciones energéticas con copy y cuadritos
   */
  verificarSolucionesEnergeticas() {
    cy.log('🔍 Verificando pantalla de soluciones energéticas...');
    
    // Esperar a que cargue el contenido
    cy.wait(3000);
    
    return cy.get('body').then(($body) => {
      const textoBody = $body.text();
      const textoBodyLower = textoBody.toLowerCase();
      
      // Verificar que se muestre el copy "Soluciones energéticas"
      const copyEsperado = 'soluciones energéticas';
      const tieneCopy = textoBodyLower.includes(copyEsperado);
      
      // Buscar cuadritos con información (cards, boxes, tiles, etc.)
      const $cuadritos = $body.find('[class*="card"], [class*="box"], [class*="tile"], [class*="solution"], [class*="item"], [class*="grid"] > div').filter(':visible');
      
      // Filtrar solo los que tienen contenido significativo (texto, imágenes, etc.)
      const $cuadritosConInfo = $cuadritos.filter((i, el) => {
        const $el = Cypress.$(el);
        const texto = $el.text().trim();
        const tieneImagen = $el.find('img, svg').length > 0;
        // Debe tener texto significativo o una imagen
        return (texto.length > 10 || tieneImagen) && 
               $el.width() > 50 && 
               $el.height() > 50;
      });
      
      if (tieneCopy) {
        cy.log('✅ Se muestra el copy "Soluciones energéticas"');
      } else {
        cy.log('⚠️ No se encontró el copy esperado');
      }
      
      if ($cuadritosConInfo.length > 0) {
        cy.log(`✅ Se encontraron ${$cuadritosConInfo.length} cuadrito(s) con información`);
      } else {
        cy.log('⚠️ No se encontraron cuadritos con información visibles');
      }
      
      const todoCorrecto = tieneCopy && $cuadritosConInfo.length > 0;
      
      if (todoCorrecto) {
        cy.log('✅ La pantalla de soluciones energéticas muestra el copy y cuadritos con información');
      } else {
        cy.log('⚠️ Algunos elementos esperados no se están mostrando en soluciones energéticas');
      }
      
      return cy.wrap(todoCorrecto);
    });
  }

  /**
   * Flujo completo para soluciones energéticas
   */
  navegarASolucionesEnergeticasYVerificar() {
    cy.log('🚀 Navegando a soluciones energéticas y verificando...');
    
    // 1. Hacer clic en soluciones energéticas
    this.hacerClickEnSolucionesEnergeticas();
    
    // 2. Verificar pantalla
    return this.verificarSolucionesEnergeticas();
  }

  /**
   * Hacer clic en el módulo de visitas
   */
  hacerClickEnVisitas() {
    cy.log('🏢 Haciendo clic en visitas...');
    cy.get(this.visitsHeadquartersModule, { timeout: 10000 })
      .should('be.visible')
      .should('exist')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en visitas');
  }

  /**
   * Verificar que se muestra la pantalla de visitas con tabla y copy
   */
  verificarPantallaVisitas() {
    cy.log('🔍 Verificando pantalla de visitas...');
    
    // Esperar a que cargue el contenido
    cy.wait(3000);
    
    return cy.get('body').then(($body) => {
      const textoBody = $body.text();
      const textoBodyLower = textoBody.toLowerCase();
      
      // Verificar el título principal
      const tituloEsperado = 'historial de visitas';
      const tieneTitulo = textoBodyLower.includes(tituloEsperado);
      
      // Verificar el copy descriptivo
      const copyEsperado = [
        'consulta y gestiona todas las visitas programadas e históricas de tus sedes'
      ];
      const tieneCopy = copyEsperado.some(texto => 
        textoBodyLower.includes(texto.toLowerCase())
      );
      
      // Buscar tabla con información
      const $tablas = $body.find('table, [class*="table"], [class*="Table"]').filter(':visible');
      const $filasTabla = $tablas.find('tr, [class*="row"], [class*="Row"]').filter(':visible');
      
      // Verificar si la tabla tiene contenido (más de solo encabezados)
      let tieneTablaConInfo = false;
      if ($tablas.length > 0 && $filasTabla.length > 1) {
        // Verificar que las filas tienen datos
        const filasConDatos = $filasTabla.filter((i, el) => {
          const texto = Cypress.$(el).text().trim();
          return texto.length > 5 && texto.split(/\s+/).length > 2;
        });
        tieneTablaConInfo = filasConDatos.length > 0;
      }
      
      if (tieneTitulo) {
        cy.log('✅ Se muestra el título principal "Historial de Visitas"');
      } else {
        cy.log('⚠️ No se encontró el título principal esperado');
      }
      
      if (tieneCopy) {
        cy.log('✅ Se muestra el copy descriptivo');
      } else {
        cy.log('⚠️ No se encontró el copy descriptivo esperado');
      }
      
      if (tieneTablaConInfo) {
        cy.log(`✅ Se encontró una tabla con información (${$filasTabla.length} filas)`);
      } else {
        cy.log('⚠️ No se encontró una tabla con información visible');
      }
      
      const todoCorrecto = tieneTitulo && tieneCopy && tieneTablaConInfo;
      
      if (todoCorrecto) {
        cy.log('✅ La pantalla de visitas muestra el título, copy y tabla con información');
      } else {
        cy.log('⚠️ Algunos elementos esperados no se están mostrando en la pantalla de visitas');
      }
      
      return cy.wrap(todoCorrecto);
    });
  }

  /**
   * Flujo completo para visitas
   */
  navegarAVisitasYVerificar() {
    cy.log('🚀 Navegando a visitas y verificando...');
    
    // 1. Hacer clic en visitas
    this.hacerClickEnVisitas();
    
    // 2. Verificar pantalla
    return this.verificarPantallaVisitas();
  }

  /**
   * Esperar a que el menú de ajustes esté expandido
   */
  esperarMenuAjustesExpandido() {
    cy.log('⏳ Esperando a que el menú de ajustes se expanda...');
    
    // Buscar el contenedor de hijos relacionado con ajustes
    // El contenedor debe perder la clase "collapsed" y tener opacity > 0
    cy.get(this.settingsModule, { timeout: 10000 })
      .should('be.visible')
      .then(($settingsModule) => {
        // Buscar el elemento padre que contiene el contenedor de hijos
        const $menuItem = $settingsModule.closest('[class*="menu-item"], [class*="nav-item"], li, [role="menuitem"]');
        
        if ($menuItem.length > 0) {
          // Buscar el contenedor de hijos dentro del elemento del menú
          const $childrenContainer = $menuItem.find('[class*="childrenContainer"]').first();
          
          if ($childrenContainer.length > 0) {
            // Esperar a que el contenedor se expanda:
            // 1. Que no tenga la clase "collapsed"
            // 2. Que tenga opacity > 0
            cy.wrap($childrenContainer, { timeout: 10000 })
              .should(($el) => {
                const className = $el.attr('class') || '';
                const hasCollapsedClass = className.includes('collapsed');
                const opacity = parseFloat($el.css('opacity')) || 0;
                
                if (hasCollapsedClass) {
                  throw new Error(`El contenedor aún tiene la clase 'collapsed'`);
                }
                if (opacity <= 0) {
                  throw new Error(`El contenedor tiene opacidad ${opacity}, se esperaba > 0`);
                }
                
                expect(opacity).to.be.greaterThan(0);
              });
          } else {
            // Si no encontramos el contenedor en el menuItem, buscar el contenedor que contiene las opciones de ajustes
            cy.log('⚠️ No se encontró childrenContainer en el menuItem, buscando contenedor que contiene opciones de ajustes...');
            // Buscar el contenedor que contiene la opción de usuarios (que es parte del menú de ajustes)
            cy.get('[class*="childrenContainer"]', { timeout: 10000 })
              .filter((i, el) => {
                const $el = Cypress.$(el);
                // Verificar si este contenedor contiene la opción de usuarios
                return $el.find(this.usersOption).length > 0;
              })
              .first()
              .should(($el) => {
                const className = $el.attr('class') || '';
                const hasCollapsedClass = className.includes('collapsed');
                const opacity = parseFloat($el.css('opacity')) || 0;
                
                if (hasCollapsedClass) {
                  throw new Error(`El contenedor aún tiene la clase 'collapsed'`);
                }
                if (opacity <= 0) {
                  throw new Error(`El contenedor tiene opacidad ${opacity}, se esperaba > 0`);
                }
                
                expect(opacity).to.be.greaterThan(0);
              });
          }
        } else {
          // Estrategia alternativa: buscar directamente el contenedor que contiene las opciones de ajustes
          cy.log('⚠️ No se encontró el elemento del menú, buscando contenedor que contiene opciones de ajustes...');
          cy.get('[class*="childrenContainer"]', { timeout: 10000 })
            .filter((i, el) => {
              const $el = Cypress.$(el);
              // Verificar si este contenedor contiene la opción de usuarios
              return $el.find(this.usersOption).length > 0;
            })
            .first()
            .should(($el) => {
              const className = $el.attr('class') || '';
              const hasCollapsedClass = className.includes('collapsed');
              const opacity = parseFloat($el.css('opacity')) || 0;
              
              if (hasCollapsedClass) {
                throw new Error(`El contenedor aún tiene la clase 'collapsed'`);
              }
              if (opacity <= 0) {
                throw new Error(`El contenedor tiene opacidad ${opacity}, se esperaba > 0`);
              }
              
              expect(opacity).to.be.greaterThan(0);
            });
        }
      });
    
    // Después de que el contenedor se expanda, verificar que las opciones sean visibles
    cy.get(this.usersOption, { timeout: 10000 })
      .should('be.visible');
    
    // Esperar un momento adicional para que la animación termine
    cy.wait(1000);
    cy.log('✅ Menú de ajustes expandido');
  }

  /**
   * Verificar si el menú de ajustes ya está expandido
   * @returns {Cypress.Chainable<boolean>} - True si está expandido, false si no
   */
  verificarSiMenuAjustesEstaExpandido() {
    return cy.get('body').then(($body) => {
      // Buscar el contenedor que contiene las opciones de ajustes
      const $childrenContainer = $body.find('[class*="childrenContainer"]').filter((i, el) => {
        const $el = Cypress.$(el);
        // Verificar si este contenedor contiene opciones de ajustes (usuarios, sedes, etc.)
        return $el.find(this.usersOption).length > 0 || $el.find(this.sitesOption).length > 0;
      }).first();
      
      if ($childrenContainer.length > 0) {
        const className = $childrenContainer.attr('class') || '';
        const hasCollapsedClass = className.includes('collapsed');
        const opacity = parseFloat($childrenContainer.css('opacity')) || 0;
        
        // El menú está expandido si no tiene la clase collapsed y tiene opacity > 0
        const estaExpandido = !hasCollapsedClass && opacity > 0;
        return cy.wrap(estaExpandido);
      }
      
      // Si no encontramos el contenedor, asumimos que no está expandido
      return cy.wrap(false);
    });
  }

  /**
   * Hacer clic en el módulo de ajustes (solo si no está expandido)
   */
  hacerClickEnAjustes() {
    cy.log('⚙️ Verificando estado del menú de ajustes...');
    
    // Verificar si el menú ya está expandido
    this.verificarSiMenuAjustesEstaExpandido().then((estaExpandido) => {
      if (!estaExpandido) {
        cy.log('⚙️ El menú no está expandido, haciendo clic en ajustes...');
        cy.get(this.settingsModule, { timeout: 10000 })
          .should('be.visible')
          .should('exist')
          .clickVisible({ pause: 1000, highlight: true });
        cy.log('✅ Clic realizado en ajustes');
        
        // Esperar a que se despliegue el menú completamente
        this.esperarMenuAjustesExpandido();
      } else {
        cy.log('✅ El menú de ajustes ya está expandido, no es necesario hacer clic');
        // Asegurarse de que el menú esté completamente expandido
        this.esperarMenuAjustesExpandido();
      }
    });
  }

  /**
   * Hacer clic en la opción de usuarios dentro de ajustes
   */
  hacerClickEnUsuarios() {
    cy.log('👥 Haciendo clic en usuarios...');
    
    // Asegurarse de que el menú esté expandido antes de intentar hacer clic
    this.esperarMenuAjustesExpandido();
    
    // Esperar a que el elemento sea visible (no solo exista en el DOM)
    cy.get(this.usersOption, { timeout: 15000 })
      .should('exist')
      .then(($el) => {
        const opacity = parseFloat($el.css('opacity')) || 1;
        const parent = $el.parent();
        const parentOpacity = parseFloat(parent.css('opacity')) || 1;
        
        if (opacity === 0 || parentOpacity === 0) {
          cy.log('⏳ El elemento aún no es visible, esperando a que el menú se expanda completamente...');
          cy.wait(2000);
          // Verificar nuevamente que el menú esté expandido
          this.esperarMenuAjustesExpandido();
        }
      })
      .should('be.visible')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en usuarios');
  }

  /**
   * Verificar que se muestra la tabla de usuarios
   */
  verificarTablaUsuarios() {
    cy.log('🔍 Verificando tabla de usuarios...');
    
    // Esperar a que cargue el contenido
    cy.wait(3000);
    
    return cy.get('body').then(($body) => {
      // Buscar tabla con usuarios
      const $tablas = $body.find('table, [class*="table"], [class*="Table"]').filter(':visible');
      const $filasTabla = $tablas.find('tr, [class*="row"], [class*="Row"]').filter(':visible');
      
      // Verificar si la tabla tiene muchas filas (muchos usuarios)
      let tieneMuchosUsuarios = false;
      if ($tablas.length > 0 && $filasTabla.length > 1) {
        // Filtrar filas con datos (excluyendo encabezados)
        const filasConDatos = $filasTabla.filter((i, el) => {
          const $el = Cypress.$(el);
          const texto = $el.text().trim();
          // Buscar patrones comunes de usuarios (emails, nombres, etc.)
          return texto.length > 5 && (
            texto.includes('@') || // Email
            texto.split(/\s+/).length >= 2 || // Nombre completo
            /\d/.test(texto) // Contiene números (ID, etc.)
          );
        });
        tieneMuchosUsuarios = filasConDatos.length >= 2; // Al menos 2 usuarios
      }
      
      if (tieneMuchosUsuarios) {
        cy.log(`✅ Se encontró una tabla con muchos usuarios (${$filasTabla.length} filas)`);
      } else {
        cy.log('⚠️ No se encontró una tabla con muchos usuarios');
      }
      
      return cy.wrap(tieneMuchosUsuarios);
    });
  }

  /**
   * Flujo completo para usuarios
   */
  navegarAUsuariosYVerificar() {
    cy.log('🚀 Navegando a usuarios y verificando...');
    
    // 1. Hacer clic en ajustes
    this.hacerClickEnAjustes();
    
    // 2. Hacer clic en usuarios
    this.hacerClickEnUsuarios();
    
    // 3. Verificar tabla
    return this.verificarTablaUsuarios();
  }

  /**
   * Hacer clic en la opción de sedes dentro de ajustes
   */
  hacerClickEnSedes() {
    cy.log('🏢 Haciendo clic en sedes...');
    
    // Asegurarse de que el menú esté expandido antes de intentar hacer clic
    this.esperarMenuAjustesExpandido();
    
    // Esperar a que el elemento sea visible (no solo exista en el DOM)
    cy.get(this.sitesOption, { timeout: 15000 })
      .should('exist')
      .then(($el) => {
        // Verificar que el elemento y sus padres sean visibles
        const opacity = parseFloat($el.css('opacity')) || 1;
        const parent = $el.parent();
        const parentOpacity = parseFloat(parent.css('opacity')) || 1;
        
        // Si el elemento o su padre tienen opacity 0, esperar más tiempo
        if (opacity === 0 || parentOpacity === 0) {
          cy.log('⏳ El elemento aún no es visible, esperando a que el menú se expanda completamente...');
          cy.wait(2000);
          // Verificar nuevamente que el menú esté expandido
          this.esperarMenuAjustesExpandido();
        }
      })
      .should('be.visible')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en sedes');
  }

  /**
   * Verificar que se muestra la tabla de sedes con el título correcto
   */
  verificarPantallaSedes() {
    cy.log('🔍 Verificando pantalla de sedes...');
    
    // Esperar a que cargue el contenido
    cy.wait(3000);
    
    return cy.get('body').then(($body) => {
      const textoBody = $body.text();
      const textoBodyLower = textoBody.toLowerCase();
      
      // Verificar el título
      const tituloEsperado = 'gestión de sedes';
      const tieneTitulo = textoBodyLower.includes(tituloEsperado);
      
      // Buscar tabla
      const $tablas = $body.find('table, [class*="table"], [class*="Table"]').filter(':visible');
      const $filasTabla = $tablas.find('tr, [class*="row"], [class*="Row"]').filter(':visible');
      
      const tieneTabla = $tablas.length > 0 && $filasTabla.length > 0;
      
      if (tieneTitulo) {
        cy.log('✅ Se muestra el título "Gestión de Sedes"');
      } else {
        cy.log('⚠️ No se encontró el título esperado');
      }
      
      if (tieneTabla) {
        cy.log(`✅ Se encontró una tabla (${$filasTabla.length} filas)`);
      } else {
        cy.log('⚠️ No se encontró una tabla visible');
      }
      
      const todoCorrecto = tieneTitulo && tieneTabla;
      
      if (todoCorrecto) {
        cy.log('✅ La pantalla de sedes muestra el título y la tabla');
      } else {
        cy.log('⚠️ Algunos elementos esperados no se están mostrando en la pantalla de sedes');
      }
      
      return cy.wrap(todoCorrecto);
    });
  }

  /**
   * Flujo completo para sedes
   */
  navegarASedesYVerificar() {
    cy.log('🚀 Navegando a sedes y verificando...');
    
    // 1. Hacer clic en ajustes
    this.hacerClickEnAjustes();
    
    // 2. Hacer clic en sedes
    this.hacerClickEnSedes();
    
    // 3. Verificar pantalla
    return this.verificarPantallaSedes();
  }

  /**
   * Hacer clic en la opción de contribución solidaridad dentro de ajustes
   */
  hacerClickEnContribucion() {
    cy.log('🤝 Haciendo clic en contribución solidaridad...');
    
    // Asegurarse de que el menú esté expandido antes de intentar hacer clic
    this.esperarMenuAjustesExpandido();
    
    cy.get(this.contributionOption, { timeout: 15000 })
      .should('exist')
      .then(($el) => {
        const opacity = parseFloat($el.css('opacity')) || 1;
        const parent = $el.parent();
        const parentOpacity = parseFloat(parent.css('opacity')) || 1;
        
        if (opacity === 0 || parentOpacity === 0) {
          cy.log('⏳ El elemento aún no es visible, esperando a que el menú se expanda completamente...');
          cy.wait(2000);
          // Verificar nuevamente que el menú esté expandido
          this.esperarMenuAjustesExpandido();
        }
      })
      .should('be.visible')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en contribución solidaridad');
  }

  /**
   * Verificar que se muestra la tabla con el título "Tus solicitudes"
   */
  verificarPantallaContribucion() {
    cy.log('🔍 Verificando pantalla de contribución solidaridad...');
    
    // Esperar a que cargue el contenido
    cy.wait(3000);
    
    return cy.get('body').then(($body) => {
      const textoBody = $body.text();
      const textoBodyLower = textoBody.toLowerCase();
      
      // Verificar el título
      const tituloEsperado = 'tus solicitudes';
      const tieneTitulo = textoBodyLower.includes(tituloEsperado);
      
      // Buscar tabla
      const $tablas = $body.find('table, [class*="table"], [class*="Table"]').filter(':visible');
      const $filasTabla = $tablas.find('tr, [class*="row"], [class*="Row"]').filter(':visible');
      
      const tieneTabla = $tablas.length > 0 && $filasTabla.length > 0;
      
      if (tieneTitulo) {
        cy.log('✅ Se muestra el título "Tus solicitudes"');
      } else {
        cy.log('⚠️ No se encontró el título esperado');
      }
      
      if (tieneTabla) {
        cy.log(`✅ Se encontró una tabla (${$filasTabla.length} filas)`);
      } else {
        cy.log('⚠️ No se encontró una tabla visible');
      }
      
      const todoCorrecto = tieneTitulo && tieneTabla;
      
      if (todoCorrecto) {
        cy.log('✅ La pantalla de contribución muestra el título y la tabla');
      } else {
        cy.log('⚠️ Algunos elementos esperados no se están mostrando en la pantalla de contribución');
      }
      
      return cy.wrap(todoCorrecto);
    });
  }

  /**
   * Flujo completo para contribución solidaridad
   */
  navegarAContribucionYVerificar() {
    cy.log('🚀 Navegando a contribución solidaridad y verificando...');
    
    // 1. Hacer clic en ajustes
    this.hacerClickEnAjustes();
    
    // 2. Hacer clic en contribución
    this.hacerClickEnContribucion();
    
    // 3. Verificar pantalla
    return this.verificarPantallaContribucion();
  }

  /**
   * Hacer clic en la opción de cuenta dentro de ajustes
   */
  hacerClickEnCuenta() {
    cy.log('👤 Haciendo clic en cuenta...');
    
    // Asegurarse de que el menú esté expandido antes de intentar hacer clic
    this.esperarMenuAjustesExpandido();
    
    cy.get(this.accountOption, { timeout: 15000 })
      .should('exist')
      .then(($el) => {
        const opacity = parseFloat($el.css('opacity')) || 1;
        const parent = $el.parent();
        const parentOpacity = parseFloat(parent.css('opacity')) || 1;
        
        if (opacity === 0 || parentOpacity === 0) {
          cy.log('⏳ El elemento aún no es visible, esperando a que el menú se expanda completamente...');
          cy.wait(2000);
          // Verificar nuevamente que el menú esté expandido
          this.esperarMenuAjustesExpandido();
        }
      })
      .should('be.visible')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en cuenta');
  }

  /**
   * Verificar que se muestra la pantalla de cuenta con información y título
   */
  verificarPantallaCuenta() {
    cy.log('🔍 Verificando pantalla de cuenta...');
    
    // Esperar a que cargue el contenido
    cy.wait(3000);
    
    return cy.get('body').then(($body) => {
      const textoBody = $body.text();
      const textoBodyLower = textoBody.toLowerCase();
      
      // Verificar el título principal
      const tituloEsperado = 'configuración de la cuenta';
      const tieneTitulo = textoBodyLower.includes(tituloEsperado);
      
      // Verificar que hay información de la cuenta (campos, formularios, etc.)
      const $formularios = $body.find('form, [class*="form"], input, [class*="field"]').filter(':visible');
      const $camposInfo = $body.find('[class*="info"], [class*="data"], [class*="profile"]').filter(':visible');
      
      const tieneInformacion = $formularios.length > 0 || $camposInfo.length > 0 || textoBody.length > 500;
      
      if (tieneTitulo) {
        cy.log('✅ Se muestra el título "Configuración de la cuenta"');
      } else {
        cy.log('⚠️ No se encontró el título esperado');
      }
      
      if (tieneInformacion) {
        cy.log('✅ Se muestra información de la cuenta');
      } else {
        cy.log('⚠️ No se encontró información de la cuenta visible');
      }
      
      const todoCorrecto = tieneTitulo && tieneInformacion;
      
      if (todoCorrecto) {
        cy.log('✅ La pantalla de cuenta muestra el título y la información');
      } else {
        cy.log('⚠️ Algunos elementos esperados no se están mostrando en la pantalla de cuenta');
      }
      
      return cy.wrap(todoCorrecto);
    });
  }

  /**
   * Flujo completo para cuenta
   */
  navegarACuentaYVerificar() {
    cy.log('🚀 Navegando a cuenta y verificando...');
    
    // 1. Hacer clic en ajustes
    this.hacerClickEnAjustes();
    
    // 2. Hacer clic en cuenta
    this.hacerClickEnCuenta();
    
    // 3. Verificar pantalla
    return this.verificarPantallaCuenta();
  }

  /**
   * Hacer clic en la opción de API dentro de ajustes
   */
  hacerClickEnApi() {
    cy.log('🔌 Haciendo clic en API...');
    
    // Asegurarse de que el menú esté expandido antes de intentar hacer clic
    this.esperarMenuAjustesExpandido();
    
    cy.get(this.apiOption, { timeout: 15000 })
      .should('exist')
      .then(($el) => {
        const opacity = parseFloat($el.css('opacity')) || 1;
        const parent = $el.parent();
        const parentOpacity = parseFloat(parent.css('opacity')) || 1;
        
        if (opacity === 0 || parentOpacity === 0) {
          cy.log('⏳ El elemento aún no es visible, esperando a que el menú se expanda completamente...');
          cy.wait(2000);
          // Verificar nuevamente que el menú esté expandido
          this.esperarMenuAjustesExpandido();
        }
      })
      .should('be.visible')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en API');
  }

  /**
   * Verificar que se muestra la pantalla de API con el copy correcto
   */
  verificarPantallaApi() {
    cy.log('🔍 Verificando pantalla de API...');
    
    // Esperar a que cargue el contenido
    cy.wait(3000);
    
    return cy.get('body').then(($body) => {
      const textoBody = $body.text();
      const textoBodyLower = textoBody.toLowerCase();
      
      // Verificar el título "API"
      const tituloApi = textoBodyLower.includes('api');
      
      // Verificar el copy completo
      const copyEsperado = [
        'conéctate a tus datos energéticos',
        'facturación para integrarlos a tus sistemas',
        'documentación'
      ];
      const tieneCopy = copyEsperado.every(texto => 
        textoBodyLower.includes(texto.toLowerCase())
      );
      
      if (tituloApi) {
        cy.log('✅ Se muestra el título "API"');
      } else {
        cy.log('⚠️ No se encontró el título API');
      }
      
      if (tieneCopy) {
        cy.log('✅ Se muestra el copy completo sobre API');
      } else {
        cy.log('⚠️ No se encontró el copy completo esperado');
        cy.log(`   Texto encontrado: "${textoBody.substring(0, 300)}..."`);
      }
      
      const todoCorrecto = tituloApi && tieneCopy;
      
      if (todoCorrecto) {
        cy.log('✅ La pantalla de API muestra el título y el copy correctamente');
      } else {
        cy.log('⚠️ Algunos elementos esperados no se están mostrando en la pantalla de API');
      }
      
      return cy.wrap(todoCorrecto);
    });
  }

  /**
   * Flujo completo para API
   */
  navegarAApiYVerificar() {
    cy.log('🚀 Navegando a API y verificando...');
    
    // 1. Hacer clic en ajustes
    this.hacerClickEnAjustes();
    
    // 2. Hacer clic en API
    this.hacerClickEnApi();
    
    // 3. Verificar pantalla
    return this.verificarPantallaApi();
  }

  /**
   * Hacer clic en la opción de métodos de pago dentro de ajustes
   */
  hacerClickEnMetodosPago() {
    cy.log('💳 Haciendo clic en métodos de pago...');
    
    // Asegurarse de que el menú esté expandido antes de intentar hacer clic
    this.esperarMenuAjustesExpandido();
    
    cy.get(this.paymentMethodsOption, { timeout: 15000 })
      .should('exist')
      .then(($el) => {
        const opacity = parseFloat($el.css('opacity')) || 1;
        const parent = $el.parent();
        const parentOpacity = parseFloat(parent.css('opacity')) || 1;
        
        if (opacity === 0 || parentOpacity === 0) {
          cy.log('⏳ El elemento aún no es visible, esperando a que el menú se expanda completamente...');
          cy.wait(2000);
          // Verificar nuevamente que el menú esté expandido
          this.esperarMenuAjustesExpandido();
        }
      })
      .should('be.visible')
      .clickVisible({ pause: 1000, highlight: true });
    cy.log('✅ Clic realizado en métodos de pago');
  }

  /**
   * Verificar que se muestra la pantalla de métodos de pago con los copys correctos
   */
  verificarPantallaMetodosPago() {
    cy.log('🔍 Verificando pantalla de métodos de pago...');
    
    // Esperar a que cargue el contenido
    cy.wait(3000);
    
    return cy.get('body').then(($body) => {
      const textoBody = $body.text();
      const textoBodyLower = textoBody.toLowerCase();
      
      // Verificar título "Tarjetas"
      const tituloTarjetas = textoBodyLower.includes('tarjetas');
      
      // Verificar copy de tarjetas
      const copyTarjetas = [
        'agrega y administra tus tarjetas de crédito y débito'
      ];
      const tieneCopyTarjetas = copyTarjetas.every(texto => 
        textoBodyLower.includes(texto.toLowerCase())
      );
      
      // Verificar título "PSE"
      const tituloPse = textoBodyLower.includes('pse');
      
      // Verificar copy de PSE
      const copyPse = [
        'agrega y administra tus cuentas bancarias pse'
      ];
      const tieneCopyPse = copyPse.every(texto => 
        textoBodyLower.includes(texto.toLowerCase())
      );
      
      if (tituloTarjetas) {
        cy.log('✅ Se muestra el título "Tarjetas"');
      } else {
        cy.log('⚠️ No se encontró el título Tarjetas');
      }
      
      if (tieneCopyTarjetas) {
        cy.log('✅ Se muestra el copy de tarjetas');
      } else {
        cy.log('⚠️ No se encontró el copy de tarjetas');
      }
      
      if (tituloPse) {
        cy.log('✅ Se muestra el título "PSE"');
      } else {
        cy.log('⚠️ No se encontró el título PSE');
      }
      
      if (tieneCopyPse) {
        cy.log('✅ Se muestra el copy de PSE');
      } else {
        cy.log('⚠️ No se encontró el copy de PSE');
      }
      
      const todoCorrecto = tituloTarjetas && tieneCopyTarjetas && tituloPse && tieneCopyPse;
      
      if (todoCorrecto) {
        cy.log('✅ La pantalla de métodos de pago muestra todos los copys correctamente');
      } else {
        cy.log('⚠️ Algunos elementos esperados no se están mostrando en la pantalla de métodos de pago');
      }
      
      return cy.wrap(todoCorrecto);
    });
  }

  /**
   * Flujo completo para métodos de pago (último paso de la automatización)
   */
  navegarAMetodosPagoYVerificar() {
    cy.log('🚀 Navegando a métodos de pago y verificando (paso final)...');
    
    // 1. Hacer clic en ajustes
    this.hacerClickEnAjustes();
    
    // 2. Hacer clic en métodos de pago
    this.hacerClickEnMetodosPago();
    
    // 3. Verificar pantalla
    return this.verificarPantallaMetodosPago().then((todoCorrecto) => {
      if (todoCorrecto) {
        cy.log('✅ Automatización completada exitosamente');
      } else {
        cy.log('⚠️ La automatización llegó al final pero algunos elementos no se verificaron correctamente');
      }
      
      return cy.wrap(todoCorrecto);
    });
  }
}

export default ModulosNavegacionPage;
