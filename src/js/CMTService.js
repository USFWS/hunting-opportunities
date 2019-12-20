const API_URL = 'https://systems.fws.gov/cmt/getOrgsGeo.do';

const getByOrgCode = (code) => fetch(`${API_URL}?orgCode=${code}`)
  .then((res) => res.json())
  .then((facility) => facility.features[0].properties);

module.exports = {
  getByOrgCode,
};
