const L = require('leaflet');

const helpers = require('./helpers');
const emitter = require('./emitter');
const layers = require('./layers');
const icons = require('./icons');
const GLOBAL_BOUNDS = require('./bounds');

const emptyGeojson = {
  type: 'FeatureCollection',
  name: 'filtered',
  crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
  features: [],
};

const paddingOptions = {
  paddingTopLeft: [375, 50],
  paddingBottomRight: [50, 50],
};

const onEachFeature = (feat, layer) => {
  const props = feat.properties;
  layer.bindPopup(`<p><strong><a href="${props.URL}">${props.OrgName}</a></strong></p>`);
  layer.on('mouseover', () => layer.openPopup());
  layer.on('click', () => emitter.emit('click:refuge', props));
};

const Map = function (opts) {
  this.map = L.map('map', { zoomControl: false }).fitBounds(GLOBAL_BOUNDS.init);
  this.data = opts.data;

  this.currentHuntUnit = L.geoJSON(emptyGeojson, {
    style: {
      color: '#ff7800',
      fillColor: '#ff8000',
      fill: true,
      weight: 10,
    },
  }).addTo(this.map);

  this.filtered = L.geoJSON(emptyGeojson, {
    onEachFeature,
    pointToLayer: (feat, latlng) => L.marker(latlng, { icon: icons.orangeMarker }),
  }).addTo(this.map);

  this.markers = L.geoJSON(this.data, {
    onEachFeature,
    pointToLayer: (feat, latlng) => L.marker(latlng, { icon: icons.blueMarker }),
  }).addTo(this.map);

  layers.natGeo.addTo(this.map);
  // layers.refuges.addTo(this.map);
  layers.huntUnits.addTo(this.map);
  layers.amenities.addTo(this.map);

  L.control.layers(layers.basemaps, {
    'Refuge boundaries': layers.refuges,
    'Refuge amenities': layers.amenities,
    'Current hunt unit': this.currentHuntUnit,
    'Hunt units': layers.huntUnits,
  }).addTo(this.map);
  L.control.zoom({ position: 'topright' }).addTo(this.map);

  emitter.on('set:bounds', (bounds) => this.map.fitBounds(bounds));
  emitter.on('zoom:refuge', (refuge) => {
    const coordinates = [...refuge.geometry.coordinates].reverse();
    this.map.flyTo(coordinates, 12, { ...paddingOptions });
  });
  emitter.on('zoom:unit', (unit) => {
    this.currentHuntUnit.clearLayers();
    this.currentHuntUnit.addData({ ...emptyGeojson, features: [unit] });
    this.map.flyToBounds(this.currentHuntUnit.getBounds(), { ...paddingOptions });
  });
  emitter.on('render:results', (features) => {
    this.filtered.clearLayers();
    this.filtered.addData({ ...emptyGeojson, features });
    const bounds = this.filtered.getBounds();
    if (bounds) {
      this.map.fitBounds(bounds, {
        paddingTopLeft: [375, 50],
        paddingBottomRight: [50, 50],
        maxZoom: 12,
      });
    }
  });
};

module.exports = Map;
