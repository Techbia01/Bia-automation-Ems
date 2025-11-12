# 📋 Guía de Instalación - Proyecto Cypress EMS (Mac)

## ⚠️ IMPORTANTE - Lee esto primero

**NO necesitas instalar Cypress por separado.** 
Cypress se instalará automáticamente cuando ejecutes `npm install`. 
Solo necesitas instalar **Node.js** primero.

---

## Requisitos Previos

### 1. Instalar Node.js (SOLO ESTO es necesario instalar manualmente)
1. Ve a: https://nodejs.org/
2. Descarga la versión **LTS** (recomendada)
3. Instala el archivo `.pkg` descargado
4. Abre **Terminal** (Aplicaciones > Utilidades > Terminal)
5. Verifica la instalación ejecutando:
   ```bash
   node --version
   npm --version
   ```
   Deberías ver números de versión (ej: v20.x.x y 10.x.x)

---

## Instalación del Proyecto

### 2. Descomprimir el archivo ZIP
1. Descarga `EMS_Proyecto.zip`
2. Haz doble clic para descomprimirlo
3. Mueve la carpeta `EMS` a tu Escritorio o donde prefieras

### 3. Abrir Terminal en la carpeta del proyecto
1. Abre **Terminal** (Aplicaciones > Utilidades > Terminal)
2. Navega a la carpeta del proyecto:
   ```bash
   cd ~/Desktop/EMS
   ```
   *(Si lo pusiste en otra ubicación, ajusta la ruta)*

### 4. Instalar las dependencias (esto instalará Cypress automáticamente)
Ejecuta este comando (puede tardar unos minutos):
```bash
npm install
```

**Esto instalará automáticamente:**
- ✅ Cypress (NO necesitas instalarlo por separado)
- ✅ Todas las dependencias necesarias del proyecto

**Espera a que termine** (verás mensajes de descarga e instalación). 
La primera vez puede tardar 2-5 minutos mientras descarga Cypress.

---

## Ejecutar los Tests

### 5. Opción A: Abrir Cypress en modo interactivo (recomendado para empezar)
```bash
npm run test:open
```

Esto abrirá la interfaz de Cypress donde podrás:
- Ver todos los tests disponibles
- Seleccionar el navegador (Chrome, Electron, etc.)
- Ejecutar tests haciendo clic en ellos

### 6. Opción B: Ejecutar un test específico desde la terminal
```bash
npx cypress run --spec "cypress/e2e/UsuariosEms/creacion_usuarios/creacion_usuario_ems/creacion_usuario_ems_happy_path.cy.js"
```

### 7. Opción C: Ejecutar todos los tests
```bash
npm test
```

---

## Comandos Útiles

```bash
# Abrir Cypress en modo interactivo
npm run test:open

# Ejecutar todos los tests
npm test

# Ejecutar tests en modo visible (con navegador)
npx cypress run --headed --spec "cypress/e2e/UsuariosEms/creacion_usuarios/creacion_usuario_ems/creacion_usuario_ems_happy_path.cy.js"
```

---

## Solución de Problemas

### Si `npm install` da error:
- Asegúrate de tener Node.js instalado correctamente
- Intenta ejecutar: `npm install --legacy-peer-deps`

### Si Cypress no se abre:
- Verifica que la instalación terminó correctamente
- Intenta ejecutar: `npx cypress verify`

### Si hay problemas de permisos:
- Puede que necesites ejecutar: `sudo npm install`
- (Te pedirá tu contraseña de Mac)

---

## ✅ Verificación Final

Para verificar que todo está bien instalado:
```bash
npx cypress --version
```

Deberías ver la versión de Cypress instalada.

---

## 📝 Notas Importantes

- ✅ **NO necesitas instalar Cypress por separado** - `npm install` lo instala automáticamente
- ✅ Solo necesitas instalar **Node.js** manualmente
- ✅ El proyecto ya está configurado, solo ejecuta `npm install` y listo
- ✅ Los tests se ejecutan contra: `https://web.dev.bia.app`
- ✅ Si nunca has usado Node.js, solo instálalo desde nodejs.org y listo

---

¡Listo! 🎉 Ya puedes ejecutar los tests de Cypress.

