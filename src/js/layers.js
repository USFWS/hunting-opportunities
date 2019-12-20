const L = require('leaflet');
const esri = require('esri-leaflet');
require('esri-leaflet-renderers');

const emitter = require('./emitter');
const { getRelatedHuntUnits, getRelatedHuntableSpecies } = require('./HuntService');

const natGeo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
  maxZoom: 16,
});

const grayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  maxZoom: 16,
});

const refuges = L.tileLayer.wms('https://gis.fws.gov/arcgis/services/FWS_Refuge_Boundaries/MapServer/WMSServer?', {
  layers: '0',
  opacity: 0.5,
  transparent: true,
  format: 'image/png',
  attribution: 'U.S. Fish and Wildlife Service',
});

const amenities = esri.featureLayer({
  url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_National_Visitor_Service_Amenities_View/FeatureServer/0',
  minZoom: 12,
  onEachFeature: (feature, layer) => layer.bindPopup(`<p>${feature.properties.Name}</p>`),
});

const huntUnits = esri.featureLayer({
  url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_NWRS_HQ_PubHuntUnits/FeatureServer/1',
  minZoom: 10,
  onEachFeature: (feature, layer) => {
    layer.on('click', (e) => {
      // Get info on huntable species, append it to info about the hunt unit
      getRelatedHuntUnits(e.target.feature.id)
        .then((unit) => {
          console.log(unit);
          getRelatedHuntableSpecies(unit.OBJECTID).then((species) => {
            emitter.emit('click:huntunit', {
              ...feature.properties,
              huntInfo: unit,
              species,
            });
          });
        });
    });
    // layer.bindPopup(`<p>${feature.properties.HuntUnit}</p>`);
  },
});

const basemaps = {
  'National Geographic': natGeo,
  'Gray Canvas': grayCanvas,
};

module.exports = {
  natGeo,
  grayCanvas,
  refuges,
  basemaps,
  amenities,
  huntUnits,
};
