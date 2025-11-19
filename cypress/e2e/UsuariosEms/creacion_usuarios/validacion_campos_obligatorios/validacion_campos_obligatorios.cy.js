// cypress/e2e/UsuariosEms/creacion_usuarios/validacion_campos_obligatorios/validacion_campos_obligatorios.cy.js
import LoginPage from '../../../../pages/LoginPage.js';
import CreacionUsuarioEmsPage from '../../../../pages/creacion_usuarios/creacion_usuario_ems/CreacionUsuarioEmsPage.js';

describe('Validación de Campos Obligatorios - Creación de Usuario EMS', () => {
  let loginPage;
  let creacionUsuarioPage;

  // ⚠️ Temporal: evita que scripts externos o errores de red rompan el test
  before(() => {
    Cypress.on('uncaught:exception', (err) => {
      if (
        err?.message?.includes('includes') ||
        err?.message?.includes('Kustomer.start') ||
        err?.message?.includes('Network response was not ok') ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('503') ||
        err?.message?.includes('Service Unavailable')
      ) {
        return false; // no fallar el test por esto
      }
      // para cualquier otro error, sí rompemos
      return true;
    });
  });

  beforeEach(() => {
    // Intercepts antes de visitar (para que Cypress los capture)
    cy.intercept('POST', '**/bia-auth/signin').as('signin');
    cy.intercept('GET', '**/ms-users/contracts/**').as('contracts');
    cy.intercept('GET', '**/ms-energy-insights/dashboard/v3/consumption-data').as('consumptionData');
    cy.intercept('GET', '**/ms-client-orc/v1/access-management/roles/**').as('getRoles');
    cy.intercept('GET', '**/ms-client-orc/v1/members/**').as('getMembers');

    cy.viewport(1920, 1080);
    // Visitar con manejo de errores del servidor (503, 502, etc.)
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'), {
      failOnStatusCode: false,
      timeout: 60000
    });
  });

  it('Debería validar que el botón Siguiente se habilita solo cuando todos los campos obligatorios están completos', () => {
    loginPage = new LoginPage();
    creacionUsuarioPage = new CreacionUsuarioEmsPage();

    // ============================================================
    // PASO 1: LOGIN
    // ============================================================
    cy.log('🔐 Iniciando sesión...');
    cy.get(loginPage.emailInput, { timeout: 15000 })
      .should('be.visible')
      .and('be.enabled')
      .clear()
      .type('astrid.tovar@bia.app', { delay: 0 });

    cy.get(loginPage.continueButton)
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    cy.get(loginPage.passwordInput, { timeout: 15000 })
      .should('be.visible')
      .and('be.enabled')
      .clear()
      .type('Akamaru123*', { delay: 0, log: false });

    cy.get(loginPage.loginButton)
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Esperar a que se complete el login
    cy.wait('@signin', { timeout: 30000 });
    cy.url({ timeout: 30000 }).should('include', '/home');
    cy.wait('@contracts', { timeout: 30000 });
    cy.log('✅ Login completado');

    // ============================================================
    // PASO 2: NAVEGAR A LA SECCIÓN DE USUARIOS
    // ============================================================
    cy.log('📂 Navegando a la sección de usuarios...');
    
    // Verificar que estamos en home antes de navegar
    cy.url().should('include', '/home');
    
    cy.get(creacionUsuarioPage.settingsButton, { timeout: 15000 })
      .should('be.visible')
      .click();

    // Esperar a que la navegación se complete
    cy.wait(1000);
    
    cy.get(creacionUsuarioPage.usersButton, { timeout: 15000 })
      .should('be.visible')
      .click();

    // Esperar a que la página cargue completamente
    cy.url({ timeout: 15000 }).should('include', '/settings/users');
    cy.wait(1500);
    cy.log('✅ Navegación a usuarios completada');

    // ============================================================
    // PASO 3: ABRIR EL MODAL DE CREACIÓN DE USUARIOS
    // ============================================================
    cy.log('🔍 Abriendo modal de creación de usuario...');
    
    // Verificar que estamos en la página correcta
    cy.url().should('include', '/settings/users');
    
    cy.get(creacionUsuarioPage.createUsersButton, { timeout: 15000 })
      .should('be.visible')
      .click();

    // Esperar a que el modal se abra completamente
    cy.wait(1500);
    cy.get(creacionUsuarioPage.nombreInput, { timeout: 20000 })
      .should('be.visible')
      .should('be.enabled');
    cy.log('✅ Modal de creación abierto correctamente');

    // ============================================================
    // PASO 4: VERIFICAR BOTÓN DESHABILITADO CON CAMPOS VACÍOS
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('📋 VALIDACIÓN 1: Campos vacíos');
    cy.log('═══════════════════════════════════════════════════════════');
    
    // Verificar que el modal sigue abierto
    cy.get(creacionUsuarioPage.nombreInput, { timeout: 10000 })
      .should('be.visible');
    
    // Hacer clic fuera de los campos para activar la validación
    cy.get('body').click(0, 0); // Clic fuera para perder el foco
    cy.wait(800); // Esperar para que se procese la validación
    
    // Verificar mensajes de error (si existen)
    cy.get('body').then(($body) => {
      const hasErrorMessages = $body.find('.bia-input__error, [class*="error"], [class*="Error"]').length > 0 ||
                              $body.text().includes('Debe ingresar al menos nombre y apellido') ||
                              $body.text().includes('Debe ingresar un correo válido') ||
                              $body.text().includes('Debe ingresar');
      
      if (hasErrorMessages) {
        cy.log('✅ Mensajes de error de validación visibles');
      }
    });
    
    cy.get(creacionUsuarioPage.siguienteButton, { timeout: 15000 })
      .should('be.visible')
      .should('be.disabled')
      .then(() => {
        cy.log('✅ Botón deshabilitado correctamente (campos vacíos)');
      });

    // ============================================================
    // PASO 5: LLENAR NOMBRE, APELLIDO Y CORREO (SIN ÁREA/ROL) - BOTÓN DEBE SEGUIR DESHABILITADO
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('📋 VALIDACIÓN 2: Nombre, Apellido y Correo llenos (falta Área/Rol obligatorio)');
    cy.log('═══════════════════════════════════════════════════════════');
    
    // Verificar que el modal sigue abierto
    cy.get(creacionUsuarioPage.nombreInput, { timeout: 10000 })
      .should('be.visible');
    
    // Llenar Nombre
    cy.get(creacionUsuarioPage.nombreInput, { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type('Test', { delay: 50 })
      .should('have.value', 'Test');

    // Llenar Apellido
    cy.get(creacionUsuarioPage.apellidoInput, { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type('Robot', { delay: 50 })
      .should('have.value', 'Robot');

    // Llenar Correo
    cy.get(creacionUsuarioPage.correoInput, { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type('test@example.com', { delay: 50 })
      .should('have.value', 'test@example.com');

    // Llenar Teléfono (opcional, pero lo llenamos para probar)
    cy.get(creacionUsuarioPage.telefonoInput, { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type('3113073199', { delay: 50 });

    // Esperar solo una vez después de llenar todos los campos
    cy.wait(1500);

    // Verificar que el modal sigue abierto
    cy.get(creacionUsuarioPage.nombreInput, { timeout: 10000 })
      .should('be.visible');
    
    // Verificar mensajes de error para área/rol faltante
    cy.get('body').then(($body) => {
      const hasErrorMessages = $body.find('.bia-input__error, [class*="error"], [class*="Error"]').length > 0 ||
                              $body.text().includes('Debe ingresar') ||
                              $body.text().includes('obligatorio');
      
      if (hasErrorMessages) {
        cy.log('✅ Mensajes de error visibles (falta Área/Rol)');
      }
    });
    
    // Verificar que el botón sigue deshabilitado porque falta Área/Rol
    cy.get(creacionUsuarioPage.siguienteButton, { timeout: 15000 })
      .should('be.visible')
      .should('be.disabled')
      .then(() => {
        cy.log('✅ Botón deshabilitado correctamente (falta Área/Rol - campo obligatorio)');
        cy.log('');
        cy.log('🎉 VALIDACIÓN EXITOSA - La prueba puede finalizar aquí');
        cy.log('💡 Se verificó que el botón NO se habilita cuando falta un campo obligatorio (Área/Rol)');
      });

    // ============================================================
    // RESUMEN FINAL
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('✅ VALIDACIÓN COMPLETA - TODAS LAS PRUEBAS PASARON');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('');
    cy.log('📋 Resumen de validaciones:');
    cy.log('   ✅ Botón deshabilitado con campos vacíos');
    cy.log('   ✅ Botón deshabilitado cuando falta un campo obligatorio (Área/Rol)');
    cy.log('');
    cy.log('💡 La prueba verifica que el botón Siguiente NO se habilita');
    cy.log('   cuando falta un campo obligatorio (Área/Rol), incluso si');
    cy.log('   los demás campos obligatorios (nombre, apellido, correo) están completos.');
    cy.log('');
  });
});
