const L = require('leaflet');
const querystring = require('query-string');
const { camelCase } = require('camel-case');

const emitter = require('./emitter');
const GLOBAL_BOUNDS = require('./bounds');

const stateToBounds = (state) => GLOBAL_BOUNDS[camelCase(state)];

const boundsReducer = (bounds, val) => bounds.extend(val);

const getBounds = (state) => {
  if (typeof state === 'string') return GLOBAL_BOUNDS[camelCase(state)];
  if (Array.isArray(state)) {
    // ToDo: Error handling -- show a message if zoom doesn't work
    return state
      .map(stateToBounds)
      .reduce(boundsReducer, L.latLngBounds());
  }
  return false;
};

const isQuery = (obj) => ((obj.query) ? obj.query : false);

const isSearchMethod = (obj) => ((obj.method) ? obj.method : false);

const processQueryString = (qs) => {
  const parsed = querystring.parse(qs);
  const query = isQuery(parsed);
  const searchMethod = isSearchMethod(parsed);

  if (query) emitter.emit('query', query);
  if (searchMethod) emitter.emit('method', searchMethod);
  if (parsed.state) emitter.emit('set:bounds', getBounds(parsed.state));
};

module.exports = {
  processQueryString,
};
