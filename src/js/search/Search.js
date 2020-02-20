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

  this.input.addEventListener('input', debounce(this.emitQuery.bind(this), 400));
  this.stateSelect.addEventListener('input', this.emitQuery.bind(this));
  this.specialSelect.addEventListener('input', this.emitQuery.bind(this));
  this.speciesSelect.addEventListener('input', this.emitQuery.bind(this));
  this.radios.forEach((r) => r.addEventListener('click', (e) => this.toggleSearchInterface(e.target.value)));

  // Analytics events
  this.input.addEventListener('input', debounce((e) => { emitter.emit('search:term', e.target.value); }, 2500));

  // Select the appropriate radio button based on an updated query parameter
  emitter.on('update:search', (params) => {
    const radioButton = this.radios.filter((r) => r.value === params.method);
    if (radioButton[0]) radioButton[0].checked = true;
  });
};

Search.prototype.emitQuery = function (e) {
  const query = e.target.value;
  if (!query.length) emitter.emit('clear:query');
  if (!this.specialHunts.includes(this.state) && query.length) emitter.emit(`search:${this.state}`, query);
  else if (this.specialHunts.includes(this.state)) emitter.emit('search:special', this.state);
};

Search.prototype.toggleSearchInterface = function (state) {
  this.state = state;
  const eventName = this.specialHunts.includes(this.state) ? 'special' : this.state;
  const value = this.getInput(this.state).value;
  emitter.emit(`search:${eventName}`, value);
  this.input.focus();
};

Search.prototype.getInput = function (state) {
  switch (state) {
    case 'state':
      return this.stateSelect;
    case 'species':
      return this.speciesSelect;
    case 'special':
      return this.specialSelect;
    case 'zipcode':
      return this.input;
    case 'facility':
      return this.input;
    default:
      return this.state;
  };
}

module.exports = Search;
