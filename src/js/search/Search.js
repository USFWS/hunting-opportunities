const debounce = require('debounce');
const emitter = require('../emitter');

const Search = function (opts) {
  this.input = opts.input;
  this.stateSelect = opts.stateSelect;
  this.speciesSelect = opts.speciesSelect;
  this.specialSelect = opts.specialSelect;
  this.radios = opts.radios;
  this.state = 'facility';
  this.specialHunts = ['veteran', 'youth', 'disabled', 'mentored'];

  emitter.on('query', (query) => { this.input.value = query; });
  emitter.on('method', (method) => {
    const radioButton = this.radios.filter((r) => r.value === method);
    if (radioButton[0]) radioButton[0].click();
  });
  this.input.addEventListener('input', debounce(this.emitQuery.bind(this), 400));
  this.stateSelect.addEventListener('input', this.emitQuery.bind(this));
  this.specialSelect.addEventListener('input', this.emitQuery.bind(this));
  this.speciesSelect.addEventListener('input', this.emitQuery.bind(this));
  this.radios.forEach((r) => r.addEventListener('click', this.toggleSearchInterface.bind(this)));

  // Analytics events
  this.input.addEventListener('input', debounce((e) => { emitter.emit('search:term', e.target.value); }, 2500));
};

Search.prototype.emitQuery = function (e) {
  const query = e.target.value;
  if (!this.specialHunts.includes(this.state) && query.length) emitter.emit(`search:${this.state}`, query);
  else if (this.specialHunts.includes(this.state)) emitter.emit('search:special', this.state);
};

Search.prototype.toggleSearchInterface = function (e) {
  this.state = e.target.id;
  const getInputValue = (state) => {
    switch (state) {
      case 'state':
        return this.stateSelect.value;
      case 'species':
        return this.speciesSelect.value;
      case 'special':
        return this.specialSelect.value;
      case 'zipcode':
        return this.input.value;
      case 'facility':
        return this.input.value;
      default:
        return this.state;
    }
  };
  const eventName = this.specialHunts.includes(this.state) ? 'special' : this.state;
  const value = getInputValue(this.state);
  emitter.emit(`search:${eventName}`, value);
  this.input.focus();
};

module.exports = Search;
