// cypress/pages/Home/HomeWidgetsPage.js
class HomeWidgetsPage {
  // ============================================================
  // SELECTORES BASADOS EN DATA-* ATTRIBUTES (MÁS ROBUSTOS)
  // ============================================================
  
  // Contenedor principal del home
  get homeContainer() { return '.Home_container__j8qHB'; }
  get homeGrid() { return '.Home_grid__08FM_'; }
  
  // Widget de saludo/bienvenida
  get saludoContainer() { return '.InfoWidget_container__QhoGM'; }
  get saludoHeader() { return '.InfoWidget_header__CIztC'; }
  get saludoSubtext() { return '.InfoWidget_subtext__1ZB7q'; }
  
  // Widgets KPI (Consumo hoy/semana/mes) - usando data-demo-target
  get kpiCards() { return '[data-demo-target="kpi-card"]'; }
  get kpiCardHeading() { return '.bia-kpi-card__heading'; }
  get kpiCardValue() { return '.bia-kpi-card__value'; }
  get kpiCardSubheader() { return '.CardWidget_subheaderContainer__nhRnz'; }
  
  // Gráfica de consumo energético - usando data-graph-title
  get graficaConsumoContainer() { return '[data-graph-widget="true"][data-graph-title="Consumo energético"]'; }
  get graficaConsumoTitulo() { return '.GraphWidget_titleGroup__Q6FtL'; }
  get graficaConsumoCanvas() { return '.echarts-for-react canvas'; }
  
  // Widget de facturas - usando data-table-title
  get facturasContainer() { return '[data-table-widget="true"][data-table-title="Facturas"]'; }
  get facturasTitulo() { return '.TableWidget_titleGroup__Eydni'; }
  
  // Widget de variaciones - usando data-table-title
  get variacionesContainer() { return '[data-table-widget="true"][data-table-title="Variaciones de consumo"]'; }
  get variacionesTitulo() { return '.TableWidget_titleGroup__Eydni'; }

  // ============================================================
  // MÉTODOS PARA SALUDO/BIENVENIDA
  // ============================================================
  
  /**
   * Obtener datos del saludo/bienvenida usando selectores específicos
   * @returns {Cypress.Chainable<Object>} - Datos del saludo
   */
  obtenerDatosSaludo() {
    cy.log('👋 Obteniendo datos del saludo...');
    
    return cy.get('body').then(($body) => {
      const saludoData = {
        header: '',
        value_str: '',
        encontrado: false
      };
      
      // Buscar usando selector específico primero
      const $saludoContainer = $body.find(this.saludoContainer).filter(':visible');
      
      if ($saludoContainer.length > 0) {
        // Extraer header
        const $header = $saludoContainer.find(this.saludoHeader);
        if ($header.length > 0) {
          saludoData.header = $header.text().trim();
        }
        
        // Extraer subtext (fecha y sedes)
        const $subtext = $saludoContainer.find(this.saludoSubtext);
        if ($subtext.length > 0) {
          saludoData.value_str = $subtext.text().trim();
        }
        
        saludoData.encontrado = saludoData.header.length > 0;
        
        if (saludoData.encontrado) {
          cy.log(`✅ Saludo encontrado: "${saludoData.header}"`);
          cy.log(`   📅 ${saludoData.value_str}`);
        }
      } else {
        // Fallback: buscar por texto
        const $saludoElements = $body.find('*').filter((i, el) => {
          const $el = Cypress.$(el);
          const text = $el.text().trim();
          return (text.includes('Buenas') || text.includes('Buenos')) && $el.is(':visible');
        });
        
        if ($saludoElements.length > 0) {
          const $saludo = $saludoElements.first();
          const saludoText = $saludo.text();
          
          const headerMatch = saludoText.match(/(¡?Buenas?\s+(?:tardes|días|noches)[^!]*!?)/i);
          if (headerMatch) {
            saludoData.header = headerMatch[1].trim();
          }
          
          const valueMatch = saludoText.match(/(\d+\s+de\s+\w+,\s+\d{4}[^·]*·\s*\d+\s+Sedes?)/i);
          if (valueMatch) {
            saludoData.value_str = valueMatch[1].trim();
          } else {
            const $parent = $saludo.parent();
            const parentText = $parent.text();
            const valueMatch2 = parentText.match(/(\d+\s+de\s+\w+,\s+\d{4}[^·]*·\s*\d+\s+Sedes?)/i);
            if (valueMatch2) {
              saludoData.value_str = valueMatch2[1].trim();
            }
          }
          
          saludoData.encontrado = saludoData.header.length > 0;
        }
      }
      
      if (!saludoData.encontrado) {
        cy.log('⚠️ No se encontró el saludo');
      }
      
      return cy.wrap(saludoData);
    });
  }

