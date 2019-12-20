const L = require('leaflet');
const leafletKnn = require('leaflet-knn');
const closest = require('closest');

const emitter = require('../emitter');
const helpers = require('../helpers');
const { getByOrgCode } = require('../CMTService');
const HuntService = require('../HuntService');
const templates = require('../templates');

const Results = function (opts) {
  this.data = opts.data.features;
  this.inputs = {
    stateSelect: opts.stateSelect,
    speciesSelect: opts.speciesSelect,
    specialSelect: opts.specialSelect,
    textInput: opts.textInput,
  };
  this.message = opts.message;
  this.length = opts.length;
  this.loading = opts.loading;
  this.toggle = opts.toggleResults;
  this.content = opts.content;

  emitter.on('click:huntunit', (props) => {
    this.empty();
    this.content.innerHTML = templates.hunt(props);
  });

  emitter.on('click:refuge', (props) => {
    // Shoud combine these with Promise.all to display results from separate requests
    const huntUnits = HuntService.getHuntUnitsByOrgCode(props.OrgCode);
    const refuge = getByOrgCode(props.OrgCode);

    Promise.all([huntUnits, refuge]).then(([units, facility]) => {
      this.content.innerHTML = templates.refuge({
        ...props,
        physAdd: helpers.titleCase(facility.physAdd1),
        physCity: helpers.titleCase(facility.physCity),
        physZip: facility.physZip,
        physState: helpers.getStateName(facility.physStateAbbr),
        units,
      });
    });
  });

  emitter.on('search:special', (query) => {
    const huntData = {};
    this.loading.setAttribute('aria-hidden', 'false');
    this.activateInput(this.inputs.specialSelect);
    HuntService.getSpecialHunts(query)
      .then((species) => { huntData.species = species; return species; })
      .then((species) => species.map((u) => u.OBJECTID))
      .then((objectIds) => objectIds.join(','))
      .then((objectIds) => encodeURIComponent(objectIds))
      .then(HuntService.getHuntUnitFromSpeciesData)
      .then((unitData) => { huntData.units = unitData; return huntData; })
      .then(HuntService.combineSpeciesAndHuntUnit)
      .then((results) => {
        this.render(results, templates.specialHunts, query);
        this.loading.setAttribute('aria-hidden', 'true');
      });
  });

  emitter.on('search:facility', (query) => {
    const results = this.find(query);
    this.message.innerHTML = 'Search by facility name or huntable species';
    this.activateInput(this.inputs.textInput);
    this.render(results, templates.officeList);
  });

  emitter.on('search:zipcode', (zipcode) => {
    this.activateInput(this.inputs.textInput);
    this.nearest(zipcode);
  });

  emitter.on('search:state', (query) => {
    const results = this.findByState(query);
    this.activateInput(this.inputs.stateSelect);
    this.render(results, templates.officeList);
  });

  emitter.on('search:species', (query) => {
    this.activateInput(this.inputs.speciesSelect);
    const huntData = {};
    this.loading.setAttribute('aria-hidden', 'false');
    // Get huntable species by user query, mash it up with data on hunt units
    HuntService.getHuntableSpecies(query)
      .then((species) => { huntData.species = species; return species; })
      .then((species) => species.map((u) => u.OBJECTID))
      .then((objectIds) => objectIds.join(','))
      .then((objectIds) => encodeURIComponent(objectIds))
      .then(HuntService.getHuntUnitFromSpeciesData)
      .then((unitData) => { huntData.units = unitData; return huntData; })
      .then(HuntService.combineSpeciesAndHuntUnit)
      .then((results) => {
        this.render(results, templates.huntUnits);
        this.loading.setAttribute('aria-hidden', 'true');
      });
  });

  this.content.addEventListener('click', this.handleResultClick.bind(this));
  this.toggle.addEventListener('click', this.toggleSearchResults.bind(this));
};

Results.prototype.activateInput = function (input) {
  this.empty();
  Object.values(this.inputs).forEach((i) => i.parentNode.setAttribute('aria-hidden', 'true'));
  input.parentNode.setAttribute('aria-hidden', 'false');
};

Results.prototype.openSearchResults = function () {
  this.content.classlist.remove('closed');
};

Results.prototype.closeSearchResults = function () {
  this.content.classlist.add('closed');
};

Results.prototype.toggleSearchResults = function () {
  this.content.classList.toggle('closed');
};

Results.prototype.empty = function () {
  this.length.innerHTML = '';
  this.message.innerHTML = '';
  this.content.innerHTML = '';
};

Results.prototype.handleResultClick = function (e) {
  if (e.target.className === 'facility-icon') {
    const facilityName = closest(e.target, '.facility-info').querySelector('.facility-name').textContent;
    const refuge = helpers.findRefugeByName(facilityName, this.data);
    emitter.emit('zoom:refuge', refuge);
  }
};

Results.prototype.updateLength = function (n = 0) {
  const plural = n === 1 ? '' : 's';
  this.length.innerHTML = `Showing ${n} result${plural}`;
};

Results.prototype.findByState = function (query) {
  return this.data.filter(({ properties: props }) => props.State_Array.includes(query));
};

Results.prototype.find = function (query) {
  const regex = new RegExp(query, 'gi');
  if (query.length === 0) return this.render([]);

  return this.data.filter(({ properties: props }) => {
    const isState = regex.test(props.State_Label);
    const isName = regex.test(props.OrgName);
    return (isState || isName);
  });
};

Results.prototype.render = function (results, template, query) {
  if (!results || !results.length) {
    this.content.innerHTML = '';
    this.toggle.setAttribute('aria-hidden', 'true');
    return false;
  }

  this.content.innerHTML = template(results, query);
  this.updateLength(results.length);
  this.toggle.setAttribute('aria-hidden', 'false');
  emitter.emit('render:results', results);
};

Results.prototype.nearest = function (zipcode) {
  if (zipcode.length !== 5) {
    this.message.innerHTML = 'You must provide a valid five-digit zip code.';
    return false;
  }
  this.message.innerHTML = '';

  const findNearest = () => {
    const userZipcode = this.zipcodes.features
      .filter((zip) => zip.properties.GEOID10 === zipcode);

    if (!userZipcode.length) {
      this.message.innerHTML = 'The number you entered did not match an existing zipcode.';
      return false;
    }
    return this.index.nearest(userZipcode[0].geometry.coordinates, 10);
  };

  const mapOfficesToFeatures = (nearestOffices) => nearestOffices.map((o) => o.layer.feature);

  const findAndDisplayNearestOffices = (zip) => {
    const nearestOffices = findNearest(zip);
    if (nearestOffices) {
      const features = mapOfficesToFeatures(nearestOffices);
      this.render(features, templates.officeList);
    }
  };

  if (!this.zipcodes) {
    this.index = leafletKnn(L.geoJSON(this.data));
    this.message.innerHTML = 'Loading zipcode data...';
    this.loading.setAttribute('aria-hidden', 'false');
    fetch('./data/zip-centroids.js')
      .then((res) => res.json())
      .then((zipcodes) => {
        this.message.innerHTML = '';
        this.loading.setAttribute('aria-hidden', 'true');
        this.zipcodes = zipcodes;
        findAndDisplayNearestOffices(zipcode);
      });
  } else {
    findAndDisplayNearestOffices(zipcode);
  }
};

module.exports = Results;
