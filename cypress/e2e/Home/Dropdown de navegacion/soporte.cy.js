// cypress/e2e/Home/Dropdown de navegacion/soporte.cy.js
import LoginPage from '../../../pages/LoginPage.js';
import HomePage from '../../../pages/HomePage.js';
import DropdownNavegacionPage from '../../../pages/Home/DropdownNavegacionPage.js';
import { INTERCEPTS } from '../../../pages/config.js';

describe('Dropdown de navegación - Soporte', () => {
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
    
    // Interceptar errores 404 de fuentes que son esperados y no afectan la funcionalidad
    cy.intercept('GET', '**/fonts/inter/Inter-Medium.woff2', { statusCode: 404 }).as('font404');
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
    cy.intercept('GET', '**/users/**').as('getUserInfo');
    cy.intercept('GET', '**/members/me**').as('getMemberInfo');
    cy.intercept('GET', '**/contracts-groups**').as('getContractsGroups');
    cy.intercept('GET', '**/roles/settings**').as('getRolesSettings');
    
    // Mockear Firebase Remote Config
    const mockRemoteConfigResponse = {
      entries: {
        configValues: JSON.stringify({
          webusers: {
            whitelist_change_account: ['astrid.tovar@bia.app', 'karen.diaz@bia.app', 'estefany.'],
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
    
    // Interceptar errores 404 de fuentes que son esperados y no afectan la funcionalidad
    cy.intercept('GET', '**/fonts/inter/Inter-Medium.woff2', { statusCode: 404 }).as('font404');

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
        console.log('✅ ConfigValues establecido antes del login');
      }
    });
    
    cy.log('✅ ConfigValues establecido antes del login');

    // Inicializar instancias de páginas
    loginPage = new LoginPage();
    homePage = new HomePage();
    dropdownNavegacionPage = new DropdownNavegacionPage();
  });

  it('Debería redirigir a la página de soporte y poder hacer una pregunta en el chat', () => {
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

    // Esperar un momento para que la aplicación procese el configValues
    cy.wait(2000);

    // Esperar tiempo adicional para que Remote Config y todos los datos se procesen completamente
    cy.log('⏳ Esperando a que todos los datos y configuraciones se procesen...');
    cy.wait(3000);
    
    cy.log('✅ Datos procesados, continuando con la navegación a soporte...');

    // Paso 2: Navegar a soporte desde el dropdown
    dropdownNavegacionPage.navegarASoporte();

    // Paso 3: Verificar que se redirige a la página de soporte
    // La URL correcta es: https://web.dev.bia.app/support
    cy.url({ timeout: 30000 }).then((url) => {
      cy.log(`🔍 URL actual después de navegar a soporte: ${url}`);
      const urlLower = url.toLowerCase();
      const urlEsperada = 'https://web.dev.bia.app/support';
      
      // Verificar que la URL contenga /support
      const includesSupport = urlLower.includes('/support') || 
                              urlLower.includes('/soporte') ||
                              urlLower.includes('web.dev.bia.app/support') ||
                              urlLower.includes('web.dev.bia.app/soporte');
      
      if (!includesSupport) {
        cy.log(`⚠️ URL actual no contiene '/support' o '/soporte': ${url}`);
        cy.log(`⚠️ URL esperada: ${urlEsperada}`);
      } else {
        cy.log(`✅ URL contiene '/support': ${url}`);
        if (url.toLowerCase() === urlEsperada.toLowerCase()) {
          cy.log(`✅ URL exacta correcta: ${url}`);
        }
      }
      
      expect(includesSupport, `La URL debería contener '/support' o '/soporte', pero es: ${url}`).to.be.true;
    });
    
    // Verificación adicional usando should para asegurar que la URL contiene /support
    cy.url({ timeout: 30000 }).should('include', '/support');
    
    cy.log('✅ Redirección a soporte completada');

    // Paso 4: Interactuar con el chat de soporte
    dropdownNavegacionPage.interactuarConChatSoporte();
    
    cy.log('✅ Interacción con chat de soporte completada exitosamente - Test finalizado');
  });
});

