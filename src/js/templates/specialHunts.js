const { capitalize } = require('../helpers');

const createHuntItem = (hunt) => `
  <h3>${hunt.unit.attributes.OrgName}</h3>
  <p class="hunt-unit-info">${hunt.Label}</p>
  <ul>
    <li>Method of take: ${hunt.MethodOfTake}</li>
    <li>Date/time: ${hunt.DateTime}</li>
    <li>Bag limit: ${hunt.BagLimits}</li>
  </ul>
`;

const template = (hunts, query) => {
  console.log(hunts);
  return `
    <h2>${capitalize(query)} hunts</h2>
    ${hunts.map(createHuntItem).join('')}
  `;
};

module.exports = template;
