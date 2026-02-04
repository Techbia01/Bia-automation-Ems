// cypress/pages/Home/GraficasPage.js
class GraficasPage {
  /**
   * Obtener todas las barras de las gráficas visibles en la página
   * @returns {Cypress.Chainable<Array>} - Array de elementos de barras
   */
  obtenerBarrasDeGraficas() {
    cy.log('📊 Buscando barras de gráficas en la página...');
    
    return cy.get('body').then(($body) => {
      const barras = [];
      
      // Buscar barras en diferentes tipos de gráficas:
      // 1. SVG (Recharts, D3, etc.)
      const $svgBarras = $body.find('svg rect, svg path[class*="bar"], svg g[class*="bar"] rect, svg g[class*="bar"] path').filter(':visible');
      
      // 2. Canvas (Chart.js, etc.)
      const $canvas = $body.find('canvas').filter(':visible');
      
      // 3. Elementos con clases relacionadas a barras
      const $claseBarras = $body.find('[class*="bar"], [class*="Bar"], [data-testid*="bar"], [role="img"]').filter(':visible');
      
      // Procesar barras SVG
      $svgBarras.each((i, el) => {
        const $el = Cypress.$(el);
        const $parent = $el.closest('svg');
        
        // Obtener dimensiones del elemento
        const rect = el.getBoundingClientRect();
        const height = rect.height || parseFloat($el.attr('height') || '0');
        const width = rect.width || parseFloat($el.attr('width') || '0');
        
        // Obtener atributos para identificar barras
        const fill = $el.attr('fill') || '';
        const classAttr = $el.attr('class') || '';
        const dataKey = $el.attr('data-key') || '';
        
        // Filtrar barras que sean realmente barras (no ejes, líneas, etc.)
        // Las barras generalmente tienen altura y ancho significativos
        // Y no son transparentes o de color de fondo
        const esBarra = height > 5 && width > 5 && 
                        $parent.length > 0 &&
                        fill !== 'none' &&
                        fill !== 'transparent' &&
                        !classAttr.includes('axis') &&
                        !classAttr.includes('grid') &&
                        !classAttr.includes('line');
        
        if (esBarra) {
          barras.push({
            elemento: el,
            tipo: 'svg',
            svg: $parent[0],
            fill: fill,
            classAttr: classAttr
          });
        }
      });
      
      // Buscar también barras en grupos específicos de Recharts
      const $rechartsBars = $body.find('svg g[class*="recharts-bar"], svg g[class*="recharts-bar-rectangle"] rect').filter(':visible');
      $rechartsBars.each((i, el) => {
        const $el = Cypress.$(el);
        const rect = el.getBoundingClientRect();
        
        if (rect.height > 5 && rect.width > 5) {
          // Verificar que no esté ya en la lista
          const yaExiste = barras.some(b => b.elemento === el);
          if (!yaExiste) {
            barras.push({
              elemento: el,
              tipo: 'svg-recharts',
              fill: $el.attr('fill') || ''
            });
          }
        }
      });
      
      // Procesar canvas (más complejo, necesitaríamos coordenadas)
      $canvas.each((i, el) => {
        barras.push({
          elemento: el,
          tipo: 'canvas'
        });
      });
      
      // Procesar elementos con clases de barras
      $claseBarras.each((i, el) => {
        const $el = Cypress.$(el);
        const rect = el.getBoundingClientRect();
        
        // Verificar que sea visible y tenga dimensiones
        if (rect.height > 5 && rect.width > 5) {
          barras.push({
            elemento: el,
            tipo: 'elemento'
          });
        }
      });
      
      cy.log(`✅ Se encontraron ${barras.length} barra(s) de gráfica(s)`);
      
      return cy.wrap(barras);
    });
  }

