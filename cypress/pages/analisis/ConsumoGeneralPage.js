// cypress/pages/analisis/ConsumoGeneralPage.js
class ConsumoGeneralPage {
  // ============================================================
  // SELECTORES
  // ============================================================
  
  // Contenedor principal del módulo de consumo general
  get consumoGeneralContainer() { return '[data-module="consumo-general"], .ConsumoGeneral_container, [class*="ConsumoGeneral"]'; }
  
  // Filtros de período
  get filtroPeriodo() { return '[data-filter="period"], [class*="FilterPeriod"], select[name*="period"]'; }
  get filtroMensual() { return '[data-period="monthly"], [value="monthly"], #monthly'; }
  get filtroDiario() { return '[data-period="daily"], [value="daily"], #daily, #tab-daily'; }
  get filtroSemanal() { return '[data-period="weekly"], [value="weekly"], #weekly, #tab-weekly'; }
  get filtroDropdown() { return '.FiltersSection_filterChipDropdown__zqrbE'; }
  
  // Selector de fecha
  get selectorFecha() { return '[data-date-picker], [class*="DatePicker"], input[type="date"]'; }
  
  // Widgets y gráficas
  get widgetsContainer() { return '[data-widgets-container], [class*="WidgetsContainer"]'; }
  get graficasContainer() { return '[data-graphs-container], [class*="GraphsContainer"]'; }
  
  // Título del módulo
  get tituloModulo() { return 'h1, h2, [class*="Title"], [class*="title"]'; }
  
  // Botón de sedes - usando el ID
  get botonSedes() { return '#breadcrumb-filter-button'; }
  
  // ============================================================
  // SELECTORES DEL MODAL DE MATRIZ DE CONSUMO
  // ============================================================
  
  // Modal y contenedor
  get modalMatrizConsumo() { return '[role="dialog"], [class*="Modal"], [class*="modal"], [class*="Dialog"], [class*="dialog"]'; }
  get tituloModal() { return 'h1, h2, h3, [class*="title"], [class*="Title"]'; }
  get botonCerrarModal() { return 'button[aria-label*="cerrar"], button[aria-label*="close"], button[title*="Cerrar"], button[title*="Close"], [class*="close"]'; }
  
  // Sección Agrupación
  get agrupacionHora() { return 'input[value="hourly"], input[value="hour"], [id*="grouping-hour"], [id*="grouping-Hour"]'; }
  get agrupacionDia() { return 'input[value="daily"], input[value="day"], [id*="grouping-day"], [id*="grouping-Day"]'; }
  get agrupacionMes() { return 'input[value="monthly"], input[value="month"], #download-matrix-grouping-month, [id*="grouping-month"], [id*="grouping-Month"]'; }
  
  // Sección Sedes
  get selectorSedes() { return '[id*="sede"], [id*="Sede"], [id*="site"], [id*="Site"], [class*="sede"], [class*="Sede"]'; }
  get textoSedes() { return '*:contains("sedes"), *:contains("Sedes")'; }
  
  // Sección Periodo
  get campoPeriodo() { return 'input[placeholder*="periodo"], input[placeholder*="period"], input[placeholder*="Selecciona"], #download-matrix-month-picker-button, [id*="period"], [id*="Period"], [id*="date-picker"], [id*="DatePicker"]'; }
  get botonAplicarPeriodo() { return '#date-picker-apply-button, button:contains("Aplicar"), button:contains("Apply"), [id*="apply"]'; }
  
  // Sección Tipo de Energía
  get checkboxActiva() { return 'input[type="checkbox"][value*="activa"], input[type="checkbox"][value*="active"]'; }
  get checkboxActivaExportada() { return 'input[type="checkbox"][value*="export"], input[type="checkbox"][value*="exportada"]'; }
  get checkboxReactivaInductiva() { return 'input[type="checkbox"][value*="inductiva"], input[type="checkbox"][value*="inductive"]'; }
  get checkboxReactivaCapacitiva() { return 'input[type="checkbox"][value*="capacitiva"], input[type="checkbox"][value*="capacitive"]'; }
  
  // Botón de acción
  get botonEnviarCorreo() { return '#download-matrix-send-button, button:contains("Enviar"), button:contains("Send"), button:contains("correo"), button:contains("email")'; }

  // ============================================================
  // MÉTODOS DE NAVEGACIÓN
  // ============================================================

  /**
   * Verificar que el módulo de consumo general cargó correctamente
   * @returns {Cypress.Chainable<boolean>} - True si cargó correctamente
   */
  verificarQueCargo() {
    cy.log('🔍 Verificando que el módulo de consumo general cargó...');
    
    return cy.url({ timeout: 15000 }).then((url) => {
      // Verificar que estamos en la página correcta (múltiples opciones)
      const urlLower = url.toLowerCase();
      const esPaginaCorrecta = urlLower.includes('/analisis') || 
                               urlLower.includes('/analysis') || 
                               urlLower.includes('/consumo-general');
      
      if (!esPaginaCorrecta) {
        cy.log(`⚠️ URL actual: ${url}`);
        cy.log('   La URL no coincide con las rutas esperadas (/analisis, /analysis, /consumo-general)');
      } else {
        cy.log(`✅ URL correcta: ${url}`);
      }
      
      return cy.get('body', { timeout: 10000 }).then(($body) => {
        // Buscar elementos característicos del módulo
        const $container = $body.find(this.consumoGeneralContainer).filter(':visible');
        const tieneContainer = $container.length > 0;
        
        if (tieneContainer) {
          cy.log('✅ Módulo de consumo general cargado correctamente');
        } else {
          cy.log('⚠️ No se encontró el contenedor principal, pero continuando...');
        }
        
        return cy.wrap(tieneContainer || esPaginaCorrecta);
      });
    });
  }

  /**
   * Interceptar la llamada al API de analytics/widgets
   * @returns {Cypress.Chainable} - Intercept configurado
   */
  interceptarApiAnalyticsWidgets() {
    cy.log('🔗 Interceptando llamada al API de analytics/widgets...');
    
    return cy.intercept('POST', '**/ms-bia-consumptions/v1/analitics/widgets', (req) => {
      // Agregar headers para evitar cache
      req.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      req.headers['Pragma'] = 'no-cache';
      req.headers['Expires'] = '0';
      
      req.continue();
    }).as('analyticsWidgetsApi');
  }

