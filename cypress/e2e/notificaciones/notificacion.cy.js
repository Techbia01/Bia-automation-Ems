// cypress/e2e/notificaciones/notificacion.cy.js
import LoginPage from '../../pages/LoginPage.js';
import HomePage from '../../pages/HomePage.js';
import NotificacionesPage from '../../pages/Home/NotificacionesPage.js';
import { INTERCEPTS } from '../../pages/config.js';
import { llamarApiVariationsWidgets } from '../../support/helpers.js';

describe('Notificaciones', () => {
  let loginPage;
  let homePage;
  let notificacionesPage;
  let authToken;

  before(() => {
    // Evitar errores de scripts externos y librerías de visualización
    Cypress.on('uncaught:exception', (err) => {
      if (
        err?.message?.includes('includes') ||
        err?.message?.includes('Kustomer.start') ||
        err?.message?.includes('getRawIndex') ||
        err?.message?.includes('Cannot read properties of undefined')
      ) {
        return false; // No fallar el test por estos errores
      }
      return true;
    });
  });

  beforeEach(() => {
    // Interceptar llamadas importantes
    cy.intercept('POST', '**/bia-auth/signin').as(INTERCEPTS.SIGNIN);
    cy.intercept('GET', '**/ms-users/contracts/**').as(INTERCEPTS.CONTRACTS);
    // Interceptar la llamada a la API de widgets de variaciones de consumo
    cy.intercept('POST', '**/ems-api/app-consumptions/variations/widgets').as('variationsWidgets');

    cy.viewport(1920, 1080);
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'));

    // Inicializar instancias de páginas
    loginPage = new LoginPage();
    homePage = new HomePage();
    notificacionesPage = new NotificacionesPage();
  });

  it('Debería abrir notificaciones y mostrar el detalle de la primera notificación', () => {
    const email = 'astrid.tovar@bia.app';
    const password = 'Akamaru123*';

    // ============================================================
    // PASO 1: LOGIN Y NAVEGACIÓN AL HOME
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('🔐 PASO 1: LOGIN Y NAVEGACIÓN AL HOME');
    cy.log('═══════════════════════════════════════════════════════');
    
    loginPage.loginCompleto(email, password);

    // Esperar a que el login se complete y capturar el token
    cy.wait(`@${INTERCEPTS.SIGNIN}`, { timeout: 20000 }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      authToken = interception.response.body.access_token;
      expect(authToken).to.exist;
      cy.log('✅ Login exitoso');
      cy.log(`🔑 Token de autenticación capturado (longitud: ${authToken.length} caracteres)`);
    });

    // Verificar que estamos en el home
    cy.url({ timeout: 20000 }).should('include', '/home');
    
    // Esperar a que el home cargue completamente
    homePage.verificarQueCargo();
    cy.wait(2000); // Esperar a que todos los elementos carguen

    // ============================================================
    // PASO 2: NAVEGAR A NOTIFICACIONES
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('🔔 PASO 2: NAVEGAR A LA SECCIÓN DE NOTIFICACIONES');
    cy.log('═══════════════════════════════════════════════════════');
    
    // Esperar a que el elemento del menú con id="notifications" esté visible
    notificacionesPage.esperarBotonNotificaciones();
    
    // Hacer clic en el elemento del menú con id="notifications"
    notificacionesPage.hacerClickEnNotificaciones();
    
    // Esperar a que navegue a la página de notificaciones
    cy.url({ timeout: 10000 }).should('include', '/notifications');
    cy.wait(2000); // Esperar a que cargue la página

    // ============================================================
    // PASO 3: VERIFICAR SI HAY NOTIFICACIONES Y SELECCIONAR LA PRIMERA
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════');
    cy.log('📋 PASO 3: BUSCAR Y SELECCIONAR LA PRIMERA NOTIFICACIÓN');
    cy.log('═══════════════════════════════════════════════════════');
    
    // Verificar si hay notificaciones y hacer clic en la primera si existe
    notificacionesPage.verificarSiHayNotificaciones().then((hayNotificaciones) => {
      if (hayNotificaciones) {
        // Extraer datos de la notificación antes de hacer clic
        let notificationData = null;
        notificacionesPage.extraerDatosNotificacion().then((data) => {
          notificationData = data;
        });
        
        // Hacer clic en la primera notificación
        notificacionesPage.hacerClickEnPrimeraNotificacion();
        
        // Esperar a que se abra el detalle
        cy.wait(2000);

        // ============================================================
        // PASO 4: VERIFICAR QUE SE MUESTRA EL DETALLE Y HACER SCROLL
        // ============================================================
        cy.log('');
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('📄 PASO 4: VERIFICAR EL DETALLE Y HACER SCROLL');
        cy.log('═══════════════════════════════════════════════════════');
        
        // Esperar y verificar el detalle
        notificacionesPage.esperarDetalleNotificacion();
        notificacionesPage.verificarDetalleNotificacion();
        
        // Hacer scroll para ver toda la información
        notificacionesPage.hacerScrollEnDetalle();

        // ============================================================
        // PASO 5: ESPERAR LLAMADA A LA API Y COMPARAR DATOS
        // ============================================================
        cy.log('');
        cy.log('═══════════════════════════════════════════════════════');
        cy.log('🔍 PASO 5: ESPERAR API Y COMPARAR DATOS CON FRONTEND');
        cy.log('═══════════════════════════════════════════════════════');
        
        // Esperar a que se complete la llamada a la API (con timeout más largo)
        cy.wait('@variationsWidgets', { timeout: 15000 }).then((interception) => {
          cy.log('✅ Llamada a la API recibida');
          
          // Verificar que la respuesta sea exitosa
          expect(interception.response.statusCode).to.be.oneOf([200, 201]);
          cy.log('✅ Respuesta de la API exitosa');
          
          // Extraer el request body para obtener los datos de la notificación
          const requestBody = interception.request.body;
          
          // Llamar al API usando el token capturado para validar los datos
          if (authToken && requestBody) {
            cy.log('📡 Llamando al API de widgets de variaciones con el token capturado...');
            
            llamarApiVariationsWidgets(authToken, requestBody, 'America/Bogota').then((apiResponse) => {
              cy.log('✅ Respuesta del API obtenida');
              
              // Esperar un momento adicional para que el frontend renderice los datos
              cy.wait(2000);
              
              // Comparar los datos de la API con el frontend (títulos y gráficas)
              notificacionesPage.compararDatosConAPI(interception, notificationData, apiResponse);
            });
          } else {
            cy.log('⚠️ No se pudo obtener el token o el request body, comparando solo con la interceptación');
            cy.wait(2000);
            notificacionesPage.compararDatosConAPI(interception, notificationData);
          }
        });
        
        cy.log('');
        cy.log('✅ Flujo de notificaciones completado exitosamente');
      } else {
        cy.log('ℹ️ No se encontraron notificaciones en la lista');
        cy.log('✅ Test completado (sin notificaciones)');
      }
    });
  });
});