  /**
   * Hacer hover sobre una barra específica
   * @param {HTMLElement|Cypress.Chainable} barra - Elemento de la barra
   * @param {number} indice - Índice de la barra (para logging)
   */
  hacerHoverSobreBarra(barra, indice = 0) {
    cy.log(`🖱️ Haciendo hover sobre la barra ${indice + 1}...`);
    
    cy.wrap(barra.elemento)
      .should('be.visible')
      .then(($barra) => {
        // Obtener posición de la barra
        const rect = $barra[0].getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        cy.log(`   📍 Posición: x=${x.toFixed(0)}, y=${y.toFixed(0)}`);
        cy.log(`   📏 Dimensiones: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}`);
        
        // Intentar múltiples métodos de hover para mayor compatibilidad
        // Método 1: Trigger mouseover en el elemento
        cy.wrap($barra)
          .trigger('mouseover', { force: true })
          .trigger('mouseenter', { force: true });
        
        cy.wait(200);
        
        // Método 2: Trigger en coordenadas específicas (más preciso para gráficas)
        cy.get('body').then(($body) => {
          // Hacer hover en el centro de la barra usando coordenadas
          cy.wrap($barra)
            .trigger('mousemove', { 
              clientX: x, 
              clientY: y, 
              force: true 
            })
            .trigger('mouseover', { 
              clientX: x, 
              clientY: y, 
              force: true 
            });
        });
        
        // Esperar un momento para que aparezca el tooltip
        cy.wait(500);
        
        cy.log(`✅ Hover realizado sobre la barra ${indice + 1}`);
      });
  }

  /**
   * Verificar que un tooltip está visible
   * @param {number} timeout - Tiempo máximo de espera en ms
   * @returns {Cypress.Chainable<boolean>} - True si el tooltip está visible
   */
  verificarTooltipVisible(timeout = 3000) {
    cy.log('🔍 Verificando si el tooltip está visible...');
    
    // Primero intentar buscar tooltips comunes con un selector más específico
    return cy.get('body', { timeout }).then(($body) => {
      // Buscar tooltips comunes (incluyendo elementos que aparecen al hacer hover)
      // Priorizar selectores más específicos primero
      const selectoresTooltip = [
        '.recharts-tooltip-wrapper', // Recharts específico
        '[class*="recharts-tooltip"]', // Para Recharts
        '[class*="tooltip"]',
        '[class*="Tooltip"]',
        '[class*="tooltip-wrapper"]',
        '[role="tooltip"]',
        '[data-testid*="tooltip"]',
        '[id*="tooltip"]',
        '[class*="popover"]',
        '[class*="Popover"]',
        '[class*="overlay"]'
      ];
      
      let tooltipEncontrado = false;
      
      // Buscar tooltips visibles
      for (const selector of selectoresTooltip) {
        try {
          const $tooltip = $body.find(selector).filter(':visible');
          if ($tooltip.length > 0) {
            // Verificar que el tooltip tenga contenido y esté realmente visible
            $tooltip.each((i, el) => {
              const $el = Cypress.$(el);
              const texto = $el.text().trim();
              const rect = el.getBoundingClientRect();
              
              // Verificar que tenga texto y dimensiones visibles
              if (texto.length > 0 && rect.width > 0 && rect.height > 0) {
                // Verificar que no sea parte del menú lateral u otros elementos fijos
                const noEsMenuLateral = !$el.closest('[id="notifications"], [id*="sidebar"], [id*="menu"], [id*="nav"]').length;
                
                if (noEsMenuLateral) {
                  cy.log(`✅ Tooltip encontrado con selector: ${selector}`);
                  cy.log(`   📋 Contenido: "${texto.substring(0, 100)}..."`);
                  tooltipEncontrado = true;
                  return false; // break
                }
              }
            });
            
            if (tooltipEncontrado) break;
          }
        } catch (e) {
          // Continuar con el siguiente selector si hay error
          continue;
        }
      }
      
      // Si no encontramos tooltip con selectores específicos, buscar elementos con posición fixed/absolute
      if (!tooltipEncontrado) {
        const $fixedElements = $body.find('*').filter((i, el) => {
          try {
            const $el = Cypress.$(el);
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            const texto = $el.text().trim();
            
            return (style.position === 'fixed' || style.position === 'absolute') &&
                   rect.width > 30 && rect.height > 15 &&
                   texto.length > 0 &&
                   !$el.closest('[id="notifications"], [id*="sidebar"], [id*="menu"], [id*="nav"]').length;
          } catch (e) {
            return false;
          }
        });
        
        if ($fixedElements.length > 0) {
          const texto = $fixedElements.first().text().trim();
          if (texto.length > 0) {
            cy.log(`✅ Tooltip encontrado (elemento con posición fixed/absolute)`);
            cy.log(`   📋 Contenido: "${texto.substring(0, 100)}..."`);
            tooltipEncontrado = true;
          }
        }
      }
      
      // También buscar dentro de SVG (para gráficas)
      if (!tooltipEncontrado) {
        const $svgTooltips = $body.find('svg g[class*="tooltip"], svg [class*="tooltip"]').filter(':visible');
        if ($svgTooltips.length > 0) {
          $svgTooltips.each((i, el) => {
            const $el = Cypress.$(el);
            const texto = $el.text().trim();
            if (texto.length > 0) {
              cy.log(`✅ Tooltip encontrado en SVG`);
              cy.log(`   📋 Contenido: "${texto.substring(0, 100)}..."`);
              tooltipEncontrado = true;
              return false;
            }
          });
        }
      }
      
      if (!tooltipEncontrado) {
        cy.log('⚠️ No se encontró tooltip visible');
      }
      
      return cy.wrap(tooltipEncontrado);
    });
  }

