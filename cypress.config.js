const { defineConfig } = require('cypress');
const { beforeRunHook, afterRunHook } = require('cypress-mochawesome-reporter/lib');

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    reportPageTitle: 'Reporte de Pruebas Cypress - EMS',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
    reportDir: 'cypress/reports',
    overwrite: true, // Cambiar a true para asegurar que se generen los reportes
    html: false, // No generar HTML aquí, lo haremos después con merge
    json: true, // Asegurar que se generen JSON
  },
  e2e: {
    baseUrl: 'https://web.dev.bia.app',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['**/1-getting-started/**', '**/2-advanced-examples/**'],
    env: {
      loginPath: '/login',
    },
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: true,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    // Configuración para evitar errores de cache
    defaultCommandTimeout: 30000,
    requestTimeout: 30000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      // Configuración para Chrome
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          // Usar un perfil de usuario temporal limpio para evitar restauración de sesión
          const os = require('os');
          const path = require('path');
          const tempProfileDir = path.join(os.tmpdir(), 'cypress-chrome-profile-' + Date.now());
          launchOptions.args.push(`--user-data-dir=${tempProfileDir}`);
          
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--disable-features=VizDisplayCompositor');
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--disable-extensions');
          launchOptions.args.push('--disable-background-timer-throttling');
          launchOptions.args.push('--disable-backgrounding-occluded-windows');
          launchOptions.args.push('--disable-renderer-backgrounding');
          // Opciones adicionales para mejorar la conectividad y SSL
          launchOptions.args.push('--ignore-certificate-errors');
          launchOptions.args.push('--ignore-ssl-errors');
          launchOptions.args.push('--ignore-certificate-errors-spki-list');
          launchOptions.args.push('--allow-running-insecure-content');
          launchOptions.args.push('--test-type');
          launchOptions.args.push('--allow-insecure-localhost');
          launchOptions.args.push('--unsafely-treat-insecure-origin-as-secure=https://web.dev.bia.app');
          // Deshabilitar completamente el diálogo de restauración de páginas
          launchOptions.args.push('--disable-session-crashed-bubble');
          launchOptions.args.push('--disable-infobars');
          launchOptions.args.push('--disable-restore-session-state');
          launchOptions.args.push('--no-first-run');
          launchOptions.args.push('--no-default-browser-check');
          launchOptions.args.push('--disable-popup-blocking');
          launchOptions.args.push('--disable-prompt-on-repost');
          launchOptions.args.push('--disable-hang-monitor');
          launchOptions.args.push('--disable-client-side-phishing-detection');
          launchOptions.args.push('--disable-component-update');
          launchOptions.args.push('--disable-domain-reliability');
          launchOptions.args.push('--disable-features=TranslateUI');
          launchOptions.args.push('--disable-ipc-flooding-protection');
          launchOptions.args.push('--disable-notifications');
          launchOptions.args.push('--disable-sync');
          launchOptions.args.push('--disable-background-networking');
          launchOptions.args.push('--disable-default-apps');
        }
        return launchOptions;
      });
    }
  }
});