  /**
   * Interceptar la llamada al API de matrix-file/v2 (descarga)
   * @returns {Cypress.Chainable} - Intercept configurado
   */
  interceptarApiMatrixFile() {
    cy.log('🔗 Interceptando llamada al API de matrix-file/v2...');
    
    return cy.intercept('POST', '**/ems-api/app-consumptions/consumptions/matrix-file/v2', (req) => {
      cy.log('📡 Interceptando petición de descarga de matriz...');
      cy.log(`   Email: ${req.body?.email || 'N/A'}`);
      cy.log(`   Start date: ${req.body?.start_date || 'N/A'}`);
      cy.log(`   End date: ${req.body?.end_date || 'N/A'}`);
      cy.log(`   Aggregation: ${req.body?.aggregation || 'N/A'}`);
      cy.log(`   Contracts: ${req.body?.contracts?.length || 0} contrato(s)`);
      if (req.body?.contracts && req.body.contracts.length > 0) {
        cy.log(`   Contract IDs: ${req.body.contracts.join(', ')}`);
      }
      
      req.continue();
    }).as('matrixFileApi');
  }

  /**
   * Esperar a que la llamada al API de matrix-file/v2 se complete y validar respuesta
   * @param {number} timeout - Timeout en milisegundos (default: 30000)
   * @returns {Cypress.Chainable<Object>} - Datos del servicio (request y response)
   */
  esperarApiMatrixFile(timeout = 30000) {
    cy.log('⏳ Esperando respuesta del API de matrix-file/v2...');
    
    return cy.wait('@matrixFileApi', { timeout }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('✅ Respuesta del API de matrix-file/v2 recibida exitosamente');
      
      const requestBody = interception.request.body;
      const responseBody = interception.response.body;
      
      return cy.wrap({
        request: requestBody,
        response: responseBody,
        statusCode: interception.response.statusCode
      });
    });
  }

  /**
   * Esperar a que la llamada al API de analytics/widgets se complete
   * @param {number} timeout - Timeout en milisegundos (default: 30000)
   * @returns {Cypress.Chainable<Object>} - Respuesta del API
   */
  esperarApiAnalyticsWidgets(timeout = 30000) {
    cy.log('⏳ Esperando respuesta del API de analytics/widgets...');
    
    return cy.wait('@analyticsWidgetsApi', { timeout }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('✅ Respuesta del API recibida exitosamente');
      
      const responseBody = interception.response.body;
      cy.log(`📊 Widgets recibidos: ${Array.isArray(responseBody) ? responseBody.length : 'N/A'}`);
      
      return cy.wrap(responseBody);
    });
  }

  /**
   * Esperar a que las gráficas carguen completamente
   * @param {number} timeout - Timeout en milisegundos (default: 10000)
   * @returns {Cypress.Chainable} - Chainable de Cypress
   */
  esperarGraficasCarguen(timeout = 10000) {
    cy.log('⏳ Esperando a que las gráficas carguen completamente...');
    
    // Esperar a que aparezcan elementos de gráficas (canvas o svg)
    cy.get('canvas, svg', { timeout })
      .should('exist')
      .then(() => {
        cy.log('✅ Elementos de gráficas encontrados');
        
        // Esperar adicional para que se rendericen completamente
        cy.wait(2000);
        
        // Verificar que las gráficas estén visibles
        cy.get('body').then(($body) => {
          const $graficas = $body.find('canvas, svg').filter(':visible');
          cy.log(`📊 Gráficas visibles encontradas: ${$graficas.length}`);
          
          if ($graficas.length > 0) {
            cy.log('✅ Gráficas cargadas y visibles');
          } else {
            cy.log('⚠️ No se encontraron gráficas visibles, continuando...');
          }
        });
      });
    
    return cy.wrap(null);
  }

  /**
   * Obtener todos los widgets KPI del módulo de consumo general
   * Usa la misma lógica que funciona en el home pero busca dentro del contenedor específico
   * @returns {Cypress.Chainable<Object>} - Objeto con todos los widgets KPI indexados por header
   */
  obtenerDatosWidgets() {
    cy.log('📊 Obteniendo datos de widgets del módulo de consumo general...');
    
    return cy.get('body', { timeout: 10000 }).then(($body) => {
      const widgetsData = {};
      const widgetsEncontrados = new Set(); // Para evitar duplicados
      
      // Buscar primero el contenedor de consumo general
      let $container = $body.find('[data-module="consumo-general"]').filter(':visible');
      if ($container.length === 0) {
        $container = $body.find('[class*="ConsumoGeneral"]').filter(':visible');
      }
      // Si no encontramos contenedor específico, usar body pero filtrar mejor
      if ($container.length === 0) {
        $container = $body;
        cy.log('⚠️ No se encontró contenedor específico, buscando en todo el body');
      } else {
        cy.log(`✅ Contenedor de consumo general encontrado`);
      }
      
      // Buscar primero los contenedores de widgets (excluir gráficas y tablas)
      const $widgetWrappers = $container.find('.WidgetsSection_widgetWrapper__fOU06').filter(':visible');
      cy.log(`🔍 Contenedores de widgets encontrados: ${$widgetWrappers.length}`);
      
      // Estrategia 1: Buscar por data-demo-target="kpi-card" dentro de los wrappers
      const $kpiCards1 = $widgetWrappers.find('[data-demo-target="kpi-card"]').filter(':visible');
      cy.log(`🔍 Estrategia 1 (data-demo-target): ${$kpiCards1.length} widget(s)`);
      
      // Estrategia 2: Buscar por clase bia-kpi-card dentro de los wrappers (excluir gráficas y tablas)
      const $kpiCards2 = $widgetWrappers.find('.bia-kpi-card').filter(':visible');
      cy.log(`🔍 Estrategia 2 (clase bia-kpi-card): ${$kpiCards2.length} widget(s)`);
      
      // Estrategia 3: Buscar por CardWidget_container que contiene widgets KPI (no gráficas ni tablas)
      const $kpiCards3 = $widgetWrappers.find('.CardWidget_container__d_EnN').filter(':visible').filter((i, el) => {
        const $el = Cypress.$(el);
        // Excluir si contiene elementos de gráfica o tabla
        return $el.find('[data-graph-widget], [data-table-widget]').length === 0;
      });
      cy.log(`🔍 Estrategia 3 (CardWidget sin gráficas/tablas): ${$kpiCards3.length} widget(s)`);
      
      // Combinar todos los resultados únicos
      const todosLosCards = [];
      
      // Agregar cards de estrategia 1
      $kpiCards1.each((i, card) => {
        const cardId = Cypress.$(card)[0];
        if (!widgetsEncontrados.has(cardId)) {
          todosLosCards.push(card);
          widgetsEncontrados.add(cardId);
        }
      });
      
      // Agregar cards de estrategia 2 que no estén ya incluidos
      $kpiCards2.each((i, card) => {
        const cardId = Cypress.$(card)[0];
        if (!widgetsEncontrados.has(cardId)) {
          todosLosCards.push(card);
          widgetsEncontrados.add(cardId);
        }
      });
      
      // Agregar cards de estrategia 3 que no estén ya incluidos
      $kpiCards3.each((i, card) => {
        const cardId = Cypress.$(card)[0];
        if (!widgetsEncontrados.has(cardId)) {
          todosLosCards.push(card);
          widgetsEncontrados.add(cardId);
        }
      });
      
      cy.log(`🔍 Total widgets KPI únicos encontrados: ${todosLosCards.length}`);
      
      // Procesar cada widget encontrado
      todosLosCards.forEach((card, index) => {
        const $card = Cypress.$(card);
        
        // Buscar el heading dentro del card - múltiples estrategias
        let $heading = $card.find('.bia-kpi-card__heading').first();
        
        // Si no encuentra con el selector específico, buscar por clase heading
        if ($heading.length === 0) {
          $heading = $card.find('[class*="heading"], [class*="Heading"]').first();
        }
        
        // Si aún no encuentra, buscar por estructura HTML común
        if ($heading.length === 0) {
          $heading = $card.find('h2, h3, h4, [class*="title"], [class*="Title"]').first();
        }
        
        // Si aún no encuentra, buscar cualquier elemento con texto que parezca un título
        if ($heading.length === 0) {
          // Buscar el primer elemento visible con texto que no sea un valor numérico
          $heading = $card.find('*').filter((i, el) => {
            const $el = Cypress.$(el);
            const text = $el.text().trim();
            const children = $el.children();
            
            // Debe tener texto, ser visible, y no ser un contenedor con muchos hijos (probablemente es el card completo)
            const tieneTexto = text.length > 3 && text.length < 150;
            const esVisible = $el.is(':visible');
            const noEsValor = !text.match(/^\d+[KMB]?\s*(kWh|kVArh|COP)/i); // No es un valor
            const noEsPrecio = !text.match(/^\$[\d.]+/); // No es un precio
            const pocosHijos = children.length < 5; // No tiene muchos hijos (no es el contenedor completo)
            
            return tieneTexto && esVisible && noEsValor && noEsPrecio && pocosHijos;
          }).first();
        }
        
        if ($heading.length > 0) {
          let header = $heading.text().trim();
          
          // Normalizar header: eliminar espacios múltiples y normalizar
          header = header.replace(/\s+/g, ' ').trim();
          
          // Verificar que no sea un widget duplicado
          if (widgetsData[header]) {
            cy.log(`⚠️ Widget duplicado encontrado: "${header}", omitiendo...`);
            return;
          }
          
          // Extraer datos del widget
          const widgetData = {
            header: header,
            value_str: '',
            subheader: '',
            encontrado: false
          };
          
          // Extraer value_str (puede ser kWh, kVArh, o otros formatos)
          let $value = $card.find('.bia-kpi-card__value').first();
          if ($value.length === 0) {
            $value = $card.find('.CardWidget_value__acdKq').first();
          }
          if ($value.length === 0) {
            $value = $card.find('[class*="value"], [class*="Value"]').first();
          }
          
          if ($value.length > 0) {
            // Obtener el texto completo del contenedor (incluye ambos spans: número y unidad)
            const valueText = $value.text().trim();
            // Normalizar espacios múltiples
            const valueTextNormalizado = valueText.replace(/\s+/g, ' ').trim();
            
            // Buscar diferentes formatos: kWh, kVArh, o solo números
            const valueMatch = valueTextNormalizado.match(/(\d+(?:\.\d+)?[KMB]?)\s*(kWh|kVArh|kVAh)?/i);
            if (valueMatch) {
              const unidad = valueMatch[2] || 'kWh';
              widgetData.value_str = `${valueMatch[1]} ${unidad}`;
            } else {
              // Si no hay unidad explícita, intentar detectarla del texto
              if (valueTextNormalizado.toLowerCase().includes('kvarh')) {
                const numMatch = valueTextNormalizado.match(/(\d+(?:\.\d+)?[KMB]?)/i);
                if (numMatch) {
                  widgetData.value_str = `${numMatch[1]} kVArh`;
                } else {
                  widgetData.value_str = valueTextNormalizado;
                }
              } else {
                // Usar el texto completo
                widgetData.value_str = valueTextNormalizado;
              }
            }
          }
          
          // Extraer subheader
          let $subheader = $card.find('[class*="subheader"], [class*="Subheader"]').first();
          if ($subheader.length === 0) {
            $subheader = $card.find('.CardWidget_subheaderContainer__nhRnz').first();
          }
          
          if ($subheader.length > 0) {
            const subheaderText = $subheader.text().trim();
            const precioMatch = subheaderText.match(/\$[\d.]+[KMB]?\s*COP/i);
            if (precioMatch) {
              widgetData.subheader = precioMatch[0].trim();
            } else {
              widgetData.subheader = subheaderText;
            }
          }
          
          widgetsData[header] = widgetData;
          
          cy.log(`✅ Widget ${index + 1} extraído: "${header}"`);
          cy.log(`   value_str: "${widgetData.value_str || 'N/A'}"`);
          cy.log(`   subheader: "${widgetData.subheader || 'N/A'}"`);
        } else {
          cy.log(`⚠️ Widget ${index + 1} encontrado pero sin heading/título`);
        }
      });
      
      cy.log(`📊 Total widgets KPI extraídos: ${Object.keys(widgetsData).length}`);
      cy.log(`   Widgets: ${Object.keys(widgetsData).join(', ')}`);
      
      return cy.wrap(widgetsData);
    });
  }

  /**
   * Verificar que los widgets se muestran en la UI
   * @returns {Cypress.Chainable<Object>} - Datos de los widgets encontrados
   */
  verificarWidgetsEnUI() {
    cy.log('🔍 Verificando widgets en la UI...');
    
    return cy.get('body', { timeout: 10000 }).then(($body) => {
      const widgetsData = {
        encontrados: false,
        cantidad: 0,
        detalles: []
      };
      
      // Buscar contenedor de widgets
      const $widgetsContainer = $body.find(this.widgetsContainer).filter(':visible');
      
      if ($widgetsContainer.length > 0) {
        // Buscar elementos que parezcan widgets (cards, gráficas, etc.)
        const $widgets = $widgetsContainer.find('[class*="Widget"], [class*="Card"], [class*="Chart"], [data-widget]').filter(':visible');
        widgetsData.cantidad = $widgets.length;
        widgetsData.encontrados = widgetsData.cantidad > 0;
        
        if (widgetsData.encontrados) {
          cy.log(`✅ Se encontraron ${widgetsData.cantidad} widget(s) en la UI`);
          
          // Extraer detalles de los primeros widgets
          $widgets.slice(0, 5).each((i, el) => {
            const $el = Cypress.$(el);
            const texto = $el.text().trim().substring(0, 50);
            widgetsData.detalles.push({
              indice: i + 1,
              texto: texto || 'Sin texto',
              visible: $el.is(':visible')
            });
          });
        }
      } else {
        cy.log('⚠️ No se encontró el contenedor de widgets');
      }
      
      return cy.wrap(widgetsData);
    });
  }

  /**
   * Verificar y obtener datos de las gráficas en la UI
   * Busca gráficas usando la estructura HTML del módulo de consumo general
   * @returns {Cypress.Chainable<Object>} - Datos de las gráficas encontradas
   */
  verificarGraficasEnUI() {
    cy.log('📊 Verificando gráficas en la UI (solo módulo de consumo general)...');
    
    return cy.get('body', { timeout: 10000 }).then(($body) => {
      const graficasData = {
        encontradas: false,
        cantidad: 0,
        detalles: []
      };
      
      // Estrategia 1: Buscar contenedores de widgets de gráficas usando data-* attributes
      const $graficasWidgets = $body.find('[data-graph-widget="true"], [data-chart-widget="true"]').filter(':visible');
      cy.log(`🔍 Estrategia 1 (data-graph-widget): ${$graficasWidgets.length} widget(s) de gráfica`);
      
      // Estrategia 2: Buscar contenedores de gráficas por clases comunes
      const $graficasContainers = $body.find('[class*="GraphWidget"], [class*="ChartWidget"], [class*="Chart"], [class*="Graph"]').filter(':visible');
      cy.log(`🔍 Estrategia 2 (clases): ${$graficasContainers.length} contenedor(es) de gráfica`);
      
      const graficasEncontradas = [];
      const graficasYaProcesadas = new Set();
      
      // Procesar widgets encontrados por data-* attributes
      $graficasWidgets.each((i, widget) => {
        const $widget = Cypress.$(widget);
        const widgetId = widget;
        
        if (!graficasYaProcesadas.has(widgetId)) {
          // Extraer título del widget
          const $titulo = $widget.find('[class*="title"], [class*="Title"], [data-graph-title], h2, h3, h4').first();
          let titulo = '';
          
          if ($titulo.length > 0) {
            titulo = $titulo.text().trim();
          } else {
            // Intentar obtener título del atributo data-graph-title
            titulo = $widget.attr('data-graph-title') || '';
          }
          
          // Verificar que tenga canvas o svg dentro
          const $canvas = $widget.find('canvas').filter(':visible');
          const $svg = $widget.find('svg').filter(':visible');
          
          if (titulo && ($canvas.length > 0 || $svg.length > 0)) {
            graficasEncontradas.push({
              titulo: titulo,
              tipo: $canvas.length > 0 ? 'canvas' : 'svg',
              elemento: widget
            });
            graficasYaProcesadas.add(widgetId);
          }
        }
      });
      
      // Procesar contenedores encontrados por clases
      $graficasContainers.each((i, container) => {
        const $container = Cypress.$(container);
        const containerId = container;
        
        if (!graficasYaProcesadas.has(containerId)) {
          // Buscar título dentro del contenedor
          const $titulo = $container.find('[class*="title"], [class*="Title"], h2, h3, h4, [class*="heading"]').first();
          const titulo = $titulo.length > 0 ? $titulo.text().trim() : '';
          
          // Verificar que tenga canvas o svg dentro
          const $canvas = $container.find('canvas').filter(':visible');
          const $svg = $container.find('svg').filter(':visible');
          
          // Solo incluir si tiene título y gráfica renderizada
          if (titulo.length > 0 && ($canvas.length > 0 || $svg.length > 0)) {
            // Filtrar solo gráficas relacionadas con consumo general
            const tituloLower = titulo.toLowerCase();
            const palabrasClave = ['consumo', 'febrero', 'promedio', 'meses', 'vs.', 'últimos'];
            const esGraficaRelevante = palabrasClave.some(palabra => tituloLower.includes(palabra));
            
            if (esGraficaRelevante) {
              graficasEncontradas.push({
                titulo: titulo,
                tipo: $canvas.length > 0 ? 'canvas' : 'svg',
                elemento: container
              });
              graficasYaProcesadas.add(containerId);
            }
          }
        }
      });
      
      // Estrategia 3: Buscar gráficas por estructura de título + canvas/svg cercano
      if (graficasEncontradas.length === 0) {
        cy.log('🔍 Estrategia 3: Buscando gráficas por estructura de título + elemento gráfico...');
        
        // Buscar títulos que mencionen consumo
        const $titulosConsumo = $body.find('h2, h3, h4, [class*="title"], [class*="Title"]').filter((i, el) => {
          const $el = Cypress.$(el);
          const texto = $el.text().trim().toLowerCase();
          return (texto.includes('consumo') || texto.includes('febrero') || texto.includes('promedio') || texto.includes('meses')) &&
                 texto.length > 5 &&
                 texto.length < 100 &&
                 $el.is(':visible');
        });
        
        $titulosConsumo.each((i, tituloEl) => {
          const $tituloEl = Cypress.$(tituloEl);
          const titulo = $tituloEl.text().trim();
          
          // Buscar canvas o svg cercano (dentro del mismo contenedor padre)
          const $parent = $tituloEl.closest('[class*="Widget"], [class*="Card"], [class*="container"], [class*="Container"]');
          if ($parent.length > 0) {
            const $canvas = $parent.find('canvas').filter(':visible');
            const $svg = $parent.find('svg').filter(':visible');
            
            if ($canvas.length > 0 || $svg.length > 0) {
              const yaExiste = graficasEncontradas.some(g => g.titulo.toLowerCase() === titulo.toLowerCase());
              if (!yaExiste) {
                graficasEncontradas.push({
                  titulo: titulo,
                  tipo: $canvas.length > 0 ? 'canvas' : 'svg',
                  elemento: tituloEl
                });
              }
            }
          }
        });
      }
      
      graficasData.cantidad = graficasEncontradas.length;
      graficasData.encontradas = graficasData.cantidad > 0;
      
      if (graficasData.encontradas) {
        cy.log(`✅ Se encontraron ${graficasData.cantidad} gráfica(s) en el módulo de consumo general`);
        
        // Extraer detalles de las gráficas encontradas
        graficasEncontradas.forEach((grafica, index) => {
          graficasData.detalles.push({
            indice: index + 1,
            tipo: grafica.tipo,
            titulo: grafica.titulo,
            visible: true
          });
          
          cy.log(`   ${index + 1}. "${grafica.titulo}" (${grafica.tipo})`);
        });
      } else {
        cy.log('⚠️ No se encontraron gráficas visibles en el módulo de consumo general');
        cy.log('   Intentando búsqueda más amplia...');
        
        // Búsqueda de respaldo: contar todos los canvas/svg visibles
        const $todasLasGraficas = $body.find('canvas, svg').filter(':visible');
        cy.log(`   Total elementos canvas/svg encontrados en la página: ${$todasLasGraficas.length}`);
      }
      
      return cy.wrap(graficasData);
    });
  }

  /**
   * Verificar una gráfica específica por su título
   * @param {string} tituloGrafica - Título de la gráfica a buscar
   * @returns {Cypress.Chainable<Object>} - Datos de la gráfica encontrada
   */
  verificarGraficaPorTitulo(tituloGrafica) {
    cy.log(`📊 Verificando gráfica: "${tituloGrafica}"...`);
    
    return cy.get('body', { timeout: 10000 }).then(($body) => {
      const graficaData = {
        encontrada: false,
        titulo: '',
        tieneCanvas: false,
        tieneSvg: false
      };
      
      // Buscar por título
      const $titulo = $body.find('*').filter((i, el) => {
        const $el = Cypress.$(el);
        const texto = $el.text().trim().toLowerCase();
        return texto.includes(tituloGrafica.toLowerCase()) && $el.is(':visible');
      }).first();
      
      if ($titulo.length > 0) {
        graficaData.titulo = $titulo.text().trim();
        
        // Buscar gráfica asociada (canvas o svg cercano)
        const $container = $titulo.closest('[class*="Widget"], [class*="Chart"], [class*="Graph"]');
        if ($container.length > 0) {
          const $canvas = $container.find('canvas').filter(':visible');
          const $svg = $container.find('svg').filter(':visible');
          
          graficaData.tieneCanvas = $canvas.length > 0;
          graficaData.tieneSvg = $svg.length > 0;
          graficaData.encontrada = graficaData.tieneCanvas || graficaData.tieneSvg;
        }
      }
      
      if (graficaData.encontrada) {
        cy.log(`✅ Gráfica encontrada: "${graficaData.titulo}"`);
        cy.log(`   🎨 Canvas: ${graficaData.tieneCanvas ? 'Sí' : 'No'}`);
        cy.log(`   🎨 SVG: ${graficaData.tieneSvg ? 'Sí' : 'No'}`);
      } else {
        cy.log(`⚠️ No se encontró la gráfica: "${tituloGrafica}"`);
      }
      
      return cy.wrap(graficaData);
    });
  }

  /**
   * Cambiar el filtro de período
   * @param {string} periodo - Período a seleccionar ('monthly', 'daily', 'weekly')
   * @returns {Cypress.Chainable} - Chainable de Cypress
   */
  cambiarFiltroPeriodo(periodo = 'monthly') {
    cy.log(`🔄 Cambiando filtro de período a: ${periodo}...`);
    
    return cy.get('body', { timeout: 10000 }).then(($body) => {
      let selectorFiltro = null;
      
      switch (periodo.toLowerCase()) {
        case 'monthly':
        case 'mensual':
          selectorFiltro = this.filtroMensual;
          break;
        case 'daily':
        case 'diario':
          selectorFiltro = '#tab-daily';
          break;
        case 'weekly':
        case 'semanal':
          selectorFiltro = '#tab-weekly';
          break;
        default:
          cy.log(`⚠️ Período no reconocido: ${periodo}, usando monthly por defecto`);
          selectorFiltro = this.filtroMensual;
      }
      
      // Buscar el filtro por ID primero
      const $filtro = $body.find(selectorFiltro).filter(':visible');
      
      if ($filtro.length > 0) {
        cy.wrap($filtro.first())
          .scrollIntoView()
          .should('be.visible')
          .click({ force: true });
        
        cy.wait(3000); // Esperar a que se actualice la UI y el API
        cy.log(`✅ Filtro cambiado a: ${periodo}`);
      } else {
        cy.log(`⚠️ No se encontró el filtro con selector: ${selectorFiltro}`);
        throw new Error(`No se pudo encontrar el filtro para período: ${periodo}`);
      }
    });
  }

  /**
   * Hacer clic en el filtro semanal
   * @returns {Cypress.Chainable} - Chainable de Cypress
   */
  hacerClicEnFiltroSemanal() {
    cy.log('🔄 Haciendo clic en filtro semanal...');
    
    return cy.get('#tab-weekly', { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .click({ force: true })
      .then(() => {
        cy.wait(3000); // Esperar a que se actualice la UI y el API
        cy.log('✅ Filtro semanal seleccionado');
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
   * Abrir el dropdown de filtros y seleccionar la primera opción
   * @returns {Cypress.Chainable} - Chainable de Cypress
   */
  abrirDropdownYSeleccionarPrimeraOpcion() {
    cy.log('🔄 Abriendo dropdown de filtros...');
    
    return cy.get('.FiltersSection_filterChipDropdown__zqrbE', { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .click({ force: true })
      .then(() => {
        cy.wait(1000); // Esperar a que se abra el dropdown
        
        // Buscar la primera opción del dropdown
        cy.get('body').then(($body) => {
          // Buscar opciones del dropdown (pueden estar en un menú, lista, etc.)
          const $opciones = $body.find('[role="menuitem"], [role="option"], [class*="dropdown-item"], [class*="menu-item"], li').filter(':visible');
          
          if ($opciones.length > 0) {
            cy.log(`✅ Se encontraron ${$opciones.length} opción(es) en el dropdown`);
            cy.log(`   Seleccionando la primera opción: "${$opciones.first().text().trim()}"`);
            
            cy.wrap($opciones.first())
              .scrollIntoView()
              .click({ force: true });
            
            cy.wait(2000); // Esperar a que se aplique el filtro
            cy.log('✅ Primera opción del dropdown seleccionada');
          } else {
            cy.log('⚠️ No se encontraron opciones en el dropdown');
            // Intentar cerrar el dropdown si está abierto
            cy.get('body').type('{esc}');
          }
        });
      });
  }

  /**
   * Hacer clic en el botón de sedes, verificar que se abra y muestre información
   * @returns {Cypress.Chainable} - Chainable de Cypress
   */
  hacerClicEnBotonSedesYVerificarInfo() {
    cy.log('🔄 Haciendo clic en botón de sedes...');
    
    // Buscar el botón usando el ID directamente
    return cy.get(this.botonSedes, { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .click({ force: true })
      .then(() => {
        cy.wait(3000); // Esperar a que se abra el dropdown/modal
        cy.log('✅ Clic realizado en botón de sedes');
        
        // Verificar que el dropdown/modal se haya abierto y muestre información
        return cy.get('body').then(($body) => {
          // Buscar el dropdown/modal que se abrió - múltiples estrategias
          let $dropdown = $body.find('[role="menu"], [role="listbox"]').filter(':visible').last();
          
          if ($dropdown.length === 0) {
            $dropdown = $body.find('[class*="dropdown"], [class*="Dropdown"]').filter(':visible').last();
          }
          
          if ($dropdown.length === 0) {
            $dropdown = $body.find('[class*="menu"], [class*="Menu"]').filter(':visible').last();
          }
          
          if ($dropdown.length === 0) {
            $dropdown = $body.find('[class*="popover"], [class*="Popover"]').filter(':visible').last();
          }
          
          if ($dropdown.length === 0) {
            $dropdown = $body.find('[class*="Select"], [class*="select"]').filter(':visible').last();
          }
          
          if ($dropdown.length === 0) {
            // Buscar cualquier elemento que apareció después del clic (cerca del botón)
            const $boton = $body.find(this.botonSedes);
            if ($boton.length > 0) {
              // Buscar elementos visibles cerca del botón
              $dropdown = $boton.parent().siblings().filter(':visible').last();
              if ($dropdown.length === 0) {
                $dropdown = $boton.closest('[class*="breadcrumb"]').siblings().filter(':visible').last();
              }
            }
          }
          
          if ($dropdown.length > 0) {
            cy.log(`✅ Dropdown/Modal de sedes encontrado`);
            
            // Contar elementos en el dropdown - múltiples estrategias
            let $items = $dropdown.find('[role="menuitem"], [role="option"]').filter(':visible');
            
            if ($items.length === 0) {
              $items = $dropdown.find('li, [class*="item"], [class*="Item"]').filter(':visible');
            }
            
            if ($items.length === 0) {
              $items = $dropdown.find('[class*="option"], [class*="Option"]').filter(':visible');
            }
            
            if ($items.length === 0) {
              $items = $dropdown.find('[class*="sede"], [class*="Sede"], [class*="site"], [class*="Site"]').filter(':visible');
            }
            
            if ($items.length === 0) {
              // Buscar cualquier elemento hijo con texto
              $items = $dropdown.find('*').filter((i, el) => {
                const $el = Cypress.$(el);
                const text = $el.text().trim();
                return text.length > 0 && 
                       text.length < 200 && 
                       $el.is(':visible') &&
                       $el.children().length < 10; // No es un contenedor grande
              });
            }
            
            cy.log(`📊 Elementos encontrados en el dropdown: ${$items.length}`);
            
            // Solo validar si encontramos elementos, sino solo loguear
            if ($items.length > 0) {
              cy.log('✅ El dropdown muestra información');
            } else {
              cy.log('⚠️ El dropdown está abierto pero no se encontraron elementos con los selectores estándar');
              cy.log('   Intentando búsqueda alternativa...');
            }
            
            // Mostrar información encontrada
            if ($items.length > 0) {
              cy.log('📋 Información de sedes encontrada:');
              $items.slice(0, 15).each((i, el) => {
                const texto = Cypress.$(el).text().trim();
                if (texto.length > 0) {
                  cy.log(`   ${i + 1}. ${texto.substring(0, 80)}`);
                }
              });
              
              if ($items.length > 15) {
                cy.log(`   ... y ${$items.length - 15} elemento(s) más`);
              }
              
              // Hacer scroll para ver toda la información
              cy.log('🔄 Haciendo scroll para ver toda la información...');
              const dropdownElement = $dropdown[0];
              
              cy.wrap(dropdownElement)
                .scrollTo('bottom', { duration: 2000, easing: 'swing' })
                .then(() => {
                  cy.wait(500);
                  cy.log('✅ Scroll hacia abajo completado');
                  
                  cy.wrap(dropdownElement)
                    .scrollTo('top', { duration: 2000, easing: 'swing' })
                    .then(() => {
                      cy.wait(500);
                      cy.log('✅ Scroll hacia arriba completado');
                      cy.log(`✅ Validación completada: Se encontraron ${$items.length} elemento(s) de sedes`);
                    });
                });
            } else {
              // Si no encontramos elementos con los selectores estándar, buscar en todo el body
              cy.log('⚠️ Buscando información de sedes en toda la página...');
              const $infoSedes = $body.find('*').filter((i, el) => {
                const $el = Cypress.$(el);
                const text = $el.text().trim();
                return text.length > 3 && 
                       text.length < 100 && 
                       $el.is(':visible') &&
                       (text.toLowerCase().includes('sede') || 
                        text.toLowerCase().includes('site') ||
                        text.match(/^[A-Z]/)); // Empieza con mayúscula (posible nombre de sede)
              });
              
              if ($infoSedes.length > 0) {
                cy.log(`✅ Se encontró información relacionada: ${$infoSedes.length} elemento(s)`);
                $infoSedes.slice(0, 10).each((i, el) => {
                  const texto = Cypress.$(el).text().trim();
                  if (texto.length > 0) {
                    cy.log(`   ${i + 1}. ${texto.substring(0, 60)}`);
                  }
                });
              }
              
              cy.log('✅ Validación completada: El dropdown se abrió correctamente');
            }
          } else {
            cy.log('⚠️ No se encontró el dropdown/modal después del clic');
            cy.log('   Buscando información de sedes en la página...');
            
            // Buscar cualquier información relacionada con sedes
            const $infoSedes = $body.find('[class*="Sede"], [class*="sede"], [class*="Site"], [class*="site"], [id*="sede"], [id*="site"]').filter(':visible');
            
            if ($infoSedes.length > 0) {
              cy.log(`✅ Se encontró información de sedes: ${$infoSedes.length} elemento(s)`);
              $infoSedes.slice(0, 10).each((i, el) => {
                const texto = Cypress.$(el).text().trim();
                if (texto.length > 0) {
                  cy.log(`   ${i + 1}. ${texto.substring(0, 60)}`);
                }
              });
            } else {
              cy.log('⚠️ No se encontró información de sedes visible');
              throw new Error('El botón de sedes no abrió ningún dropdown o no se muestra información');
            }
          }
        });
      });
  }

  /**
   * Ejecutar el flujo completo de descarga de matriz de consumo
   * @returns {Cypress.Chainable} - Chainable de Cypress con los datos del servicio
   */
  ejecutarFlujoDescarga() {
    cy.log('📥 Iniciando flujo de descarga de matriz de consumo...');
    
    // Paso 1: Clic en botón de descarga
    return cy.get('#analysis-download-button', { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .click({ force: true })
      .then(() => {
        cy.wait(3000); // Esperar a que se abra el modal completamente
        cy.log('✅ Clic en botón de descarga realizado');
        
        // Paso 2: Clic en agrupación "Mes" usando el ID correcto
        cy.log('📅 Seleccionando agrupación "Mes"...');
        return cy.get('#download-matrix-radio-month', { timeout: 10000 })
          .should('be.visible')
          .scrollIntoView()
          .click({ force: true })
          .then(() => {
            cy.wait(2000); // Esperar a que se actualice la UI después de seleccionar Mes
            cy.log('✅ Clic en "Mes" realizado');
            
            // Paso 3: Clic en el botón de periodo usando el ID correcto
            cy.log('📆 Abriendo selector de periodo...');
            return cy.get('#download-matrix-date-picker-button', { timeout: 10000 })
              .should('be.visible')
              .scrollIntoView()
              .click({ force: true })
              .then(() => {
                cy.wait(2000); // Esperar a que se abra el calendario
                cy.log('✅ Selector de periodo abierto');
                
                // Paso 4: El calendario ya trae seleccionado un mes, solo hacer clic en "Aplicar"
                cy.log('🔄 Aplicando selección del periodo...');
                return cy.get('#date-picker-apply-button', { timeout: 10000 })
                      .should('be.visible')
                      .scrollIntoView()
                      .click({ force: true })
                      .then(() => {
                        cy.wait(1000);
                        cy.log('✅ Clic en "Aplicar" realizado');
                        
                        // Verificar que no haya ocurrido un refresh de página
                        cy.url().should('not.include', '/login');
                        cy.get('#download-matrix-send-button', { timeout: 10000 }).should('exist');
                        
                        // Paso 5: Clic en "Enviar a mi correo"
                        cy.log('📧 Enviando correo...');
                        
                        return cy.get('#download-matrix-send-button', { timeout: 10000 })
                          .should('be.visible')
                          .scrollIntoView()
                          .click({ force: true })
                          .then(() => {
                            cy.log('✅ Clic en "Enviar a mi correo" realizado');
                            
                            // Verificar que no haya ocurrido un refresh de página después de enviar
                            cy.url().should('not.include', '/login');
                            
                            // Esperar respuesta del API de matrix-file/v2
                            return cy.wait('@matrixFileApi', { timeout: 30000 }).then((interception) => {
                              // Validar que la respuesta sea exitosa
                              expect(interception.response.statusCode).to.eq(200);
                              cy.log('✅ API de descarga respondió exitosamente');
                              
                              // Extraer y validar datos del servicio
                              const requestBody = interception.request.body;
                              const responseBody = interception.response.body;
                              
                              cy.log('');
                              cy.log('═══════════════════════════════════════════════════════');
                              cy.log('📡 VALIDACIÓN CONTRA EL SERVICIO');
                              cy.log('═══════════════════════════════════════════════════════');
                              cy.log('   ┌─ Datos enviados al servicio:');
                              cy.log(`   │  Email: "${requestBody.email || 'N/A'}"`);
                              cy.log(`   │  Start date: "${requestBody.start_date || 'N/A'}"`);
                              cy.log(`   │  End date: "${requestBody.end_date || 'N/A'}"`);
                              cy.log(`   │  Aggregation: "${requestBody.aggregation || 'N/A'}"`);
                              cy.log(`   │  Energy types: ${requestBody.energy_types?.join(', ') || 'N/A'}`);
                              cy.log(`   │  Contracts: ${requestBody.contracts?.length || 0} contrato(s)`);
                              cy.log(`   ├─ Respuesta del servicio:`);
                              cy.log(`   │  Status: ${interception.response.statusCode}`);
                              cy.log(`   │  Response: ${JSON.stringify(responseBody).substring(0, 200)}...`);
                              cy.log(`   └─ Validación:`);
                              
                              // Validar que el email esté presente
                              expect(requestBody.email, 'El email debe estar presente en la petición').to.exist;
                              expect(requestBody.email, 'El email no debe estar vacío').to.not.be.empty;
                              
                              // Validar que la agregación sea "month" (según el curl proporcionado)
                              expect(requestBody.aggregation, 'La agregación debe ser "month"').to.eq('month');
                              
                              // Validar que haya fechas
                              expect(requestBody.start_date, 'La fecha de inicio debe estar presente').to.exist;
                              expect(requestBody.end_date, 'La fecha de fin debe estar presente').to.exist;
                              
                              // Validar que haya tipos de energía
                              expect(requestBody.energy_types, 'Debe haber tipos de energía en la petición').to.exist;
                              expect(requestBody.energy_types.length, 'Debe haber al menos un tipo de energía').to.be.greaterThan(0);
                              
                              // Validar que haya contratos
                              expect(requestBody.contracts, 'Debe haber contratos en la petición').to.exist;
                              expect(requestBody.contracts.length, 'Debe haber al menos un contrato').to.be.greaterThan(0);
                              
                              cy.log(`      Email: ✅`);
                              cy.log(`      Aggregation (month): ✅`);
                              cy.log(`      Fechas: ✅`);
                              cy.log(`      Energy types: ✅`);
                              cy.log(`      Contratos: ✅`);
                              cy.log(`      🎯 RESULTADO: ✅ Todas las validaciones correctas`);
                              cy.log('═══════════════════════════════════════════════════════');
                              
                              cy.wait(2000); // Esperar adicional para que aparezca el mensaje
                              
                              // Paso 6: Validar el mensaje informativo específico
                              return cy.get('body', { timeout: 10000 }).then(($body) => {
                                // Buscar el mensaje específico: "Estamos preparando tu archivo. En cuanto esté listo, lo enviaremos a karen.diaz@bia.app"
                                const textoBuscado = 'estamos preparando tu archivo';
                                const emailBuscado = 'karen.diaz@bia.app';
                                
                                let $mensaje = $body.find('*').filter((i, el) => {
                                  const $el = Cypress.$(el);
                                  const text = $el.text().trim().toLowerCase();
                                  return text.includes(textoBuscado) && 
                                         text.includes(emailBuscado.toLowerCase()) &&
                                         $el.is(':visible') &&
                                         text.length < 500;
                                }).first();
                                
                                if ($mensaje.length > 0) {
                                  const textoCompleto = $mensaje.text().trim();
                                  cy.log(`✅ Mensaje informativo encontrado: "${textoCompleto.substring(0, 150)}"`);
                                  
                                  // Validar que el email en el mensaje coincida con el del servicio
                                  if (textoCompleto.toLowerCase().includes(requestBody.email.toLowerCase())) {
                                    cy.log(`✅ Email en el mensaje coincide con el del servicio: "${requestBody.email}"`);
                                  } else {
                                    cy.log(`⚠️ Email en el mensaje no coincide: esperado "${requestBody.email}", encontrado en mensaje`);
                                  }
                                } else {
                                  cy.log('⚠️ No se encontró el mensaje informativo específico');
                                  cy.log('   Buscando cualquier mensaje relacionado...');
                                  
                                  // Buscar mensajes relacionados
                                  $mensaje = $body.find('[class*="Toast"], [class*="toast"], [class*="Notification"], [class*="notification"], [class*="Alert"], [class*="alert"], [class*="Message"], [class*="message"]').filter((i, el) => {
                                    const $el = Cypress.$(el);
                                    const text = $el.text().trim().toLowerCase();
                                    return (text.includes('preparando') || 
                                            text.includes('archivo') ||
                                            text.includes('enviaremos') ||
                                            text.includes('enviado')) &&
                                           $el.is(':visible') &&
                                           text.length < 500;
                                  }).first();
                                  
                                  if ($mensaje.length > 0) {
                                    cy.log(`✅ Mensaje relacionado encontrado: "${$mensaje.text().trim().substring(0, 150)}"`);
                                  } else {
                                    cy.log('⚠️ No se encontró ningún mensaje relacionado');
                                    cy.log('   (El API respondió correctamente, esto es solo informativo)');
                                  }
                                }
                                
                                cy.log('');
                                cy.log('✅ Flujo de descarga completado exitosamente');
                                
                                // Retornar los datos del servicio para validación adicional
                                return cy.wrap({
                                  request: requestBody,
                                  response: responseBody,
                                  statusCode: interception.response.statusCode
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
  }

  /**
   * Verificar que el título del módulo es correcto
   * @param {string} tituloEsperado - Título esperado (default: 'Consumo General')
   * @returns {Cypress.Chainable<boolean>} - True si el título es correcto
   */
  verificarTituloModulo(tituloEsperado = 'Consumo General') {
    cy.log(`🔍 Verificando título del módulo: "${tituloEsperado}"...`);
    
    return cy.get('body', { timeout: 10000 }).then(($body) => {
      const tituloLower = tituloEsperado.toLowerCase();
      
      // Buscar por texto en títulos
      const $titulo = $body.find(this.tituloModulo).filter((i, el) => {
        const $el = Cypress.$(el);
        const texto = $el.text().trim().toLowerCase();
        return texto.includes(tituloLower) && $el.is(':visible');
      });
      
      const encontrado = $titulo.length > 0;
      
      if (encontrado) {
        cy.log(`✅ Título encontrado: "${$titulo.first().text().trim()}"`);
      } else {
        cy.log(`⚠️ No se encontró el título: "${tituloEsperado}"`);
      }
      
      return cy.wrap(encontrado);
    });
  }
}

export default ConsumoGeneralPage;