  /**
   * Obtener el contenido del tooltip visible
   * @returns {Cypress.Chainable<Object>} - Objeto con el contenido del tooltip
   */
  obtenerContenidoTooltip() {
    cy.log('📋 Extrayendo contenido del tooltip...');
    
    return cy.get('body').then(($body) => {
      const tooltipData = {
        encontrado: false,
        texto: '',
        elementos: []
      };
      
      // Buscar tooltips
      const selectoresTooltip = [
        '[class*="tooltip"]',
        '[class*="Tooltip"]',
        '[class*="recharts-tooltip"]', // Para Recharts
        '[class*="tooltip-wrapper"]',
        '[role="tooltip"]',
        '[data-testid*="tooltip"]',
        '[id*="tooltip"]',
        '[class*="popover"]',
        '[class*="Popover"]'
      ];
      
      for (const selector of selectoresTooltip) {
        const $tooltip = $body.find(selector).filter(':visible');
        if ($tooltip.length > 0) {
          const texto = $tooltip.first().text().trim();
          if (texto.length > 0) {
            tooltipData.encontrado = true;
            tooltipData.texto = texto;
            
            // Extraer elementos individuales del tooltip
            $tooltip.first().find('*').each((i, el) => {
              const $el = Cypress.$(el);
              const textoEl = $el.text().trim();
              if (textoEl.length > 0 && textoEl !== texto) {
                tooltipData.elementos.push(textoEl);
              }
            });
            
            cy.log(`✅ Tooltip encontrado: "${texto.substring(0, 100)}..."`);
            break;
          }
        }
      }
      
      if (!tooltipData.encontrado) {
        cy.log('⚠️ No se encontró tooltip');
      }
      
      return cy.wrap(tooltipData);
    });
  }

