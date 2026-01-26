// cypress/pages/Home/HomeWidgetsPage.js
class HomeWidgetsPage {
  // Selectores para los widgets del home
  // Nota: Estos selectores pueden necesitar ajustarse según la estructura real del DOM
  
  // Selector genérico para contenedor de widgets
  get widgetsContainer() { return '[data-testid="home-widgets"], .home-widgets, [class*="widget"]'; }
  
  // Métodos para obtener datos de los widgets desde el UI
  // Usa navegación del DOM (parent, siblings, children) para encontrar elementos relacionados
  obtenerDatosWidgets() {
    cy.log('📊 Obteniendo datos de los widgets desde el UI usando navegación del DOM...');
    
    return cy.get('body').then(($body) => {
      const widgetsData = {};
      
      // Buscar todos los elementos que contengan "Consumo" y tengan valores numéricos
      const $todosLosElementos = $body.find('*');
      const widgetsEncontrados = [];
      
      // Buscar elementos que contengan patrones de consumo
      $todosLosElementos.each((i, el) => {
        const $el = Cypress.$(el);
        const text = $el.text().trim();
        
        // Buscar patrones de consumo: "Consumo hoy", "Consumo esta semana", "Consumo este mes", etc.
        const consumoMatch = text.match(/(Consumo\s+(?:hoy|esta\s+semana|este\s+mes|energético))/i);
        
        if (consumoMatch && $el.is(':visible')) {
          // Verificar que también tenga un valor numérico (kWh) cerca
          const tieneValor = text.match(/\d+(?:\.\d+)?[KMB]?\s*kWh/i);
          
          if (tieneValor) {
            widgetsEncontrados.push({
              elemento: $el,
              texto: text,
              headerMatch: consumoMatch[1]
            });
          }
        }
      });
      
      cy.log(`🔍 Encontrados ${widgetsEncontrados.length} elementos con patrón de consumo`);
      
      // Procesar cada widget encontrado
      widgetsEncontrados.forEach((widgetInfo, index) => {
        const $tituloElement = widgetInfo.elemento;
        const textoCompleto = widgetInfo.texto;
        const headerMatch = widgetInfo.headerMatch;
        
        cy.log(`📋 Procesando widget ${index + 1}/${widgetsEncontrados.length}: "${headerMatch}"`);
        
        // Buscar el contenedor del widget
        let $widget = $tituloElement.parents('[class*="card"], [class*="widget"], [class*="metric"], [class*="MuiCard"]').first();
        
        if ($widget.length === 0) {
          $widget = $tituloElement.closest('div').parent();
        }
        
        if ($widget.length === 0) {
          $widget = $tituloElement.parent();
        }
        
        // Extraer header
        let header = headerMatch;
        
        // Buscar header más específico en el texto
        const headerPatterns = [
          /(Consumo\s+hoy)/i,
          /(Consumo\s+esta\s+semana)/i,
          /(Consumo\s+este\s+mes)/i,
          /(Consumo\s+energético)/i
        ];
        
        for (const pattern of headerPatterns) {
          const match = textoCompleto.match(pattern);
          if (match) {
            header = match[1].trim();
            break;
          }
        }
        
        // Extraer value_str
        let value_str = '';
        const valueMatch = textoCompleto.match(/(\d+(?:\.\d+)?[KMB]?\s*kWh)/gi);
        if (valueMatch) {
          value_str = valueMatch[0].trim();
        } else {
          // Buscar en el contenedor del widget
          const widgetText = $widget.length > 0 ? $widget.text() : textoCompleto;
          const valueMatch2 = widgetText.match(/(\d+(?:\.\d+)?[KMB]?\s*kWh)/gi);
          if (valueMatch2) {
            value_str = valueMatch2[0].trim();
          }
        }
        
        // Extraer subheader
        let subheader = '';
        const subheaderMatch = textoCompleto.match(/\$[\d.]+[KMB]?\s*COP/gi);
        if (subheaderMatch) {
          subheader = subheaderMatch[0].trim();
        } else {
          const widgetText = $widget.length > 0 ? $widget.text() : textoCompleto;
          const subheaderMatch2 = widgetText.match(/\$[\d.]+[KMB]?\s*COP/gi);
          if (subheaderMatch2) {
            subheader = subheaderMatch2[0].trim();
          }
        }
        
        if (header && (value_str || subheader)) {
          widgetsData[header] = {
            header: header,
            value_str: value_str,
            subheader: subheader
          };
          
          cy.log(`✅ Widget extraído: "${header}"`);
          cy.log(`   - value_str: ${value_str || 'N/A'}`);
          cy.log(`   - subheader: ${subheader || 'N/A'}`);
        }
      });
      
      // También buscar otros widgets que puedan tener consumo pero con diferentes nombres
      // Buscar "reactiva inductiva penalizada" u otros widgets
      const $otrosWidgets = $body.find('*').filter((i, el) => {
        const $el = Cypress.$(el);
        const text = $el.text().trim().toLowerCase();
        return (text.includes('reactiva') || text.includes('inductiva') || text.includes('penalizada')) &&
               $el.is(':visible') &&
               text.match(/\d+(?:\.\d+)?[kmb]?\s*kwh/i);
      });
      
      if ($otrosWidgets.length > 0) {
        $otrosWidgets.each((i, el) => {
          const $el = Cypress.$(el);
          const texto = $el.text();
          const headerMatch = texto.match(/([^:]*reactiva[^:]*)/i);
          
          if (headerMatch) {
            const header = headerMatch[1].trim();
            const valueMatch = texto.match(/(\d+(?:\.\d+)?[KMB]?\s*kWh)/gi);
            const subheaderMatch = texto.match(/\$[\d.]+[KMB]?\s*COP/gi);
            
            widgetsData[header] = {
              header: header,
              value_str: valueMatch ? valueMatch[0].trim() : '',
              subheader: subheaderMatch ? subheaderMatch[0].trim() : ''
            };
            
            cy.log(`✅ Widget adicional encontrado: "${header}"`);
          }
        });
      }
      
      cy.log(`📊 Total widgets extraídos del UI: ${Object.keys(widgetsData).length}`);
      Object.keys(widgetsData).forEach(key => {
        cy.log(`   - "${key}"`);
      });
      
      return cy.wrap(widgetsData);
    });
    
    // Función auxiliar para buscar datos en un contenedor
    const buscarEnContenedor = ($widget, tituloEsperado, index) => {
      if ($widget.length === 0 || !$widget.is(':visible')) {
        return buscarWidget(index + 1);
      }
      
      // Extraer el header real del widget desde el DOM
      let header = tituloEsperado; // Por defecto usar el título esperado
      
      // Estrategia para extraer el header:
      // 1. Buscar en elementos de título (h1-h6, elementos con class*="title", "header", "label")
      const $headerElements = $widget.find('[class*="title"], [class*="header"], [class*="label"], h1, h2, h3, h4, h5, h6');
      if ($headerElements.length > 0) {
        // Buscar el que contenga el texto del título esperado
        $headerElements.each((i, el) => {
          const $el = Cypress.$(el);
          const text = $el.text().trim();
          // Verificar si contiene alguno de los títulos esperados
          if (titulosEsperados.some(t => text.includes(t) || text === t)) {
            header = text;
            return false; // break
          }
        });
      }
      
      // 2. Si no encontramos header específico, buscar en el texto del widget
      if (header === tituloEsperado) {
        const widgetText = $widget.text();
        const headerMatch = widgetText.match(/(Consumo\s+(?:hoy|esta\s+semana|este\s+mes))/i);
        if (headerMatch) {
          header = headerMatch[1].trim();
        }
      }
      
      let value_str = '';
      let subheader = '';
      
      // Estrategia 1: Buscar en el texto completo del widget
      const widgetText = $widget.text();
      
      // Extraer value_str: número + K/M/B + kWh
      const valueMatch = widgetText.match(/(\d+(?:\.\d+)?[KMB]?\s*kWh)/gi);
      value_str = valueMatch ? valueMatch[0].trim() : '';
      
      // Estrategia 2: Si no encontramos, buscar en elementos hijos específicos
      if (!value_str) {
        const $valueElements = $widget.find('[class*="value"], [class*="amount"], [class*="number"], h1, h2, h3, h4, h5, h6');
        $valueElements.each((i, el) => {
          const $el = Cypress.$(el);
          const text = $el.text();
          const match = text.match(/(\d+(?:\.\d+)?[KMB]?\s*kWh)/gi);
          if (match && !value_str) {
            value_str = match[0].trim();
            return false; // break
          }
        });
      }
      
      // Extraer subheader: $ + número + K/M/B + COP
      const subheaderMatch = widgetText.match(/\$[\d.]+[KMB]?\s*COP/gi);
      subheader = subheaderMatch ? subheaderMatch[0].trim() : '';
      
      // Estrategia 3: Buscar en elementos que contengan $ y COP
      if (!subheader) {
        const $subheaderElements = $widget.find('*').filter((i, el) => {
          const $el = Cypress.$(el);
          const text = $el.text();
          return text.includes('$') && text.includes('COP');
        });
        
        if ($subheaderElements.length > 0) {
          const subheaderText = $subheaderElements.first().text();
          const match = subheaderText.match(/\$[\d.]+[KMB]?\s*COP/gi);
          subheader = match ? match[0].trim() : '';
        }
      }
      
      if (value_str || subheader) {
        widgetsData[header] = {
          header: header,
          value_str: value_str,
          subheader: subheader
        };
        
        cy.log(`✅ Widget encontrado: ${header}`);
        cy.log(`   - header: ${header}`);
        cy.log(`   - value_str: ${value_str || 'No encontrado'}`);
        cy.log(`   - subheader: ${subheader || 'No encontrado'}`);
      } else {
        cy.log(`⚠️ Widget encontrado pero sin datos: ${header}`);
      }
      
      return buscarWidget(index + 1);
    };
    
    return buscarWidget(0);
  }
  
