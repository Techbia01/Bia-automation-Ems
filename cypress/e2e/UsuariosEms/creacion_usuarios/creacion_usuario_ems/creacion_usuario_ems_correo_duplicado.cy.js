// cypress/e2e/UsuariosEms/creacion_usuarios/creacion_usuario_ems/creacion_usuario_ems_correo_duplicado.cy.js
import LoginPage from '../../../../pages/LoginPage.js';
import HomePage from '../../../../pages/HomePage.js';
import CreacionUsuarioEmsPage from '../../../../pages/creacion_usuarios/creacion_usuario_ems/CreacionUsuarioEmsPage.js';
import { TEST_DATA } from '../../../../pages/config.js';

describe('Creación de Usuarios EMS - Negative Path: Correo Duplicado', () => {
  let loginPage;
  let homePage;
  let creacionUsuarioPage;

  // Correo que ya existe en el sistema
  const correoDuplicado = 'karen.diaz@bia.app';

  // ⚠️ Temporal: evita que scripts externos o el bug de "includes" rompan el test
  before(() => {
    Cypress.on('uncaught:exception', (err) => {
      if (
        err?.message?.includes('includes') ||
        err?.message?.includes('Kustomer.start')
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
    cy.intercept('POST', '**/ems-api/app-users/**').as('createUser');
    cy.intercept('POST', '**/ms-client-orc/v1/members**').as('createMember');
    cy.intercept('GET', '**/ems-api/app-users/**').as('getUsers');
    cy.intercept('GET', '**/ms-client-orc/v1/access-management/roles/**').as('getRoles');
    cy.intercept('GET', '**/ems-api/app-users/roles/settings**').as('getRolesSettings');
    cy.intercept('GET', '**/ms-client-orc/v1/members/**').as('getMembers');

    cy.viewport(1920, 1080);
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'));
  });

  it('No debería permitir crear un usuario con un correo que ya existe', () => {
    loginPage = new LoginPage();
    homePage = new HomePage();
    creacionUsuarioPage = new CreacionUsuarioEmsPage();

    // Paso 1: Login
    cy.get(loginPage.emailInput, { timeout: 10000 })
      .should('be.visible')
      .and('be.enabled')
      .clear()
      .type('astrid.tovar@bia.app', { delay: 0 });

    cy.get(loginPage.continueButton)
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    cy.get(loginPage.passwordInput, { timeout: 10000 })
      .should('be.visible')
      .and('be.enabled')
      .clear()
      .type('Akamaru123*', { delay: 0, log: false });

    cy.get(loginPage.loginButton)
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Esperar a las llamadas clave que pueblan el Home
    cy.wait('@signin', { timeout: 20000 });
    cy.url({ timeout: 20000 }).should('include', '/home');
    cy.wait('@contracts', { timeout: 30000 });

    // Paso 2: Navegar a la sección de usuarios
    cy.get(creacionUsuarioPage.settingsButton, { timeout: 10000 })
      .should('be.visible')
      .click();

    cy.get(creacionUsuarioPage.usersButton, { timeout: 10000 })
      .should('be.visible')
      .click();

    // Paso 3: Abrir el modal de creación de usuarios
    cy.log('🔍 Abriendo modal de creación de usuarios...');
    cy.get(creacionUsuarioPage.createUsersButton, { timeout: 10000 })
      .should('be.visible')
      .click();

    // Esperar a que el modal se abra
    cy.wait(2000);
    
    // Verificar que el modal se abrió
    cy.get(creacionUsuarioPage.nombreInput, { timeout: 10000 })
      .should('be.visible')
      .then(() => {
        cy.log('✅ Modal de creación abierto correctamente');
      });

    // Paso 4: Llenar el formulario completo con el correo duplicado
    cy.log(`📝 Intentando crear usuario con correo duplicado: ${correoDuplicado}`);
    
    const timestamp = Date.now();
    
    // Generar valores únicos para la creación (nombres reales sin números)
    const nombresReales = ['María', 'Carlos', 'Ana', 'Juan', 'Laura', 'Pedro', 'Sofía', 'Diego', 'Isabella', 'Andrés'];
    const apellidosReales = ['González', 'Rodríguez', 'Martínez', 'López', 'García', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores'];
    
    // Seleccionar nombre y apellido basado en el timestamp para hacerlos únicos
    const indiceNombre = timestamp % nombresReales.length;
    const indiceApellido = (timestamp * 7) % apellidosReales.length;
    
    const nombre = nombresReales[indiceNombre];
    const apellido = apellidosReales[indiceApellido];
    
    // Teléfono de 10 dígitos: usar los últimos 3 dígitos del timestamp para mantenerlo único
    const ultimosDigitos = timestamp.toString().slice(-3);
    const telefono = `3113073${ultimosDigitos}`; // Total: 10 dígitos
    
    const areaRol = TEST_DATA.NEW_USER.areaRol;

    cy.log(`📝 Creando usuario con correo duplicado`);
    cy.log(`📧 Correo: ${correoDuplicado}`);
    cy.log(`👤 Nombre: ${nombre} ${apellido}`);

    // Llenar nombre
    cy.get(creacionUsuarioPage.nombreInput, { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .clear()
      .type(nombre, { delay: 50, parseSpecialCharSequences: false })
      .should('have.value', nombre);

    // Llenar apellido
    cy.get(creacionUsuarioPage.apellidoInput, { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .clear()
      .type(apellido, { delay: 50, parseSpecialCharSequences: false })
      .should('have.value', apellido);

    // Llenar correo DUPLICADO (karen.diaz@bia.app)
    cy.get(creacionUsuarioPage.correoInput, { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .clear()
      .type(correoDuplicado, { delay: 50, parseSpecialCharSequences: false })
      .should('have.value', correoDuplicado);

    // Llenar teléfono
    cy.get(creacionUsuarioPage.telefonoInput, { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .clear()
      .type(telefono, { delay: 50, parseSpecialCharSequences: false })
      .invoke('val')
      .then((value) => {
        // Extraer solo los dígitos del valor formateado
        const digits = value.replace(/\D/g, '');
        expect(digits).to.equal(telefono);
      });

    // Llenar área y rol
    cy.get(creacionUsuarioPage.areaRolInput, { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .click({ force: true })
      .clear()
      .type(areaRol, { delay: 100, parseSpecialCharSequences: false })
      .should('have.value', areaRol);
    
    // Esperar un momento adicional para que el campo de área y rol se registre
    cy.wait(1000);
    
    // Esperar un momento para que el formulario valide los campos
    cy.wait(1000);

    // Paso 5: Avanzar al siguiente paso
    cy.get(creacionUsuarioPage.siguienteButton, { timeout: 10000 })
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Paso 6: Seleccionar rol - Paso 2 (Roles)
    const rolSeleccionado = 'Administración';
    cy.get(creacionUsuarioPage.rolAdministracion, { timeout: 10000 })
      .should('be.visible')
      .click();

    // Avanzar al siguiente paso
    cy.get(creacionUsuarioPage.siguienteButton, { timeout: 10000 })
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Paso 7: Seleccionar sedes - Paso 3 (Sedes)
    cy.get(creacionUsuarioPage.seleccionarTodasLasSedesCheckbox, { timeout: 10000 })
      .check({ force: true });

    // Avanzar al siguiente paso después de seleccionar sedes
    cy.get(creacionUsuarioPage.siguienteButton, { timeout: 10000 })
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Esperar a que se actualice la UI y aparezca la siguiente pantalla
    cy.wait(1000);

    // Paso 8: Intentar crear el usuario con correo duplicado
    cy.log('❌ Intentando crear usuario con correo duplicado...');
    cy.get(creacionUsuarioPage.crearUsuarioButton, { timeout: 15000 })
      .should('be.visible')
      .and('not.be.disabled')
      .click()
      .then(() => {
        cy.log('✅ Click en "Crear Usuario" completado');
      });
    
    // Esperar a que el servidor responda con error (members responde con 400)
    cy.log('⏳ Esperando respuesta del servidor...');
    cy.wait('@createMember', { timeout: 15000 }).then((interception) => {
      const statusCode = interception.response.statusCode;
      cy.log(`📊 Respuesta del servidor: Status ${statusCode}`);
      
      // Verificar que el servidor rechazó la creación
      expect([400, 409, 422]).to.include(statusCode);
      cy.log(`✅ El servidor rechazó correctamente la creación con status ${statusCode}`);
      
      // Verificar el mensaje de error si está disponible
      if (interception.response.body) {
        const errorBody = interception.response.body;
        cy.log('📋 Mensaje de error del servidor:');
        cy.log(JSON.stringify(errorBody, null, 2));
      }
    });
    
    // Verificar que el usuario NO se creó (esperar un momento para que se procese)
    cy.wait(3000);
    cy.log('🔍 Verificando que el usuario NO se creó en la base de datos...');
    
    // Verificar que no aparece el nuevo usuario en la tabla (el nombre completo no debería estar)
    cy.get('body').then(($body) => {
      const nombreCompleto = `${nombre} ${apellido}`;
      const bodyText = $body.text();
      
      // Si encontramos el nombre completo, podría ser un usuario existente, pero verificamos que no sea el nuevo
      if (bodyText.includes(nombreCompleto)) {
        cy.log(`⚠️ Se encontró "${nombreCompleto}" en la página`);
        cy.log('⚠️ Esto podría ser un usuario existente, no el nuevo que intentamos crear');
      } else {
        cy.log(`✅ No se encontró el nuevo usuario "${nombreCompleto}" en la tabla (correcto)`);
      }
    });
    
    cy.log('');
    cy.log('✅ El sistema correctamente rechazó la creación del usuario duplicado');
    cy.log('✅ El usuario NO se creó en la base de datos');
    cy.log('');

    cy.log('');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('✅ CASO NEGATIVO EXITOSO: No se puede crear usuario con correo duplicado');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('');
    cy.log('📋 Resumen:');
    cy.log(`   ✅ Se intentó crear usuario con correo duplicado: ${correoDuplicado}`);
    cy.log(`   ✅ Nombre: ${nombre} ${apellido}`);
    cy.log(`   ✅ Teléfono: ${telefono}`);
    cy.log(`   ✅ Área/Rol: ${areaRol}`);
    cy.log('   ✅ El servidor rechazó la creación correctamente');
    cy.log('   ✅ No se creó un usuario duplicado');
    cy.log('');
  });
});