  /**
   * Hacer hover sobre todas las barras de una gráfica y verificar tooltips
   * @param {string} tituloGrafica - Título de la gráfica (opcional, para filtrar)
   * @returns {Cypress.Chainable<Array>} - Array con los resultados de cada hover
   */
  hacerHoverSobreTodasLasBarras(tituloGrafica = null) {
    cy.log('🖱️ Iniciando hover sobre todas las barras de las gráficas...');
    
    if (tituloGrafica) {
      cy.log(`   📊 Filtrando gráfica: "${tituloGrafica}"`);
    }
    
    return this.obtenerBarrasDeGraficas().then((barras) => {
      const resultados = [];
      
      if (barras.length === 0) {
        cy.log('⚠️ No se encontraron barras en las gráficas');
        return cy.wrap([]);
      }
      
      cy.log(`📊 Se encontraron ${barras.length} barra(s) para hacer hover`);
      
      // Hacer hover sobre cada barra
      barras.forEach((barra, indice) => {
        cy.log(`\n🔄 Procesando barra ${indice + 1}/${barras.length}...`);
        
        // Hacer hover
        this.hacerHoverSobreBarra(barra, indice);
        
        // Verificar tooltip
        this.verificarTooltipVisible().then((tooltipVisible) => {
          // Obtener contenido del tooltip si está visible
          if (tooltipVisible) {
            this.obtenerContenidoTooltip().then((tooltipData) => {
              resultados.push({
                indice: indice + 1,
                tooltipVisible: true,
                contenido: tooltipData.texto,
                elementos: tooltipData.elementos
              });
              
              cy.log(`✅ Barra ${indice + 1}: Tooltip visible`);
              cy.log(`   📋 Contenido: "${tooltipData.texto.substring(0, 80)}..."`);
            });
          } else {
            resultados.push({
              indice: indice + 1,
              tooltipVisible: false,
              contenido: '',
              elementos: []
            });
            
            cy.log(`⚠️ Barra ${indice + 1}: Tooltip no visible`);
          }
        });
        
        // Esperar un momento antes de pasar a la siguiente barra
        cy.wait(300);
        
        // Quitar el hover antes de pasar a la siguiente
        cy.get('body').trigger('mouseleave', { force: true });
        cy.wait(200);
      });
      
      cy.log(`\n✅ Proceso completado: ${resultados.length} barra(s) procesada(s)`);
      
      return cy.wrap(resultados);
    });
  }

  /**
   * Hacer hover sobre las barras de una gráfica específica por su título
   * @param {string} tituloGrafica - Título de la gráfica (ej: "Excesos de energía reactiva inductiva")
   * @returns {Cypress.Chainable<Array>} - Array con los resultados
   */
  hacerHoverSobreBarrasDeGrafica(tituloGrafica) {
    cy.log(`📊 Buscando gráfica: "${tituloGrafica}"...`);
    
    return cy.get('body').then(($body) => {
      // Buscar el contenedor de la gráfica por su título
      const $titulo = $body.find('*').filter((i, el) => {
        const $el = Cypress.$(el);
        return $el.text().trim().includes(tituloGrafica);
      }).first();
      
      if ($titulo.length === 0) {
        cy.log(`⚠️ No se encontró la gráfica con título: "${tituloGrafica}"`);
        return cy.wrap([]);
      }
      
      cy.log(`✅ Gráfica encontrada: "${tituloGrafica}"`);
      
      // Buscar el contenedor padre de la gráfica
      const $contenedorGrafica = $titulo.closest('[class*="card"], [class*="widget"], [class*="chart"], [class*="graph"]').first();
      
      if ($contenedorGrafica.length === 0) {
        cy.log('⚠️ No se encontró el contenedor de la gráfica');
        return cy.wrap([]);
      }
      
      // Buscar barras dentro del contenedor
      const barras = [];
      
      const $svgBarras = $contenedorGrafica.find('svg rect, svg path[class*="bar"], svg g[class*="bar"] rect').filter(':visible');
      
      $svgBarras.each((i, el) => {
        const $el = Cypress.$(el);
        const height = parseFloat($el.attr('height') || '0');
        const width = parseFloat($el.attr('width') || '0');
        
        if (height > 5 && width > 5) {
          barras.push({
            elemento: el,
            tipo: 'svg'
          });
        }
      });
      
      cy.log(`✅ Se encontraron ${barras.length} barra(s) en la gráfica "${tituloGrafica}"`);
      
      if (barras.length === 0) {
        return cy.wrap([]);
      }
      
      // Hacer hover sobre cada barra
      const resultados = [];
      
      barras.forEach((barra, indice) => {
        cy.log(`\n🔄 Procesando barra ${indice + 1}/${barras.length} de "${tituloGrafica}"...`);
        
        this.hacerHoverSobreBarra(barra, indice);
        
        this.verificarTooltipVisible().then((tooltipVisible) => {
          if (tooltipVisible) {
            this.obtenerContenidoTooltip().then((tooltipData) => {
              resultados.push({
                grafica: tituloGrafica,
                indice: indice + 1,
                tooltipVisible: true,
                contenido: tooltipData.texto,
                elementos: tooltipData.elementos
              });
              
              cy.log(`✅ Barra ${indice + 1}: Tooltip visible`);
              cy.log(`   📋 Contenido: "${tooltipData.texto.substring(0, 80)}..."`);
            });
          } else {
            resultados.push({
              grafica: tituloGrafica,
              indice: indice + 1,
              tooltipVisible: false,
              contenido: '',
              elementos: []
            });
            
            cy.log(`⚠️ Barra ${indice + 1}: Tooltip no visible`);
          }
        });
        
        cy.wait(300);
        cy.get('body').trigger('mouseleave', { force: true });
        cy.wait(200);
      });
      
      cy.log(`\n✅ Proceso completado para "${tituloGrafica}": ${resultados.length} barra(s) procesada(s)`);
      
      return cy.wrap(resultados);
    });
  }

