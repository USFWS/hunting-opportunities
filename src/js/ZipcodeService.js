const API_URL = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_ZIP_Code_Points_analysis/FeatureServer/0/';

const getZipCode = (code) => fetch(`${API_URL}query?outFields=PO_NAME%2CSTATE&f=pgeojson&where=ZIP_CODE='${code}'`)
  .then((res) => res.json())
  .catch(console.log);

module.exports = {
  getZipCode,
};
