# 💳 Tests de Métodos de Pago

Este módulo contiene las pruebas automatizadas para los flujos de agregar métodos de pago (Tarjeta y PSE) en la aplicación EMS.

## 📁 Estructura

```
MetodosPago/
├── agregar_tarjeta_desde_metodos_pago/
│   ├── agregar_tarjeta_desde_metodos_pago_happy_path.cy.js      # Tests exitosos tarjeta
│   └── agregar_tarjeta_desde_metodos_pago_validaciones.cy.js    # Tests validaciones tarjeta
├── agregar_pse/
│   ├── agregar_pse_happy_path.cy.js                              # Tests exitosos PSE
│   └── agregar_pse_validaciones.cy.js                            # Tests validaciones PSE
└── README.md                                                      # Este archivo
```

## 🎯 Tests Disponibles

### 💳 AGREGAR TARJETA

#### Happy Path (agregar_tarjeta_desde_metodos_pago_happy_path.cy.js)

Pruebas exitosas de agregar diferentes tipos de tarjetas:

1. **Tarjeta Visa** - Test con tarjeta Visa básica (4111111111111111)
2. **Tarjeta Mastercard** - Test con Mastercard (5555555555554444)
3. **Tarjeta American Express** - Test con Amex que requiere CVV de 4 dígitos

**Características especiales**:
- Detecta automáticamente si el usuario tiene o no métodos de pago
- Si NO tiene métodos: Click en "Agregar método de pago"
- Si SÍ tiene métodos: Click en "Agregar tarjeta" (no "Agregar PSE")

#### Validaciones (agregar_tarjeta_desde_metodos_pago_validaciones.cy.js)

Pruebas de validaciones de formulario:

1. **Campos vacíos** - Verifica que no se pueda enviar el formulario sin datos
2. **Tarjeta inválida** - Verifica rechazo de números de tarjeta inválidos
3. **Fecha expirada** - Verifica validación de fechas de expiración
4. **CVV corto** - Verifica longitud mínima del código de seguridad

---

### 🏦 AGREGAR PSE

#### Happy Path (agregar_pse_happy_path.cy.js)

Pruebas exitosas de agregar PSE con diferentes configuraciones:

1. **Usuario SIN métodos de pago** - Test con Banco de Bogotá + CC
2. **Usuario CON métodos de pago** - Test con Bancolombia + CC
3. **BBVA Colombia** - Test con BBVA + CE (Cédula Extranjería)
4. **Davivienda con NIT** - Test con Davivienda + NIT

**Características especiales**:
- **CRÍTICO**: Detecta si usuario NO tiene métodos y selecciona automáticamente el radio button PSE
- Si NO tiene métodos: Click en "Agregar método de pago" → Seleccionar radio PSE
- Si SÍ tiene métodos: Click directo en "Agregar PSE"
- Usa números de documento válidos (solo dígitos 1-9, máximo 10 dígitos)

#### Validaciones (agregar_pse_validaciones.cy.js)

Pruebas de validaciones de formulario PSE:

1. **Sin seleccionar banco** - Verifica que banco es requerido
2. **Sin tipo de documento** - Verifica que tipo documento es requerido
3. **Sin número de documento** - Verifica que número es requerido
4. **Solo acepta números** - Verifica que campo documento rechaza letras
5. **Máximo 10 dígitos** - Verifica longitud máxima
6. **No acepta solo ceros** - Verifica validación de número inválido
7. **Formulario vacío** - Verifica que no se puede enviar sin datos
8. **Número válido** - Verifica que acepta números del 1-9

## 🚀 Cómo Ejecutar

### Ejecutar TODOS los tests de métodos de pago (Tarjeta + PSE)

```bash
npm run test:metodos-pago           # Headless
npm run test:metodos-pago-open      # Modo interactivo
```

---

### 💳 Tests de TARJETA

```bash
# Todos los tests de tarjeta
npm run test:agregar-tarjeta
npm run test:agregar-tarjeta-open

# Solo happy path
npm run test:agregar-tarjeta-happy

# Solo validaciones
npm run test:agregar-tarjeta-validations
```

### 🏦 Tests de PSE

```bash
# Todos los tests de PSE
npm run test:agregar-pse
npm run test:agregar-pse-open

# Solo happy path
npm run test:agregar-pse-happy

# Solo validaciones
npm run test:agregar-pse-validations
```

---

### Ejecutar un test específico

```bash
# Tarjeta
npx cypress run --spec "cypress/e2e/MetodosPago/agregar_tarjeta_desde_metodos_pago/agregar_tarjeta_desde_metodos_pago_happy_path.cy.js"

# PSE
npx cypress run --spec "cypress/e2e/MetodosPago/agregar_pse/agregar_pse_happy_path.cy.js"
```

## 📝 Flujos de Prueba

### 💳 Flujo: Agregar Tarjeta

