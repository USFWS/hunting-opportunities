const localstorage = require('local-storage');

const Disclaimer = function (disclaimerWrapper) {
  this.wrapper = disclaimerWrapper;
  this.form = disclaimerWrapper.querySelector('form');
  this.checkbox = disclaimerWrapper.querySelector('input[type=checkbox]');
  this.button = disclaimerWrapper.querySelector('button');

  this.form.addEventListener('submit', this.submitHandler.bind(this));
  this.checkbox.addEventListener('click', this.checkboxHandler.bind(this));

  this.checkDisclaimer();
}

Disclaimer.prototype.enableDisclaimer = function () {
  localstorage.remove('disclaimer');
  this.wrapper.setAttribute('aria-hidden', 'false');
};

Disclaimer.prototype.disableDisclaimer = function () {
  localstorage.set('disclaimer', 'hidden');
};

Disclaimer.prototype.checkboxHandler = function (e) {
  e.target.checked ? this.disableDisclaimer() : this.enableDisclaimer();
};

Disclaimer.prototype.checkDisclaimer = function () {
  if (localstorage.get('disclaimer') != 'hidden') this.enableDisclaimer();
};

Disclaimer.prototype.submitHandler = function (e) {
  e.preventDefault();
  this.wrapper.setAttribute('aria-hidden', 'true');
};

module.exports = Disclaimer;