// cypress/e2e/Home/Dropdown de navegacion/cambio_cuenta.cy.js
import LoginPage from '../../../pages/LoginPage.js';
import HomePage from '../../../pages/HomePage.js';
import DropdownNavegacionPage from '../../../pages/Home/DropdownNavegacionPage.js';
import { INTERCEPTS } from '../../../pages/config.js';

describe('Dropdown de navegación - Cambio de cuenta', () => {
  let loginPage;
  let homePage;
  let dropdownNavegacionPage;

  before(() => {
    // (Temporal) Evita que scripts externos rompan el test
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
    // Limpiar caché antes de iniciar
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });

    // Intercepta las llamadas necesarias
    cy.intercept('POST', '**/bia-auth/signin').as(INTERCEPTS.SIGNIN);
    cy.intercept('GET', '**/ms-users/contracts/**').as(INTERCEPTS.CONTRACTS);
    cy.intercept('POST', '**/change-account**').as('changeAccount');
    cy.intercept('GET', '**/users/**').as('getUserInfo');
    cy.intercept('GET', '**/members/me**').as('getMemberInfo');
    cy.intercept('GET', '**/contracts-groups**').as('getContractsGroups');
    cy.intercept('GET', '**/roles/settings**').as('getRolesSettings');
    
    // Mockear Firebase Remote Config para asegurar que la whitelist de cambio de cuenta esté disponible
    const mockRemoteConfigResponse = {
      entries: {
        configValues: JSON.stringify({
          webusers: {
            whitelist_change_account: ['astrid.tovar@bia.app', 'karen.diaz@bia.app', 'estefany.'],
            // Otros valores de config que puedan ser necesarios
            showMembersAndRoles: true,
            showDashboard: true
          }
        })
      }
    };
    
    // Interceptar y mockear las llamadas de Firebase Remote Config
    cy.intercept('POST', '**/firebaseremoteconfig.googleapis.com/v1/projects/**/namespaces/firebase:fetch**', {
      statusCode: 200,
      body: mockRemoteConfigResponse
    }).as('remoteConfigFetch');
    
    cy.intercept('POST', '**/firebaseremoteconfig.googleapis.com/**', {
      statusCode: 200,
      body: mockRemoteConfigResponse
    }).as('remoteConfig');
    
    cy.intercept('GET', '**/firebaseremoteconfig.googleapis.com/**', {
      statusCode: 200,
      body: mockRemoteConfigResponse
    }).as('remoteConfigGet');
    
    // Interceptar llamadas de Kustomer para evitar errores 401 que puedan afectar el renderizado
    cy.intercept('GET', '**/kustomerapp.com/**', { statusCode: 200, body: {} }).as('kustomer');
    cy.intercept('POST', '**/kustomerapp.com/**', { statusCode: 200, body: {} }).as('kustomerPost');

    cy.viewport(1920, 1080);
    
    // Visitar con headers para evitar caché
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'), {
      onBeforeLoad: (win) => {
        // Limpiar caché del navegador
        win.localStorage.clear();
        win.sessionStorage.clear();
        
        // Establecer configValues ANTES del login para que esté disponible desde el inicio
        const configValues = {
          webusers: {
            whitelist_change_account: ['astrid.tovar@bia.app', 'karen.diaz@bia.app', 'estefany.'],
            showMembersAndRoles: true,
            showDashboard: true,
            showGraphConsumption: false,
            is_enabled_eva_support: true
          }
        };
        win.localStorage.setItem('configValues', JSON.stringify(configValues));
        // Usar console.log en lugar de cy.log dentro de onBeforeLoad
        console.log('✅ ConfigValues establecido antes del login');
      }
    });
    
    cy.log('✅ ConfigValues establecido antes del login');

    // Inicializar instancias de páginas
    loginPage = new LoginPage();
    homePage = new HomePage();
    dropdownNavegacionPage = new DropdownNavegacionPage();
  });

  it('Debería cambiar de cuenta exitosamente', () => {
    // Paso 1: Login inicial
    const email = 'astrid.tovar@bia.app';
    const password = 'Akamaru123*';

    loginPage.loginCompleto(email, password);

    // Espera a que el login se complete
    cy.wait(`@${INTERCEPTS.SIGNIN}`, { timeout: 20000 })
      .its('response.statusCode')
      .should('eq', 200);

    // Verifica que se redirige al home
    cy.url({ timeout: 20000 }).should('include', '/home');
    
    // Espera a que carguen los contratos
    cy.wait(`@${INTERCEPTS.CONTRACTS}`, { timeout: 30000 });

    // Verifica que el home haya cargado completamente
    homePage.verificarQueCargo();

    // Esperar a que se completen las llamadas que pueden determinar los permisos del menú
    cy.wait('@getMemberInfo', { timeout: 15000 }).then(() => {
      cy.log('✅ Información del miembro cargada');
    });
    
    cy.wait('@getContractsGroups', { timeout: 15000 }).then(() => {
      cy.log('✅ Grupos de contratos cargados');
    });

    // CRÍTICO: Asegurar que Remote Config se haya procesado y guardado en localStorage
    // Verificar que configValues esté en localStorage con la whitelist
    cy.window().then((win) => {
      const configValues = win.localStorage.getItem('configValues');
      if (configValues) {
        const config = JSON.parse(configValues);
        cy.log('✅ ConfigValues encontrado en localStorage');
        if (config.webusers?.whitelist_change_account) {
          cy.log(`✅ Whitelist encontrada: ${config.webusers.whitelist_change_account.join(', ')}`);
        }
      } else {
        cy.log('⚠️ ConfigValues no encontrado, estableciendo manualmente...');
        // Establecer configValues manualmente si no está presente
        const configToSet = {
          webusers: {
            whitelist_change_account: ['astrid.tovar@bia.app', 'karen.diaz@bia.app'],
            showMembersAndRoles: true,
            showDashboard: true
          }
        };
        win.localStorage.setItem('configValues', JSON.stringify(configToSet));
        cy.log('✅ ConfigValues establecido manualmente');
      }
    });
    
    // Esperar un momento para que la aplicación procese el configValues
    cy.wait(2000);

    // Paso 2: Cambiar de cuenta
    const nuevoCorreo = 'karen.diaz@bia.app';

    // Esperar tiempo adicional para que Remote Config y todos los datos se procesen completamente
    cy.log('⏳ Esperando a que todos los datos y configuraciones se procesen...');
    cy.wait(5000);
    
    // Limpiar caché del navegador (sin recargar para mantener la sesión)
    cy.window().then((win) => {
      if (win.caches) {
        win.caches.keys().then((names) => {
          names.forEach((name) => {
            win.caches.delete(name);
          });
        });
      }
    });
    
    cy.log('✅ Caché limpiada, continuando con el cambio de cuenta...');

    // Hacer clic en el botón sidebar header (esto incluye depuración)
    dropdownNavegacionPage.hacerClicEnSidebarHeader();

    // Esperar un momento adicional para que el dropdown se renderice completamente
    cy.wait(3000);
    
    // Intentar múltiples estrategias para encontrar el elemento
    cy.get('body').then(($body) => {
      const elementById = $body.find('#change-account');
      const elementExists = elementById.length > 0;
      
      cy.log(`🔍 Verificación: Elemento #change-account existe: ${elementExists}`);
      
      if (elementExists && elementById.is(':visible')) {
        cy.log('✅ Elemento encontrado y visible, haciendo clic...');
        cy.get('#change-account').click();
      } else if (elementExists && !elementById.is(':visible')) {
        cy.log('⚠️ Elemento existe pero no es visible, intentando hacer scroll y clic...');
        cy.get('#change-account').scrollIntoView().click({ force: true });
      } else {
        cy.log('⚠️ Elemento no encontrado por ID, buscando por texto...');
        // Buscar por texto dentro de posibles contenedores del dropdown
        cy.get('body').contains(/cambiar cuenta/i, { timeout: 10000 })
          .should('exist')
          .scrollIntoView()
          .click();
      }
    });

    // Verificar que se visualiza la pantalla de cambio de cuenta
    dropdownNavegacionPage.verificarPantallaCambioCuenta();

    // Ingresar el correo del cliente en el input
    dropdownNavegacionPage.ingresarCorreoCliente(nuevoCorreo);

    // Esperar a que aparezca en el buscador y hacer clic
    dropdownNavegacionPage.seleccionarResultadoBuscador(nuevoCorreo);

    // Hacer clic en el botón cambiar de cuenta
    dropdownNavegacionPage.hacerClicEnCambiarDeCuenta();

    // Esperar a que se complete el cambio de perfil y se redirija al home
    cy.url({ timeout: 20000 }).should('include', '/home');
    
    // Verificar que el home haya cargado completamente
    homePage.verificarQueCargo();
    
    cy.log('✅ Cambio de perfil completado exitosamente - Test finalizado');
  });
});

