# 🐛 Guía de Debugging y Visualización en Cypress

## Ver los Clics en Tiempo Real

### 1. **Modo Interactivo (Recomendado)**
Ejecuta Cypress en modo interactivo para ver todos los clics en tiempo real:
```bash
npm run test:open
```

### 2. **Modo Headed (Ver el navegador)**
Ejecuta los tests con el navegador visible:
```bash
npm run test:headed
```

### 3. **Comandos Personalizados para Resaltar Clics**

Ya están integrados en los Page Objects. Los elementos se resaltan automáticamente antes de hacer clic con un borde verde brillante.

#### Uso en código:
```javascript
// Clic con resaltado visual (ya implementado)
cy.get('#mi-elemento').clickVisible({ pause: 1000, highlight: true });

// Scroll y clic con resaltado
cy.get('#mi-elemento').scrollAndClick({ pause: 1000, highlight: true });
```

### 4. **Pausar Manualmente Durante la Ejecución**

#### Opción A: Usar `cy.pause()`
Agrega esto en cualquier parte de tu test:
```javascript
cy.pause(); // Presiona "Resume" en Cypress para continuar
```

#### Opción B: Usar `cy.debug()`
Pausa y abre las DevTools:
```javascript
cy.debug(); // Abre las DevTools del navegador
```

#### Opción C: Usar helpers
```javascript
import { pausar, pausarConMensaje, resaltarElemento } from '../support/helpers';

// Pausar
pausar();

// Pausar con mensaje
pausarConMensaje('Revisando el estado del dropdown');

// Resaltar un elemento específico
resaltarElemento('#rates');
```

### 5. **Aumentar el Tiempo de Espera Entre Acciones**

Si los clics son muy rápidos, puedes aumentar el tiempo de pausa:

```javascript
// En los métodos de Page Objects, ajusta el parámetro 'pause'
.clickVisible({ pause: 2000, highlight: true }); // 2 segundos de pausa
```

### 6. **Ver Videos de las Ejecuciones**

Los videos están habilitados por defecto. Se guardan en:
```
cypress/videos/
```

### 7. **Screenshots Automáticos**

Los screenshots se toman automáticamente cuando un test falla. Se guardan en:
```
cypress/screenshots/
```

## Tips para Debugging

1. **Usa el Time Travel**: En Cypress puedes hacer clic en cualquier comando del timeline para ver el estado en ese momento.

2. **Console Logs**: Los logs aparecen en la consola de Cypress. Busca los mensajes con 🔍 para ver información de debugging.

3. **Selector Playground**: Usa el selector playground de Cypress para encontrar selectores fácilmente.

4. **Slow Down**: Si necesitas ver más lento, agrega `cy.wait()` entre acciones.

## Ejemplo de Test con Pausas

```javascript
it('Mi test con debugging', () => {
  loginPage.loginCompleto(email, password);
  
  // Pausar después del login
  cy.pause();
  
  dropdownNavegacionPage.hacerClicEnSidebarHeader();
  
  // Pausar después de abrir dropdown
  cy.pause();
  
  dropdownNavegacionPage.hacerClicEnTarifas();
});
```

## Configuración Recomendada

Para ver mejor los clics, ajusta estos valores en `cypress.config.js`:

```javascript
defaultCommandTimeout: 30000, // Ya configurado
```

Y en los métodos, usa pausas más largas:
```javascript
.clickVisible({ pause: 1500, highlight: true }); // 1.5 segundos
```

