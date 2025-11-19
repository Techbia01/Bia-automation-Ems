# 💳 Tests de Agregar Tarjeta

Este módulo contiene las pruebas automatizadas para el flujo de agregar tarjeta en la aplicación EMS.

## 📁 Estructura

```
MetodosPago/
├── agregar_tarjeta/
│   ├── agregar_tarjeta_happy_path.cy.js      # Tests exitosos
│   └── agregar_tarjeta_validaciones.cy.js    # Tests de validaciones
└── README.md                                  # Este archivo
```

## 🎯 Tests Disponibles

### Happy Path (agregar_tarjeta_happy_path.cy.js)

Pruebas exitosas de agregar diferentes tipos de tarjetas:

1. **Tarjeta Visa** - Test con tarjeta Visa básica (4111111111111111)
2. **Tarjeta Mastercard** - Test con Mastercard (5555555555554444)
3. **Tarjeta American Express** - Test con Amex que requiere CVV de 4 dígitos

### Validaciones (agregar_tarjeta_validaciones.cy.js)

Pruebas de validaciones de formulario:

1. **Campos vacíos** - Verifica que no se pueda enviar el formulario sin datos
2. **Tarjeta inválida** - Verifica rechazo de números de tarjeta inválidos
3. **Fecha expirada** - Verifica validación de fechas de expiración
4. **CVV corto** - Verifica longitud mínima del código de seguridad

## 🚀 Cómo Ejecutar

### Ejecutar todos los tests de agregar tarjeta

```bash
npm run test:agregar-tarjeta
```

### Abrir en modo interactivo

```bash
npm run test:agregar-tarjeta-open
```

### Ejecutar solo el happy path

```bash
npm run test:agregar-tarjeta-happy
```

### Ejecutar solo validaciones

```bash
npm run test:agregar-tarjeta-validations
```

### Ejecutar un test específico

```bash
npx cypress run --spec "cypress/e2e/MetodosPago/agregar_tarjeta/agregar_tarjeta_happy_path.cy.js"
```

## 📝 Flujo de Prueba

El flujo completo que se automatiza es:

1. ✅ **Login** - Autenticación con credenciales válidas
2. ✅ **Navegación** - Ir a Settings → Métodos de Pago
3. ✅ **Validación URL** - Verificar que estamos en `/invoice/payment-methods`
4. ✅ **Abrir modal** - Click en "Agregar tarjeta"
5. ✅ **Llenar formulario** - Ingresar datos de tarjeta:
   - Número de tarjeta
   - Nombre (Alejandra)
   - Apellido (Rojas)
   - Fecha de expiración (generada aleatoriamente entre 01-12 y 25-33)
   - CVV (generado aleatoriamente de 3 o 4 dígitos)
   - Nombre personalizado de la tarjeta
6. ✅ **Guardar** - Click en botón de guardar
7. ✅ **Verificación** - Confirmar que la tarjeta se agregó correctamente

## 🎴 Tarjetas de Prueba

Las siguientes tarjetas están disponibles para las pruebas:

| Número | Tipo | Descripción |
|--------|------|-------------|
| 4111111111111111 | Visa | Visa básica |
| 4444333322221111 | Visa | Visa alternativa |
| 5555555555554444 | Mastercard | Mastercard |
| 2223003122003222 | Mastercard | Mastercard 2-series |
| 378282246310005 | American Express | Amex (CVV 4 dígitos) |
| 30569309025904 | Diners Club | Diners Club |
| 6759000000000000 | Maestro | Maestro |

## 🏗️ Arquitectura

### Page Object Model

Los tests utilizan el patrón Page Object Model (POM):

**`AgregarTarjetaPage.js`** - Contiene:
- Todos los selectores del flujo de agregar tarjeta
- Métodos para navegar y llenar formularios
- Métodos auxiliares (generar fecha, CVV aleatorio)
- Verificaciones

### Fixtures

**`metodos_pago.json`** - Contiene:
- Array de tarjetas válidas con sus tipos
- Datos del titular (nombre y apellido)
- Nombre por defecto de la tarjeta

### Configuración

**`config.js`** - Actualizado con:
- Constantes de tarjetas de prueba
- URLs de métodos de pago
- Nombres de intercepts para APIs

## 🔍 Selectores Utilizados

### Navegación
- `#settings` - Dropdown de configuración
- `#payment-methods` - Opción de métodos de pago

### Formulario
- `#payment-method-section-add-button` - Botón agregar tarjeta
- `#add-payment-methods-modal-card-number-input` - Número de tarjeta
- `#add-payment-methods-modal-card-first-name-input` - Nombre
- `#add-payment-methods-modal-card-last-name-input` - Apellido
- `#add-payment-methods-modal-card-expiration-input` - Fecha expiración
- `#add-payment-methods-modal-card-security-code-input` - CVV
- `#add-payment-methods-modal-card-custom-name-input` - Nombre personalizado
- `#add-payment-methods-modal-save-button` - Botón guardar

## 📊 Intercepts Configurados

Los tests capturan las siguientes llamadas API:

- `@signin` - Autenticación
- `@contracts` - Contratos del usuario
- `@getPaymentMethods` - Obtener métodos de pago existentes
- `@createPaymentMethod` - Crear nuevo método de pago

## 👤 Usuarios de Automatización

Los tests utilizan 3 usuarios dedicados para las pruebas de agregar tarjeta:

| Usuario | Email | Uso |
|---------|-------|-----|
| Usuario 1 | user_auto@yopmail.com | Test Visa + Validaciones |
| Usuario 2 | user_auto2@yopmail.com | Test Mastercard |
| Usuario 3 | user_auto3@yopmail.com | Test American Express |

**Ubicación de credenciales**: `cypress/fixtures/usuarios_automation.json`

## ⚠️ Notas Importantes

1. **Credenciales**: Los tests usan usuarios dedicados de automatización (ver tabla arriba)
2. **Datos aleatorios**: Fecha de expiración y CVV se generan aleatoriamente
3. **Nombres únicos**: Para Mastercard se usa timestamp para evitar duplicados
4. **Manejo de errores**: Los tests ignoran errores de scripts externos (Kustomer)
5. **Rotación de usuarios**: Cada test usa un usuario diferente para evitar conflictos

## 🐛 Troubleshooting

### El test falla en navegación
- Verifica que el usuario tenga permisos para ver métodos de pago
- Confirma que los IDs `#settings` y `#payment-methods` existen

### El formulario no se envía
- Verifica que todos los campos requeridos se llenen
- Revisa que la validación de tarjeta funcione correctamente
- Confirma que el botón no esté deshabilitado

### No se encuentra la tarjeta después de agregarla
- Revisa que el intercept `@createPaymentMethod` responda 200/201
- Verifica que el nombre personalizado sea único
- Confirma que la página recargue la lista de tarjetas

## 📚 Referencias

- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Page Object Model](https://martinfowler.com/bliki/PageObject.html)
- Documentación del proyecto en `/README.md`

