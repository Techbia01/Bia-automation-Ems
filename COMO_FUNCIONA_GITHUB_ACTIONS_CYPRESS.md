# 🔗 Cómo se Conecta GitHub Actions con Cypress

Esta guía explica paso a paso cómo funciona la integración entre GitHub Actions y Cypress.

## 📊 Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. TRIGGER (Activación)                                     │
│    - Push a main/master/develop                            │
│    - Pull Request                                          │
│    - Horario programado (2 AM UTC)                        │
│    - Ejecución manual                                      │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. GITHUB ACTIONS CREA UN RUNNER                           │
│    - Máquina virtual Ubuntu (ubuntu-latest)                │
│    - Ambiente limpio y aislado                              │
│    - Sin acceso a tu máquina local                          │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. CHECKOUT DEL CÓDIGO                                      │
│    - Descarga tu código del repositorio                     │
│    - Usa: actions/checkout@v4                               │
│    - Obtiene todos los archivos del proyecto               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. SETUP NODE.JS                                            │
│    - Instala Node.js versión 18                            │
│    - Configura npm                                         │
│    - Usa: actions/setup-node@v4                            │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. INSTALAR DEPENDENCIAS                                    │
│    - Ejecuta: npm ci                                        │
│    - Instala Cypress y todas las dependencias              │
│    - Lee package.json y package-lock.json                  │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. EJECUTAR PRUEBAS CYPRESS                                 │
│    - Ejecuta: npm run test                                  │
│    - Que ejecuta: cypress run                              │
│    - Cypress lee: cypress.config.js                        │
│    - Usa CYPRESS_BASE_URL: https://web.dev.bia.app          │
│    - Ejecuta pruebas en: cypress/e2e/**/*.cy.js            │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. CYPRESS EJECUTA LAS PRUEBAS                              │
│    - Abre Chrome headless (sin interfaz gráfica)            │
│    - Navega a: https://web.dev.bia.app                     │
│    - Ejecuta cada test en cypress/e2e/                     │
│    - Genera reportes JSON en: cypress/reports/*.json       │
│    - Guarda videos en: cypress/videos/                     │
│    - Guarda screenshots en: cypress/screenshots/           │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. GENERAR REPORTES                                         │
│    - Fusiona JSONs: npm run merge:reports                   │
│    - Genera HTML: npm run generate:report                   │
│    - Crea: cypress/reports/report.html                      │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. PUBLICAR ARTEFACTOS                                      │
│    - Sube reporte HTML a GitHub                            │
│    - Sube videos y screenshots                             │
│    - Puedes descargarlos desde Actions                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 10. ENVIAR NOTIFICACIÓN A SLACK                             │
│     - Lee: scripts/generate-slack-message.js                │
│     - Genera mensaje con resultados                        │
│     - Envía a: SLACK_WEBHOOK_URL (secret)                  │
└─────────────────────────────────────────────────────────────┘
```

## 🔍 Puntos Clave de la Conexión

### 1. **No hay conexión directa**
- GitHub Actions NO se conecta directamente a Cypress
- GitHub Actions ejecuta comandos en una máquina virtual
- Esos comandos ejecutan Cypress como si fuera local

### 2. **Cypress se ejecuta en la máquina virtual**
```
GitHub Actions Runner (Ubuntu)
  └── Node.js instalado
      └── npm ci (instala Cypress)
          └── npm run test
              └── cypress run
                  └── Chrome headless
                      └── Navega a https://web.dev.bia.app
                          └── Ejecuta pruebas
```

### 3. **Variables de entorno**
- `CYPRESS_BASE_URL` se pasa como variable de entorno
- Cypress la lee automáticamente
- No necesitas configurarla en `cypress.config.js` si la pasas así

### 4. **Archivos de configuración**
- `cypress.config.js` → Configuración de Cypress
- `package.json` → Scripts y dependencias
- `.github/workflows/cypress-tests.yml` → Configuración de GitHub Actions

## 🐛 Problemas Comunes

### ❌ "Las pruebas no se ejecutan"

**Causas posibles:**
1. **Error en la instalación de dependencias**
   - Revisa el paso "Instalar dependencias"
   - Verifica que `package.json` y `package-lock.json` estén correctos

2. **Error en la ejecución de Cypress**
   - Revisa el paso "Ejecutar pruebas Cypress"
   - Busca mensajes de error en los logs

3. **Cypress no encuentra las pruebas**
   - Verifica que los archivos estén en `cypress/e2e/`
   - Verifica el patrón en `cypress.config.js`: `specPattern`

### ❌ "Exit code 6"

**Significa:**
- Cypress SÍ se ejecutó
- Pero las pruebas fallaron
- Esto es normal si hay errores en las pruebas

**Solución:**
- Revisa los logs del paso "Ejecutar pruebas Cypress"
- Busca qué pruebas fallaron y por qué
- Revisa los videos y screenshots en los artefactos

### ❌ "No se generan reportes"

**Causas:**
1. Las pruebas fallaron antes de generar reportes
2. No hay archivos JSON en `cypress/reports/`
3. Error al fusionar reportes

**Solución:**
- Verifica que `cypress/reports/` tenga archivos `.json`
- Revisa los logs del paso "Generar reportes"

## 🔧 Cómo Verificar que Todo Funciona

### Paso 1: Revisar los logs en GitHub Actions

1. Ve a la pestaña **Actions**
2. Abre la ejecución más reciente
3. Haz clic en **"Ejecutar pruebas Cypress"**
4. Revisa cada paso:
   - ✅ Checkout código
   - ✅ Setup Node.js
   - ✅ Instalar dependencias
   - ⚠️ Ejecutar pruebas Cypress (aquí verás si fallan)
   - ✅ Generar reportes
   - ✅ Publicar artefactos
   - ✅ Enviar notificación

### Paso 2: Ver qué pruebas se ejecutaron

En los logs del paso "Ejecutar pruebas Cypress", busca:
```
Running: cypress/e2e/Login/login_correo_happy_path.cy.js
```

### Paso 3: Ver qué pruebas fallaron

Busca líneas como:
```
✖ Login -- Happy path con correo
```

### Paso 4: Descargar artefactos

1. Al final de la ejecución, ve a la sección **Artifacts**
2. Descarga `cypress-report` (reporte HTML)
3. Descarga `cypress-artifacts` (videos y screenshots)

## 💡 Resumen

**GitHub Actions NO se conecta directamente a Cypress.**

En su lugar:
1. GitHub Actions crea una máquina virtual
2. Instala Node.js y dependencias
3. Ejecuta `cypress run` como si fuera local
4. Cypress ejecuta las pruebas contra tu aplicación web
5. Genera reportes y los sube a GitHub
6. Envía notificación a Slack

**Es como si ejecutaras `npm run test` en tu computadora, pero en una máquina virtual de GitHub.**

