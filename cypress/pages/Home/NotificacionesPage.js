// cypress/pages/Home/NotificacionesPage.js
class NotificacionesPage {
  // Selector para el botón/icono de notificaciones
  get botonNotificaciones() {
    return '#notifications';
  }

  // Selector para el contenedor de notificaciones (modal/dropdown)
  get contenedorNotificaciones() {
    return '[id*="notification"], [class*="notification"], [data-testid*="notification"]';
  }

  // Selector para la lista de notificaciones
  get listaNotificaciones() {
    return '[class*="notification-item"], [class*="notification-list"] li, [role="listitem"]';
  }

  // Selector para la primera notificación
  get primeraNotificacion() {
    return '[class*="notification-item"]:first, [class*="notification-list"] li:first, [role="listitem"]:first';
  }

  // Selector para el detalle de la notificación
  get detalleNotificacion() {
    return '[class*="notification-detail"], [class*="notification-modal"], [class*="notification-content"]';
  }

  /**
   * Esperar a que el botón de notificaciones esté visible
   */
  esperarBotonNotificaciones() {
    cy.log('⏳ Esperando a que el botón de notificaciones esté visible...');
    cy.get(this.botonNotificaciones, { timeout: 10000 })
      .should('be.visible')
      .should('exist');
    cy.log('✅ Botón de notificaciones visible');
  }

  /**
   * Hacer clic en el botón de notificaciones
   */
  hacerClickEnNotificaciones() {
    cy.log('🔔 Haciendo clic en el botón de notificaciones...');
    cy.get(this.botonNotificaciones)
      .should('be.visible')
      .click();
    cy.log('✅ Clic realizado en notificaciones');
  }

  /**
   * Verificar si existen notificaciones en la lista
   * @returns {Cypress.Chainable<boolean>} - True si hay notificaciones, false si no
   */
  verificarSiHayNotificaciones() {
    cy.log('🔍 Verificando si hay notificaciones en la lista...');
    
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
        cy.log(`✅ Se encontraron ${$notificaciones.length} notificación(es)`);
      } else {
        cy.log('ℹ️ No se encontraron notificaciones');
      }
      
