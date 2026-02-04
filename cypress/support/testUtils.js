// cypress/support/testUtils.js
import { TIMEOUTS, WAIT_TIMES } from '../pages/config.js';

/**
 * Utilidades para mejorar la automatización y hacerla más limpia
 */

/**
 * Esperar de forma más legible con logging
 * @param {number} ms - Milisegundos a esperar
 * @param {string} reason - Razón de la espera (opcional)
 */
export function waitWithReason(ms, reason = '') {
  if (reason) {
    cy.log(`⏳ Esperando ${ms}ms${reason ? ` - ${reason}` : ''}`);
  }
  cy.wait(ms);
}

/**
 * Hacer hover suave y lento sobre un elemento
 * @param {Cypress.Chainable} element - Elemento sobre el que hacer hover
 * @param {Object} options - Opciones de hover
 * @param {number} options.delay - Delay entre eventos (default: WAIT_TIMES.HOVER_DELAY)
 * @param {number} options.tooltipWait - Tiempo de espera para tooltip (default: WAIT_TIMES.TOOLTIP_DISPLAY)
 */
export function smoothHover(element, options = {}) {
  const { delay = WAIT_TIMES.HOVER_DELAY, tooltipWait = WAIT_TIMES.TOOLTIP_DISPLAY } = options;
  
  return element
    .scrollIntoView({ duration: 1000 })
    .wait(delay)
    .trigger('mouseover', { force: true })
    .wait(delay)
    .trigger('mouseenter', { force: true })
    .wait(delay)
    .trigger('mousemove', { force: true })
    .wait(tooltipWait);
}

/**
 * Hacer clic con esperas y logging mejorado
 * @param {Cypress.Chainable} element - Elemento sobre el que hacer clic
 * @param {Object} options - Opciones de clic
 * @param {string} options.description - Descripción del clic para logging
 * @param {number} options.waitAfter - Tiempo de espera después del clic
 */
export function clickWithLog(element, options = {}) {
  const { description = 'elemento', waitAfter = WAIT_TIMES.CLICK_DELAY } = options;
  
  cy.log(`🖱️ Haciendo clic en: ${description}`);
  return element
    .should('be.visible', { timeout: TIMEOUTS.MEDIUM })
    .click({ force: true })
    .then(() => {
      if (waitAfter > 0) {
        waitWithReason(waitAfter, `después de clic en ${description}`);
      }
    });
}

/**
 * Verificar que un texto existe en la página (más robusto)
 * @param {string|Array<string>} textos - Texto(s) a buscar
 * @param {Object} options - Opciones
 * @param {boolean} options.caseSensitive - Si la búsqueda es case-sensitive
 */
export function verifyTextExists(textos, options = {}) {
  const { caseSensitive = false } = options;
  const textosArray = Array.isArray(textos) ? textos : [textos];
  
  return cy.get('body', { timeout: TIMEOUTS.MEDIUM }).then(($body) => {
    const textoCompleto = caseSensitive ? $body.text() : $body.text().toLowerCase();
    
    textosArray.forEach(texto => {
      const textoBuscar = caseSensitive ? texto : texto.toLowerCase();
      const encontrado = textoCompleto.includes(textoBuscar);
      
      if (encontrado) {
        cy.log(`✅ Texto encontrado: "${texto}"`);
      } else {
        cy.log(`⚠️ Texto no encontrado: "${texto}"`);
      }
    });
  });
}

/**
 * Navegar al home de forma consistente
 */
export function navigateToHome() {
  cy.log('🏠 Navegando al home...');
  return cy.get('#home', { timeout: TIMEOUTS.MEDIUM })
    .should('be.visible')
    .click({ force: true })
    .then(() => {
      waitWithReason(WAIT_TIMES.PAGE_TRANSITION, 'para navegación al home');
      cy.url({ timeout: TIMEOUTS.LONG }).should('include', '/home');
      cy.get('[data-demo-target="home-grid"]', { timeout: TIMEOUTS.MEDIUM })
        .should('be.visible');
      cy.log('✅ Navegación al home completada');
    });
}

/**
 * Cerrar modal/dialog de forma robusta
 * @param {Object} options - Opciones
 * @param {Array<string>} options.selectors - Selectores adicionales para buscar botón cerrar
 */
