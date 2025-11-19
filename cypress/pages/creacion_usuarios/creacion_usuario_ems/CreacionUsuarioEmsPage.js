// cypress/pages/creacion_usuarios/creacion_usuario_ems/CreacionUsuarioEmsPage.js
class CreacionUsuarioEmsPage {
  // Selectores de navegación
  get settingsButton() { return '#settings'; }
  get usersButton() { return '#users'; }
  
  // Selectores para creación de usuarios
  get createUsersButton() { return '#create-users'; }
  get createUserOnlyButton() { return '#create-user-only'; }
  
  // Selectores del formulario - Paso 1 (Datos)
  get nombreInput() { return '#user-first-name'; }
  get apellidoInput() { return '#user-last-name'; }
  get correoInput() { return '#user-email'; }
  get telefonoInput() { return '#user-phone-phone'; }
  get areaRolInput() { return '#user-position'; }
  
  // Botones de navegación del formulario
  get siguienteButton() { return '#user-modal-next-btn'; }
  get crearUsuarioButton() { return '#user-modal-create-btn'; }
  
  // Selectores del formulario - Paso 2 (Roles)
  get rolAdministracion() { return '#role-card-Administración'; }
  
  // Selectores del formulario - Paso 3 (Sedes)
  get seleccionarTodasLasSedesCheckbox() { return '#site-checkbox-0'; }
  
  // Selectores para edición de usuarios
  get tablaUsuarios() { return 'table, [role="table"], .table'; }
  get primerCorreoTabla() { return 'tbody tr:first-child td:nth-child(2), tbody tr:first-child [data-testid*="email"], tbody tr:first-child a[href*="mailto"]'; }
  get botonEditarUsuario() { return '#user-info-actions'; }
  get botonGuardarCambios() { return '#user-modal-update-btn'; }
  get mensajeCambiosGuardados() { return 'text=/cambios.*guardado|guardado.*cambio|se.*han.*guardado/i'; }
  
  // Métodos para llenar el formulario
  llenarFormularioDatos(nombre, apellido, correo, telefono, areaRol) {
    // Nombre
    cy.get(this.nombreInput, { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(nombre, { delay: 0 });
    
    // Apellido
    cy.get(this.apellidoInput, { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(apellido, { delay: 0 });
    
    // Correo
    cy.get(this.correoInput, { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(correo, { delay: 0 });
    
    // Teléfono (si se proporciona)
    if (telefono) {
      cy.get(this.telefonoInput, { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(telefono, { delay: 0 });
    }
    
    // Área y rol
    cy.get(this.areaRolInput, { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(areaRol, { delay: 0 });
  }
  
  // Los siguientes selectores se agregarán paso a paso
}

export default CreacionUsuarioEmsPage;