  // Método auxiliar para extraer datos usando navegación del DOM desde un elemento título
  extraerDatosDesdeTitulo($tituloElement) {
    const datos = {
      value_str: '',
      subheader: ''
    };
    
    // Navegar al contenedor padre del widget
    const $widget = $tituloElement.parents('[class*="card"], [class*="widget"]').first();
    
    if ($widget.length > 0) {
      // Buscar value_str en elementos hijos específicos
      const $valueElement = $widget.find('[class*="value"], [class*="amount"], h1, h2, h3').first();
      if ($valueElement.length > 0) {
        const valueText = $valueElement.text();
        const match = valueText.match(/(\d+(?:\.\d+)?[KMB]?\s*kWh)/gi);
        datos.value_str = match ? match[0].trim() : '';
      }
      
      // Buscar subheader en elementos que contengan $
      const $subheaderElement = $widget.find('*').filter((i, el) => {
        return Cypress.$(el).text().includes('$') && Cypress.$(el).text().includes('COP');
      }).first();
      
      if ($subheaderElement.length > 0) {
        const subheaderText = $subheaderElement.text();
        const match = subheaderText.match(/\$[\d.]+[KMB]?\s*COP/gi);
        datos.subheader = match ? match[0].trim() : '';
      }
    }
    
    return datos;
  }

