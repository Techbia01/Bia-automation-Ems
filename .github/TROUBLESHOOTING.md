# 🔧 Solución de Problemas - GitHub Actions y Cypress

## ❓ ¿Por qué no se ejecutan todos los tests?

### Posibles causas:

1. **Tests fallan y se detiene la ejecución**
   - El workflow tiene `continue-on-error: true`, así que debería continuar
   - Revisa los logs en GitHub Actions para ver qué tests fallaron

2. **Timeouts**
   - Algunos tests pueden tardar más de lo esperado
   - Ya configuramos timeouts más largos (30-60 segundos)

3. **Problemas de conectividad**
   - La URL `https://web.dev.bia.app` puede no estar disponible
   - Verifica que el servidor esté funcionando

## 🔍 Cómo Ver los Errores Detallados

### En GitHub Actions:

1. Ve a la pestaña **Actions** en tu repositorio
2. Haz clic en la ejecución más reciente
3. Haz clic en el job **"Ejecutar pruebas Cypress"**
4. Revisa cada paso:
   - **"Ejecutar pruebas Cypress"**: Aquí verás qué tests se ejecutaron y cuáles fallaron
   - Busca mensajes en rojo que indiquen errores específicos

### Información útil en los logs:

- **Qué tests se ejecutaron**: Busca líneas como `Running: cypress/e2e/...`
- **Qué tests fallaron**: Busca líneas con `✖` o `FAILED`
- **Errores específicos**: Busca mensajes de error después de cada test fallido

## 🐛 Errores Comunes y Soluciones

### Error: "Timed out after waiting"

**Solución:**
- Los timeouts ya están configurados a 30-60 segundos
- Si sigue fallando, puede ser que el servidor esté lento
- Considera aumentar los timeouts en `cypress.config.js`

### Error: "Element not found" o "Element is not visible"

**Solución:**
- El elemento puede tardar en cargar
- Verifica que los `wait()` estén configurados correctamente
- Revisa que los intercepts estén funcionando

### Error: "Network request failed"

**Solución:**
- Verifica que `https://web.dev.bia.app` esté disponible
- Revisa que los intercepts estén configurados correctamente
- Puede ser un problema de conectividad en GitHub Actions

### Error: "Test failed but continue-on-error is true"

**Esto es normal:**
- El workflow continúa ejecutando los demás tests
- Al final, verás un resumen de todos los tests ejecutados
- El workflow marcará como "unstable" si hay fallos, pero no como "failure"

## 📊 Ver Resumen de Tests Ejecutados

En los logs de GitHub Actions, busca secciones como:

```
✓ 5 passed
✖ 2 failed
```

Esto te dirá cuántos tests pasaron y cuántos fallaron.

## 🎯 Ejecutar Tests Específicos

Si quieres ejecutar solo ciertos tests, puedes modificar el workflow temporalmente:

```yaml
spec: 'cypress/e2e/Login/**/*.cy.js'  # Solo tests de Login
```

O ejecutar un test específico:

```yaml
spec: 'cypress/e2e/Login/login_happy_path_con_correo.cy.js'
```

## 💡 Consejos

1. **Revisa los videos**: Si un test falla, descarga el video desde los artefactos de GitHub Actions
2. **Revisa los screenshots**: Los screenshots de fallos se guardan automáticamente
3. **Ejecuta localmente primero**: Antes de hacer push, ejecuta `npm test` localmente para verificar

## 📞 ¿Necesitas Más Ayuda?

Si después de revisar los logs sigues teniendo problemas:

1. Copia el mensaje de error específico
2. Revisa qué test está fallando
3. Verifica que el test funcione localmente con `npm test`