  /**
   * Esperar a que las gráficas carguen completamente
   * @param {number} timeout - Tiempo máximo de espera en ms
   */
  esperarGraficasCarguen(timeout = 10000) {
    cy.log('⏳ Esperando a que las gráficas carguen...');
    
    // Esperar a que aparezcan elementos de gráficas
    cy.get('svg, canvas, [class*="chart"], [class*="graph"]', { timeout })
      .should('exist')
      .should('have.length.at.least', 1);
    
    // Esperar un momento adicional para que se rendericen completamente
    cy.wait(2000);
    
    cy.log('✅ Gráficas cargadas');
  }

  /**
   * Hacer hover optimizado sobre barras clave (primera, media, última) de una gráfica
   * @param {string} tituloGrafica - Título de la gráfica (opcional)
   * @param {number} maxBarras - Número máximo de barras a procesar (default: 3)
   * @returns {Cypress.Chainable<Array>} - Array con resultados del hover
   */
  hacerHoverSobreBarrasClave(tituloGrafica = null, maxBarras = 3) {
    cy.log('🔄 Haciendo hover optimizado sobre barras clave...');
    
    return this.obtenerBarrasDeGraficas().then((todasLasBarras) => {
      if (todasLasBarras.length === 0) {
        cy.log('⚠️ No se encontraron barras para hacer hover');
        return cy.wrap([]);
      }
      
      // Seleccionar barras clave (primera, media, última)
      const totalBarras = Math.min(todasLasBarras.length, maxBarras);
      const barrasClave = [];
      
      if (totalBarras > 0) {
        barrasClave.push({ barra: todasLasBarras[0], indice: 1, tipo: 'primera' });
        
        if (totalBarras > 2) {
          const indiceMedio = Math.floor(totalBarras / 2);
          barrasClave.push({ barra: todasLasBarras[indiceMedio], indice: indiceMedio + 1, tipo: 'media' });
        }
        
        if (totalBarras > 1) {
          barrasClave.push({ barra: todasLasBarras[totalBarras - 1], indice: totalBarras, tipo: 'última' });
        }
      }
      
      cy.log(`📊 Haciendo hover sobre ${barrasClave.length} barra(s) clave...`);
      
      const resultadosHover = [];
      
      // Hacer hover sobre barras clave hasta encontrar el primer tooltip visible
      const graficasPage = this; // Guardar referencia para usar en callbacks
      let tooltipEncontrado = false; // Flag para detener cuando se encuentre un tooltip
      
      return cy.wrap(null).then(() => {
        return barrasClave.reduce((chain, { barra, indice, tipo }) => {
          return chain.then(() => {
            // Si ya encontramos un tooltip, no continuar con más barras
            if (tooltipEncontrado) {
              return cy.wrap(null);
            }
            
            cy.log(`   📊 Hover sobre barra ${indice} (${tipo})...`);
            
            // Hacer hover suave y natural con múltiples eventos para asegurar que funcione
            return cy.wrap(barra.elemento)
              .scrollIntoView({ duration: 300 })
              .wait(400)
              .trigger('mouseover', { force: true, bubbles: true })
              .wait(200)
              .trigger('mouseenter', { force: true, bubbles: true })
              .wait(200)
              .trigger('mousemove', { force: true, bubbles: true })
              .wait(1500) // Esperar tiempo suficiente para que aparezca el tooltip
              .then(() => {
                // Esperar un poco más para asegurar que el tooltip esté completamente renderizado
                cy.wait(500);
                
                // Verificar tooltip usando la referencia guardada
                return graficasPage.verificarTooltipVisible(3000).then((tieneTooltip) => {
                  if (tieneTooltip) {
                    cy.log(`      ✅ Tooltip visible en barra ${indice} (${tipo}) - Continuando al siguiente paso`);
                    resultadosHover.push({ tooltipVisible: true, indice, tipo });
                    tooltipEncontrado = true; // Marcar que encontramos un tooltip
                    cy.wait(1000); // Espera mínima para ver el tooltip antes de continuar
                    
                    // Limpiar hover rápidamente
                    cy.wrap(barra.elemento)
                      .trigger('mouseleave', { force: true })
                      .trigger('mouseout', { force: true });
                    cy.wait(300);
                  } else {
                    cy.log(`      ⚠️ Tooltip no visible en barra ${indice}`);
                    resultadosHover.push({ tooltipVisible: false, indice, tipo });
                    
                    // Limpiar hover de forma suave
                    cy.wrap(barra.elemento)
                      .trigger('mouseleave', { force: true })
                      .trigger('mouseout', { force: true });
                    cy.wait(500);
                  }
                });
              });
          });
        }, cy.wrap(null));
      }).then(() => {
        const tooltipsVisibles = resultadosHover.filter(r => r.tooltipVisible).length;
        if (tooltipEncontrado) {
          cy.log(`✅ Tooltip encontrado - ${tooltipsVisibles} tooltip(s) visible(s) de ${resultadosHover.length} barra(s) procesada(s)`);
        } else {
          cy.log(`⚠️ Hover completado sin tooltips visibles - ${resultadosHover.length} barra(s) procesada(s)`);
        }
        return cy.wrap({ resultados: resultadosHover, tooltipEncontrado });
      });
    });
  }