  // ============================================================
  // MÉTODOS PARA WIDGETS KPI (CONSUMO HOY/SEMANA/MES)
  // ============================================================
  
  /**
   * Obtener un widget KPI específico por su título
   * @param {string} titulo - Título del widget ("Consumo hoy", "Consumo esta semana", "Consumo este mes")
   * @returns {Cypress.Chainable<Object>} - Datos del widget KPI
   */
  obtenerWidgetKPI(titulo) {
    cy.log(`📊 Obteniendo widget KPI: "${titulo}"...`);
    
    return cy.get('body').then(($body) => {
      const widgetData = {
        header: '',
        value_str: '',
        subheader: '',
        porcentaje: '',
        comparacion: '',
        encontrado: false
      };
      
      // Buscar todos los widgets KPI
      const $kpiCards = $body.find(this.kpiCards).filter(':visible');
      
      if ($kpiCards.length === 0) {
        cy.log(`⚠️ No se encontraron widgets KPI`);
        return cy.wrap(widgetData);
      }
      
      // Buscar el widget que coincida con el título
      let $widgetEncontrado = null;
      
      $kpiCards.each((i, card) => {
        const $card = Cypress.$(card);
        const $heading = $card.find(this.kpiCardHeading);
        
        if ($heading.length > 0) {
          const headingText = $heading.text().trim();
          
          // Comparación flexible del título
          if (headingText.toLowerCase().includes(titulo.toLowerCase()) || 
              titulo.toLowerCase().includes(headingText.toLowerCase())) {
            $widgetEncontrado = $card;
            widgetData.header = headingText;
            return false; // break
          }
        }
      });
      
      if ($widgetEncontrado && $widgetEncontrado.length > 0) {
        // Extraer value_str
        const $value = $widgetEncontrado.find(this.kpiCardValue);
        if ($value.length > 0) {
          const valueText = $value.text().trim();
          // Extraer número + unidad (ej: "16K kWh")
          const valueMatch = valueText.match(/(\d+(?:\.\d+)?[KMB]?)\s*kWh/i);
          if (valueMatch) {
            widgetData.value_str = `${valueMatch[1]} kWh`;
          } else {
            widgetData.value_str = valueText;
          }
        }
        
        // Extraer subheader (precio)
        const $subheader = $widgetEncontrado.find(this.kpiCardSubheader);
        if ($subheader.length > 0) {
          const subheaderText = $subheader.text().trim();
          const precioMatch = subheaderText.match(/\$[\d.]+[KMB]?\s*COP/i);
          if (precioMatch) {
            widgetData.subheader = precioMatch[0].trim();
          }
        }
        
        // Extraer porcentaje y comparación (tag)
        const $tag = $widgetEncontrado.find('.bia-tag');
        if ($tag.length > 0) {
          const tagText = $tag.text().trim();
          const porcentajeMatch = tagText.match(/([+-]?\d+%)/);
          if (porcentajeMatch) {
            widgetData.porcentaje = porcentajeMatch[1];
          }
        }
        
        // Extraer texto de comparación
        const $comparacion = $widgetEncontrado.find('.CardWidget_comparison__EBA5L');
        if ($comparacion.length > 0) {
          widgetData.comparacion = $comparacion.text().trim();
        }
        
        widgetData.encontrado = true;
        
        cy.log(`✅ Widget KPI encontrado: "${widgetData.header}"`);
        cy.log(`   📊 Valor: ${widgetData.value_str}`);
        cy.log(`   💰 Precio: ${widgetData.subheader || 'N/A'}`);
        if (widgetData.porcentaje) {
          cy.log(`   📈 Variación: ${widgetData.porcentaje}`);
        }
      } else {
        cy.log(`⚠️ No se encontró el widget KPI con título: "${titulo}"`);
      }
      
      return cy.wrap(widgetData);
    });
  }
  
