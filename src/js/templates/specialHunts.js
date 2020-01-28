const { capitalize, matchesStateRegs } = require('../helpers');

const createHuntItem = ({ properties: hunt }) => {
  // TODO: We need to include the HuntUrl here from the point dataset
  console.log(hunt);
  const regs = [hunt.MethodOfTake, hunt.DateTime, hunt.BagLimits].map(matchesStateRegs);

  return `
    <h3>${hunt.OrgName}</h3>
    <p class="hunt-unit-info">${hunt.Label}</p>
    <button class="zoom-to-hunt-unit veteran-zoom-to" value="${hunt.OBJECTID}">
      <svg class="zoom-icon"><use xlink:href="#zoom"></use></svg>
    </button>
    <ul class="huntable-species-list">
      ${regs[0] ? '' : `<li>Method of take: ${hunt.MethodOfTake}</li>`}
      ${regs[1] ? '' : `<li>Date & times: ${hunt.DateTime}</li>`}
      ${regs[2] ? '' : `<li>Bag limit: ${hunt.BagLimits}</li>`}
    </ul>
  `;
};

const template = (hunts, query) => `
  <h2>${capitalize(query)} hunts</h2>
  ${hunts.map(createHuntItem).join('')}
`;

module.exports = template;
