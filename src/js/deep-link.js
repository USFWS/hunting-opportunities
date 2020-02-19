const L = require('leaflet');
const querystring = require('query-string');
const { camelCase } = require('camel-case');

const emitter = require('./emitter');
const GLOBAL_BOUNDS = require('./bounds');

const DeepLink = function (window) {
  this.history = window.history;
  this.window = window;

  this.window.addEventListener('popstate', this.historyHandler.bind(this));
  emitter.on('search:state', (e) => this.updateHistory(e, 'state'));
  emitter.on('search:species', (e) => this.updateHistory(e, 'species'));
  emitter.on('search:zipcode', (e) => this.updateHistory(e, 'zipcode'));
  emitter.on('search:special', (e) => this.updateHistory(e, 'special'));
  emitter.on('search:facility', (e) => this.updateHistory(e, 'facility'));
  emitter.on('clear:query', (e) => this.updateHistory(e))

  //emitter.on('click:huntunit', (e) => this.updateHistory(e));
  //emitter.on('click:refuge', (e) => this.updateHistory(e));
};

// Maybe run an initialize function that sets up the query string when the map opens

DeepLink.prototype.updateHistory = function (e, type) {
  const params = {
    method: type || querystring.parse(this.window.location.search).method,
    ...(e && { query: e })
  }
  const string = querystring.stringify(params);
  this.history.pushState(params, null, `/?${string}`);
}

DeepLink.prototype.historyHandler = function ({ state }) {

  if (!state) return;

  emitter.emit('update:search', {
    ...(state.query && { query: state.query }),
    ...(state.method && { method: state.method })
  });
};

DeepLink.prototype.stateToBounds = function (state) {
  return GLOBAL_BOUNDS[camelCase(state)] || false;
};

DeepLink.prototype.processQueryString = function (qs) {
  const parsed = querystring.parse(qs);

  if (parsed.state) emitter.emit('set:bounds', this.getBounds(parsed.state));
  emitter.emit('update:search', {
    ...(parsed.query && { query: parsed.query }),
    ...(parsed.method && { method: parsed.method })
  });
};

DeepLink.prototype.getBounds = function (state) {
  if (typeof state === 'string') return GLOBAL_BOUNDS[camelCase(state)];
  if (Array.isArray(state)) {
    return state
      .map(stateToBounds)
      .filter(Boolean) // filters falsy values out
      .reduce((bounds, val) => bounds.extend(val), L.latLngBounds());
  }
  return false;
};

module.exports = DeepLink;
