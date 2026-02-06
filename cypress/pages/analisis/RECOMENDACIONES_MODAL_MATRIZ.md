# Recomendaciones para Automatizar el Modal de Matriz de Consumo

## 📋 Resumen de Mejoras Implementadas

### 1. **Selectores Centralizados**
✅ Se agregaron selectores específicos para todos los elementos del modal en la sección `SELECTORES DEL MODAL DE MATRIZ DE CONSUMO`:
- Modal y contenedor
- Sección Agrupación (Hora, Día, Mes)
- Sección Sedes
- Sección Periodo
- Sección Tipo de Energía
- Botón de acción

### 2. **Métodos Helper Agregados**

#### `verificarModalAbierto()`
- Verifica que el modal esté visible antes de continuar
- Valida el título del modal
- Retorna un boolean para manejo de errores

#### `hacerClicEnCampoPeriodo()`
- **Múltiples estrategias de búsqueda**:
  1. Por ID específico (`#download-matrix-month-picker-button`)
  2. Por placeholder del input
  3. Por atributos relacionados (id, class)
  4. Por contexto dentro del modal (buscando labels relacionados)
- Manejo robusto de casos donde el elemento no se encuentra inmediatamente

### 3. **Mejoras en el Flujo Principal**

#### Antes:
```javascript
cy.get('#download-matrix-month-picker-button', { timeout: 20000 })
  .should('exist')
  .should('be.visible')
  .click({ force: true })
```

#### Después:
```javascript
return this.hacerClicEnCampoPeriodo()
  .then(() => {
    // Continúa con el flujo...
  })
```

## 🎯 Recomendaciones Adicionales

### 1. **Agregar Validaciones en Cada Paso**

```javascript
// Después de seleccionar "Mes"
cy.get('#download-matrix-grouping-month')
  .should('have.attr', 'checked') // o 'aria-checked', 'true'
  .then(() => {
    cy.log('✅ Agrupación "Mes" seleccionada correctamente');
  });
```

### 2. **Mejorar la Búsqueda del Mes en el Date Picker**

El código actual busca el mes de múltiples formas, pero se puede mejorar:

```javascript
// Agregar búsqueda por fecha actual
const fechaActual = new Date();
const mesActual = fechaActual.toLocaleString('es-ES', { month: 'long' }); // "febrero"

// Buscar el mes actual primero
cy.get('body').then(($body) => {
  const $mesActual = $body.find(`*:contains("${mesActual}")`).filter(':visible');
  if ($mesActual.length > 0) {
    return cy.wrap($mesActual.first()).click();
  }
  // Fallback a otras estrategias...
});
```

### 3. **Agregar Esperas Inteligentes**

En lugar de `cy.wait()` fijos, usar esperas condicionales:

```javascript
// Esperar a que el campo de periodo esté habilitado (no disabled)
cy.get('#download-matrix-month-picker-button', { timeout: 20000 })
  .should('not.be.disabled')
  .should('be.visible');
```

### 4. **Manejo de Errores Mejorado**

```javascript
hacerClicEnCampoPeriodo() {
  return cy.get('body', { timeout: 10000 }).then(($body) => {
    // ... búsqueda ...
    
    if ($campoPeriodo.length === 0) {
      // Tomar screenshot para debugging
      cy.screenshot('modal-sin-campo-periodo');
      
      // Log detallado del estado del modal
      const $modal = $body.find(this.modalMatrizConsumo).filter(':visible');
      cy.log(`Estado del modal: ${$modal.length > 0 ? 'Visible' : 'No visible'}`);
      
      // Intentar estrategia alternativa
      return cy.get('#download-matrix-month-picker-button', { timeout: 20000 });
    }
  });
}
```

### 5. **Agregar Métodos para Cada Sección del Modal**

```javascript
// Seleccionar agrupación
seleccionarAgrupacion(tipo = 'month') {
  const selectores = {
    hour: this.agrupacionHora,
    day: this.agrupacionDia,
    month: this.agrupacionMes
  };
  
  return cy.get(selectores[tipo] || this.agrupacionMes, { timeout: 10000 })
    .should('be.visible')
    .click({ force: true })
    .then(() => {
      cy.wait(1500); // Esperar animación
      cy.log(`✅ Agrupación "${tipo}" seleccionada`);
    });
}

// Seleccionar sedes (si es necesario en el futuro)
seleccionarSedes(sedes = []) {
  // Implementar lógica si es necesario
}

// Seleccionar tipo de energía
seleccionarTipoEnergia(tipos = ['activa']) {
  // Implementar lógica para checkboxes
}
```

### 6. **Interceptar y Validar la Petición del API**

Ya está implementado, pero se puede mejorar el logging:

```javascript
// En el método que espera la respuesta del API
cy.wait('@matrixFileApi', { timeout: 30000 }).then((interception) => {
  // Validar estructura de la petición
  expect(interception.request.body).to.have.property('aggregation');
  expect(interception.request.body).to.have.property('contracts');
  expect(interception.request.body.contracts).to.be.an('array');
  
  // Log detallado
  cy.log('📡 Petición al API:');
  cy.log(`   Aggregation: ${interception.request.body.aggregation}`);
  cy.log(`   Contracts: ${interception.request.body.contracts.length}`);
  cy.log(`   Start date: ${interception.request.body.start_date}`);
  cy.log(`   End date: ${interception.request.body.end_date}`);
});
```

### 7. **Agregar Screenshots en Puntos Clave**

```javascript
// Después de abrir el modal
cy.screenshot('modal-matriz-consumo-abierto');

// Después de seleccionar Mes
cy.screenshot('modal-agrupacion-mes-seleccionada');

// Después de seleccionar periodo
cy.screenshot('modal-periodo-seleccionado');

// Después de enviar
cy.screenshot('modal-enviado-exitosamente');
```

### 8. **Usar Comandos Personalizados de Cypress**

Crear comandos reutilizables en `cypress/support/commands.js`:

```javascript
Cypress.Commands.add('clickModalElement', (selector, options = {}) => {
  const { timeout = 10000, force = true } = options;
  
  cy.get('body', { timeout }).then(($body) => {
    const $modal = $body.find('[role="dialog"], [class*="modal"]').filter(':visible');
    if ($modal.length > 0) {
      return cy.get(selector, { timeout })
        .should('be.visible')
        .scrollIntoView()
        .click({ force });
    } else {
      throw new Error('Modal no está visible');
    }
  });
});
```

## 🔧 Próximos Pasos Recomendados

1. ✅ **Implementar las mejoras de búsqueda del campo periodo** (ya hecho)
2. ⏳ **Agregar validaciones después de cada paso**
3. ⏳ **Implementar métodos helper para cada sección**
4. ⏳ **Agregar screenshots en puntos clave**
5. ⏳ **Mejorar el manejo de errores con logging detallado**
6. ⏳ **Crear comandos personalizados de Cypress para reutilización**

## 📝 Notas Importantes

- El modal puede tener animaciones, por lo que es importante esperar a que los elementos estén completamente renderizados
- El campo de periodo puede tener diferentes IDs dependiendo del estado de la aplicación
- Siempre verificar que el modal esté visible antes de interactuar con sus elementos
- Usar `{ force: true }` solo cuando sea necesario, preferir esperar a que los elementos sean interactuables

## 🐛 Debugging

Si el test falla:
1. Verificar que el modal esté abierto con `verificarModalAbierto()`
2. Tomar screenshot del estado actual
3. Verificar en la consola del navegador si hay errores de JavaScript
4. Revisar los logs de Cypress para ver qué selector se está usando
5. Verificar que los elementos no estén ocultos por animaciones CSS
