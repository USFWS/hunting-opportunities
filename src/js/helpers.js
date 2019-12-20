const L = require('leaflet');
const unique = require('array-unique').immutable;
const madison = require('madison');
const flatten = require('flatten');
const titleCase = require('to-title-case');
const formatThousands = require('format-thousands');

const addOptionsToSelect = (values, select) => {
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.text = value;
    select.add(option);
  });
};

const getUniqueStates = (states) => unique(states);

const updateFeatureStateName = (feat) => {
  const state = feat.properties.State;
  const array = state ? state.split('/').map(madison.getStateName) : [''];
  return {
    ...feat,
    properties: {
      ...feat.properties,
      State_Array: array,
      State_Label: array.join(', '),
    },
  };
};

const getStateName = (abbrev) => madison.getStateName(abbrev);

const sortByName = (a, b) => {
  const aName = a.properties.OrgName.toUpperCase();
  const bName = b.properties.OrgName.toUpperCase();
  if (aName < bName) return -1;
  if (aName > bName) return 1;
  return 0;
};

const findRefugeByName = (name, data) => data.find((r) => r.properties.OrgName === name);

const featuresToBounds = (features) => {
  if (!features[0].geometry) return null;
  return features.reduce(
    (bounds, feature) => {
      const coordinates = [...feature.geometry.coordinates];
      return bounds.extend(coordinates.reverse());
    },
    new L.latLngBounds(),
  );
};

const formatAcreage = (acres) => {
  const rounded = Math.round(acres);
  return formatThousands(rounded, ',');
};

const capitalize = (s) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

module.exports = {
  flatten,
  unique,
  sortByName,
  featuresToBounds,
  findRefugeByName,
  getStateName,
  addOptionsToSelect,
  updateFeatureStateName,
  getUniqueStates,
  titleCase,
  formatThousands,
  formatAcreage,
  capitalize,
};
