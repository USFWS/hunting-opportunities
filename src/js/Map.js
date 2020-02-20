const L = require('leaflet');
const pointInPolygon = require('@turf/boolean-point-in-polygon').default;
const bboxPolygon = require('@turf/bbox-polygon').default;
const { polygon, point } = require('@turf/helpers');

const emitter = require('./emitter');
const layers = require('./layers');
const icons = require('./icons');
const { initialBounds, alaskaBbox } = require('./bounds');
const { getHuntUnitsByRelatedGUID } = require('./HuntService');

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
  layer.bindPopup(`<p class="refuge-name-popup"><strong>${props.OrgName}</strong></p>`);
  layer.on('mouseover', () => layer.openPopup());
  layer.on('mouseout', () => layer.closePopup());
  layer.on('click', () => emitter.emit('click:refuge', props));
};

const Map = function (opts) {
  this.map = L.map('map', { zoomControl: false }).fitBounds(initialBounds);
  this.data = opts.data;

  this.map.createPane('hunt-units');
  this.map.getPane('hunt-units').style.zIndex = 300;

  this.zipcode = L.geoJSON(emptyGeojson, {
    onEachFeature: (feat, layer) => layer.bindPopup(`<p>${feat.properties.PO_NAME}, ${feat.properties.STATE}</p>`),
  }).addTo(this.map);

  this.filtered = L.geoJSON(emptyGeojson, {
    onEachFeature,
    pointToLayer: (feat, latlng) => L.marker(latlng, { icon: icons.orangeMarker }),
  }).addTo(this.map);

  this.markers = L.geoJSON(this.data, {
    onEachFeature,
    pointToLayer: (feat, latlng) => L.marker(latlng, { icon: icons.blueMarker }),
    filter: (feat) => {
      const type = feat.properties.OrgType;
      if (type === 'WMD' || type === 'CA') return false;
      return true;
    },
  }).addTo(this.map);

  this.currentHuntUnits = L.geoJSON(emptyGeojson, {
    style: {
      color: '#ff7800',
      fillColor: '#ff8000',
      fill: true,
      weight: 10,
    },
  }).addTo(this.map);

  layers.natGeo.addTo(this.map);
  // layers.refuges.addTo(this.map);
  layers.huntUnits.addTo(this.map);
  layers.amenities.addTo(this.map);

  L.control.layers(layers.basemaps, {
    'Refuge boundaries': layers.refuges,
    'Refuge amenities': layers.amenities,
    'Current hunt unit': this.currentHuntUnits,
    'Hunt units': layers.huntUnits,
  }).addTo(this.map);
  L.control.zoom({ position: 'topright' }).addTo(this.map);

  this.map.on('moveend', (e) => {
    const center = e.target.getCenter();
    const polygon = bboxPolygon(alaskaBbox);
    const pt = point([center.lng, center.lat]);
    if (pointInPolygon(pt, polygon)) {
      if (this.map.hasLayer(layers.huntUnits)) {
        layers.huntUnits.remove();
        layers.huntUnitsAlaska.addTo(this.map);
      }
    } else {
      if (this.map.hasLayer(layers.huntUnitsAlaska)) {
        layers.huntUnitsAlaska.remove();
        layers.huntUnits.addTo(this.map);
      }
    }
  })

  emitter.on('set:bounds', (bounds) => this.map.fitBounds(bounds));

  emitter.on('found:zipcode', (geojson) => {
    this.zipcode.clearLayers();
    this.zipcode.addData(geojson);
  });
  emitter.on('zoom:refuge', (refuge) => {
    const coordinates = [...refuge.geometry.coordinates].reverse();
    this.map.flyTo(coordinates, 12, { ...paddingOptions });
  });
  emitter.on('zoom:unit', (unit) => {
    this.currentHuntUnits.clearLayers();
    this.currentHuntUnits.addData({ ...emptyGeojson, features: [unit] });
    this.map.flyToBounds(this.currentHuntUnits.getBounds(), { ...paddingOptions });
  });
  emitter.on('render:results', (features) => {
    if (!features[0].geometry) return false;
    const data = { ...emptyGeojson, features };
    const bounds = L.geoJSON(data).getBounds();
    const featureType = features[0].geometry ? features[0].geometry.type : null;

    if (featureType === 'Point') {
      this.currentHuntUnits.clearLayers();
      this.filtered.clearLayers();
      this.filtered.addData(data);
    } else if (featureType === 'Polygon' || featureType === 'MultiPolygon') {
      this.filtered.clearLayers();
      this.currentHuntUnits.clearLayers();
      this.currentHuntUnits.addData(data);
    }
    if (bounds && featureType) {
      this.map.fitBounds(bounds, {
        paddingTopLeft: [375, 50],
        paddingBottomRight: [50, 50],
        maxZoom: 12,
      });
    }
  });

  emitter.on('click:huntunit', (data) => {
    getHuntUnitsByRelatedGUID(data.RelateGUID).then((units) => emitter.emit('zoom:unit', units[0]));
  });

  let lastZoom;
  this.map.on('zoomend', () => {
    const zoom = this.map.getZoom();
    const zoomLimit = 12;
    if (zoom < zoomLimit && (!lastZoom || lastZoom >= zoomLimit)) {
      this.map.eachLayer((l) => {
        if (l.getTooltip) {
          const toolTip = l.getTooltip();
          if (toolTip) {
            this.map.closeTooltip(toolTip);
          }
        }
      });
    } else {
      this.map.eachLayer((l) => {
        if (l.getTooltip) {
          const toolTip = l.getTooltip();
          if (toolTip) {
            this.map.addLayer(toolTip);
          }
        }
      });
    }
    lastZoom = zoom;
  });
};

module.exports = Map;
