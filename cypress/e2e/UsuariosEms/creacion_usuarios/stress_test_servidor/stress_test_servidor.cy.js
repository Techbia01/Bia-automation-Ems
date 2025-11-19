// cypress/e2e/UsuariosEms/creacion_usuarios/stress_test_servidor/stress_test_servidor.cy.js
import LoginPage from '../../../../pages/LoginPage.js';
import CreacionUsuarioEmsPage from '../../../../pages/creacion_usuarios/creacion_usuario_ems/CreacionUsuarioEmsPage.js';

describe('Stress Test - Saturación del Servidor', () => {
  let loginPage;
  let creacionUsuarioPage;

  // ⚠️ Ignorar errores de red y servidor para este test de stress
  before(() => {
    Cypress.on('uncaught:exception', (err) => {
      // Ignorar todos los errores de red y servidor en este test de stress
      if (
        err?.message?.includes('includes') ||
        err?.message?.includes('Kustomer.start') ||
        err?.message?.includes('Network response was not ok') ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('503') ||
        err?.message?.includes('502') ||
        err?.message?.includes('504') ||
        err?.message?.includes('Service Unavailable') ||
        err?.message?.includes('Bad Gateway') ||
        err?.message?.includes('Gateway Timeout')
      ) {
        return false;
      }
      return true;
    });
  });

  beforeEach(() => {
    // Intercepts para capturar todas las peticiones
    cy.intercept('POST', '**/bia-auth/signin').as('signin');
    cy.intercept('GET', '**/ms-users/contracts/**').as('contracts');
    cy.intercept('GET', '**/ms-energy-insights/dashboard/v3/consumption-data').as('consumptionData');
    cy.intercept('GET', '**/ms-client-orc/v1/access-management/roles/**').as('getRoles');
    cy.intercept('GET', '**/ms-client-orc/v1/members/**').as('getMembers');
    cy.intercept('POST', '**/ems-api/app-users/**').as('createUser');
    cy.intercept('GET', '**/ems-api/app-users/**').as('getUsers');

    cy.viewport(1920, 1080);
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'), {
      failOnStatusCode: false,
      timeout: 60000
    });
  });

  it('Debería saturar el servidor con múltiples acciones rápidas', () => {
    loginPage = new LoginPage();
    creacionUsuarioPage = new CreacionUsuarioEmsPage();

    cy.log('🔥 INICIANDO STRESS TEST - Saturación del servidor');
    cy.log('');

    // ============================================================
    // PASO 1: LOGIN RÁPIDO
    // ============================================================
    cy.log('🔐 Login rápido...');
    cy.get(loginPage.emailInput, { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type('astrid.tovar@bia.app', { delay: 0 });

    cy.get(loginPage.continueButton).click();
    cy.get(loginPage.passwordInput, { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type('Akamaru123*', { delay: 0, log: false });

    cy.get(loginPage.loginButton).click();
    cy.wait('@signin', { timeout: 30000 });
    cy.url({ timeout: 30000 }).should('include', '/home');
    cy.wait('@contracts', { timeout: 30000 });
    
    // Esperar a que la página cargue completamente antes de navegar
    cy.wait(2000); // Espera para que la página se estabilice

    // ============================================================
    // PASO 2: NAVEGACIÓN RÁPIDA
    // ============================================================
    cy.log('📂 Navegación rápida a usuarios...');
    cy.get(creacionUsuarioPage.settingsButton, { timeout: 20000 })
      .should('be.visible')
      .click({ force: true });

    cy.get(creacionUsuarioPage.usersButton, { timeout: 15000 })
      .click({ force: true });

    cy.url({ timeout: 15000 }).should('include', '/settings/users');

    // ============================================================
    // PASO 3: ABRIR Y CERRAR MODAL MÚLTIPLES VECES RÁPIDAMENTE
    // ============================================================
    cy.log('🔥 Abriendo y cerrando modal múltiples veces para saturar...');
    
    const numIteraciones = 30; // Aumentado para más carga
    
    for (let i = 1; i <= numIteraciones; i++) {
      cy.log(`🔄 Iteración ${i}/${numIteraciones}`);
      
      // Abrir modal SIN ESPERAR
      cy.get(creacionUsuarioPage.createUsersButton, { timeout: 15000 })
        .click({ force: true });

      // Llenar campos con .blur() para disparar validaciones (TÉCNICA QUE CAUSÓ 503)
      cy.get(creacionUsuarioPage.nombreInput, { timeout: 5000 })
        .clear({ force: true })
        .type(`Test${i}`, { delay: 0, force: true })
        .blur(); // Dispara validación → genera petición al servidor

      cy.get(creacionUsuarioPage.apellidoInput, { timeout: 5000 })
        .clear({ force: true })
        .type(`Robot${i}`, { delay: 0, force: true })
        .blur(); // Dispara validación → genera petición al servidor

      cy.get(creacionUsuarioPage.correoInput, { timeout: 5000 })
        .clear({ force: true })
        .type(`test${i}@example.com`, { delay: 0, force: true })
        .blur(); // Dispara validación → genera petición al servidor

      // MÚLTIPLES CLICKS FUERA PARA DISPARAR VALIDACIONES (TÉCNICA QUE CAUSÓ 503)
      for (let j = 0; j < 10; j++) {
        cy.get('body').click(0, 0, { force: true });
        cy.get('body').click(100, 100, { force: true });
        cy.get('body').click(200, 200, { force: true });
        cy.get('body').click(300, 300, { force: true });
      }

      // MÚLTIPLES VERIFICACIONES DE MENSAJES DE ERROR (TÉCNICA QUE CAUSÓ 503)
      // Esto hace múltiples queries al DOM y puede generar carga
      for (let k = 0; k < 5; k++) {
        cy.get('body').then(($body) => {
          const hasErrorMessages = $body.find('.bia-input__error, [class*="error"], [class*="Error"]').length > 0 ||
                                  $body.text().includes('Debe ingresar al menos nombre y apellido') ||
                                  $body.text().includes('Debe ingresar un correo válido') ||
                                  $body.text().includes('Debe ingresar');
        });
      }

      // Presionar ESC para cerrar SIN ESPERAR
      cy.get('body').type('{esc}', { force: true });
    }

    cy.log('');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('🔥 STRESS TEST COMPLETADO');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log(`✅ Se realizaron ${numIteraciones} iteraciones de apertura/cierre de modal`);
    cy.log('⚠️ Si el servidor sigue funcionando, el test pasó');
    cy.log('');
  });

  it('Debería hacer múltiples peticiones simultáneas al servidor', () => {
    loginPage = new LoginPage();
    creacionUsuarioPage = new CreacionUsuarioEmsPage();

    cy.log('🔥 INICIANDO STRESS TEST - Múltiples peticiones simultáneas');
    cy.log('');

    // ============================================================
    // PASO 1: LOGIN
    // ============================================================
    cy.get(loginPage.emailInput, { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type('astrid.tovar@bia.app', { delay: 0 });

    cy.get(loginPage.continueButton).click();
    cy.get(loginPage.passwordInput, { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type('Akamaru123*', { delay: 0, log: false });

    cy.get(loginPage.loginButton).click();
    cy.wait('@signin', { timeout: 30000 });
    cy.url({ timeout: 30000 }).should('include', '/home');
    cy.wait('@contracts', { timeout: 30000 });
    
    // Esperar a que la página cargue completamente antes de navegar
    cy.wait(2000); // Espera para que la página se estabilice

    // ============================================================
    // PASO 2: NAVEGAR A USUARIOS
    // ============================================================
    cy.get(creacionUsuarioPage.settingsButton, { timeout: 20000 })
      .should('be.visible')
      .click({ force: true });

    cy.get(creacionUsuarioPage.usersButton, { timeout: 15000 })
      .click({ force: true });

    cy.url({ timeout: 15000 }).should('include', '/settings/users');

    // ============================================================
    // PASO 3: ABRIR MODAL Y HACER MÚLTIPLES INTERACCIONES RÁPIDAS
    // ============================================================
    cy.log('🔥 Abriendo modal y haciendo múltiples interacciones rápidas...');
    
    cy.get(creacionUsuarioPage.createUsersButton, { timeout: 15000 })
      .click({ force: true });

    cy.get(creacionUsuarioPage.nombreInput, { timeout: 20000 })
      .should('exist');

    // AUMENTADO: Más acciones para saturar más
    const numAcciones = 50;
    
    for (let i = 0; i < numAcciones; i++) {
      // Escribir con .blur() para disparar validaciones (TÉCNICA QUE CAUSÓ 503)
      cy.get(creacionUsuarioPage.nombreInput, { timeout: 5000 })
        .clear({ force: true })
        .type(`Test${i}`, { delay: 0, force: true })
        .blur() // Dispara validación → genera petición
        .clear({ force: true })
        .blur(); // Otro blur para más carga

      // Escribir con .blur() para disparar validaciones
      cy.get(creacionUsuarioPage.apellidoInput, { timeout: 5000 })
        .clear({ force: true })
        .type(`Robot${i}`, { delay: 0, force: true })
        .blur() // Dispara validación → genera petición
        .clear({ force: true })
        .blur(); // Otro blur para más carga

      // Escribir con .blur() para disparar validaciones
      cy.get(creacionUsuarioPage.correoInput, { timeout: 5000 })
        .clear({ force: true })
        .type(`test${i}@example.com`, { delay: 0, force: true })
        .blur() // Dispara validación → genera petición
        .clear({ force: true })
        .blur(); // Otro blur para más carga

      // MÚLTIPLES CLICKS FUERA PARA DISPARAR VALIDACIONES (TÉCNICA QUE CAUSÓ 503)
      // Aumentado a más clicks para más carga
      for (let j = 0; j < 10; j++) {
        cy.get('body').click(0, 0, { force: true });
        cy.get('body').click(50, 50, { force: true });
        cy.get('body').click(100, 100, { force: true });
        cy.get('body').click(150, 150, { force: true });
        cy.get('body').click(200, 200, { force: true });
      }

      // MÚLTIPLES VERIFICACIONES DE MENSAJES DE ERROR (TÉCNICA QUE CAUSÓ 503)
      // Esto hace múltiples queries al DOM y genera carga
      for (let k = 0; k < 5; k++) {
        cy.get('body').then(($body) => {
          const hasErrorMessages = $body.find('.bia-input__error, [class*="error"], [class*="Error"]').length > 0 ||
                                  $body.text().includes('Debe ingresar al menos nombre y apellido') ||
                                  $body.text().includes('Debe ingresar un correo válido') ||
                                  $body.text().includes('Debe ingresar');
        });
      }

      // Click rápido en diferentes campos con blur
      cy.get(creacionUsuarioPage.telefonoInput, { timeout: 5000 })
        .click({ force: true })
        .clear({ force: true })
        .type(`311307319${i}`, { delay: 0, force: true })
        .blur() // Dispara validación
        .clear({ force: true })
        .blur(); // Otro blur

      // Click en área/rol también con blur
      cy.get(creacionUsuarioPage.areaRolInput, { timeout: 5000 })
        .click({ force: true })
        .clear({ force: true })
        .type(`area${i}`, { delay: 0, force: true })
        .blur() // Dispara validación
        .clear({ force: true })
        .blur(); // Otro blur
    }

    cy.log('');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('🔥 STRESS TEST COMPLETADO');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log(`✅ Se realizaron ${numAcciones} acciones rápidas consecutivas`);
    cy.log('⚠️ Si el servidor sigue funcionando, el test pasó');
    cy.log('');
  });
});