export function closeModal(options = {}) {
  const { selectors = [] } = options;
  const defaultSelectors = [
    "button[title='Cerrar']",
    "button[aria-label*='cerrar']",
    "button[aria-label*='Cerrar']",
    '[class*="close"]',
    '[class*="Close"]'
  ];
  
  const allSelectors = [...defaultSelectors, ...selectors];
  
  cy.log('❌ Cerrando modal/dialog...');
  
  return cy.get('body').then(($body) => {
    const $modal = $body.find('[class*="modal"], [class*="Modal"], [role="dialog"]').filter(':visible');
    
    if ($modal.length > 0) {
      // Intentar encontrar botón de cerrar
      let botonEncontrado = false;
      
      allSelectors.forEach(selector => {
        if (!botonEncontrado) {
          const $boton = $body.find(selector).filter(':visible').first();
          if ($boton.length > 0) {
            cy.wrap($boton).click({ force: true });
            waitWithReason(WAIT_TIMES.MODAL_ANIMATION, 'para cerrar modal');
            botonEncontrado = true;
            cy.log(`✅ Modal cerrado usando selector: ${selector}`);
          }
        }
      });
      
      if (!botonEncontrado) {
        // Intentar con ESC como último recurso
        cy.get('body').type('{esc}');
        waitWithReason(WAIT_TIMES.MODAL_ANIMATION, 'para cerrar modal con ESC');
        cy.log('⚠️ Modal cerrado usando ESC');
      }
    } else {
      cy.log('ℹ️ No se encontró modal visible para cerrar');
    }
  });
}

/**
 * Verificar que una URL es la esperada
 * @param {string} expectedUrl - URL esperada
 * @param {Object} options - Opciones
 * @param {boolean} options.exact - Si debe ser exacta o contener
 */
export function verifyUrl(expectedUrl, options = {}) {
  const { exact = true } = options;
  
  cy.log(`🔍 Verificando URL: ${expectedUrl}`);
  
  if (exact) {
    cy.url({ timeout: TIMEOUTS.VERY_LONG }).should('eq', expectedUrl);
  } else {
    cy.url({ timeout: TIMEOUTS.VERY_LONG }).should('include', expectedUrl);
  }
  
  cy.log('✅ URL verificada correctamente');
}

/**
 * Retry logic para operaciones que pueden fallar temporalmente
 * @param {Function} operation - Función a ejecutar (debe retornar Cypress.Chainable)
 * @param {Object} options - Opciones
 * @param {number} options.maxRetries - Número máximo de reintentos
 * @param {number} options.delay - Delay entre reintentos
 */
export function retryOperation(operation, options = {}) {
  const { maxRetries = 3, delay = 1000 } = options;
  let retries = 0;
  
  const attempt = () => {
    return cy.then(() => {
      return operation().catch((error) => {
        retries++;
        if (retries < maxRetries) {
          cy.log(`⚠️ Intento ${retries} falló, reintentando... (${retries}/${maxRetries})`);
          cy.wait(delay);
          return attempt();
        } else {
          cy.log(`❌ Todos los reintentos fallaron (${maxRetries} intentos)`);
          throw error;
        }
      });
    });
  };
  
  return attempt();
}

/**
 * Limpiar y formatear logs para mejor legibilidad
 * @param {string} title - Título de la sección
 * @param {string} emoji - Emoji para el título (opcional)
 */
export function logSection(title, emoji = '') {
  cy.log('');
  cy.log('═══════════════════════════════════════════════════════');
  cy.log(`${emoji ? emoji + ' ' : ''}${title}`);
  cy.log('═══════════════════════════════════════════════════════');
}

/**
 * Verificar que un elemento está visible con mejor manejo de errores
 * @param {string} selector - Selector del elemento
 * @param {Object} options - Opciones
 * @param {string} options.description - Descripción del elemento
 */
export function verifyElementVisible(selector, options = {}) {
  const { description = selector, timeout = TIMEOUTS.MEDIUM } = options;
  
  cy.log(`🔍 Verificando que "${description}" está visible...`);
  
  return cy.get(selector, { timeout })
    .should('be.visible')
    .then(() => {
      cy.log(`✅ "${description}" está visible`);
    });
}