  /**
   * Hacer clic en una barra de gráfica y cerrar modal si se abre
   * @param {number} indiceBarra - Índice de la barra (default: 0 para la primera)
   */
  hacerClicEnBarraYCerrarModal(indiceBarra = 0) {
    cy.log(`🖱️ Haciendo clic en la barra ${indiceBarra + 1}...`);
    
    return this.obtenerBarrasDeGraficas().then((todasLasBarras) => {
      if (todasLasBarras.length === 0) {
        cy.log('⚠️ No hay barras disponibles');
        return cy.wrap(null);
      }
      
      const barra = todasLasBarras[indiceBarra];
      
      return cy.wrap(barra.elemento)
        .scrollIntoView()
        .click({ force: true })
        .then(() => {
          cy.wait(1000);
          
          // Cerrar modal si se abrió
          cy.get('body').then(($body) => {
            const $modal = $body.find('[role="dialog"], [class*="modal"]').filter(':visible').first();
            if ($modal.length > 0) {
              const $cerrar = $body.find("button[title='Cerrar']").first();
              if ($cerrar.length > 0) {
                cy.wrap($cerrar).click({ force: true });
              } else {
                cy.get('body').type('{esc}');
              }
              cy.wait(500);
            }
          });
        });
    });
  }
}

export default GraficasPage;