1. ✅ **Login** - Autenticación con credenciales válidas
2. ✅ **Navegación** - Ir a Settings → Métodos de Pago
3. ✅ **Validación URL** - Verificar que estamos en `/invoice/payment-methods`
4. ✅ **Detección de escenario** - Verificar si usuario tiene métodos de pago
5. ✅ **Abrir modal** - Click en botón correspondiente:
   - Sin métodos: "Agregar método de pago"
   - Con métodos: "Agregar tarjeta"
6. ✅ **Llenar formulario** - Ingresar datos de tarjeta:
   - Número de tarjeta
   - Nombre (Alejandra)
   - Apellido (Rojas)
   - Fecha de expiración (generada aleatoriamente entre 01-12 y 25-33)
   - CVV (generado aleatoriamente de 3 o 4 dígitos)
   - Nombre personalizado de la tarjeta
7. ✅ **Guardar** - Click en botón de guardar
8. ✅ **Verificación** - Confirmar que la tarjeta se agregó correctamente

### 🏦 Flujo: Agregar PSE

1. ✅ **Login** - Autenticación con credenciales válidas
2. ✅ **Navegación** - Ir a Settings → Métodos de Pago
3. ✅ **Validación URL** - Verificar que estamos en `/invoice/payment-methods`
4. ✅ **Detección de escenario** - Verificar si usuario tiene métodos de pago
5. ✅ **Abrir modal PSE**:
   - **Sin métodos**: Click en "Agregar método de pago" → **SELECCIONAR RADIO PSE** ⚠️
   - **Con métodos**: Click directo en "Agregar PSE"
6. ✅ **Llenar formulario PSE**:
   - Seleccionar banco (ej: Bancolombia, BBVA, etc.)
   - Seleccionar tipo de documento (CC, CE, NIT)
   - Ingresar número de documento (solo números 1-9, máximo 10 dígitos)
7. ✅ **Guardar** - Click en botón de guardar
8. ✅ **Verificación** - Confirmar que PSE se agregó correctamente

## 🎴 Datos de Prueba

### Tarjetas de Prueba (Fixture: `metodos_pago.json`)

| Número | Tipo | Descripción |
|--------|------|-------------|
| 4111111111111111 | Visa | Visa básica |
| 4444333322221111 | Visa | Visa alternativa |
| 5555555555554444 | Mastercard | Mastercard |
| 2223003122003222 | Mastercard | Mastercard 2-series |
| 378282246310005 | American Express | Amex (CVV 4 dígitos) |
| 30569309025904 | Diners Club | Diners Club |
| 6759000000000000 | Maestro | Maestro |

### Datos PSE (Fixture: `metodos_pago_pse.json`)

#### Bancos disponibles:
- Banco de Bogotá
- Bancolombia
- BBVA Colombia
- Davivienda
- Banco de Occidente
- Banco Popular
- Colpatria

#### Tipos de documento:
- CC - Cédula de Ciudadanía
- CE - Cédula de Extranjería
- NIT - Número de Identificación Tributaria

#### Números de documento válidos:
- 1234567890
- 9876543210
- 1111222233
- 5555666677
- 9999888877
- 1357924680
- 2468135790

**⚠️ IMPORTANTE**: Para que el pago PSE sea exitoso, el número debe contener dígitos del 1 al 9 y tener máximo 10 dígitos.

## 🏗️ Arquitectura

### Page Object Model

Los tests utilizan el patrón Page Object Model (POM):

**`AgregarTarjetaPage.js`** - Page Object para Tarjetas:
- Todos los selectores del flujo de agregar tarjeta
- Métodos para navegar y llenar formularios
- Detección automática de escenarios (con/sin métodos de pago)
- Métodos auxiliares (generar fecha, CVV aleatorio)
- Verificaciones

**`AgregarPSEPage.js`** - Page Object para PSE:
- Todos los selectores del flujo de agregar PSE
- Selector del radio button PSE (crítico para usuarios sin métodos)
- Métodos para seleccionar banco y tipo de documento
- Detección automática de escenarios (con/sin métodos de pago)
- Validaciones de campo numérico (solo números, máximo 10 dígitos)
- Verificaciones

### Fixtures

**`metodos_pago.json`** - Datos para Tarjetas:
- Array de tarjetas válidas con sus tipos
- Datos del titular (nombre y apellido)
- Nombre por defecto de la tarjeta

**`metodos_pago_pse.json`** - Datos para PSE:
- Lista de bancos disponibles
- Tipos de documento (CC, CE, NIT)
- Números de documento válidos (solo dígitos 1-9, máximo 10)

**`usuarios_automation.json`** - Usuarios de Automatización:
- 3 usuarios dedicados para tests de métodos de pago
- Cada usuario con email, password, UID y descripción

### Configuración

