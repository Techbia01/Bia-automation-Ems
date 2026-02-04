// cypress/e2e/analisis/energia-reactiva/energia-reactiva.cy.js
import LoginPage from '../../../pages/LoginPage.js';
import HomePage from '../../../pages/HomePage.js';

describe('Análisis - Energía Reactiva', () => {
  let loginPage;
  let homePage;

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
    cy.viewport(1920, 1080);
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'));

    loginPage = new LoginPage();
    homePage = new HomePage();
  });

  it('Debería validar el análisis de energía reactiva', () => {
    const email = 'astrid.tovar@bia.app';
    const password = 'Akamaru123*';
    
    // Login
    loginPage.loginConCorreo(email, password);
    homePage.verificarQueCargo();
    
    cy.log('✅ Test de análisis de energía reactiva - Pendiente de implementar');
  });
});
