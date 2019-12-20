const { capitalize } = require('../helpers');

const createHuntItem = ({ properties: hunt }) => `
  <h3>${hunt.OrgName}</h3>
  <p class="hunt-unit-info">${hunt.Label}</p>
  <button class="zoom-to-hunt-unit" value="${hunt.OBJECTID}">Zoom</button>
  <ul>
    <li>Method of take: ${hunt.MethodOfTake}</li>
    <li>Date/time: ${hunt.DateTime}</li>
    <li>Bag limit: ${hunt.BagLimits}</li>
  </ul>
`;

const template = (hunts, query) => `
  <h2>${capitalize(query)} hunts</h2>
  ${hunts.map(createHuntItem).join('')}
`;

module.exports = template;
