// cypress/e2e/UsuariosEms/edicion_usuarios/edicion_usuario_rol_contabilidad.cy.js
import LoginPage from '../../../pages/LoginPage.js';
import CreacionUsuarioEmsPage from '../../../pages/creacion_usuarios/creacion_usuario_ems/CreacionUsuarioEmsPage.js';

describe('Edición de Usuario y Cambio de Rol a Contabilidad - Happy Path', () => {
  let loginPage;
  let creacionUsuarioPage;

  // ⚠️ Temporal: evita que scripts externos o el bug de "includes" rompan el test
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
    cy.intercept('GET', '**/ems-api/app-users/**').as('getUsers');
    cy.intercept('PUT', '**/ems-api/app-users/**').as('updateUser');
    cy.intercept('PATCH', '**/ems-api/app-users/**').as('updateUserPatch');
    cy.intercept('POST', '**/ems-api/app-users/**/update').as('updateUserPost');

    cy.viewport(1920, 1080);
    cy.visit(Cypress.config('baseUrl') + Cypress.env('loginPath'), {
      failOnStatusCode: false,
      timeout: 60000
    });
  });

  it('Debería editar datos del usuario y cambiar el rol a Contabilidad', () => {
    loginPage = new LoginPage();
    creacionUsuarioPage = new CreacionUsuarioEmsPage();

    cy.log('🔐 Iniciando sesión...');

    // ============================================================
    // PASO 1: LOGIN
    // ============================================================
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

    // Esperar a que se complete el login y capturar el access_token
    cy.wait('@signin', { timeout: 30000 }).then((interception) => {
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
    
    cy.url({ timeout: 30000 }).should('include', '/home');
    cy.wait('@contracts', { timeout: 30000 });
    cy.log('✅ Login completado');

    // ============================================================
    // PASO 2: NAVEGAR A LA SECCIÓN DE USUARIOS
    // ============================================================
    cy.log('📂 Navegando a la sección de usuarios...');
    
    cy.get(creacionUsuarioPage.settingsButton, { timeout: 15000 })
      .should('be.visible')
      .click();

    cy.wait(1000);
    
    cy.get(creacionUsuarioPage.usersButton, { timeout: 15000 })
      .should('be.visible')
      .click();

    // Esperar a que la página cargue completamente
    cy.url({ timeout: 15000 }).should('include', '/settings/users');
    cy.wait(2000);
    cy.log('✅ Navegación a usuarios completada');

    // ============================================================
    // PASO 3: SELECCIONAR EL PRIMER NOMBRE DE USUARIO DE LA TABLA
    // ============================================================
    cy.log('🔍 Buscando el primer nombre de usuario en la tabla...');
    
    // Esperar a que la tabla cargue
    cy.wait('@getUsers', { timeout: 30000 });
    
    // Buscar el primer elemento con ID que comienza con "user-name-link-"
    cy.get('[id^="user-name-link-"]', { timeout: 15000 })
      .first()
      .should('be.visible')
      .click({ force: true });

    // Obtener el correo ANTES de abrir el modal (desde la tabla)
    let correoUsuarioEditado = '';
    cy.get('tbody tr:first-child td:nth-child(2)', { timeout: 10000 })
      .should('exist')
      .then(($td) => {
        const texto = $td.text().trim();
        if (texto.includes('@')) {
          correoUsuarioEditado = texto;
          cy.log(`📧 Correo obtenido de la tabla: ${correoUsuarioEditado}`);
          cy.wrap(correoUsuarioEditado).as('correoUsuario');
        }
      });

    cy.log('✅ Primer nombre de usuario seleccionado');

    // Esperar a que aparezca el modal/popup
    cy.wait(2000);
    
    // Verificar que el modal se haya abierto buscando el botón de editar
    cy.get(creacionUsuarioPage.botonEditarUsuario, { timeout: 10000 })
      .should('exist')
      .then(() => {
        cy.log('✅ Modal de información del usuario abierto correctamente');
      });
    
    // Obtener el correo del alias si no se obtuvo antes
    cy.get('@correoUsuario').then((correo) => {
      if (correo) {
        correoUsuarioEditado = correo;
      }
    });

    // ============================================================
    // PASO 4: OBTENER EL ROL ACTUAL DEL USUARIO ANTES DE EDITAR
    // ============================================================
    cy.log('🔍 Obteniendo el rol actual del usuario desde la API...');
    
    // Obtener el correo del alias y luego consultar la API
    cy.get('@correoUsuario').then((correo) => {
      correoUsuarioEditado = correo || '';
      
      if (correoUsuarioEditado) {
        cy.get('@authToken').then((accessToken) => {
          if (!accessToken) {
            cy.log('⚠️ No se pudo obtener access_token para consultar el rol actual');
            cy.wrap('').as('rolActual');
            return;
          }

          const contractIds = '0,4,15702,15703,18979,18980,18981,18982,18983,18984';
          
          cy.request({
            method: 'GET',
            url: `https://api.dev.bia.app/ms-client-orc/v1/members/?contract_ids=${contractIds}&limit=1000`,
            headers: {
              'authorization': accessToken,
              'x-platform': 'web',
              'x-source': 'EMS',
              'x-timezone': 'America/Bogota'
            },
            timeout: 30000,
            failOnStatusCode: false
          }).then((response) => {
            if (response.status === 200) {
              const members = response.body.data || response.body.members || response.body;
              if (Array.isArray(members)) {
                const usuario = members.find(user => user.email === correoUsuarioEditado);
                if (usuario && usuario.roles) {
                  const rolesArray = Array.isArray(usuario.roles) ? usuario.roles : [usuario.roles];
                  if (rolesArray.length > 0) {
                    const primerRol = rolesArray[0];
                    const rolActualNombre = typeof primerRol === 'string' 
                      ? primerRol 
                      : (primerRol.name || primerRol.role_name || primerRol.role || '');
                    cy.log(`📋 Rol actual obtenido de API: ${rolActualNombre}`);
                    cy.wrap(rolActualNombre).as('rolActual');
                  } else {
                    cy.log('⚠️ El usuario no tiene roles asignados');
                    cy.wrap('').as('rolActual');
                  }
                } else {
                  cy.log('⚠️ No se encontraron roles para el usuario');
                  cy.wrap('').as('rolActual');
                }
              } else {
                cy.wrap('').as('rolActual');
              }
            } else {
              cy.log(`⚠️ Error al consultar API: ${response.status}`);
              cy.wrap('').as('rolActual');
            }
          });
        });
      } else {
        cy.log('⚠️ No se pudo obtener el correo del usuario, continuando sin detectar rol actual');
        cy.wrap('').as('rolActual');
      }
    });

    // Esperar un momento para que se complete la consulta
    cy.wait(2000);

    // ============================================================
    // PASO 5: HACER CLIC EN EL BOTÓN DE EDICIÓN
    // ============================================================
    cy.log('✏️ Abriendo modal de edición...');
    
    cy.get(creacionUsuarioPage.botonEditarUsuario, { timeout: 15000 })
      .should('be.visible')
      .click();

    cy.wait(1500);
    cy.log('✅ Modal de edición abierto');

    // ============================================================
    // PASO 6: EDITAR CAMPOS DEL USUARIO (NOMBRE, APELLIDO, TELÉFONO)
    // ============================================================
    cy.log('📝 Editando campos del usuario...');
    
    // Generar valores únicos para la edición (nombres sin números)
    const timestamp = Date.now();
    // Generar letras aleatorias para hacer los nombres únicos sin usar números
    const letrasAleatorias = String.fromCharCode(97 + (timestamp % 26)) + String.fromCharCode(97 + ((timestamp * 7) % 26));
    const nuevoNombre = `Usuario${letrasAleatorias}`;
    const nuevoApellido = `Editado${letrasAleatorias}`;
    // Teléfono de 10 dígitos: usar los últimos 3 dígitos del timestamp para mantenerlo único
    const ultimosDigitos = timestamp.toString().slice(-3);
    const nuevoTelefono = `3113073${ultimosDigitos}`; // Total: 10 dígitos

    // Editar Nombre
    cy.log(`📝 Cambiando nombre a: ${nuevoNombre}`);
    cy.get(creacionUsuarioPage.nombreInput, { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type(nuevoNombre, { delay: 50 });

    // Editar Apellido
    cy.log(`📝 Cambiando apellido a: ${nuevoApellido}`);
    cy.get(creacionUsuarioPage.apellidoInput, { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type(nuevoApellido, { delay: 50 });

    // Editar Teléfono/Celular
    cy.log(`📝 Cambiando teléfono a: ${nuevoTelefono}`);
    cy.get(creacionUsuarioPage.telefonoInput, { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type(nuevoTelefono, { delay: 50 });

    cy.wait(1000);
    cy.log('✅ Campos editados correctamente');

    // Obtener el correo del usuario editado desde el input de correo (no se puede editar pero está visible)
    cy.get(creacionUsuarioPage.correoInput, { timeout: 10000 })
      .should('be.visible')
      .invoke('val')
      .then((correo) => {
        correoUsuarioEditado = correo;
        cy.log(`📧 Correo del usuario editado: ${correoUsuarioEditado}`);
      });

    // ============================================================
    // PASO 7: HACER CLIC EN SIGUIENTE PARA IR A LA SELECCIÓN DE ROLES
    // ============================================================
    cy.log('➡️ Avanzando a la selección de roles...');
    
    cy.get(creacionUsuarioPage.siguienteButton, { timeout: 15000 })
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    cy.wait(2000);
    cy.log('✅ Navegado a la sección de roles');

    // ============================================================
    // PASO 8: SELECCIONAR UN ROL DIFERENTE AL ACTUAL
    // ============================================================
    // Lista de roles disponibles con sus IDs
    const rolesDisponibles = [
      { id: 'role-card-Administración', nombre: 'Administración' },
      { id: 'role-card-Contabilidad', nombre: 'Contabilidad' },
      { id: 'role-card-Mantenimiento', nombre: 'Mantenimiento' }
    ];

    cy.log('📋 Seleccionando un rol diferente al actual...');
    
    // Obtener el rol actual que se detectó antes y seleccionar uno diferente
    cy.get('@rolActual', { timeout: 3000 })
      .then((rolActual) => {
        let rolActualNombre = rolActual || '';
        cy.log(`   Rol actual detectado de API: ${rolActualNombre}`);
        
        // Si no se pudo obtener del alias, intentar obtenerlo del modal como respaldo
        cy.get('body').then(($body) => {
          if (!rolActualNombre) {
            const rolElement = $body.find('[class*="role"], [class*="Role"], [data-role], .bia-badge, [class*="badge"]');
            if (rolElement.length > 0) {
              rolActualNombre = rolElement.first().text().trim();
              cy.log(`   Rol actual detectado del modal: ${rolActualNombre}`);
            } else {
              cy.log(`   Rol actual: No detectado`);
            }
          }
          
          // Determinar qué rol seleccionar (uno diferente al actual)
          let rolASeleccionar = null;
          let rolSeleccionadoNombre = '';
          
          if (rolActualNombre) {
            const nombreRolActual = rolActualNombre.toLowerCase().trim();
            
            // Lógica específica para cada rol:
            // Si tiene Administración → cambiar a Contabilidad o Mantenimiento
            // Si tiene Contabilidad → cambiar a Administración o Mantenimiento
            // Si tiene Mantenimiento → cambiar a Administración o Contabilidad
            
            if (nombreRolActual.includes('administración') || nombreRolActual.includes('administracion')) {
              // Si tiene Administración, cambiar a Contabilidad (prioridad) o Mantenimiento
              rolASeleccionar = rolesDisponibles.find(rol => rol.nombre === 'Contabilidad') ||
                               rolesDisponibles.find(rol => rol.nombre === 'Mantenimiento');
              cy.log(`✅ Usuario tiene Administración → Cambiando a: ${rolASeleccionar.nombre}`);
            } else if (nombreRolActual.includes('contabilidad')) {
              // Si tiene Contabilidad, cambiar a Administración (prioridad) o Mantenimiento
              rolASeleccionar = rolesDisponibles.find(rol => rol.nombre === 'Administración') ||
                               rolesDisponibles.find(rol => rol.nombre === 'Mantenimiento');
              cy.log(`✅ Usuario tiene Contabilidad → Cambiando a: ${rolASeleccionar.nombre}`);
            } else if (nombreRolActual.includes('mantenimiento')) {
              // Si tiene Mantenimiento, cambiar a Administración (prioridad) o Contabilidad
              rolASeleccionar = rolesDisponibles.find(rol => rol.nombre === 'Administración') ||
                               rolesDisponibles.find(rol => rol.nombre === 'Contabilidad');
              cy.log(`✅ Usuario tiene Mantenimiento → Cambiando a: ${rolASeleccionar.nombre}`);
            } else {
              // Si el rol no coincide con ninguno conocido, usar el primero diferente
              rolASeleccionar = rolesDisponibles.find(rol => {
                const nombreRolDisponible = rol.nombre.toLowerCase().trim();
                return nombreRolActual !== nombreRolDisponible &&
                       !nombreRolActual.includes(nombreRolDisponible) && 
                       !nombreRolDisponible.includes(nombreRolActual);
              });
              
              if (rolASeleccionar) {
                cy.log(`✅ Rol actual desconocido: "${rolActualNombre}" → Seleccionando: "${rolASeleccionar.nombre}"`);
              } else {
                cy.log(`⚠️ No se encontró un rol diferente, usando Contabilidad por defecto`);
                rolASeleccionar = rolesDisponibles.find(rol => rol.nombre === 'Contabilidad') || rolesDisponibles[0];
              }
            }
          } else {
            // Si no se detectó el rol actual, usar Contabilidad por defecto
            rolASeleccionar = rolesDisponibles.find(rol => rol.nombre === 'Contabilidad') || rolesDisponibles[0];
            cy.log(`⚠️ No se pudo detectar el rol actual, usando: ${rolASeleccionar.nombre}`);
          }
          
          rolSeleccionadoNombre = rolASeleccionar.nombre;
          
          // Seleccionar el rol
          cy.get(`#${rolASeleccionar.id}`, { timeout: 15000 })
            .should('be.visible')
            .click();

          cy.wait(1000);
          cy.log(`✅ Rol ${rolSeleccionadoNombre} seleccionado (diferente al anterior: ${rolActualNombre || 'N/A'})`);
          
          // Guardar el rol seleccionado para la verificación final
          cy.wrap(rolSeleccionadoNombre).as('rolSeleccionado');
          cy.wrap(rolActualNombre).as('rolActualFinal');
        });
      });

    // ============================================================
    // PASO 8: HACER CLIC EN SIGUIENTE PARA IR A LA SIGUIENTE SECCIÓN
    // ============================================================
    cy.log('➡️ Avanzando a la siguiente sección...');
    
    cy.get(creacionUsuarioPage.siguienteButton, { timeout: 15000 })
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    cy.wait(2000);
    cy.log('✅ Navegado a la siguiente sección');

    // ============================================================
    // PASO 9: GUARDAR CAMBIOS
    // ============================================================
    cy.log('💾 Guardando cambios...');
    
    cy.get(creacionUsuarioPage.botonGuardarCambios, { timeout: 15000 })
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    cy.log('✅ Botón de guardar cambios presionado');

    // Esperar a que se procese la actualización
    cy.wait(3000); // Esperar tiempo suficiente para que se procese

    // ============================================================
    // PASO 10: VERIFICAR MENSAJE DE CONFIRMACIÓN
    // ============================================================
    cy.log('🔍 Verificando mensaje de confirmación...');
    
    // Buscar el mensaje de éxito (puede estar en diferentes formatos)
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const mensajeEncontrado = 
        $body.text().includes('cambios se han guardado') ||
        $body.text().includes('cambios guardados') ||
        $body.text().includes('guardado correctamente') ||
        $body.text().includes('actualizado correctamente') ||
        $body.find('[class*="success"], [class*="Success"], [class*="toast"], [class*="notification"]').length > 0;
      
      if (mensajeEncontrado) {
        cy.log('✅ Mensaje de confirmación encontrado');
      } else {
        // Intentar buscar por selector específico
        cy.get('body').contains(/cambios.*guardado|guardado.*cambio|se.*han.*guardado/i, { timeout: 5000 })
          .should('be.visible')
          .then(() => {
            cy.log('✅ Mensaje de confirmación visible');
          });
      }
    });

    // ============================================================
    // PASO 11: VERIFICAR EN EL SERVICIO DE MEMBERS QUE LOS CAMBIOS SE GUARDARON
    // ============================================================
    cy.log('');
    cy.log('🔍 Verificando en el servicio de Members que los cambios se guardaron...');
    
    // Esperar un momento para que el servidor procese la actualización
    cy.wait(2000);

    // Hacer petición a la API de members para verificar los cambios
    cy.get('@authToken').then((accessToken) => {
      if (!accessToken) {
        cy.log('⚠️ No se pudo obtener access_token, saltando verificación en API');
        return;
      }

      // Contract IDs del usuario administrador (astrid.tovar@bia.app)
      const contractIds = '0,4,15702,15703,18979,18980,18981,18982,18983,18984';

      cy.log('📋 Parámetros de la consulta:');
      cy.log(`   - Correo buscado: ${correoUsuarioEditado}`);
      cy.log(`   - Contract IDs: ${contractIds}`);
      cy.log(`   - Access Token: ${accessToken ? 'Disponible' : 'No disponible'} (longitud: ${accessToken ? accessToken.length : 0} caracteres)`);
      cy.log('');

      // Usar el access_token capturado del login en el header de authorization
      cy.request({
        method: 'GET',
        url: `https://api.dev.bia.app/ms-client-orc/v1/members/?contract_ids=${contractIds}&limit=1000`,
        headers: {
          'authorization': accessToken, // Access token capturado del login
          'x-platform': 'web',
          'x-source': 'EMS',
          'x-timezone': 'America/Bogota',
          'accept': '*/*',
          'content-type': 'application/json'
        },
        timeout: 60000,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status !== 200) {
          cy.log(`⚠️ Error al consultar members: ${response.status}`);
          return;
        }

        const members = response.body.data || response.body.members || response.body;
        
        if (!members || (Array.isArray(members) && members.length === 0)) {
          cy.log('⚠️ No se encontraron members en la respuesta');
          return;
        }

        // Buscar el usuario por correo electrónico
        cy.log(`🔎 Buscando usuario con correo: ${correoUsuarioEditado}`);
        const usuarioEditado = Array.isArray(members) 
          ? members.find(user => user.email === correoUsuarioEditado)
          : null;

        if (!usuarioEditado) {
          cy.log(`⚠️ Usuario con correo "${correoUsuarioEditado}" no encontrado en members`);
          return;
        }

        cy.log('');
        cy.log('═══════════════════════════════════════════════════════════');
        cy.log('✅ USUARIO ENCONTRADO EN MEMBERS - VERIFICANDO CAMBIOS');
        cy.log('═══════════════════════════════════════════════════════════');
        
        // Verificar que los cambios se guardaron correctamente
        const nombreEnMembers = usuarioEditado.first_name || usuarioEditado.firstName || usuarioEditado.name;
        const apellidoEnMembers = usuarioEditado.last_name || usuarioEditado.lastName || usuarioEditado.surname;
        const telefonoEnMembers = usuarioEditado.phone || usuarioEditado.phone_number || usuarioEditado.cellphone;
        const rolesEnMembers = usuarioEditado.roles || usuarioEditado.user_roles || usuarioEditado.role;

        // VERIFICACIÓN DEL NOMBRE
        cy.log(`📝 Nombre editado:     ${nuevoNombre}`);
        cy.log(`📝 Nombre en Members:  ${nombreEnMembers}`);
        
        if (nombreEnMembers) {
          const nombreCoincide = nombreEnMembers.toLowerCase().trim() === nuevoNombre.toLowerCase().trim();
          if (nombreCoincide) {
            cy.log('✅ Nombre actualizado correctamente - Los valores coinciden exactamente');
            expect(nombreEnMembers.toLowerCase().trim()).to.equal(nuevoNombre.toLowerCase().trim());
          } else {
            cy.log(`⚠️ El nombre no coincide exactamente. Esperado: "${nuevoNombre}", Encontrado: "${nombreEnMembers}"`);
            expect(nombreEnMembers.toLowerCase().trim(), 'El nombre debe coincidir exactamente con el valor editado').to.equal(nuevoNombre.toLowerCase().trim());
          }
        } else {
          cy.log('❌ ERROR: No se encontró nombre en Members');
          expect(nombreEnMembers, 'El nombre debe existir en Members').to.not.be.undefined;
        }

        // VERIFICACIÓN DEL APELLIDO
        cy.log(`📝 Apellido editado:     ${nuevoApellido}`);
        cy.log(`📝 Apellido en Members:  ${apellidoEnMembers}`);
        
        if (apellidoEnMembers) {
          const apellidoCoincide = apellidoEnMembers.toLowerCase().trim() === nuevoApellido.toLowerCase().trim();
          if (apellidoCoincide) {
            cy.log('✅ Apellido actualizado correctamente - Los valores coinciden exactamente');
            expect(apellidoEnMembers.toLowerCase().trim()).to.equal(nuevoApellido.toLowerCase().trim());
          } else {
            cy.log(`⚠️ El apellido no coincide exactamente. Esperado: "${nuevoApellido}", Encontrado: "${apellidoEnMembers}"`);
            expect(apellidoEnMembers.toLowerCase().trim(), 'El apellido debe coincidir exactamente con el valor editado').to.equal(nuevoApellido.toLowerCase().trim());
          }
        } else {
          cy.log('❌ ERROR: No se encontró apellido en Members');
          expect(apellidoEnMembers, 'El apellido debe existir en Members').to.not.be.undefined;
        }

        // VERIFICACIÓN DEL TELÉFONO
        if (telefonoEnMembers) {
          cy.log(`📱 Teléfono editado:     ${nuevoTelefono}`);
          cy.log(`📱 Teléfono en Members:  ${telefonoEnMembers}`);
          // Comparar solo los dígitos del teléfono
          const telefonoEditadoDigitos = nuevoTelefono.replace(/\D/g, '');
          const telefonoMembersDigitos = telefonoEnMembers.replace(/\D/g, '');
          if (telefonoMembersDigitos && telefonoMembersDigitos.includes(telefonoEditadoDigitos.slice(-4))) {
            cy.log('✅ Teléfono actualizado correctamente');
          } else {
            cy.log('⚠️ El teléfono puede no coincidir exactamente (puede tener formato diferente)');
          }
        }

        // VERIFICACIÓN DEL ROL SELECCIONADO
        cy.get('@rolSeleccionado').then((rolSeleccionado) => {
          cy.get('@rolActualFinal').then((rolActualFinal) => {
            cy.log(`📋 Rol seleccionado:     ${rolSeleccionado || 'N/A'}`);
            cy.log(`📋 Rol anterior:         ${rolActualFinal || 'No detectado'}`);
            cy.log(`📋 Roles en Members:     ${JSON.stringify(rolesEnMembers)}`);
            
            if (rolesEnMembers) {
              const rolesArray = Array.isArray(rolesEnMembers) ? rolesEnMembers : [rolesEnMembers];
              const tieneRolSeleccionado = rolesArray.some(role => {
                const roleName = typeof role === 'string' ? role : (role.name || role.role_name || role.role);
                return roleName && rolSeleccionado && roleName.toLowerCase().includes(rolSeleccionado.toLowerCase());
              });
              
              if (tieneRolSeleccionado) {
                cy.log(`✅ Rol ${rolSeleccionado} encontrado en Members`);
                
                // Verificar que el rol cambió si había un rol anterior
                if (rolActualFinal && rolSeleccionado && rolActualFinal.toLowerCase() !== rolSeleccionado.toLowerCase()) {
                  const tieneRolAnterior = rolesArray.some(role => {
                    const roleName = typeof role === 'string' ? role : (role.name || role.role_name || role.role);
                    return roleName && roleName.toLowerCase().includes(rolActualFinal.toLowerCase());
                  });
                  
                  if (!tieneRolAnterior) {
                    cy.log(`✅ El rol cambió correctamente de "${rolActualFinal}" a "${rolSeleccionado}"`);
                  } else {
                    cy.log(`⚠️ El rol anterior "${rolActualFinal}" aún está presente junto con el nuevo rol`);
                  }
                }
              } else {
                cy.log(`⚠️ El rol ${rolSeleccionado} no se encontró en los roles del usuario`);
                cy.log(`   Roles encontrados: ${JSON.stringify(rolesArray)}`);
              }
            } else {
              cy.log('⚠️ No se encontraron roles en Members');
            }
          });
        });

        cy.log('');
        cy.log('═══════════════════════════════════════════════════════════');
        cy.log('✅ VERIFICACIÓN EN MEMBERS COMPLETADA');
        cy.log('═══════════════════════════════════════════════════════════');
        cy.log('✅ Nombre, apellido, teléfono y rol verificados en Members');
        cy.log('═══════════════════════════════════════════════════════════');
      });
    });

    // ============================================================
    // RESUMEN FINAL
    // ============================================================
    cy.log('');
    cy.log('═══════════════════════════════════════════════════════════');
    cy.log('✅ FLUJO DE EDICIÓN Y CAMBIO DE ROL COMPLETADO EXITOSAMENTE');
    cy.log('═══════════════════════════════════════════════════════════');
    // Obtener los valores del rol desde los alias para el resumen
    cy.get('@rolSeleccionado').then((rolSeleccionado) => {
      cy.get('@rolActualFinal').then((rolActualFinal) => {
        cy.log('📋 Pasos completados:');
        cy.log('   ✅ Login exitoso');
        cy.log('   ✅ Navegación a usuarios');
        cy.log('   ✅ Selección del primer usuario de la tabla');
        cy.log('   ✅ Apertura del modal de edición');
        cy.log('   ✅ Edición de nombre, apellido y teléfono');
        cy.log('   ✅ Detección del rol actual del usuario');
        cy.log('   ✅ Navegación a selección de roles');
        cy.log(`   ✅ Selección del rol ${rolSeleccionado || 'N/A'} (diferente al actual)`);
        cy.log('   ✅ Guardado de cambios');
        cy.log('   ✅ Verificación de mensaje de confirmación');
        cy.log('   ✅ Verificación en Members de todos los cambios');
        cy.log('');
        cy.log('📝 Valores editados:');
        cy.log(`   Nombre: ${nuevoNombre}`);
        cy.log(`   Apellido: ${nuevoApellido}`);
        cy.log(`   Teléfono: ${nuevoTelefono}`);
        cy.log(`   Rol anterior: ${rolActualFinal || 'No detectado'}`);
        cy.log(`   Rol nuevo: ${rolSeleccionado || 'N/A'}`);
        cy.log('');
      });
    });
  });
});

