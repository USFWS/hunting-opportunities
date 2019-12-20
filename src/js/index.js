const helpers = require('./helpers');
const Map = require('./Map');
const Search = require('./search/Search');
const Results = require('./search/Results');
const deepLink = require('./deep-link');
const { getUniqueHuntableSpecies, getSpecialHunts } = require('./HuntService');

const searchPanel = document.querySelector('.search-panel');
const form = searchPanel.querySelector('.search-form');
const input = searchPanel.querySelector('input[type=search]');
const list = searchPanel.querySelector('ul');
const radios = searchPanel.querySelectorAll('input[type=radio]');
const stateSelect = searchPanel.querySelector('#state-select');
const speciesSelect = searchPanel.querySelector('#species-select');
const specialSelect = searchPanel.querySelector('#special-hunt-select');
const message = searchPanel.querySelector('.message');
const length = searchPanel.querySelector('.search-results-length');
const content = searchPanel.querySelector('.search-results-content');
const loading = searchPanel.querySelector('.loading');
const toggleResults = searchPanel.querySelector('.toggle-results');

// Start the app
const init = () => {
  const API_URL = 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_NWRS_HQ_HuntFishStation/FeatureServer/0/query?where=1+%3D+1&outFields=*&f=pgeojson&token=';

  getUniqueHuntableSpecies().then((res) => helpers.addOptionsToSelect(res, speciesSelect));

  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      const geodata = { ...data, features: data.features.map(helpers.updateFeatureStateName) };
      const states = helpers.flatten(geodata.features
        .map((f) => f.properties.State_Array))
        .filter((s) => s);
      helpers.addOptionsToSelect(helpers.getUniqueStates(states).sort(), stateSelect);
      const geojson = { ...geodata };
      const map = new Map({ data: geojson });
      const search = new Search({
        input,
        stateSelect,
        speciesSelect,
        specialSelect,
        radios: Array.prototype.slice.call(radios),
      });
      const results = new Results({
        list,
        textInput: input,
        data: geojson,
        stateSelect,
        speciesSelect,
        specialSelect,
        message,
        length,
        loading,
        toggleResults,
        content,
      });
      deepLink.processQueryString(window.location.search);
    });
};

init();
document.documentElement.classList.remove('no-js');
form.addEventListener('submit', (e) => e.preventDefault());
