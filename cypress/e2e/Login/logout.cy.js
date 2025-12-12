// cypress/e2e/Login/logout.cy.js
import LoginPage from '../../pages/LoginPage.js';
import HomePage from '../../pages/HomePage.js';
import DropdownNavegacionPage from '../../pages/Home/DropdownNavegacionPage.js';
import { INTERCEPTS } from '../../pages/config.js';

describe('Logout', () => {
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
    cy.intercept('GET', '**/users/**').as('getUserInfo');
    cy.intercept('GET', '**/members/me**').as('getMemberInfo');
    cy.intercept('GET', '**/contracts-groups**').as('getContractsGroups');
    cy.intercept('GET', '**/roles/settings**').as('getRolesSettings');

    cy.viewport(1920, 1080);
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'));

    // Inicializar instancias de páginas
    loginPage = new LoginPage();
    homePage = new HomePage();
    dropdownNavegacionPage = new DropdownNavegacionPage();
  });

  it('Debería hacer logout exitosamente desde el dropdown de navegación', () => {
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

    // Esperar un momento para que la aplicación procese completamente
    cy.wait(2000);

    // Paso 2: Abrir dropdown de navegación y hacer logout
    cy.log('🖱️ Abriendo dropdown de navegación para cerrar sesión...');
    dropdownNavegacionPage.cerrarSesion();

    // Paso 3: Verificar que se redirige a la página de login
    cy.url({ timeout: 20000 }).should('include', '/login');
    
    // Verificar que la página de login esté visible
    cy.get('#email-input', { timeout: 10000 })
      .should('be.visible')
      .and('be.enabled');
    
    cy.log('✅ Logout completado exitosamente');
    cy.log('✅ Redirección a página de login confirmada - Automatización finalizada');
  });
});

