// cypress/pages/FacturasPage.js
class FacturasPage {
  // Selectores de navegación desde Facturas
  get paymentsOption() { return '#payments'; }
  get invoicesOption() { return '#invoices'; }
  get paymentMethodsButton() { return '#invoices-page-payment-methods-button'; }
  
  // URL esperada de la página de facturas
  get invoicesUrl() { return 'https://web.dev.bia.app/invoice'; }
  
  /**
   * Navega desde el Home hasta la página de métodos de pago vía Pagos → Facturas
   */
  navigateToPaymentMethodsFromFacturas() {
    cy.log('**Navegando a Métodos de Pago desde Pagos → Facturas**');
    
    // Paso 1: Click en Pagos
    cy.log('**Paso 1: Click en Pagos**');
    cy.get(this.paymentsOption, { timeout: 10000 })
      .should('be.visible')
      .click();
    
    cy.wait(1000);
    
    // Paso 2: Click en Facturas
    cy.log('**Paso 2: Click en Facturas**');
    cy.get(this.invoicesOption, { timeout: 10000 })
      .should('be.visible')
      .click();
    
    // Validar que estamos en la página de facturas
    cy.url({ timeout: 10000 }).should('include', '/invoice');
    cy.wait(2000);
    
    // Paso 3: Click en botón de Métodos de Pago
    cy.log('**Paso 3: Click en botón Métodos de Pago desde Facturas**');
    cy.get(this.paymentMethodsButton, { timeout: 10000 })
      .should('be.visible')
      .click();
    
    // Validar que estamos en la página de métodos de pago
    cy.url({ timeout: 10000 }).should('include', '/invoice/payment-methods');
    
    cy.log('**✅ Navegación exitosa a Métodos de Pago desde Facturas**');
  }
}

export default FacturasPage;