  // Método para esperar a que los widgets carguen
  esperarWidgetsCarguen() {
    cy.log('⏳ Esperando a que los widgets del home carguen...');
    
    // Esperar a que aparezcan los widgets o algún indicador de carga
    cy.get('[class*="widget"], [data-testid*="widget"], [class*="card"], [class*="chart"]', { timeout: 20000 })
      .should('exist')
      .should('have.length.at.least', 1);
    
    // Esperar un momento adicional para que los datos se rendericen
    cy.wait(2000);
    
    cy.log('✅ Widgets cargados');
  }

  // Método para obtener datos específicos de widgets de consumo
  obtenerDatosConsumo() {
    cy.log('📈 Obteniendo datos de consumo desde los widgets...');
    
    return cy.get('body').then(() => {
      const consumoData = {};
      
      // Buscar widgets relacionados con consumo
      // Ajustar selectores según la estructura real del DOM
      cy.get('[class*="consumo"], [class*="consumption"], [data-testid*="consumption"]', { timeout: 10000 })
        .should('exist')
        .then(($consumoWidgets) => {
          $consumoWidgets.each((index, widget) => {
            const $widget = Cypress.$(widget);
            const title = $widget.find('[class*="title"], [class*="label"]').first().text();
            const value = $widget.find('[class*="value"], [class*="amount"]').first().text();
            
            if (title && value) {
              consumoData[title.trim()] = value.trim();
            }
          });
        });
      
      return cy.wrap(consumoData);
    });
  }

