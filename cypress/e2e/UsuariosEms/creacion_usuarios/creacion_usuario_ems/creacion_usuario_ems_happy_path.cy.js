// cypress/e2e/UsuariosEms/creacion_usuarios/creacion_usuario_ems/creacion_usuario_ems_happy_path.cy.js
import LoginPage from '../../../../pages/LoginPage.js';
import HomePage from '../../../../pages/HomePage.js';
import CreacionUsuarioEmsPage from '../../../../pages/creacion_usuarios/creacion_usuario_ems/CreacionUsuarioEmsPage.js';
import { TEST_DATA } from '../../../../pages/config.js';

describe('Creación de Usuarios EMS - Happy Path', () => {
  let loginPage;
  let homePage;
  let creacionUsuarioPage;

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
    cy.intercept('GET', '**/ms-energy-insights/dashboard/v3/consumption-data').as('consumptionData');
    cy.intercept('POST', '**/ems-api/app-users/**').as('createUser');
    cy.intercept('GET', '**/ems-api/app-users/**').as('getUsers');
    cy.intercept('GET', '**/ms-client-orc/v1/access-management/roles/**').as('getRoles');
    cy.intercept('GET', '**/ems-api/app-users/roles/settings**').as('getRolesSettings');

    cy.viewport(1920, 1080);
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'));
  });

  it('Debería crear un usuario EMS completo paso a paso', () => {
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

    // Espera a las llamadas clave que pueblan el Home
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
    cy.get(creacionUsuarioPage.createUsersButton, { timeout: 10000 })
      .should('be.visible')
      .click();

    // Esperar a que el modal se abra
    cy.wait(1000);

    // Paso 4: Llenar el formulario - Paso 1 (Datos)
    const timestamp = Date.now();
    const nombre = TEST_DATA.NEW_USER.nombre;
    const apellido = TEST_DATA.NEW_USER.apellido;
    // Correo único para evitar duplicados (llave única)
    const correo = `testrobot${timestamp}@mailinator.com`;
    const telefono = TEST_DATA.NEW_USER.telefono;
    const areaRol = TEST_DATA.NEW_USER.areaRol;

    // Llenar nombre - escribir completo "TEST ROBOT"
    cy.get(creacionUsuarioPage.nombreInput, { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .clear()
      .type(nombre, { delay: 50, parseSpecialCharSequences: false })
      .should('have.value', nombre);

    // Llenar apellido - escribir completo "TEST"
    cy.get(creacionUsuarioPage.apellidoInput, { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .clear()
      .type(apellido, { delay: 50, parseSpecialCharSequences: false })
      .should('have.value', apellido);

    // Llenar correo - escribir completo con timestamp único
    cy.get(creacionUsuarioPage.correoInput, { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .clear()
      .type(correo, { delay: 50, parseSpecialCharSequences: false })
      .should('have.value', correo);

    // Llenar teléfono - escribir completo "3113073199"
    // El campo formatea automáticamente el número, así que verificamos que contenga los dígitos
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

    // Llenar área y rol - escribir completo "tech, qa"
    cy.get(creacionUsuarioPage.areaRolInput, { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .click({ force: true }) // Asegurar que el campo esté enfocado
      .clear()
      .type(areaRol, { delay: 100, parseSpecialCharSequences: false })
      .should('have.value', areaRol);
    
    // Esperar un momento adicional para que el campo de área y rol se registre
    cy.wait(1000);
    
    // Esperar un momento para que el formulario valide los campos
    cy.wait(1000);

    // Avanzar al siguiente paso
    cy.get(creacionUsuarioPage.siguienteButton, { timeout: 10000 })
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Paso 5: Seleccionar rol - Paso 2 (Roles)
    cy.get(creacionUsuarioPage.rolAdministracion, { timeout: 10000 })
      .should('be.visible')
      .click();

    // Avanzar al siguiente paso
    cy.get(creacionUsuarioPage.siguienteButton, { timeout: 10000 })
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Paso 6: Seleccionar sedes - Paso 3 (Sedes)
    // El checkbox puede tener opacity: 0 (checkbox personalizado), usar force: true
    cy.get(creacionUsuarioPage.seleccionarTodasLasSedesCheckbox, { timeout: 10000 })
      .check({ force: true });

    // Avanzar al siguiente paso después de seleccionar sedes
    cy.get(creacionUsuarioPage.siguienteButton, { timeout: 10000 })
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Esperar a que se actualice la UI y aparezca la siguiente pantalla
    cy.wait(1000);

    // Paso 7: Crear el usuario - en la siguiente pantalla
    cy.get(creacionUsuarioPage.crearUsuarioButton, { timeout: 15000 })
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Esperar a que se complete la creación
    cy.wait('@createUser', { timeout: 30000 });

    // Verificar que el usuario se creó correctamente
    // (Puedes agregar más aserciones según lo que muestre la aplicación)
    cy.contains('Usuario creado', { timeout: 15000 }).should('be.visible');
  });
});
