// cypress/pages/metodos_pago/AgregarTarjetaPage.js
class AgregarTarjetaPage {
  // Selectores de navegación
  get settingsDropdown() { return '#settings'; }
  get paymentMethodsOption() { return '#payment-methods'; }
  
  // Selectores de la página de métodos de pago
  get addPaymentMethodButton() { return '#payment-method-section-add-button'; }
  get paymentMethodItems() { return '.PaymentMethodItem_paymentMethodsItem__F3md2'; }
  
  // Selectores del modal/formulario
  get cardNumberInput() { return '#add-payment-methods-modal-card-number-input'; }
  get firstNameInput() { return '#add-payment-methods-modal-card-first-name-input'; }
  get lastNameInput() { return '#add-payment-methods-modal-card-last-name-input'; }
  get expirationDateInput() { return '#add-payment-methods-modal-card-expiration-input'; }
  get securityCodeInput() { return '#add-payment-methods-modal-card-security-code-input'; }
  get customNameInput() { return '#add-payment-methods-modal-card-custom-name-input'; }
  get saveButton() { return '#add-payment-methods-modal-save-button'; }
  
  // URLs esperadas
  get paymentMethodsUrl() { return 'https://web.dev.bia.app/invoice/payment-methods'; }
  
  /**
   * Navega desde el Home hasta la página de métodos de pago
   */
  navigateToPaymentMethods() {
    // Click en el dropdown de settings
    cy.get(this.settingsDropdown, { timeout: 10000 })
      .should('be.visible')
      .click();
    
    // Click en la opción de métodos de pago
    cy.get(this.paymentMethodsOption, { timeout: 10000 })
      .should('be.visible')
      .click();
    
    // Validar que estamos en la URL correcta
    cy.url({ timeout: 10000 }).should('eq', this.paymentMethodsUrl);
  }
  
  /**
   * Abre el modal para agregar un nuevo método de pago
   * MANEJA AMBOS ESCENARIOS: con y sin métodos de pago existentes
   */
  openAddPaymentMethodModal() {
    cy.log('**Verificando si usuario tiene métodos de pago existentes**');
    
    // Esperar a que la página cargue completamente
    cy.wait(2000);
    
    // Verificar si existen métodos de pago
    cy.get('body').then(($body) => {
      const hasPaymentMethods = $body.find(this.paymentMethodItems).length > 0;
      
      if (hasPaymentMethods) {
        // ESCENARIO 2: Usuario CON métodos de pago
        cy.log('**Usuario tiene métodos de pago - Buscando botón "Agregar tarjeta"**');
        
        // Buscar el botón que contiene "Agregar tarjeta" (no "Agregar PSE")
        cy.get(this.addPaymentMethodButton)
          .contains('Agregar tarjeta')
          .should('be.visible')
          .click();
        
      } else {
        // ESCENARIO 1: Usuario SIN métodos de pago
        cy.log('**Usuario NO tiene métodos de pago - Click directo en botón**');
        
        // Click directo en el único botón disponible
        cy.get(this.addPaymentMethodButton, { timeout: 10000 })
          .should('be.visible')
          .click();
      }
    });
    
    // Esperar a que el modal se abra
    cy.wait(1000);
    
    // Verificar que el modal está abierto
    cy.get(this.cardNumberInput, { timeout: 10000 })
      .should('be.visible');
    
    cy.log('**Modal de agregar tarjeta abierto correctamente**');
  }
  
  /**
   * Llena el formulario completo de agregar tarjeta
   * @param {Object} cardData - Datos de la tarjeta
   */
  fillCardForm(cardData) {
    // Número de tarjeta
    cy.get(this.cardNumberInput, { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(cardData.cardNumber, { delay: 50 })
      .should('have.value', cardData.cardNumber.replace(/\s/g, ''));
    
    // Nombre
    cy.get(this.firstNameInput, { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(cardData.firstName, { delay: 50 })
      .should('have.value', cardData.firstName);
    
    // Apellido
    cy.get(this.lastNameInput, { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(cardData.lastName, { delay: 50 })
      .should('have.value', cardData.lastName);
    
    // Fecha de expiración
    cy.get(this.expirationDateInput, { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(cardData.expirationDate, { delay: 50 });
    
    // Código de seguridad (CVV)
    cy.get(this.securityCodeInput, { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(cardData.securityCode, { delay: 50, log: false });
    
    // Nombre personalizado de la tarjeta
    cy.get(this.customNameInput, { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(cardData.customName, { delay: 50 })
      .should('have.value', cardData.customName);
  }
  
  /**
   * Envía el formulario
   */
  submitForm() {
    cy.get(this.saveButton, { timeout: 10000 })
      .should('be.visible')
      .and('not.be.disabled')
      .click();
  }
  
  /**
   * Verifica que la tarjeta se haya agregado exitosamente
   * @param {String} customName - Nombre personalizado de la tarjeta
   */
  verifyCardAdded(customName) {
    cy.contains(customName, { timeout: 15000 })
      .should('be.visible');
  }
  
  /**
   * Verifica si el usuario tiene métodos de pago existentes
   * @returns {Chainable<Boolean>} true si tiene métodos de pago, false si no
   */
  hasExistingPaymentMethods() {
    return cy.get('body').then(($body) => {
      const count = $body.find(this.paymentMethodItems).length;
      cy.log(`**Usuario tiene ${count} método(s) de pago**`);
      return count > 0;
    });
  }
  
  /**
   * Cuenta cuántos métodos de pago tiene el usuario
   * @returns {Chainable<Number>} Cantidad de métodos de pago
   */
  countPaymentMethods() {
    return cy.get('body').then(($body) => {
      const count = $body.find(this.paymentMethodItems).length;
      return count;
    });
  }
  
  /**
   * Genera una fecha de expiración aleatoria válida
   * @returns {String} Fecha en formato MMYY
   */
  generateRandomExpirationDate() {
    const month = Math.floor(Math.random() * 12) + 1; // 1-12
    const year = Math.floor(Math.random() * 9) + 25; // 25-33
    return `${month.toString().padStart(2, '0')}${year}`;
  }
  
  /**
   * Genera un código de seguridad aleatorio
   * @returns {String} CVV de 3 o 4 dígitos
   */
  generateRandomCVV() {
    const length = Math.random() > 0.5 ? 3 : 4;
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }
}

export default AgregarTarjetaPage;

