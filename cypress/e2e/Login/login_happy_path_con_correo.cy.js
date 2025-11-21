// cypress/e2e/Login/login_happy_path_con_correo.cy.js
import LoginPage from '../../pages/LoginPage.js';
import HomePage from '../../pages/HomePage.js';
import { INTERCEPTS } from '../../pages/config.js';

describe('Login happy path con correo', () => {
  let loginPage;
  let homePage;

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
    // Intercepta el login exitoso (credenciales válidas -> 200)
    cy.intercept('POST', '**/bia-auth/signin').as(INTERCEPTS.SIGNIN);
    cy.intercept('GET', '**/ms-users/contracts/**').as(INTERCEPTS.CONTRACTS);

    cy.viewport(1920, 1080);
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'));

    // Inicializar instancias de páginas
    loginPage = new LoginPage();
    homePage = new HomePage();
  });

  it('Debería hacer login exitosamente con correo y contraseña válidas', () => {
    const email = 'astrid.tovar@bia.app';
    const password = 'Akamaru123*';

    // Realizar login completo usando métodos de la página
    loginPage.loginCompleto(email, password);

    // Espera explícita a la respuesta exitosa del signin
    cy.wait(`@${INTERCEPTS.SIGNIN}`, { timeout: 20000 })
      .its('response.statusCode')
      .should('eq', 200);

    // Verifica que se redirige al home
    cy.url({ timeout: 20000 }).should('include', '/home');
    
    // Espera a que carguen los contratos (necesario para que el home cargue completamente)
    cy.wait(`@${INTERCEPTS.CONTRACTS}`, { timeout: 30000 });

    // Verifica que el home haya cargado completamente
    homePage.verificarQueCargo();
  });
});

