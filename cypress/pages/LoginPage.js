// cypress/pages/LoginPage.js
class LoginPage {
  // Selectores simples
  get emailInput() { return '#email-input'; }
  get passwordInput() { return '#password-input'; }
  get continueButton() { return '#continue-button-login'; }
  get loginButton() { return '#login-button'; }
  get errorMessage() { return '.bia-input__error'; }

  // Métodos de acción
  ingresarEmail(email) {
    cy.get(this.emailInput, { timeout: 10000 })
      .should('be.visible')
      .and('be.enabled')
      .clear()
      .type(email, { delay: 0 });
  }

  hacerClickEnContinuar() {
    cy.get(this.continueButton)
      .should('be.visible')
      .and('not.be.disabled')
      .click();
  }

  ingresarPassword(password) {
    cy.get(this.passwordInput, { timeout: 10000 })
      .should('be.visible')
      .and('be.enabled')
      .clear()
      .type(password, { delay: 0, log: false });
  }

  hacerLogin() {
    cy.get(this.loginButton)
      .should('be.visible')
      .and('not.be.disabled')
      .click();
  }

  loginCompleto(email, password) {
    this.ingresarEmail(email);
    this.hacerClickEnContinuar();
    this.ingresarPassword(password);
    this.hacerLogin();
  }
}

export default LoginPage;