**`config.js`** - Actualizado con:
- Constantes de tarjetas de prueba
- URLs de métodos de pago
- Nombres de intercepts para APIs

## 🔍 Selectores Utilizados

### Navegación (Común para ambos flujos)
- `#settings` - Dropdown de configuración
- `#payment-methods` - Opción de métodos de pago
- `#payment-method-section-add-button` - Botón agregar método de pago
- `.PaymentMethodItem_paymentMethodsItem__F3md2` - Items de métodos existentes (para detección)

### Formulario TARJETA
- `#add-payment-methods-modal-card-number-input` - Número de tarjeta
- `#add-payment-methods-modal-card-first-name-input` - Nombre
- `#add-payment-methods-modal-card-last-name-input` - Apellido
- `#add-payment-methods-modal-card-expiration-input` - Fecha expiración
- `#add-payment-methods-modal-card-security-code-input` - CVV
- `#add-payment-methods-modal-card-custom-name-input` - Nombre personalizado
- `#add-payment-methods-modal-save-button` - Botón guardar

### Formulario PSE
- `#add-payment-methods-modal-radio-pse` - **Radio button PSE (CRÍTICO cuando usuario NO tiene métodos)** ⚠️
- `#add-payment-methods-modal-pse-bank-dropdown-button` - Selector de banco
- `#add-payment-methods-modal-pse-document-type-dropdown-button` - Selector tipo documento
- `#add-payment-methods-modal-pse-document-number-input` - Input número documento
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

### Generales
1. **Credenciales**: Los tests usan usuarios dedicados de automatización (ver tabla arriba)
2. **Manejo de errores**: Los tests ignoran errores de scripts externos (Kustomer)
3. **Rotación de usuarios**: Cada test usa un usuario diferente para evitar conflictos
4. **Detección automática**: Ambos flujos detectan si el usuario tiene o no métodos de pago

### Específicas de TARJETA
1. **Datos aleatorios**: Fecha de expiración y CVV se generan aleatoriamente
2. **Nombres únicos**: Para Mastercard se usa timestamp para evitar duplicados
3. **Detección de escenario**: 
   - Sin métodos → Click en "Agregar método de pago"
   - Con métodos → Click en "Agregar tarjeta" (no "Agregar PSE")

### Específicas de PSE
1. **⚠️ CRÍTICO - Radio Button**: Cuando usuario NO tiene métodos, el código automáticamente selecciona el radio button PSE (`#add-payment-methods-modal-radio-pse`)
2. **Número de documento**: 
   - Solo acepta números del 1 al 9
   - Máximo 10 dígitos
   - NO acepta letras
3. **Bancos**: Se puede elegir cualquier banco de la lista
4. **Detección de escenario**:
   - Sin métodos → Click en "Agregar método de pago" → **Seleccionar radio PSE**
   - Con métodos → Click directo en "Agregar PSE"

## 🐛 Troubleshooting

### Problemas Generales

#### El test falla en navegación
- Verifica que el usuario tenga permisos para ver métodos de pago
- Confirma que los IDs `#settings` y `#payment-methods` existen

#### El formulario no se envía
- Verifica que todos los campos requeridos se llenen
- Confirma que el botón no esté deshabilitado

### Problemas específicos de TARJETA

#### No se encuentra la tarjeta después de agregarla
- Revisa que el intercept `@createPaymentMethod` responda 200/201
- Verifica que el nombre personalizado sea único
- Confirma que la página recargue la lista de tarjetas

#### El test no hace click en "Agregar tarjeta"
- Verifica que el código detecte correctamente si hay métodos existentes
- Confirma que la clase `.PaymentMethodItem_paymentMethodsItem__F3md2` existe
- Revisa los logs de Cypress para ver qué escenario detectó

### Problemas específicos de PSE

#### El test falla al seleccionar el radio button PSE
- **CRÍTICO**: Verifica que el selector `#add-payment-methods-modal-radio-pse` existe
- Confirma que el usuario NO tiene métodos de pago (si debería seleccionar radio)
- Revisa que el modal se abra correctamente antes de buscar el radio

#### El campo documento no acepta números
- Verifica que el ID `#add-payment-methods-modal-pse-document-number-input` existe
- Confirma que el campo está habilitado
- Prueba con un número válido (solo dígitos 1-9, máximo 10)

#### No se encuentra PSE después de agregarlo
- Revisa que el intercept `@createPaymentMethod` responda 200/201
- Verifica que el número de documento sea válido (sin ceros solamente)
- Confirma que la página recargue la lista de métodos de pago

#### El test no hace click en "Agregar PSE"
- Verifica que el usuario YA tiene métodos de pago
- Confirma que el botón con texto "Agregar PSE" existe
- Revisa los logs para ver qué escenario detectó el código

## 📚 Referencias

- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Page Object Model](https://martinfowler.com/bliki/PageObject.html)
- Documentación del proyecto en `/README.md`

