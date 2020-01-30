const helpers = require('../helpers');

const createHuntingOpportunityItem = (opp, urlHunting) => {
  const regs = [opp.MethodOfTake, opp.DateTime, opp.BagLimits].map(helpers.matchesStateRegs);
  return `
    <p class="centered"><strong>${opp.Label}</strong></p>
    <ul class="huntable-species-list">
      ${regs[0] ? '' : `<li>Method of take: <a href="${urlHunting}">${opp.MethodOfTake}</a></li>`}
      ${regs[1] ? '' : `<li>Date & times: <a href="${urlHunting}">${opp.DateTime}</a></li>`}
      ${regs[2] ? '' : `<li>Bag limit: <a href="${urlHunting}">${opp.BagLimits}</a></li>`}
    </ul>`;
};

const createHuntUnitItem = (unit, urlHunting) => `
    <ul class="hunt-unit-info">
      <li><strong>Hunt unit: ${unit.HuntUnit}</strong></li>
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
    ${facility.url ? `<h3><a href="${facility.url}" target="_blank"> ${facility.name} in ${facility.state}</a></h3>` : ''}
    ${facility.units.map((u) => createHuntUnitItem(u, facility.urlHunting)).join('')}
  `;
};

module.exports = (facilities, query) => {
  const huntable = query || facilities[0].properties.Species;
  return `
    <h2>Hunts available for ${huntable}</h2>
    <p class="regulation-details">State regulations for method of take, date/times and bag limit apply unless otherwise noted.</p>
    ${facilities.map(createFacilityItem).join('')}
  `;
};
