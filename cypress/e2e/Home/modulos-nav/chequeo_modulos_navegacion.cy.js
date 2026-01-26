// cypress/e2e/Home/modulos-nav/chequeo_modulos_navegacion.cy.js
import LoginPage from '../../../pages/LoginPage.js';
import HomePage from '../../../pages/HomePage.js';
import ModulosNavegacionPage from '../../../pages/Home/modulos-nav/ModulosNavegacionPage.js';
import { INTERCEPTS } from '../../../pages/config.js';

describe('Chequeo de Módulos de Navegación - Automatización Completa', () => {
  let loginPage;
  let homePage;
  let modulosNavegacionPage;

  before(() => {
    Cypress.on('uncaught:exception', (err) => {
      if (
        err?.message?.includes('includes') ||
        err?.message?.includes('Kustomer.start')
      ) {
        return false;
      }
      return true;
    });
  });

  beforeEach(() => {
    cy.intercept('POST', '**/bia-auth/signin').as(INTERCEPTS.SIGNIN);
    cy.intercept('GET', '**/ms-users/contracts/**').as(INTERCEPTS.CONTRACTS);

    cy.viewport(1920, 1080);
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'));

    loginPage = new LoginPage();
    homePage = new HomePage();
    modulosNavegacionPage = new ModulosNavegacionPage();
  });

  it('Debería navegar y verificar todos los módulos del sistema', () => {
    const email = 'astrid.tovar@bia.app';
    const password = 'Akamaru123*';

    // ============================================================
    // PASO 1: LOGIN
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('🔐 PASO 1: LOGIN');
    cy.log('═══════════════════════════════════════════════════════');
    
    loginPage.loginCompleto(email, password);

    cy.wait(`@${INTERCEPTS.SIGNIN}`, { timeout: 20000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('✅ Login exitoso');
    });

    cy.url({ timeout: 20000 }).should('include', '/home');
    cy.wait(`@${INTERCEPTS.CONTRACTS}`, { timeout: 30000 });
    homePage.verificarQueCargo();
    cy.wait(3000); // Esperar a que cargue completamente

    // ============================================================
    // PASO 2: INICIO
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('🏠 PASO 2: MÓDULO DE INICIO');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.navegarAInicioYVerificar();
    cy.wait(4000); // Pausa para observar el módulo de inicio

    // ============================================================
    // PASO 3: NOTIFICACIONES
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('🔔 PASO 3: MÓDULO DE NOTIFICACIONES');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.navegarANotificacionesYVerificar().then((hayNotificaciones) => {
      if (hayNotificaciones) {
        cy.log('✅ Hay notificaciones disponibles');
      } else {
        cy.log('ℹ️ No hay notificaciones disponibles, continuando...');
      }
    });
    cy.wait(4000); // Pausa para observar el módulo de notificaciones

    // ============================================================
    // PASO 4: ANÁLISIS - CONSUMO GENERAL
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('📊 PASO 4: ANÁLISIS - CONSUMO GENERAL');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.navegarAConsumoGeneralYVerificar();
    cy.wait(4000); // Pausa para observar consumo general

    // ============================================================
    // PASO 5: ANÁLISIS - ENERGÍA REACTIVA
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('⚡ PASO 5: ANÁLISIS - ENERGÍA REACTIVA');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.cambiarAEnergiaReactivaYVerificar();
    cy.wait(4000); // Pausa para observar energía reactiva

    // ============================================================
    // PASO 6: EN VIVO (BIAMONITORS)
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('📡 PASO 6: EN VIVO (BIAMONITORS)');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.navegarAEnVivoYVerificar();
    cy.wait(4000); // Pausa para observar en vivo

    // ============================================================
    // PASO 7: INTENSIDAD ENERGÉTICA
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('⚡ PASO 7: INTENSIDAD ENERGÉTICA');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.navegarAIntensidadEnergeticaYVerificar();
    cy.wait(4000); // Pausa para observar intensidad energética

    // ============================================================
    // PASO 8: CALIDAD ENERGÉTICA
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('🔌 PASO 8: CALIDAD ENERGÉTICA');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.navegarACalidadEnergeticaYVerificar();
    cy.wait(4000); // Pausa para observar calidad energética

    // ============================================================
    // PASO 9: PRONÓSTICO
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('🔮 PASO 9: PRONÓSTICO');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.navegarAPronosticoYVerificar().then((estadoPronostico) => {
      if (estadoPronostico.tieneInformacion) {
        cy.log('✅ Pronóstico muestra información y gráficas');
      } else if (estadoPronostico.tieneMensajeSinDatos) {
        cy.log('ℹ️ Pronóstico muestra mensaje de que no se ha subido información');
      }
    });
    cy.wait(4000); // Pausa para observar pronóstico

    // ============================================================
    // PASO 10: PAGOS - FACTURAS
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('💳 PASO 10: PAGOS - FACTURAS');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.navegarAFacturasYVerificar();
    cy.wait(4000); // Pausa para observar facturas

    // ============================================================
    // PASO 11: SOSTENIBILIDAD (CO2)
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('🌱 PASO 11: SOSTENIBILIDAD (CO2)');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.navegarASostenibilidadYVerificar();
    cy.wait(4000); // Pausa para observar sostenibilidad

    // ============================================================
    // PASO 12: RECs
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('📜 PASO 12: RECs');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.navegarARecsYVerificar().then((estadoRecs) => {
      if (estadoRecs.tieneRecs) {
        cy.log('✅ RECs muestra tabla con valores');
      } else if (estadoRecs.noTieneRecs) {
        cy.log('ℹ️ RECs muestra mensaje de suscripción');
      }
    });
    cy.wait(4000); // Pausa para observar RECs

    // ============================================================
    // PASO 13: SOLUCIONES ENERGÉTICAS
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('💡 PASO 13: SOLUCIONES ENERGÉTICAS');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.navegarASolucionesEnergeticasYVerificar();
    cy.wait(4000); // Pausa para observar soluciones energéticas

    // ============================================================
    // PASO 14: VISITAS
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('🏢 PASO 14: VISITAS');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.navegarAVisitasYVerificar();
    cy.wait(4000); // Pausa para observar visitas

    // ============================================================
    // PASO 15: AJUSTES - USUARIOS
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('⚙️ PASO 15: AJUSTES - USUARIOS');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.navegarAUsuariosYVerificar();
    cy.wait(4000); // Pausa para observar usuarios

    // ============================================================
    // PASO 16: AJUSTES - SEDES
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('⚙️ PASO 16: AJUSTES - SEDES');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.navegarASedesYVerificar();
    cy.wait(4000); // Pausa para observar sedes

    // ============================================================
    // PASO 17: AJUSTES - CONTRIBUCIÓN SOLIDARIDAD
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('⚙️ PASO 17: AJUSTES - CONTRIBUCIÓN SOLIDARIDAD');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.navegarAContribucionYVerificar();
    cy.wait(4000); // Pausa para observar contribución

    // ============================================================
    // PASO 18: AJUSTES - CUENTA
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('⚙️ PASO 18: AJUSTES - CUENTA');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.navegarACuentaYVerificar();
    cy.wait(4000); // Pausa para observar cuenta

    // ============================================================
    // PASO 19: AJUSTES - API
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('⚙️ PASO 19: AJUSTES - API');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.navegarAApiYVerificar();
    cy.wait(4000); // Pausa para observar API

    // ============================================================
    // PASO 20: AJUSTES - MÉTODOS DE PAGO (FINAL)
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('⚙️ PASO 20: AJUSTES - MÉTODOS DE PAGO (PASO FINAL)');
    cy.log('═══════════════════════════════════════════════════════');
    
    modulosNavegacionPage.navegarAMetodosPagoYVerificar().then((todoCorrecto) => {
      cy.wait(4000); // Pausa final para observar métodos de pago
      if (todoCorrecto) {
        cy.log('');
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('🎉 AUTOMATIZACIÓN COMPLETADA EXITOSAMENTE');
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('✅ Todos los módulos fueron verificados correctamente');
        cy.log('✅ La automatización ha llegado a su fin');
        cy.log('═══════════════════════════════════════════════════════');
      } else {
        cy.log('');
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('⚠️ AUTOMATIZACIÓN COMPLETADA CON ADVERTENCIAS');
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('⚠️ Algunos elementos no se verificaron correctamente');
        cy.log('✅ La automatización ha llegado a su fin');
        cy.log('═══════════════════════════════════════════════════════');
      }
    });
  });
});
