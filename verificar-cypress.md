# Verificación de Cypress

## Pasos para que Cypress muestre tus archivos:

1. **Cierra completamente Cypress** (cierra la ventana del navegador)

2. **Abre PowerShell o CMD en el directorio EMS:**
   ```powershell
   cd C:\Users\User\OneDrive\Desktop\EMS
   ```

3. **Ejecuta Cypress:**
   ```powershell
   npm run test:open
   ```

4. **Si aún no aparecen los archivos:**
   - Verifica que estés en el directorio correcto: `C:\Users\User\OneDrive\Desktop\EMS`
   - Verifica que el archivo `cypress.config.js` existe en ese directorio
   - Intenta limpiar el caché de Cypress:
     ```powershell
     Remove-Item -Recurse -Force .\cypress\.cache -ErrorAction SilentlyContinue
     npm run test:open
     ```

## Archivos que deberían aparecer:

- `cypress/e2e/Home/Dropdown de navegacion/soporte.cy.js` ✅ (nuevo)
- `cypress/e2e/Home/Dropdown de navegacion/blog.cy.js`
- `cypress/e2e/Home/Dropdown de navegacion/tarifas.cy.js`
- `cypress/e2e/Home/Dropdown de navegacion/legales.cy.js`
- `cypress/e2e/Home/Dropdown de navegacion/cambio_cuenta.cy.js`
- `cypress/e2e/Home/Dropdown de navegacion/solicitar_funcionalidad.cy.js`
- `cypress/e2e/Login/login_happy_path_con_correo.cy.js`
- `cypress/e2e/Login/login_correo_fallido.cy.js`
- Y más...

