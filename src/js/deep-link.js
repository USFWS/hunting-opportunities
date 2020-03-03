const L = require('leaflet');
const querystring = require('query-string');
const { camelCase } = require('camel-case');

const emitter = require('./emitter');
const GLOBAL_BOUNDS = require('./bounds');
const { getHuntUnitByObjectIds, getRefugeInfoByName } = require('./HuntService');

const DeepLink = function (window) {
  this.history = window.history;
  this.window = window;

  this.window.addEventListener('popstate', this.historyHandler.bind(this));
  emitter.on('search:state', (e) => this.updateHistory({ type: 'query', method: 'state', data: e }));
  emitter.on('search:species', (e) => this.updateHistory({ type: 'query', method: 'species', data: e }));
  emitter.on('search:zipcode', (e) => this.updateHistory({ type: 'query', method: 'zipcode', data: e }));
  emitter.on('search:special', (e) => this.updateHistory({ type: 'query', method: 'special', data: e }));
  emitter.on('search:facility', (e) => this.updateHistory({ type: 'query', method: 'facility', data: e }));
  emitter.on('clear:query', (e) => this.updateHistory({ type: 'query', data: e }))

  // Click comes from a map, zoom comes from a button in the results
  emitter.on('click:huntunit', (e) => this.updateHistory({ type: 'unit', data: e.OBJECTID }));
  emitter.on('zoom:unit', (e) => this.updateHistory({ type: 'unit', data: e.id }));
  emitter.on('click:refuge', (e) => this.updateHistory({ type: 'facility', data: e.OrgName }));
  emitter.on('zoom:refuge', (e) => this.updateHistory({ type: 'facility', data: e.properties.OrgName }));
};

// Maybe run an initialize function that sets up the query string when the map opens

DeepLink.prototype.updateHistory = function (update, type) {
  const params = {
    ...querystring.parse(this.window.location.search),
    ...(update.method && { method: update.method }),
    ...(update.type === 'query' && { query: update.data }),
    ...(update.type === 'unit' && { unit: update.data }),
    ...(update.type === 'facility' && { facility: update.data }),
  }
  if (update.type !== 'unit' && update.type !== 'facility') {
    if (params.facility) delete params.facility;
    if (params.unit) delete params.unit;
  }
  if (!params.query) delete params.query;
  const string = querystring.stringify(params).replace(/%20/g, '+');
  this.history.pushState(params, null, `${window.location.pathname}?${string}`);
}

DeepLink.prototype.historyHandler = function ({ state }) {
  if (!state) return;

  emitter.emit('update:search', {
    ...(state.query && { query: state.query }),
    ...(state.method && { method: state.method })
  });

  if (state.facility && state.unit || !state.facility && state.unit) {
    getHuntUnitByObjectIds(state.unit)
      .then((json) => emitter.emit('set:bounds', L.geoJSON(json).getBounds()));
  }

  if (state.facility && !state.unit) {
    getRefugeInfoByName(state.facility)
      .then((json) => emitter.emit('set:bounds', L.geoJSON(json).getBounds()));
  }
};

DeepLink.prototype.stateToBounds = function (state) {
  return GLOBAL_BOUNDS[camelCase(state)] || false;
};

DeepLink.prototype.processQueryString = function (qs) {
  const parsed = querystring.parse(qs);

  if (parsed.state) emitter.emit('set:bounds', this.getBounds(parsed.state));

  if (parsed.facility && parsed.unit || !parsed.facility && parsed.unit) {
    getHuntUnitByObjectIds(parsed.unit)
      .then((json) => emitter.emit('set:bounds', L.geoJSON(json).getBounds()));
  }

  if (parsed.facility && !parsed.unit) {
    getRefugeInfoByName(parsed.facility)
      .then((json) => emitter.emit('set:bounds', L.geoJSON(json).getBounds()));
  }

  const params = {};
  if (parsed.query) params.query = parsed.query;
  if (parsed.query) params.method = parsed.method;

  emitter.emit('update:search', params);
};

DeepLink.prototype.getBounds = function (state) {
  if (typeof state === 'string') return GLOBAL_BOUNDS[camelCase(state)];
  if (Array.isArray(state)) {
    return state
      .map(this.stateToBounds)
      .filter(Boolean) // filters falsy values out
      .reduce((bounds, val) => bounds.extend(val), L.latLngBounds());
  }
  return false;
};

module.exports = DeepLink;
