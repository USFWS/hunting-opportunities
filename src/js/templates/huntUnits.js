const helpers = require('../helpers');

const createHuntingOpportunityItem = (opp, urlHunting) => {
  const regs = [opp.MethodOfTake, opp.DateTime, opp.BagLimits, opp.Access].map(helpers.matchesStateRegs);
  return `
    <p><strong>${opp.Species}</strong></p>
    <ul class="huntable-species-list">
      ${regs[0] ? '' : `<li>Method of take: <a href="${urlHunting}" target="_blank">${opp.MethodOfTake}</a></li>`}
      ${regs[1] ? '' : `<li>Date & times: <a href="${urlHunting}" target="_blank">${opp.DateTime}</a></li>`}
      ${regs[2] ? '' : `<li>Bag limit: <a href="${urlHunting}" target="_blank">${opp.BagLimits}</a></li>`}
      ${opp.SpecialOpportunities ? `<li><a href="${urlHunting}" target="_blank">${opp.SpecialOpportunities}</a></li>` : '' }
    </ul>`;
};

const createHuntUnitItem = (unit, urlHunting) => `
  <ul class="hunt-unit-info">
    <li><strong>Hunt unit: ${unit.Hunt_Unit_Name.replace('_', ' ')}</strong></li>
    <li>
    ${unit.OBJECTID
  ? `<button class="zoom-to-hunt-unit hidden-button" value="${unit.OBJECTID}">
        <svg class="zoom-icon"><use xlink:href="#zoom"></use></svg>
      </button>`
  : ''}
    </li>
  </ul>

  ${unit.opportunities.map((o) => createHuntingOpportunityItem(o, urlHunting)).join('')}
`;

const createFacilityItem = (facility) => {
  if (!facility) return;
  return `
    ${facility.urlHunting ? `<button class="zoom-to-refuge hidden-button" value="${facility.orgCode}"><h3>${facility.name} in ${facility.state}</h3></button>` : ''}
    ${facility.units.map((u) => createHuntUnitItem(u, facility.urlHunting)).join('')}
  `;
};

module.exports = (facilities, query) => {
  const huntable = query || facilities[0].properties.Species;
  return `
    <h2>Hunts available for ${huntable}</h2>
    <p>State regulations for method of take, date/times and bag limit apply unless otherwise noted.</p>
    ${facilities.map(createFacilityItem).join('')}
  `;
};
