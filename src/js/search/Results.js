const L = require('leaflet');
const leafletKnn = require('leaflet-knn');
const closest = require('closest');

const emitter = require('../emitter');
const helpers = require('../helpers');
const { getByOrgCode } = require('../CMTService');
const { getZipCode } = require('../ZipcodeService');
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

  this.content.addEventListener('click', this.handleResultClick.bind(this));
  this.toggle.addEventListener('click', this.toggleSearchResults.bind(this));

  // Analytics events
  this.inputs.speciesSelect.addEventListener('change', (e) => emitter.emit('select:species', e.target.value));
  this.inputs.stateSelect.addEventListener('change', (e) => emitter.emit('select:state', e.target.value));

  const displayHuntUnit = (props) => {
    this.empty();
    this.content.innerHTML = templates.hunt(props);
    this.loading.setAttribute('aria-hidden', 'true');
  };

  emitter.on('click:huntunit', displayHuntUnit);
  emitter.on('zoom:unit', (unit) => {
    this.loading.setAttribute('aria-hidden', 'false');
    HuntService.completeRefugeInfoFromHuntUnit(unit).then(displayHuntUnit);
  });

  emitter.on('click:refuge', (props) => {
    this.loading.setAttribute('aria-hidden', 'false');

    HuntService.getHuntUnitsByOrgCode(props.OrgCode)
      .then((units) => {
        getByOrgCode(props.OrgCode)
          .then((facility) => {
            this.render([{
              ...facility,
              properties: { ...props, ...facility.properties, units },
            }], templates.refuge);
          })
          .catch((err) => {
            console.log('Could not retrieve facility info.');
            this.render([{
              properties: { ...props, units },
            }], templates.refuge);
          });
      });
  });

  emitter.on('search:special', (query) => {
    this.loading.setAttribute('aria-hidden', 'false');
    this.activateInput(this.inputs.specialSelect);
    HuntService.getSpecialHunts(query)
      .then(HuntService.completeRefugeInfoFromSpeciesInfo)
      .then((results) => {
        this.render(results, templates.huntUnits, query);
      });
  });

  emitter.on('search:facility', (query) => {
    const results = this.find(query);
    this.activateInput(this.inputs.textInput);
    this.message.innerHTML = 'Search by station name or state';
    this.render(results, templates.officeList);
  });

  emitter.on('search:zipcode', (zipcode) => {
    this.activateInput(this.inputs.textInput);
    this.nearest(zipcode);
  });

  emitter.on('search:state', (query) => {
    this.loading.setAttribute('aria-hidden', 'false');
    const results = this.findByState(query);
    this.activateInput(this.inputs.stateSelect);
    this.render(results, templates.officeList);
  });

  emitter.on('search:species', (query) => {
    this.activateInput(this.inputs.speciesSelect);
    this.loading.setAttribute('aria-hidden', 'false');
    // Get huntable species by user query, mash it up with data on hunt units
    HuntService.getHuntableSpecies(query)
      .then(HuntService.completeRefugeInfoFromSpeciesInfo)
      .then((results) => {
        this.render(results, templates.huntUnits, query);
      });
  });
};

Results.prototype.activateInput = function (input) {
  this.empty();
  Object.values(this.inputs).forEach((i) => i.parentNode.setAttribute('aria-hidden', 'true'));
  input.parentNode.setAttribute('aria-hidden', 'false');
};

Results.prototype.openSearchResults = function () {
  this.content.classList.remove('closed');
  this.toggle.textContent = 'Hide results';
};

Results.prototype.closeSearchResults = function () {
  this.content.classList.add('closed');
  this.toggle.textContent = 'Show results';
};

Results.prototype.toggleSearchResults = function () {
  if (this.content.classList.contains('closed')) {
    this.openSearchResults();
    emitter.emit('toggle:results', 'open');
  } else {
    this.closeSearchResults();
    emitter.emit('toggle:results', 'close');
  }
};

Results.prototype.empty = function () {
  this.length.innerHTML = '';
  this.message.innerHTML = '';
  this.content.innerHTML = '';
};

Results.prototype.handleResultClick = function (e) {
  const { classList } = e.target;
  if (classList.contains('facility-icon')) {
    const facilityName = closest(e.target, '.facility-info').querySelector('.facility-name').textContent;
    const refuge = helpers.findRefugeByName(facilityName, this.data);
    emitter.emit('zoom:refuge', refuge);
  }

  if (classList.contains('zoom-to-hunt-unit')) {
    HuntService.getHuntUnitByObjectIds(e.target.value)
      .then((data) => data[0])
      .then((unit) => emitter.emit('zoom:unit', unit));
  }

  if (classList.contains('zoom-to-refuge')) {
    const orgCode = e.target.value;
    HuntService.getRefugeInfoByOrgCode(orgCode)
      .then((refuge) => emitter.emit('zoom:refuge', refuge));
  }

  if (classList.contains('zoom-icon')) {
    const objectId = closest(e.target, '.zoom-to-hunt-unit').value;
    HuntService.getHuntUnitByObjectIds(objectId)
      .then((data) => data[0])
      .then((unit) => emitter.emit('zoom:unit', unit));
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
  this.loading.setAttribute('aria-hidden', 'true');
  emitter.emit('render:results', results);
};

Results.prototype.nearest = function (zipcode) {
  if (zipcode.length !== 5) {
    this.message.innerHTML = 'You must provide a valid five-digit zip code.';
    return false;
  }
  this.message.innerHTML = '';

  const findNearest = (geometry) => {
    if (!geometry) return false;
    return this.index.nearest(geometry, 10);
  };

  const mapOfficesToFeatures = (nearestOffices) => nearestOffices.map((o) => o.layer.feature);

  const findAndDisplayNearestOffices = (zip) => {
    const nearestOffices = findNearest(zip);
    if (nearestOffices) {
      const features = mapOfficesToFeatures(nearestOffices);
      this.render(features, templates.officeList);
    }
  };

  this.index = leafletKnn(L.geoJSON(this.data));
  this.message.innerHTML = 'Loading zipcode data...';
  this.loading.setAttribute('aria-hidden', 'false');
  getZipCode(zipcode)
    .then((geojson) => {
      const { coordinates } = geojson.features[0].geometry;
      this.message.innerHTML = '';
      this.loading.setAttribute('aria-hidden', 'true');
      findAndDisplayNearestOffices([...coordinates]);
      emitter.emit('found:zipcode', geojson);
    })
    .catch(() => { this.message.innerHTML = 'The number you entered did not match an existing zipcode.'; });
};

module.exports = Results;
