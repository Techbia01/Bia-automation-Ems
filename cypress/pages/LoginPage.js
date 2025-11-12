// cypress/pages/LoginPage.js
class LoginPage {
  // Selectores simples
  get emailInput() { return '#email-input'; }
  get passwordInput() { return '#password-input'; }
  get continueButton() { return '#continue-button-login'; }
  get loginButton() { return '#login-button'; }
  get errorMessage() { return '.bia-input__error'; }
}

export default LoginPage;