  /**
   * Obtener todos los widgets KPI de consumo
   * Busca por múltiples selectores para asegurar que encuentra todos los widgets
   * @returns {Cypress.Chainable<Object>} - Objeto con todos los widgets KPI
   */
  obtenerTodosLosWidgetsKPI() {
    cy.log('📊 Obteniendo todos los widgets KPI...');
    
    return cy.get('body').then(($body) => {
      const widgetsData = {};
      const widgetsEncontrados = new Set(); // Para evitar duplicados
      
      // Estrategia 1: Buscar por data-demo-target="kpi-card"
      const $kpiCards1 = $body.find('[data-demo-target="kpi-card"]').filter(':visible');
      cy.log(`🔍 Estrategia 1 (data-demo-target): ${$kpiCards1.length} widget(s)`);
      
      // Estrategia 2: Buscar por clase bia-kpi-card directamente
      const $kpiCards2 = $body.find('.bia-kpi-card').filter(':visible');
      cy.log(`🔍 Estrategia 2 (clase bia-kpi-card): ${$kpiCards2.length} widget(s)`);
      
      // Estrategia 3: Buscar por CardWidget_container que contiene widgets KPI
      const $kpiCards3 = $body.find('.CardWidget_container__d_EnN').filter(':visible');
      cy.log(`🔍 Estrategia 3 (CardWidget_container): ${$kpiCards3.length} widget(s)`);
      
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
        
        // Buscar el heading dentro del card
        let $heading = $card.find(this.kpiCardHeading);
        
        // Si no encuentra con el selector específico, buscar por texto
        if ($heading.length === 0) {
          $heading = $card.find('.bia-kpi-card__heading');
        }
        
        // Si aún no encuentra, buscar cualquier elemento con texto que parezca un título
        if ($heading.length === 0) {
          $heading = $card.find('*').filter((i, el) => {
            const $el = Cypress.$(el);
            const text = $el.text().trim();
            // Buscar textos que parezcan títulos de widgets KPI
            return (text.includes('Consumo') || text.includes('Reactiva') || text.includes('reactiva')) &&
                   text.length < 50 && // Títulos no son muy largos
                   $el.is(':visible');
          }).first();
        }
        
        if ($heading.length > 0) {
          const header = $heading.text().trim();
          
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
            porcentaje: '',
            comparacion: ''
          };
          
          // Extraer value_str (puede ser kWh, kVArh, o otros formatos)
          let $value = $card.find(this.kpiCardValue);
          if ($value.length === 0) {
            $value = $card.find('.bia-kpi-card__value');
          }
          
          if ($value.length > 0) {
            const valueText = $value.text().trim();
            // Buscar diferentes formatos: kWh, kVArh, o solo números
            const valueMatch = valueText.match(/(\d+(?:\.\d+)?[KMB]?)\s*(kWh|kVArh|kVAh)?/i);
            if (valueMatch) {
              const unidad = valueMatch[2] || 'kWh';
              widgetData.value_str = `${valueMatch[1]} ${unidad}`;
            } else {
              // Si no hay unidad, usar el texto completo
              widgetData.value_str = valueText;
            }
          }
          
          // Extraer subheader
          let $subheader = $card.find(this.kpiCardSubheader);
          if ($subheader.length === 0) {
            $subheader = $card.find('.CardWidget_subheaderContainer__nhRnz');
          }
          
          if ($subheader.length > 0) {
            const subheaderText = $subheader.text().trim();
            const precioMatch = subheaderText.match(/\$[\d.]+[KMB]?\s*COP/i);
            if (precioMatch) {
              widgetData.subheader = precioMatch[0].trim();
            }
          }
          
          // Extraer porcentaje
          const $tag = $card.find('.bia-tag');
          if ($tag.length > 0) {
            const tagText = $tag.text().trim();
            const porcentajeMatch = tagText.match(/([+-]?\d+%)/);
            if (porcentajeMatch) {
              widgetData.porcentaje = porcentajeMatch[1];
            }
          }
          
          // Extraer comparación
          const $comparacion = $card.find('.CardWidget_comparison__EBA5L');
          if ($comparacion.length > 0) {
            widgetData.comparacion = $comparacion.text().trim();
          }
          
          widgetsData[header] = widgetData;
          
          cy.log(`✅ Widget ${index + 1} extraído: "${header}"`);
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
   * Obtener el widget de Reactiva Inductiva Penalizada específicamente
   * @returns {Cypress.Chainable<Object>} - Datos del widget
   */
  obtenerWidgetReactivaInductivaPenalizada() {
    cy.log('⚡ Obteniendo widget de Reactiva Inductiva Penalizada...');
    
    return this.obtenerWidgetKPI('Reactiva inductiva penalizada').then((widget) => {
      if (!widget.encontrado) {
        // Intentar variaciones del nombre
        return this.obtenerWidgetKPI('reactiva inductiva').then((widget2) => {
          if (!widget2.encontrado) {
            return this.obtenerWidgetKPI('reactiva').then((widget3) => {
              return cy.wrap(widget3);
            });
          }
          return cy.wrap(widget2);
        });
      }
      return cy.wrap(widget);
    });
  }

  // ============================================================
  // MÉTODOS PARA GRÁFICA DE CONSUMO ENERGÉTICO
  // ============================================================
  
  /**
   * Verificar y obtener datos de la gráfica de consumo energético
   * @returns {Cypress.Chainable<Object>} - Datos de la gráfica
   */
  verificarGraficaConsumo() {
    cy.log('📊 Verificando gráfica de consumo energético...');
    
    return cy.get('body').then(($body) => {
      const graficaData = {
        encontrada: false,
        titulo: '',
        tieneCanvas: false
      };
      
      // Buscar usando selector específico con data-*
      const $graficaContainer = $body.find(this.graficaConsumoContainer).filter(':visible');
      
      if ($graficaContainer.length > 0) {
        graficaData.encontrada = true;
        
        // Extraer título
        const $titulo = $graficaContainer.find(this.graficaConsumoTitulo);
        if ($titulo.length > 0) {
          graficaData.titulo = $titulo.text().trim();
        }
        
        // Verificar que tenga canvas (gráfica renderizada)
        const $canvas = $graficaContainer.find(this.graficaConsumoCanvas);
        if ($canvas.length > 0) {
          graficaData.tieneCanvas = true;
        }
        
        cy.log(`✅ Gráfica encontrada: "${graficaData.titulo}"`);
        cy.log(`   🎨 Canvas renderizado: ${graficaData.tieneCanvas ? 'Sí' : 'No'}`);
      } else {
        // Fallback: buscar por texto
        const $graficaElements = $body.find('*').filter((i, el) => {
          const $el = Cypress.$(el);
          const text = $el.text().trim().toLowerCase();
          return text.includes('consumo energético') || text.includes('consumo energetico');
        });
        
        if ($graficaElements.length > 0) {
          graficaData.encontrada = true;
          graficaData.titulo = $graficaElements.first().text().trim();
          cy.log(`✅ Gráfica encontrada (fallback): "${graficaData.titulo}"`);
        } else {
          cy.log('⚠️ No se encontró la gráfica de consumo energético');
        }
      }
      
      return cy.wrap(graficaData);
    });
  }

  // ============================================================
  // MÉTODOS PARA WIDGET DE FACTURAS
  // ============================================================
  
  /**
   * Verificar y obtener datos del widget de facturas
   * @returns {Cypress.Chainable<Object>} - Datos del widget de facturas
   */
  verificarFacturas() {
    cy.log('💰 Verificando widget de facturas...');
    
    return cy.get('body').then(($body) => {
      const facturasData = {
        encontrada: false,
        header: '',
        proximaFactura: '',
        mes: '',
        limitePago: '',
        estado: ''
      };
      
      // Buscar usando selector específico con data-*
      const $facturasContainer = $body.find(this.facturasContainer).filter(':visible');
      
      if ($facturasContainer.length > 0) {
        facturasData.encontrada = true;
        facturasData.header = 'Facturas';
        
        // Extraer título
        const $titulo = $facturasContainer.find(this.facturasTitulo);
        if ($titulo.length > 0) {
          facturasData.header = $titulo.text().trim();
        }
        
        // Extraer datos de la tabla
        const $rows = $facturasContainer.find('.TableWidget_row__QPWFB');
        $rows.each((i, row) => {
          const $row = Cypress.$(row);
          const rowText = $row.text().trim();
          
          if (rowText.includes('Próxima factura')) {
            const match = rowText.match(/Próxima factura\s+(.+)/i);
            if (match) {
              facturasData.proximaFactura = match[1].trim();
            }
          } else if (rowText.includes('Mes')) {
            const match = rowText.match(/Mes\s+(.+)/i);
            if (match) {
              facturasData.mes = match[1].trim();
            }
          } else if (rowText.includes('Límite de pago')) {
            const match = rowText.match(/Límite de pago\s+(.+)/i);
            if (match) {
              facturasData.limitePago = match[1].trim();
            }
          }
        });
        
        // Extraer estado (tag)
        const $tag = $facturasContainer.find('.bia-tag');
        if ($tag.length > 0) {
          facturasData.estado = $tag.text().trim();
        }
        
        cy.log(`✅ Widget de facturas encontrado`);
        cy.log(`   📅 Próxima factura: ${facturasData.proximaFactura || 'N/A'}`);
        cy.log(`   📆 Mes: ${facturasData.mes || 'N/A'}`);
        cy.log(`   ⏰ Límite de pago: ${facturasData.limitePago || 'N/A'}`);
        cy.log(`   ✅ Estado: ${facturasData.estado || 'N/A'}`);
      } else {
        // Fallback: buscar por texto
        const $facturasElements = $body.find('*').filter((i, el) => {
          const $el = Cypress.$(el);
          const text = $el.text().trim();
          return text.includes('Facturas') && $el.is(':visible');
        });
        
        if ($facturasElements.length > 0) {
          facturasData.encontrada = true;
          facturasData.header = 'Facturas';
          cy.log(`✅ Widget de facturas encontrado (fallback)`);
        } else {
          cy.log('⚠️ No se encontró el widget de facturas');
        }
      }
      
      return cy.wrap(facturasData);
    });
  }

  // ============================================================
  // MÉTODOS PARA WIDGET DE VARIACIONES DE CONSUMO
  // ============================================================
  
  /**
   * Verificar y obtener datos del widget de variaciones de consumo
   * @returns {Cypress.Chainable<Object>} - Datos del widget de variaciones
   */
  verificarVariacionesConsumo() {
    cy.log('📈 Verificando widget de variaciones de consumo...');
    
    return cy.get('body').then(($body) => {
      const variacionesData = {
        encontrada: false,
        header: '',
        filas: []
      };
      
      // Buscar usando selector específico con data-*
      const $variacionesContainer = $body.find(this.variacionesContainer).filter(':visible');
      
      if ($variacionesContainer.length > 0) {
        variacionesData.encontrada = true;
        variacionesData.header = 'Variaciones de consumo';
        
        // Extraer título
        const $titulo = $variacionesContainer.find(this.variacionesTitulo);
        if ($titulo.length > 0) {
          variacionesData.header = $titulo.text().trim();
        }
        
        // Extraer filas de la tabla
        const $rows = $variacionesContainer.find('tbody tr');
        $rows.each((i, row) => {
          const $row = Cypress.$(row);
          const rowData = {
            sede: '',
            ciudad: '',
            periodo1: '',
            periodo2: '',
            variacion: '',
            porcentaje: ''
          };
          
          // Extraer nombre de sede
          const $sedeName = $row.find('.TableWidget_siteName__9szEm');
          if ($sedeName.length > 0) {
            rowData.sede = $sedeName.text().trim();
          }
          
          // Extraer ciudad
          const $ciudad = $row.find('.TableWidget_siteCity__JpFok');
          if ($ciudad.length > 0) {
            rowData.ciudad = $ciudad.text().trim();
          }
          
          // Extraer valores de períodos y variación
          const $cells = $row.find('td');
          if ($cells.length >= 5) {
            // Asumir estructura: Sede | Periodo1 | Periodo2 | Variación | Porcentaje
            const periodo1Text = Cypress.$($cells[1]).text().trim();
            const periodo2Text = Cypress.$($cells[2]).text().trim();
            const variacionText = Cypress.$($cells[3]).text().trim();
            
            rowData.periodo1 = periodo1Text;
            rowData.periodo2 = periodo2Text;
            rowData.variacion = variacionText;
            
            // Extraer porcentaje del tag
            const $tag = Cypress.$($cells[4]).find('.bia-tag');
            if ($tag.length > 0) {
              rowData.porcentaje = $tag.text().trim();
            }
          }
          
          if (rowData.sede) {
            variacionesData.filas.push(rowData);
          }
        });
        
        cy.log(`✅ Widget de variaciones encontrado`);
        cy.log(`   📊 Filas encontradas: ${variacionesData.filas.length}`);
      } else {
        // Fallback: buscar por texto
        const $variacionesElements = $body.find('*').filter((i, el) => {
          const $el = Cypress.$(el);
          const text = $el.text().trim();
          return text.includes('Variaciones de consumo') && $el.is(':visible');
        });
        
        if ($variacionesElements.length > 0) {
          variacionesData.encontrada = true;
          variacionesData.header = 'Variaciones de consumo';
          cy.log(`✅ Widget de variaciones encontrado (fallback)`);
        } else {
          cy.log('⚠️ No se encontró el widget de variaciones de consumo');
        }
      }
      
      return cy.wrap(variacionesData);
    });
  }

  // ============================================================
  // MÉTODOS COMPATIBILIDAD (MANTENER PARA NO ROMPER TESTS EXISTENTES)
  // ============================================================
  
  /**
   * Obtener datos de widgets desde el UI
   * Extrae SOLO los widgets KPI que están visibles en el frontend
   * @returns {Cypress.Chainable<Object>} - Datos de widgets
   */
  obtenerDatosWidgets() {
    cy.log('📊 Obteniendo datos de los widgets desde el UI...');
    
    // Usar el nuevo método mejorado para widgets KPI
    return this.obtenerTodosLosWidgetsKPI().then((kpiWidgets) => {
      // Convertir al formato esperado por los tests existentes
      const widgetsData = {};
      
      Object.keys(kpiWidgets).forEach((key) => {
        widgetsData[key] = {
          header: kpiWidgets[key].header,
          value_str: kpiWidgets[key].value_str,
          subheader: kpiWidgets[key].subheader
        };
      });
      
      cy.log(`📊 Total widgets KPI extraídos del UI: ${Object.keys(widgetsData).length}`);
      cy.log(`   Widgets encontrados: ${Object.keys(widgetsData).join(', ')}`);
      
      return cy.wrap(widgetsData);
    });
  }

  // ============================================================
  // MÉTODOS ADICIONALES (COMPATIBILIDAD)
  // ============================================================
  
  /**
   * Verificar si existe el proceso de instalación (método legacy)
   * @returns {Cypress.Chainable<Object>} - Datos del proceso
   */
  verificarProcesoInstalacion() {
    cy.log('🔧 Verificando proceso de instalación...');
    
    return cy.get('body').then(($body) => {
      const procesoData = {
        encontrado: false,
        header: ''
      };
      
      // Buscar elementos que contengan "Proceso de instalación"
      const $procesoElements = $body.find('*').filter((i, el) => {
        const $el = Cypress.$(el);
        const text = $el.text().trim();
        return text.includes('Proceso de instalación') && $el.is(':visible');
      });
      
      if ($procesoElements.length > 0) {
        procesoData.encontrado = true;
        procesoData.header = 'Proceso de instalación';
        cy.log('✅ Proceso de instalación encontrado');
      } else {
        cy.log('⚠️ No se encontró el proceso de instalación');
      }
      
      return cy.wrap(procesoData);
    });
  }

  // ============================================================
  // MÉTODOS DE ESPERA Y CONFIGURACIÓN
  // ============================================================
  
  /**
   * Limpiar cache del navegador antes de cargar widgets
   * Esto asegura que siempre se obtengan datos frescos del API
   * NO limpia cookies de autenticación para mantener la sesión
   */
  limpiarCache() {
    cy.log('🧹 Limpiando cache del navegador (manteniendo sesión)...');
    
    // Limpiar localStorage (excepto datos de autenticación si es necesario)
    cy.window().then((win) => {
      // Guardar datos importantes de autenticación si existen
      const authData = {};
      const authKeys = ['userData', 'bia_session_profile', 'persistSession', 'bia_auth_in_progress'];
      
      authKeys.forEach(key => {
        const value = win.localStorage.getItem(key);
        if (value) {
          authData[key] = value;
        }
      });
      
      // Limpiar todo localStorage
      win.localStorage.clear();
      
      // Restaurar datos de autenticación
      Object.keys(authData).forEach(key => {
        win.localStorage.setItem(key, authData[key]);
      });
      
      cy.log('   ✅ localStorage limpiado (datos de auth preservados)');
    });
    
    // Limpiar sessionStorage
    cy.window().then((win) => {
      win.sessionStorage.clear();
      cy.log('   ✅ sessionStorage limpiado');
    });
    
    // NO limpiar cookies para mantener la sesión de autenticación
    // cy.clearCookies(); // Comentado para mantener sesión
    
    // Limpiar cache del navegador usando cy.reload con opciones
    // Esto se hace mejor con cy.reload({ force: true }) en el test
    
    // Esperar un momento para que se complete la limpieza
    cy.wait(500);
    
    cy.log('✅ Cache limpiado (sesión preservada)');
  }
  
  /**
   * Esperar a que los widgets carguen completamente
   * @param {number} timeout - Tiempo máximo de espera en ms
   */
  esperarWidgetsCarguen(timeout = 20000) {
    cy.log('⏳ Esperando a que los widgets del home carguen...');
    
    // NO limpiar cache aquí para evitar recargas innecesarias
    // El cache se limpia antes de llegar a esta función si es necesario
    
    // Esperar contenedor principal
    cy.get(this.homeContainer, { timeout }).should('exist');
    cy.get(this.homeGrid, { timeout }).should('exist');
    
    // Esperar al menos un widget KPI
    cy.get(this.kpiCards, { timeout }).should('exist').should('have.length.at.least', 1);
    
    // Esperar un momento adicional para que los datos se rendericen
    cy.wait(2000);
    
    cy.log('✅ Widgets cargados');
  }

  /**
   * Interceptar la llamada al API de widgets
   */
  interceptarApiWidgets() {
    cy.log('🔗 Interceptando llamada al API de widgets...');
    
    // Interceptar y modificar la request para evitar cache
    return cy.intercept('POST', '**/ems-api/app-consumptions/home/widgets', (req) => {
      // Agregar headers para evitar cache
      req.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      req.headers['Pragma'] = 'no-cache';
      req.headers['Expires'] = '0';
      
      // Agregar timestamp al body para forzar nueva request
      if (req.body && typeof req.body === 'object') {
        req.body._nocache = Date.now();
      }
      
      req.continue();
    }).as('getWidgetsApi');
  }

  /**
   * Obtener datos del API de widgets desde la interceptación
   * @returns {Cypress.Chainable<Object>} - Respuesta del API
   */
  obtenerDatosApiWidgets() {
    cy.log('📡 Esperando respuesta del API de widgets...');
    
    return cy.wait('@getWidgetsApi', { timeout: 30000 }).then((interception) => {
      if (interception.response && interception.response.body) {
        cy.log('✅ Datos del API obtenidos exitosamente');
        return cy.wrap(interception.response.body);
      } else {
        cy.log('⚠️ No se obtuvo respuesta del API');
        return cy.wrap(null);
      }
    });
  }
}

export default HomeWidgetsPage;
