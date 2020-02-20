const ArcGIS = require('terraformer-arcgis-parser');
const { unique, uniqueBy, getStateName } = require('./helpers');

const HUNT_UNIT_URL = 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWS_NWRS_HQ_PubHuntUnits/FeatureServer/1/';
const SPECIES_TABLE_URL = 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_NWRS_HQ_PubHuntUnits/FeatureServer/2/';
const HUNTING_OPP_URL = 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_NWRS_HQ_HuntFishStation/FeatureServer/0/';

const getRefugeInfoByOrgCode = (orgCode) => {
  const API_URL = `${HUNTING_OPP_URL}query?outFields=*&f=pgeojson&where=OrgCode=${orgCode}`;
  return fetch(API_URL)
    .then((res) => res.json())
    .then((data) => data.features[0])
    .catch(console.log);
};

const getRefugesByOrgCodes = (orgCodes) => {
  const API_URL = `${HUNTING_OPP_URL}/query`;
  return fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `where=OrgCode%20IN%20(${orgCodes})&outFields=*&f=pgeojson`,
  })
    .then((res) => res.json())
    .catch(console.log);
};

const getHuntUnitsByOrgCode = (orgCode) => {
  const API_URL = `${HUNT_UNIT_URL}query?outFields=*&f=pgeojson&where=OrgCode=${orgCode}`;
  return fetch(API_URL)
    .then((res) => res.json())
    .then((geojson) => geojson.features)
    .then((features) => features.map((f) => f.properties))
    .catch(console.log);
};

const getHuntUnitByObjectIds = (objectIds) => {
  const API_URL = `${HUNT_UNIT_URL}query?objectIds=${objectIds}&outFields=*&f=pgeojson`;
  return fetch(API_URL)
    .then((res) => res.json())
    .then((data) => data.features)
    .catch(console.log);
};

const getRelatedHuntableSpecies = (objectIDs) => {
  const API_URL = `${HUNT_UNIT_URL}queryRelatedRecords?outFields=*&f=pjson&objectIds=${objectIDs}`;
  return fetch(API_URL)
    .then((res) => res.json())
    .then((data) => data.relatedRecordGroups[0]) // do we need more than one related record here?
    .then((result) => ((result && result.relatedRecords) ? result.relatedRecords : []))
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
  const API_URL = `${SPECIES_TABLE_URL}queryRelatedRecords`;
  return fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `objectIds=${objectIds}&outFields=*&returnGeometry=false&f=pjson`,
  })
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

const combineSpeciesAndHuntUnit = (huntData) => huntData.hunts.map((s) => {
  const huntUnit = huntData.units.find((u) => u.objectId === s.OBJECTID);
  if (!huntUnit) {
    console.log(s.OBJECTID);
    return null;
  }
  const geojson = ArcGIS.parse(huntUnit.relatedRecords[0]);
  console.log(huntUnit);
  return {
    ...geojson,
    properties: {
      ...s,
      ...geojson.properties,
    },
  };
});

const completeRefugeInfoFromHuntUnit = (unit) => {
  const getSpecies = getRelatedHuntableSpecies(unit.id);
  const getFacility = getRefugeInfoByOrgCode(unit.properties.OrgCode);

  return Promise.all([getSpecies, getFacility]).then(([species, facility]) => ({
    ...unit.properties,
    species,
    facility,
  }));
};

const completeRefugeInfoFromSpeciesInfo = (hunts) => {
  const objectIds = hunts.map((h) => h.OBJECTID).join(',');

  return getHuntUnitFromSpeciesData(encodeURIComponent(objectIds))
    .then((huntUnits) => {
      const units = huntUnits
        .map((h) => h.relatedRecords)
        .flat()
        .map((h) => h.attributes);
      // Get unique orgCodes, format as string separated by commas
      const orgCodes = unique(units.map((u) => u.OrgCode)).join(',');
      return [units, orgCodes];
    })
    .then(([units, orgCodes]) => getRefugesByOrgCodes(orgCodes)
      .then((res) => res.features)
      .then((facilities) => facilities.map(({ properties: props }) => {
        const uniqueHuntUnits = uniqueBy(units, 'OBJECTID');
        return {
          name: props.OrgName,
          url: props.UrlStation,
          orgCode: props.OrgCode,
          urlHunting: props.UrlHunting,
          state: getStateName(props.State),
          units: uniqueHuntUnits.filter((u) => u.OrgName === props.OrgName).map((u) => ({
            ...u,
            opportunities: hunts.filter((h) => h.CCCODE === u.CCCODE),
          })),
        };
      })));
};

module.exports = {
  getHuntUnitsByOrgCode,
  getHuntUnitByObjectIds,
  getRelatedHuntableSpecies,
  getUniqueHuntableSpecies,
  getHuntableSpecies,
  getHuntUnitFromSpeciesData,
  combineSpeciesAndHuntUnit,
  getSpecialHunts,
  getRefugeInfoByOrgCode,
  completeRefugeInfoFromHuntUnit,
  completeRefugeInfoFromSpeciesInfo,
  getRefugesByOrgCodes,
};
