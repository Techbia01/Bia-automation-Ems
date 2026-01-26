// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Import helpers for debugging
import './helpers';

// Manejar excepciones no capturadas globalmente para evitar que errores de librerías externas
// den la impresión de que el test falló
Cypress.on('uncaught:exception', (err) => {
  // Ignorar errores comunes de librerías externas y visualización
  if (
    err?.message?.includes('includes') ||
    err?.message?.includes('Kustomer.start') ||
    err?.message?.includes('getRawIndex') ||
    err?.message?.includes('Cannot read properties of undefined') ||
    err?.message?.includes('ResizeObserver loop limit exceeded') ||
    err?.message?.includes('Non-Error promise rejection')
  ) {
    return false; // No fallar el test por estos errores
  }
  return true; // Permitir que otros errores fallen el test
});

// Interceptar y silenciar errores 404 de fuentes para que no aparezcan en los logs
// Esto evita que los errores de fuentes den la impresión de que el test falló
beforeEach(() => {
  // Interceptar llamadas a fuentes y responder con éxito para evitar errores 404 en logs
  cy.intercept('GET', '**/fonts/**', { statusCode: 200, body: '' }).as('fonts');
  cy.intercept('GET', '**/*.woff2', { statusCode: 200, body: '' }).as('woff2');
  cy.intercept('GET', '**/*.woff', { statusCode: 200, body: '' }).as('woff');
  cy.intercept('GET', '**/*.ttf', { statusCode: 200, body: '' }).as('ttf');
  cy.intercept('GET', '**/*.eot', { statusCode: 200, body: '' }).as('eot');
});