import View from './view.js';

class AuthView extends View {
  _parentElement = document.querySelector('.auth-form');
  _window = document.querySelector('.auth-window');
  _overlay = document.querySelector('.overlay');
  _btnOpen = document.querySelector('.nav__btn--auth');
  _btnClose = document.querySelector('.auth__close');
  _modeButtons = document.querySelectorAll('[data-auth-mode]');
  _mode = 'login';

  constructor() {
    super();
    this._btnOpen.addEventListener('click', () => this.openWindow());
    this._btnClose.addEventListener('click', () => this.closeWindow());
    this._overlay.addEventListener('click', () => this.closeWindow());
    this._modeButtons.forEach((button) => {
      button.addEventListener('click', () => this.setMode(button.dataset.authMode));
    });
    this.setMode(this._mode);
  }

  openWindow() {
    this._overlay.classList.remove('hidden');
    this._window.classList.remove('hidden');
  }

  closeWindow() {
    this._overlay.classList.add('hidden');
    this._window.classList.add('hidden');
  }

  setMode(mode) {
    this._mode = mode;
    const displayName = this._parentElement.elements.displayName;
    displayName.required = mode === 'register';
    displayName.closest('label').classList.toggle('hidden', mode !== 'register');
    this._modeButtons.forEach((button) => {
      button.classList.toggle('auth__mode--active', button.dataset.authMode === mode);
    });
    this._parentElement.querySelector('[type="submit"]').textContent =
      mode === 'register' ? 'Create account' : 'Sign in';
  }

  isRegisterMode() {
    return this._mode === 'register';
  }

  renderSpinner() {
    this._parentElement.querySelector('.auth__message').textContent = 'Working...';
    this._parentElement.querySelector('.auth__submit').disabled = true;
  }

  renderError(message) {
    this._parentElement.querySelector('.auth__message').textContent = message;
    this._parentElement.querySelector('.auth__submit').disabled = false;
  }

  addHandlerSubmit(handler) {
    this._parentElement.addEventListener('submit', (event) => {
      event.preventDefault();
      handler(Object.fromEntries(new FormData(this._parentElement)));
    });
  }

  addHandlerLogout(handler) {
    this._parentElement.querySelector('.auth__logout').addEventListener('click', handler);
  }

  renderAuthenticated(user) {
    this._parentElement.querySelector('.auth__message').textContent = `Signed in as ${user.displayName}`;
    this._parentElement.querySelector('.auth__fields').classList.add('hidden');
    this._parentElement.querySelector('.auth__submit').classList.add('hidden');
    this._parentElement.querySelector('.auth__submit').disabled = false;
    this._parentElement.querySelector('.auth__modes').classList.add('hidden');
    this._parentElement.querySelector('.auth__logout').classList.remove('hidden');
    this._btnOpen.querySelector('span').textContent = user.displayName;
  }

  renderSignedOut() {
    this._parentElement.reset();
    this._parentElement.querySelector('.auth__fields').classList.remove('hidden');
    this._parentElement.querySelector('.auth__submit').classList.remove('hidden');
    this._parentElement.querySelector('.auth__submit').disabled = false;
    this._parentElement.querySelector('.auth__modes').classList.remove('hidden');
    this._parentElement.querySelector('.auth__logout').classList.add('hidden');
    this._btnOpen.querySelector('span').textContent = 'Sign in';
    this.setMode('login');
  }

  update(user) {
    if (user) this.renderAuthenticated(user);
    else this.renderSignedOut();
  }
}

export default new AuthView();