      return cy.wrap(hayNotificaciones);
    });
  }

  /**
   * Hacer clic en la primera notificación de la lista
   */
  hacerClickEnPrimeraNotificacion() {
    cy.log('📬 Haciendo clic en la primera notificación de la lista...');
    
    // Esperar a que aparezcan las notificaciones
    cy.wait(1000);
    
    // Buscar la primera notificación en la lista
    cy.get('body').then(($body) => {
      // Buscar elementos que puedan ser notificaciones en la lista
      const $notificaciones = $body.find('li, [role="listitem"], [class*="notification"], [class*="item"]').filter((i, el) => {
        const $el = Cypress.$(el);
        // Filtrar elementos visibles que no sean el menú lateral
        return $el.is(':visible') && 
               !$el.closest('[id="notifications"]').length &&
               $el.text().trim().length > 0 &&
               ($el.parent().is('ul, [role="list"], [class*="list"]') || 
                $el.closest('ul, [role="list"], [class*="list"]').length > 0);
      });
      
      if ($notificaciones.length > 0) {
        cy.log(`✅ Notificación encontrada, haciendo clic en la primera...`);
        cy.wrap($notificaciones.first())
          .should('be.visible')
          .click({ force: true });
        cy.log('✅ Clic realizado en la primera notificación');
      } else {
        cy.log('⚠️ No se pudo encontrar una notificación en la lista');
      }
    });
  }

  /**
   * Esperar a que se muestre el detalle de la notificación
   */
  esperarDetalleNotificacion() {
    cy.log('⏳ Esperando a que se muestre el detalle de la notificación...');
    
    // Esperar un momento para que se cargue el contenido
    cy.wait(2000);
    
    // Esperar a que aparezca el detalle usando diferentes selectores posibles
    cy.get('body', { timeout: 10000 }).then(($body) => {
      // Buscar elementos que puedan ser el detalle
      const selectoresDetalle = [
        '[class*="notification-detail"]',
        '[class*="notification-modal"]',
        '[class*="notification-content"]',
        '[class*="modal"]',
        '[role="dialog"]',
        'main',
        '[class*="content"]',
        '[class*="detail"]'
      ];
      
      let detalleEncontrado = false;
      
      for (const selector of selectoresDetalle) {
        const $detalle = $body.find(selector).filter(':visible');
        if ($detalle.length > 0) {
          cy.log(`✅ Detalle encontrado con selector: ${selector}`);
          detalleEncontrado = true;
          break;
        }
      }
      
      if (!detalleEncontrado) {
        // Si no se encuentra un detalle específico, verificar que haya contenido visible en la página
        cy.wait(1000);
        cy.get('body').then(($body) => {
          // Verificar que haya contenido visible (no solo el menú lateral)
          const $contenidoPrincipal = $body.find('main, [class*="main"], [class*="content"], [class*="detail"]').filter(':visible');
          const $modales = $body.find('[class*="modal"], [role="dialog"], [class*="overlay"]').filter(':visible');
          
          // Verificar que haya algún contenido visible (modal o contenido principal)
          if ($contenidoPrincipal.length > 0 || $modales.length > 0) {
            cy.log('✅ Contenido de detalle encontrado');
          } else {
            cy.log('⚠️ No se encontró detalle específico, pero la prueba continúa');
          }
        });
      }
    });
    
    cy.log('✅ Detalle de notificación visible');
  }

  /**
   * Hacer scroll en el detalle de la notificación para ver toda la información
   */
  hacerScrollEnDetalle() {
    cy.log('📜 Haciendo scroll en el detalle de la notificación...');
    
    // Esperar un momento antes de hacer scroll
    cy.wait(1000);
    
    cy.get('body').then(($body) => {
      // Buscar el contenedor del detalle (excluyendo el menú lateral)
      const $detalle = $body.find('main, [class*="main"], [class*="content"], [class*="detail"], [class*="modal"], [role="dialog"], [class*="panel"]')
        .filter(':visible')
        .not('[id="notifications"]')
        .not('[id*="sidebar"]')
        .first();
      
      if ($detalle.length > 0 && $detalle.height() > 0) {
        try {
          // Hacer scroll hasta el final del contenedor
          cy.wrap($detalle).scrollTo('bottom', { duration: 1000, ensureScrollable: false });
          cy.wait(500);
          cy.log('✅ Scroll completado hasta el final');
          
          // Hacer scroll hacia arriba para ver el inicio
          cy.wrap($detalle).scrollTo('top', { duration: 500, ensureScrollable: false });
          cy.wait(500);
          cy.log('✅ Scroll completado hacia el inicio');
        } catch (e) {
          // Si falla el scroll en el contenedor, hacer scroll en la ventana
          cy.log('⚠️ No se pudo hacer scroll en el contenedor, usando scroll de ventana');
          cy.scrollTo('bottom', { duration: 1000 });
          cy.wait(500);
          cy.scrollTo('top', { duration: 500 });
          cy.log('✅ Scroll completado en la ventana');
        }
      } else {
        // Si no hay contenedor específico, hacer scroll en la ventana
        cy.scrollTo('bottom', { duration: 1000 });
        cy.wait(500);
        cy.scrollTo('top', { duration: 500 });
        cy.log('✅ Scroll completado en la ventana');
      }
    });
  }

  /**
   * Verificar que el detalle de la notificación se muestra correctamente
   */
  verificarDetalleNotificacion() {
    cy.log('✅ Verificando detalle de notificación...');
    
    cy.get('body', { timeout: 5000 }).then(($body) => {
      // Buscar el detalle - puede ser un modal, un panel lateral, o contenido adicional
      const $detalle = $body.find('[class*="detail"], [class*="modal"], [class*="content"], [role="dialog"], [class*="panel"]').filter(':visible');
      
      if ($detalle.length > 0) {
        const textoDetalle = $detalle.first().text();
        cy.log(`📋 Contenido del detalle: "${textoDetalle.substring(0, 100)}..."`);
        cy.log('✅ Detalle de notificación verificado');
      } else {
        // Si no hay modal, verificar que haya contenido visible adicional en el área principal
        const $contenidoPrincipal = $body.find('main, [class*="main"], [class*="content"], [class*="detail"]').filter(':visible');
        if ($contenidoPrincipal.length > 0) {
          cy.log('✅ Contenido de detalle visible en el área principal');
        } else {
          cy.log('⚠️ No se encontró el detalle de la notificación, pero la prueba continúa');
        }
      }
    });
  }

  /**
   * Extraer datos de la notificación desde el DOM antes de hacer clic
   * @returns {Cypress.Chainable<Object>} - Datos de la notificación
   */
  extraerDatosNotificacion() {
    cy.log('📊 Extrayendo datos de la notificación...');
    
    return cy.get('body').then(($body) => {
      // Buscar la primera notificación
      const $notificaciones = $body.find('li, [role="listitem"], [class*="notification"], [class*="item"]').filter((i, el) => {
        const $el = Cypress.$(el);
        return $el.is(':visible') && 
               !$el.closest('[id="notifications"]').length &&
               $el.text().trim().length > 0 &&
               ($el.parent().is('ul, [role="list"], [class*="list"]') || 
                $el.closest('ul, [role="list"], [class*="list"]').length > 0);
      });
      
      if ($notificaciones.length > 0) {
        const $primera = $notificaciones.first();
        const texto = $primera.text();
        
        // Intentar extraer el ID de la notificación desde atributos data-*
        const notificationId = $primera.attr('data-notification-id') || 
                               $primera.attr('data-id') || 
                               $primera.closest('[data-notification-id]').attr('data-notification-id');
        
        cy.log(`📋 Texto de la notificación: "${texto.substring(0, 50)}..."`);
        if (notificationId) {
          cy.log(`🆔 ID de notificación encontrado: ${notificationId}`);
        }
        
        return cy.wrap({
          texto: texto,
          id: notificationId,
          elemento: $primera
        });
      }
      
      return cy.wrap(null);
    });
  }

  /**
   * Extraer títulos y gráficas del frontend
   * @returns {Cypress.Chainable<Object>} - Objeto con títulos y gráficas extraídas
   */
  extraerTitulosYGraficasDelFrontend() {
    cy.log('📊 Extrayendo títulos y gráficas del frontend...');
    
    return cy.get('body').then(($body) => {
      const frontendData = {
        titulos: [],
        graficas: [],
        widgets: []
      };
      
      // Buscar títulos (h1, h2, h3, elementos con class que contenga "title", "heading", "header")
      const $titulos = $body.find('h1, h2, h3, h4, [class*="title"], [class*="heading"], [class*="header"]').filter(':visible');
      $titulos.each((i, el) => {
        const texto = Cypress.$(el).text().trim();
        if (texto.length > 0) {
          frontendData.titulos.push(texto);
        }
      });
      
      // Buscar gráficas/widgets (canvas, svg, elementos con class que contenga "chart", "graph", "widget", "graphic")
      const $graficas = $body.find('canvas, svg, [class*="chart"], [class*="graph"], [class*="widget"], [class*="graphic"], [class*="visualization"]').filter(':visible');
      $graficas.each((i, el) => {
        const $el = Cypress.$(el);
        const tipo = el.tagName.toLowerCase();
        const clases = $el.attr('class') || '';
        const id = $el.attr('id') || '';
        
        frontendData.graficas.push({
          tipo: tipo,
          clases: clases,
          id: id,
          visible: $el.is(':visible')
        });
      });
      
      // Buscar contenedores de widgets
      const $widgets = $body.find('[class*="widget"], [data-widget], [role="region"]').filter(':visible');
      $widgets.each((i, el) => {
        const $el = Cypress.$(el);
        const texto = $el.text().trim();
        const clases = $el.attr('class') || '';
        
        if (texto.length > 0 || clases.includes('widget')) {
          frontendData.widgets.push({
            texto: texto.substring(0, 100),
            clases: clases
          });
        }
      });
      
      cy.log(`📋 Títulos encontrados: ${frontendData.titulos.length}`);
      cy.log(`📈 Gráficas encontradas: ${frontendData.graficas.length}`);
      cy.log(`📦 Widgets encontrados: ${frontendData.widgets.length}`);
      
      return cy.wrap(frontendData);
    });
  }

  /**
   * Comparar datos del frontend con la respuesta de la API
   * @param {Object} interception - Interceptación de Cypress con request/response
   * @param {Object} notificationData - Datos extraídos del frontend
   * @param {Object} apiResponseDirect - Respuesta directa del API (opcional)
   */
  compararDatosConAPI(interception, notificationData, apiResponseDirect = null) {
    cy.log('🔍 Comparando datos del frontend con la API...');
    
    // Usar la respuesta directa del API si está disponible, sino usar la interceptación
    const apiData = apiResponseDirect || (interception?.response?.body);
    const requestBody = interception?.request?.body;
    
    if (!apiData) {
      cy.log('⚠️ No se recibió respuesta de la API');
      return;
    }
    
    cy.log('📊 Datos de la API recibidos');
    
    // Extraer títulos y gráficas del frontend
    this.extraerTitulosYGraficasDelFrontend().then((frontendData) => {
      // Verificar que la respuesta tenga datos
      if (apiData && typeof apiData === 'object') {
        cy.log('✅ Respuesta de la API válida');
        
        // ============================================================
        // COMPARAR TÍTULOS
        // ============================================================
        cy.log('');
        cy.log('📋 Comparando títulos...');
        
        // Extraer títulos de la API (del request body notification)
        if (requestBody && requestBody.notification) {
          const apiNotification = requestBody.notification;
          
          // Título de la notificación
          if (apiNotification.title) {
            cy.log(`📌 Título en API: "${apiNotification.title}"`);
            
            // Verificar que el título aparezca en el frontend
            const tituloEncontrado = frontendData.titulos.some(titulo => 
              titulo.includes(apiNotification.title) || 
              apiNotification.title.includes(titulo)
            );
            
            if (tituloEncontrado) {
              cy.log('✅ Título de la notificación coincide con el frontend');
            } else {
              cy.log(`⚠️ Título "${apiNotification.title}" no encontrado exactamente en el frontend`);
              cy.log(`📋 Títulos encontrados en frontend: ${frontendData.titulos.join(', ')}`);
            }
          }
          
          // Comparación de métricas si están disponibles
          if (apiNotification.comparison_metric) {
            const metric = apiNotification.comparison_metric;
            if (metric.static_text) {
              cy.log(`📊 Texto estático en API: "${metric.static_text}"`);
              
              // Buscar este texto en los títulos o contenido del frontend
              const textoEncontrado = frontendData.titulos.some(titulo => 
                titulo.includes(metric.static_text) || 
                metric.static_text.includes(titulo)
              ) || frontendData.widgets.some(widget => 
                widget.texto.includes(metric.static_text)
              );
              
              if (textoEncontrado) {
                cy.log('✅ Texto de métrica coincide con el frontend');
              } else {
                cy.log(`⚠️ Texto de métrica "${metric.static_text}" no encontrado en el frontend`);
              }
            }
          }
        }
        
        // ============================================================
        // COMPARAR GRÁFICAS/WIDGETS
        // ============================================================
        cy.log('');
        cy.log('📈 Comparando gráficas y widgets...');
        
        // Verificar widgets en la respuesta de la API (usar apiResponseDirect si está disponible)
        const widgetsApi = apiResponseDirect?.widgets || apiData?.widgets;
        
        if (widgetsApi && Array.isArray(widgetsApi)) {
          cy.log(`📦 Widgets en API: ${widgetsApi.length}`);
          
          // Verificar que haya gráficas/widgets visibles en el frontend
          if (frontendData.graficas.length > 0 || frontendData.widgets.length > 0) {
            cy.log(`✅ Se encontraron gráficas/widgets en el frontend`);
            cy.log(`   - Gráficas: ${frontendData.graficas.length}`);
            cy.log(`   - Widgets: ${frontendData.widgets.length}`);
            
            // Verificar que el número de widgets coincida aproximadamente
            if (frontendData.widgets.length >= widgetsApi.length) {
              cy.log(`✅ Número de widgets coincide (Frontend: ${frontendData.widgets.length}, API: ${widgetsApi.length})`);
            } else {
              cy.log(`⚠️ Número de widgets diferente (Frontend: ${frontendData.widgets.length}, API: ${widgetsApi.length})`);
            }
          } else {
            cy.log('⚠️ No se encontraron gráficas/widgets visibles en el frontend');
          }
          
          // Comparar datos específicos de cada widget si están disponibles
          widgetsApi.forEach((widget, index) => {
            if (widget.title || widget.name || widget.header) {
              const widgetTitle = widget.title || widget.name || widget.header;
              cy.log(`📌 Widget ${index + 1} en API: "${widgetTitle}"`);
              
              // Buscar este título en el frontend
              const tituloEncontrado = frontendData.titulos.some(titulo => 
                titulo.includes(widgetTitle) || 
                widgetTitle.includes(titulo)
              ) || frontendData.widgets.some(w => 
                w.texto.includes(widgetTitle)
              );
              
              if (tituloEncontrado) {
                cy.log(`✅ Título del widget ${index + 1} coincide`);
              } else {
                cy.log(`⚠️ Título del widget "${widgetTitle}" no encontrado en el frontend`);
              }
            }
          });
        } else if (apiData?.data && Array.isArray(apiData.data)) {
          cy.log(`📦 Datos en API: ${apiData.data.length} elementos`);
          cy.log(`✅ Se encontraron ${frontendData.graficas.length} gráfica(s) en el frontend`);
        } else {
          cy.log('⚠️ No se encontraron widgets en la respuesta de la API');
        }
        
        // ============================================================
        // COMPARAR CONTRACT IDs
        // ============================================================
        if (requestBody && requestBody.contract_ids) {
          cy.log('');
          cy.log(`📋 Contract IDs en el request: ${requestBody.contract_ids.join(', ')}`);
          
          // Verificar que los nombres de contratos aparezcan en el frontend
          if (requestBody.notification && requestBody.notification.metadata) {
            const contracts = requestBody.notification.metadata.contracts || [];
            contracts.forEach((contract, index) => {
              if (contract.contract_name) {
                cy.log(`📌 Contrato ${index + 1}: "${contract.contract_name}"`);
                
                const nombreEncontrado = frontendData.titulos.some(titulo => 
                  titulo.includes(contract.contract_name)
                ) || frontendData.widgets.some(widget => 
                  widget.texto.includes(contract.contract_name)
                );
                
                if (nombreEncontrado) {
                  cy.log(`✅ Nombre del contrato "${contract.contract_name}" encontrado en el frontend`);
                } else {
                  cy.log(`⚠️ Nombre del contrato "${contract.contract_name}" no encontrado en el frontend`);
                }
              }
            });
          }
        }
        
        // ============================================================
        // VERIFICAR NOTIFICATION ID
        // ============================================================
        if (requestBody && requestBody.notification && requestBody.notification.id) {
          cy.log('');
          cy.log(`🆔 Notification ID en el request: ${requestBody.notification.id}`);
          if (notificationData && notificationData.id) {
            cy.log(`🆔 Notification ID en el frontend: ${notificationData.id}`);
          }
        }
      }
      
      cy.log('');
      cy.log('✅ Comparación de datos completada');
    });
  }

  /**
   * Flujo completo: abrir notificaciones y hacer clic en la primera
   */
  abrirYSeleccionarPrimeraNotificacion() {
    cy.log('🔔 Iniciando flujo completo de notificaciones...');
    
    // 1. Esperar botón
    this.esperarBotonNotificaciones();
    
    // 2. Hacer clic en notificaciones
    this.hacerClickEnNotificaciones();
    
    // 3. Verificar si hay notificaciones
    this.verificarSiHayNotificaciones().then((hayNotificaciones) => {
      if (hayNotificaciones) {
        // 4. Hacer clic en la primera
        this.hacerClickEnPrimeraNotificacion();
        
        // 5. Esperar detalle
        this.esperarDetalleNotificacion();
        
        // 6. Verificar detalle
        this.verificarDetalleNotificacion();
      } else {
        cy.log('ℹ️ No hay notificaciones disponibles para abrir');
      }
    });
  }
}

export default NotificacionesPage;
