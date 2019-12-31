const ArcGIS = require('terraformer-arcgis-parser');

const HUNT_UNIT_URL = 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWS_NWRS_HQ_PubHuntUnits/FeatureServer/1/';
const SPECIES_TABLE_URL = 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_NWRS_HQ_PubHuntUnits/FeatureServer/2/';

const getHuntUnitsByOrgCode = (orgCode) => {
  const API_URL = `${HUNT_UNIT_URL}query?where=OrgCode+%3D+${orgCode}&outFields=*&f=pgeojson`;
  return fetch(API_URL)
    .then((res) => res.json())
    .then((geojson) => geojson.features)
    .then((features) => features.map((f) => f.properties))
    .catch(console.log);
};

const getHuntUnitByObjectId = (id) => {
  const API_URL = `${HUNT_UNIT_URL}query?objectIds=${id}&outFields=*&f=pgeojson`;
  return fetch(API_URL)
    .then((res) => res.json())
    .then((data) => data.features[0])
    .catch(console.log);
};

const getRelatedHuntUnits = (objectIDs) => {
  const API_URL = `${SPECIES_TABLE_URL}queryRelatedRecords?outFields=*&f=pjson&objectIds=${objectIDs}`;
  return fetch(API_URL)
    .then((res) => res.json())
    .then((data) => data.relatedRecordGroups[0]) // do we need more than one related record here?
    .then((result) => (result ? result.relatedRecords[0].attributes : []))
    .catch(console.log);
};

const getRelatedHuntableSpecies = (objectIDs) => {
  const API_URL = `${HUNT_UNIT_URL}queryRelatedRecords?outFields=*&f=pjson&objectIds=${objectIDs}`;
  return fetch(API_URL)
    .then((res) => res.json())
    .then((data) => data.relatedRecordGroups[0]) // do we need more than one related record here?
    .then((result) => result.relatedRecords)
    .then((species) => species.map((s) => s.attributes))
    .catch(console.log);
};

const getUniqueHuntableSpecies = () => {
  const API_URL = `${SPECIES_TABLE_URL}query?where=1+%3D1&outFields=Species&returnDistinctValues=true&f=pjson`;
  return fetch(API_URL)
    .then((res) => res.json())
    .then((res) => res.features)
    .then((features) => features.map((f) => f.attributes.Species).sort())
    .catch(console.log);
};

const getHuntableSpecies = (species) => {
  const API_URL = `${SPECIES_TABLE_URL}query?where=Species+%3D+%27${species}%27&outFields=*&f=pjson`;
  return fetch(API_URL)
    .then((res) => res.json())
    .then((data) => data.features)
    .then((features) => features.map((f) => f.attributes))
    .catch(console.log);
};

const getHuntUnitFromSpeciesData = (objectIds) => {
  const API_URL = `${SPECIES_TABLE_URL}queryRelatedRecords?objectIds=${objectIds}&outFields=*&f=pjson&outSR=4326`;
  return fetch(API_URL)
    .then((res) => res.json())
    .then((data) => data.relatedRecordGroups)
    .catch(console.log);
};

const getSpecialHunts = (query) => {
  const API_URL = `${SPECIES_TABLE_URL}query?where=Access+like+%27%25${query}%25%27&outFields=*&f=pjson`;
  return fetch(API_URL)
    .then((res) => res.json())
    .then((results) => results.features)
    .then((results) => results.map((r) => r.attributes))
    .catch(console.log);
};

const combineSpeciesAndHuntUnit = (huntData) => huntData.species.map((s) => {
  const huntUnit = huntData.units.find((u) => u.objectId === s.OBJECTID);
  const geojson = ArcGIS.parse(huntUnit.relatedRecords[0]);
  return {
    ...geojson,
    properties: {
      ...s,
      ...geojson.properties,
    },
  };
});

module.exports = {
  getHuntUnitsByOrgCode,
  getHuntUnitByObjectId,
  getRelatedHuntUnits,
  getRelatedHuntableSpecies,
  getUniqueHuntableSpecies,
  getHuntableSpecies,
  getHuntUnitFromSpeciesData,
  combineSpeciesAndHuntUnit,
  getSpecialHunts,
};
