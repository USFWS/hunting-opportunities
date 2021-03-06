const L = require('leaflet');
const esri = require('esri-leaflet');
require('esri-leaflet-renderers');

const emitter = require('./emitter');
const { completeRefugeInfoFromHuntUnit } = require('./HuntService');

const imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
});

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
  where: `Category IN (36,35,1,2,3,5,6,34,32,28,7,8,9,10,11,24,16,33,18,27,20,45) AND Public_Use NOT IN ('Non-public Use')`,
});

const wilderness = esri.featureLayer({
  url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWSWilderness/FeatureServer/2',
  minZoom: 8,
  onEachFeature: (feature, layer) => layer.bindPopup(`<p>${feature.properties.DESNAME}</p>`),
})

//https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_NWRS_HQ_PubHuntUnits/FeatureServer
const huntUnitOptions = {
  url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_National_2020_2021_Hunt_Units/FeatureServer/0',
  minZoom: 10,
  style: (feat) => {
    switch (feat.properties.Huntable) {
      case 'No':
        return { fillColor: '#FF6666', color: '#000', weight: 3 };
      default:
        return { fillColor: '#0f4c81', color: '#000', weight: 3 };
    }
  },
  pane: 'hunt-units',
  onEachFeature: (feature, layer) => {
    layer.bindTooltip(feature.properties.Hunt_Unit_Name, { permanent: true });
    layer.on('click', (e) => {
      // Get info on huntable species, append it to info about the hunt unit
      completeRefugeInfoFromHuntUnit(feature).then((data) => {
        emitter.emit('click:huntunit', data);
      });
    });
  },
};

const huntUnits = esri.featureLayer(huntUnitOptions);
// https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_NWRS_HQ_PubHuntUnits_AK_Simplified/FeatureServer/0
const huntUnitsAlaska = esri.featureLayer({
  ...huntUnitOptions,
  url: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_National_2020___2021_Hunt_Units___Alaska_Simplified/FeatureServer/0/',
  minZoom: 5
});

const basemaps = {
  'National Geographic': natGeo,
  Imagery: imagery,
  'Gray Canvas': grayCanvas,
};

module.exports = {
  natGeo,
  imagery,
  grayCanvas,
  refuges,
  basemaps,
  amenities,
  huntUnits,
  huntUnitsAlaska,
  wilderness
};