  // Método para obtener datos del saludo/bienvenida
  obtenerDatosSaludo() {
    cy.log('👋 Obteniendo datos del saludo...');
    
    return cy.get('body').then(($body) => {
      const saludoData = {
        header: '',
        value_str: '',
        encontrado: false
      };
      
      // Buscar saludo que contenga "Buenas" o "Buenos"
      const $saludoElements = $body.find('*').filter((i, el) => {
        const $el = Cypress.$(el);
        const text = $el.text().trim();
        return text.includes('Buenas') || text.includes('Buenos');
      });
      
      if ($saludoElements.length > 0) {
        const $saludo = $saludoElements.first();
        const saludoText = $saludo.text();
        
        // Extraer header (ej: "¡Buenas tardes, karen!")
        const headerMatch = saludoText.match(/(¡?Buenas?\s+(?:tardes|días|noches)[^!]*!?)/i);
        if (headerMatch) {
          saludoData.header = headerMatch[1].trim();
        }
        
        // Buscar value_str (fecha y sedes) - puede estar en el mismo elemento o en elementos hermanos
        const valueMatch = saludoText.match(/(\d+\s+de\s+\w+,\s+\d{4}[^·]*·\s*\d+\s+Sedes?)/i);
        if (valueMatch) {
          saludoData.value_str = valueMatch[1].trim();
        } else {
          // Buscar en elementos cercanos
          const $parent = $saludo.parent();
          const parentText = $parent.text();
          const valueMatch2 = parentText.match(/(\d+\s+de\s+\w+,\s+\d{4}[^·]*·\s*\d+\s+Sedes?)/i);
          if (valueMatch2) {
            saludoData.value_str = valueMatch2[1].trim();
          }
        }
        
        saludoData.encontrado = true;
      }
      
      return cy.wrap(saludoData);
    });
  }

  // Método para verificar si existe la gráfica de consumo energético
  verificarGraficaConsumo() {
    cy.log('📊 Verificando gráfica de consumo energético...');
    
    return cy.get('body').then(($body) => {
      const graficaData = {
        encontrada: false,
        titulo: ''
      };
      
      // Buscar elementos que contengan "Consumo energético" o "consumo energético"
      const $graficaElements = $body.find('*').filter((i, el) => {
        const $el = Cypress.$(el);
        const text = $el.text().trim().toLowerCase();
        return text.includes('consumo energético') || text.includes('consumo energetico');
      });
      
      if ($graficaElements.length > 0) {
        graficaData.encontrada = true;
        graficaData.titulo = $graficaElements.first().text().trim();
      }
      
      return cy.wrap(graficaData);
    });
  }

  // Método para verificar si existe el modal/sección de facturas
  verificarFacturas() {
    cy.log('💰 Verificando sección de facturas...');
    
    return cy.get('body').then(($body) => {
      const facturasData = {
        encontrada: false,
        header: '',
        texto: ''
      };
      
      // Buscar elementos que contengan "Facturas"
      const $facturasElements = $body.find('*').filter((i, el) => {
        const $el = Cypress.$(el);
        const text = $el.text().trim();
        return text.includes('Facturas') || text === 'Facturas';
      });
      
      if ($facturasElements.length > 0) {
        facturasData.encontrada = true;
        const $factura = $facturasElements.first();
        facturasData.header = 'Facturas';
        facturasData.texto = $factura.text().trim();
      }
      
      return cy.wrap(facturasData);
    });
  }

  // Método para verificar si existe la gráfica de variaciones de consumo
  verificarVariacionesConsumo() {
    cy.log('📈 Verificando gráfica de variaciones de consumo...');
    
    return cy.get('body').then(($body) => {
      const variacionesData = {
        encontrada: false,
        header: ''
      };
      
      // Buscar elementos que contengan "Variaciones de consumo"
      const $variacionesElements = $body.find('*').filter((i, el) => {
        const $el = Cypress.$(el);
        const text = $el.text().trim();
        return text.includes('Variaciones de consumo') || text === 'Variaciones de consumo';
      });
      
      if ($variacionesElements.length > 0) {
        variacionesData.encontrada = true;
        variacionesData.header = 'Variaciones de consumo';
      }
      
      return cy.wrap(variacionesData);
    });
  }

  // Método para verificar si existe el proceso de instalación
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
        return text.includes('Proceso de instalación') || text === 'Proceso de instalación';
      });
      
      if ($procesoElements.length > 0) {
        procesoData.encontrado = true;
        procesoData.header = 'Proceso de instalación';
      }
      
      return cy.wrap(procesoData);
    });
  }

  // Método para interceptar la llamada al API de widgets y obtener los datos
  interceptarApiWidgets() {
    cy.log('🔗 Interceptando llamada al API de widgets...');
    
    return cy.intercept('POST', '**/ems-api/app-consumptions/home/widgets').as('getWidgetsApi');
  }

  // Método para esperar y obtener la respuesta del API de widgets
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
