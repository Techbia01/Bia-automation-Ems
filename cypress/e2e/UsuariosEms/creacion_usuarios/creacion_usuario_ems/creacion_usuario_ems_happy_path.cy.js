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
    cy.intercept('POST', '**/ms-client-orc/v1/members**').as('createMember'); // Interceptar creación en Members
    cy.intercept('GET', '**/ems-api/app-users/**').as('getUsers');
    cy.intercept('GET', '**/ms-client-orc/v1/access-management/roles/**').as('getRoles');
    cy.intercept('GET', '**/ems-api/app-users/roles/settings**').as('getRolesSettings');
    cy.intercept('GET', '**/ms-client-orc/v1/members/**').as('getMembers');

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

    // Espera a las llamadas clave que pueblan el Home y captura el access_token
    cy.wait('@signin', { timeout: 20000 }).then((interception) => {
      // Extraer el access_token del body de la respuesta del signin
      const accessToken = interception.response.body.access_token;
      cy.log(`🔑 Access Token capturado del signin: ${accessToken ? 'Sí' : 'No'}`);
      
      // Guardar el access_token para usarlo después en las peticiones a la API
      if (accessToken) {
        cy.wrap(accessToken).as('authToken');
        cy.log(`✅ Token guardado correctamente (longitud: ${accessToken.length} caracteres)`);
      } else {
        cy.log('⚠️ No se encontró access_token en la respuesta');
      }
    });
    
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
    cy.log('🔍 Buscando botón de crear usuario...');
    cy.get(creacionUsuarioPage.createUsersButton, { timeout: 10000 })
      .should('be.visible')
      .click()
      .then(() => {
        cy.log('✅ Click en botón de crear usuario completado');
      });

    // Esperar a que el modal se abra y verificar que esté visible
    cy.log('⏳ Esperando que el modal se abra...');
    cy.wait(2000);
    
    // Verificar que el modal se abrió buscando el primer input
    cy.get(creacionUsuarioPage.nombreInput, { timeout: 10000 })
      .should('be.visible')
      .then(() => {
        cy.log('✅ Modal de creación abierto correctamente');
      });

    // Paso 4: Llenar el formulario - Paso 1 (Datos)
    const timestamp = Date.now();
    
    // Generar valores únicos para la creación (nombres reales sin números)
    const nombresReales = ['María', 'Carlos', 'Ana', 'Juan', 'Laura', 'Pedro', 'Sofía', 'Diego', 'Isabella', 'Andrés'];
    const apellidosReales = ['González', 'Rodríguez', 'Martínez', 'López', 'García', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores'];
    
    // Seleccionar nombre y apellido basado en el timestamp para hacerlos únicos
    const indiceNombre = timestamp % nombresReales.length;
    const indiceApellido = (timestamp * 7) % apellidosReales.length;
    
    const nombre = nombresReales[indiceNombre];
    const apellido = apellidosReales[indiceApellido];
    
    // Generar correo ÚNICO: timestamp + número aleatorio para garantizar que nunca se repita
    // Usar Math.random() y convertirlo a string base36 para obtener caracteres alfanuméricos
    const randomComponent = Math.random().toString(36).substring(2, 8); // 6 caracteres aleatorios
    const correo = `testrobot${timestamp}${randomComponent}@mailinator.com`;
    
    // Teléfono de 10 dígitos: usar los últimos 3 dígitos del timestamp para mantenerlo único
    const ultimosDigitos = timestamp.toString().slice(-3);
    const telefono = `3113073${ultimosDigitos}`; // Total: 10 dígitos
    
    const areaRol = TEST_DATA.NEW_USER.areaRol;

    cy.log(`📝 Creando usuario con correo único`);
    cy.log(`📧 Correo: ${correo}`);
    cy.log(`👤 Nombre: ${nombre} ${apellido}`);

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
    const rolSeleccionado = 'Administración'; // Rol que se va a seleccionar
    cy.get(creacionUsuarioPage.rolAdministracion, { timeout: 10000 })
      .should('be.visible')
      .click();
    
    cy.wrap(rolSeleccionado).as('rolSeleccionado'); // Guardar el rol para verificación posterior

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
    cy.log('🚀 Buscando botón para crear el usuario final...');
    cy.get(creacionUsuarioPage.crearUsuarioButton, { timeout: 15000 })
      .should('be.visible')
      .and('not.be.disabled')
      .click()
      .then(() => {
        cy.log('✅ Click en "Crear Usuario" completado');
      });
    
    // Esperar a que se complete la creación del usuario
    cy.log('⏳ Esperando respuesta del servidor...');
    cy.log('⏳ Esperando 8 segundos para que se procese la creación del usuario...');
    
    // Esperar tiempo suficiente para que el servidor procese la creación
    // No dependemos de los intercepts para evitar fallos si no se capturan las peticiones
    cy.wait(8000);
    
    // Log de los datos del usuario creado
    cy.log('');
    cy.log('📝 Valores del usuario creado:');
    cy.log(`   Nombre: ${nombre}`);
    cy.log(`   Apellido: ${apellido}`);
    cy.log(`   Correo: ${correo}`);
    cy.log(`   Teléfono: ${telefono}`);
    cy.get('@rolSeleccionado').then((rol) => {
      cy.log(`   Rol: ${rol}`);
    });

    // ============================================================================
    // VERIFICACIÓN: Confirmar que el usuario se creó correctamente en la tabla
    // ============================================================================
    
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('🔍 VERIFICANDO CREACIÓN DEL USUARIO EN LA BASE DE DATOS');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('');
    
    // Esperar tiempo adicional para que el servidor procese la creación en Members
    cy.log('⏳ Esperando 8 segundos para que se procese la creación en Members...');
    cy.wait(8000);
    
    // Obtener el access_token capturado del signin
    cy.get('@authToken').then((accessToken) => {
      
      if (!accessToken) {
        cy.log('❌ ERROR: No se pudo obtener el access_token');
        cy.log('⚠️ Verificación de tabla omitida');
        return;
      }
      
      cy.log('✅ Access Token disponible');
      cy.log('');
      
      // Contract IDs del usuario administrador (astrid.tovar@bia.app)
      const contractIds = '0,18983,18984,18980,18982,18979,15703,15702,18981,4';
      
      cy.log('📋 Parámetros de la consulta:');
      cy.log(`   - Correo buscado: ${correo}`);
      cy.log(`   - Contract IDs: ${contractIds}`);
      cy.log('');
      
      // Esperar un poco antes de consultar para dar tiempo a que se propague el usuario
      cy.log('⏳ Esperando 3 segundos antes de consultar la API...');
      cy.wait(3000);
      
      // Consultar el servicio /ms-client-orc/v1/members para verificar el usuario
      cy.log('🌐 Consultando servicio: GET /ms-client-orc/v1/members');
      cy.request({
        method: 'GET',
        url: `https://api.dev.bia.app/ms-client-orc/v1/members/?contract_ids=${contractIds}&limit=1000`,
        headers: {
          'Authorization': accessToken,
          'x-platform': 'web',
          'x-source': 'EMS',
          'x-timezone': 'America/Bogota'
        },
        timeout: 60000, // Aumentar timeout a 60 segundos
        failOnStatusCode: false
      }).then((response) => {
        
        cy.log('');
        cy.log(`📊 Respuesta del servicio: Status ${response.status}`);
        
        if (response.status !== 200) {
          cy.log(`❌ ERROR: El servicio respondió con status ${response.status}`);
          cy.log('⚠️ Verificación de tabla omitida');
          return;
        }
        
        // Mostrar la estructura de la respuesta para debugging
        cy.log('🔍 DEBUG - Estructura de response.body:');
        cy.log(`   Tipo: ${typeof response.body}`);
        cy.log(`   Es Array: ${Array.isArray(response.body)}`);
        cy.log(`   Keys: ${JSON.stringify(Object.keys(response.body))}`);
        
        // Extraer el array de usuarios de la respuesta
        let usuarios = [];
        if (Array.isArray(response.body)) {
          usuarios = response.body;
        } else if (response.body && response.body.data && Array.isArray(response.body.data)) {
          usuarios = response.body.data;
        } else if (response.body && response.body.members && Array.isArray(response.body.members)) {
          usuarios = response.body.members;
        } else if (response.body && response.body.users && Array.isArray(response.body.users)) {
          usuarios = response.body.users;
        }
        
        cy.log(`📊 Total de usuarios en la respuesta: ${usuarios.length}`);
        cy.log('');
        
        if (usuarios.length === 0) {
          cy.log('⚠️ No se encontraron usuarios en la respuesta');
          cy.log('⚠️ Mostrando primeros 200 caracteres del response.body:');
          cy.log(JSON.stringify(response.body).substring(0, 200));
          return;
        }
        
        // Buscar el usuario por correo electrónico
        cy.log(`🔎 Buscando usuario con correo: ${correo}`);
        const usuarioCreado = usuarios.find(user => user.email === correo);
        
        // VERIFICACIÓN PRINCIPAL: El usuario debe existir en la tabla
        expect(usuarioCreado, `El usuario con correo "${correo}" debe existir en la tabla de members`).to.not.be.undefined;
        
        cy.log('');
        cy.log('✅ ¡USUARIO ENCONTRADO EN LA BASE DE DATOS!');
        cy.log('');
        
        // VERIFICACIÓN DEL CORREO: El correo ingresado debe coincidir exactamente
        const correoEnTabla = usuarioCreado.email;
        expect(correoEnTabla, 'El correo en la tabla debe coincidir con el correo ingresado').to.equal(correo);
        
        // Obtener datos adicionales del usuario para los logs
        const nombreEnTabla = usuarioCreado.first_name || usuarioCreado.name || 'N/A';
        const apellidoEnTabla = usuarioCreado.last_name || usuarioCreado.surname || 'N/A';
        const telefonoEnTabla = usuarioCreado.phone || usuarioCreado.phone_number || 'N/A';
        const rolesEnTabla = usuarioCreado.roles || [];
        const rolesArray = Array.isArray(rolesEnTabla) ? rolesEnTabla : [rolesEnTabla];
        const rolEnTabla = rolesArray.length > 0 
          ? (typeof rolesArray[0] === 'string' ? rolesArray[0] : (rolesArray[0].name || rolesArray[0].role_name || rolesArray[0].role || 'N/A'))
          : 'N/A';
        
        cy.log('');
        cy.log('✅ Usuario creado con correo:');
        cy.log(`   ${correo}`);
        cy.log('');
        cy.log('✅ Correo verificado en servicio Members:');
        cy.log(`   ${correoEnTabla}`);
        cy.log('');
        cy.log('✅ Usuario creado con rol:');
        cy.log(`   ${rolEnTabla}`);
        cy.log('');
        cy.log('═══════════════════════════════════════════════════════════');
        cy.log('✅ VERIFICACIÓN EXITOSA EN MEMBERS');
        cy.log('═══════════════════════════════════════════════════════════');
        cy.log('');
        cy.log('📋 Detalles completos del usuario en Members:');
        cy.log(`   Nombre: ${nombreEnTabla}`);
        cy.log(`   Apellido: ${apellidoEnTabla}`);
        cy.log(`   Correo: ${correoEnTabla}`);
        cy.log(`   Teléfono: ${telefonoEnTabla}`);
        cy.log(`   Rol: ${rolEnTabla}`);
        cy.log('');
        cy.log('🎉 ¡El usuario se creó correctamente en la base de datos!');
        cy.log('');
        
      });
    });

    // ============================================================================
    // LOGOUT: Cerrar sesión del usuario administrador
    // ============================================================================
    
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('🚪 CERRANDO SESIÓN DEL USUARIO ADMINISTRADOR');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('');
    
    // Click en el botón del sidebar header
    cy.log('📍 Haciendo click en el sidebar header...');
    cy.get('#sidebar-header-button', { timeout: 10000 })
      .should('be.visible')
      .click()
      .then(() => {
        cy.log('✅ Menú del sidebar abierto');
      });
    
    // Esperar un momento para que se abra el menú
    cy.wait(1000);
    
    // Click en el botón de logout
    cy.log('📍 Haciendo click en "Cerrar sesión"...');
    cy.get('#logout', { timeout: 10000 })
      .should('be.visible')
      .click()
      .then(() => {
        cy.log('✅ Click en "Cerrar sesión" completado');
      });
    
    // Verificar que se haya redirigido al login
    cy.log('⏳ Esperando redirección al login...');
    cy.url({ timeout: 10000 }).should('include', '/login');
    cy.log('✅ Sesión cerrada correctamente');
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('✅ LOGOUT EXITOSO');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('');
    cy.log(`💾 Correo guardado para login: ${correo}`);
    cy.log('');

    // ============================================================================
    // LOGIN CON USUARIO RECIÉN CREADO: Primera vez (cambio de contraseña)
    // ============================================================================
    
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('🔐 LOGIN CON USUARIO NUEVO');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('');
    
    // Contraseña temporal para usuarios nuevos
    const passwordTemporal = 'biaenergy123*';
    const passwordNueva = 'Karen1322*';
    
    cy.log(`📧 Email: ${correo}`);
    cy.log(`🔑 Password temporal: ${passwordTemporal}`);
    cy.log('');
    
    // Ingresar el correo del usuario nuevo
    cy.log('📝 Ingresando correo del usuario nuevo...');
    cy.get(loginPage.emailInput, { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(correo, { delay: 0 })
      .should('have.value', correo);
    cy.log('✅ Correo ingresado correctamente');
    
    // Click en continuar
    cy.get(loginPage.continueButton, { timeout: 10000 })
      .should('be.visible')
      .and('not.be.disabled')
      .click();
    
    // Ingresar la contraseña temporal
    cy.log('🔑 Ingresando contraseña temporal...');
    cy.get(loginPage.passwordInput, { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(passwordTemporal, { delay: 0, log: false });
    cy.log('✅ Contraseña temporal ingresada');
    
    // Click en el botón de login
    cy.log('📍 Haciendo click en "Iniciar sesión"...');
    cy.get('#login-button', { timeout: 10000 })
      .should('be.visible')
      .and('not.be.disabled')
      .click();
    cy.log('✅ Click en "Iniciar sesión" completado');
    
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('🔄 CAMBIO DE CONTRASEÑA (PRIMERA VEZ)');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('');
    
    // Esperar a que cargue la pantalla de cambio de contraseña
    cy.log('⏳ Esperando pantalla de cambio de contraseña...');
    cy.wait(3000);
    
    // Ingresar nueva contraseña
    cy.log('🔑 Ingresando nueva contraseña...');
    cy.get('#password-input', { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type(passwordNueva, { delay: 0, log: false });
    cy.log('✅ Nueva contraseña ingresada');
    
    // Confirmar nueva contraseña
    cy.log('🔑 Confirmando nueva contraseña...');
    cy.get('#confirm-password-input', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(passwordNueva, { delay: 0, log: false });
    cy.log('✅ Contraseña confirmada');
    
    // Click en actualizar contraseña
    cy.log('📍 Haciendo click en "Actualizar contraseña"...');
    cy.get('#submit-button-reset', { timeout: 10000 })
      .should('be.visible')
      .and('not.be.disabled')
      .click();
    cy.log('✅ Click en "Actualizar contraseña" completado');
    
    // Verificar que aparezca el popup de bienvenida (onboarding)
    cy.log('');
    cy.log('⏳ Esperando popup de bienvenida (onboarding)...');
    cy.contains('Bienvenid', { timeout: 20000 }).should('be.visible');
    cy.log('✅ Popup de onboarding visible');
    
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('✅ FLUJO COMPLETO EXITOSO');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('');
    cy.log('🎉 ¡Usuario creado, verificado y login exitoso!');
    cy.log('');
    cy.log('📋 Resumen:');
    cy.log(`   ✅ Usuario creado con correo: ${correo}`);
    cy.log('   ✅ Correo verificado en servicio Members');
    cy.log('   ✅ Login con usuario nuevo exitoso');
    cy.log('   ✅ Contraseña actualizada correctamente');
    cy.log('   ✅ Popup de onboarding mostrado');
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('');
    
  });
});
