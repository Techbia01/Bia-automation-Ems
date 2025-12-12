// cypress/e2e/Home/Dropdown de navegacion/legales/legales.cy.js
import LoginPage from '../../../pages/LoginPage.js';
import HomePage from '../../../pages/HomePage.js';
import DropdownNavegacionPage from '../../../pages/Home/DropdownNavegacionPage.js';
import LegalesPage from '../../../pages/LegalesPage.js';
import { INTERCEPTS } from '../../../pages/config.js';

describe('Dropdown de navegación - Legales', () => {
  let loginPage;
  let homePage;
  let dropdownNavegacionPage;
  let legalesPage;

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
    legalesPage = new LegalesPage();
  });

  it('Debería redirigir a la página de legales y mostrar la vista de documentos', () => {
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
    
    cy.log('✅ Datos procesados, continuando con la navegación a legales...');

    // Paso 2: Navegar a legales desde el dropdown
    dropdownNavegacionPage.navegarALegales();

    // Paso 3: Verificar que se redirige y carga la página de legales correctamente
    legalesPage.verificarQueCargo();

    // Paso 4: Verificar que la vista de documentos se muestra correctamente
    legalesPage.verificarVistaDocumentos();
    
    cy.log('✅ Navegación a legales y visualización de documentos completada exitosamente - Test finalizado');
  });
});

