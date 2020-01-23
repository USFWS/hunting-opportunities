const helpers = require('../helpers');

const createHuntUnitItem = ({ properties: props }) => {
  const regs = [props.MethodOfTake, props.DateTime, props.BagLimits].map(helpers.matchesStateRegs);
  return `
    <ul class="hunt-unit-info">
      <li>Hunt unit: ${props.HuntUnit}</li>
      <li>
      ${props.OBJECTID
      ? `<button class="zoom-to-hunt-unit hidden-button" value="${props.OBJECTID}">
          <svg class="zoom-icon"><use xlink:href="#zoom"></use></svg>
        </button>`
      : ''}
      </li>
      <li>
        <a href="${props.URL}" target="_blank">
          <svg class="website-icon"><use xlink:href="#world"></use></svg>
        </a>
      </li>
    </ul>

    <ul class="huntable-species-list">
      ${regs.every((r) => r === true) ? '<li>All state regulations apply</li>' : ''}
      ${regs[0] ? '' : `<li>Method of take: ${props.MethodOfTake}</li>`}
      ${regs[1] ? '' : `<li>Date & times: ${props.DateTime}</li>`}
      ${regs[2] ? '' : `<li>Bag limit: ${props.BagLimits}</li>`}
    </ul>
  `;
};

const createFacilityItem = (name, opps) => {
  const props = opps[0] ? opps[0].properties : null;
  if (!props) return;
  return `
    ${props.URL ? `<h3><a href="${props.URL}" target="_blank"> ${name} in ${props.State}</a></h3>` : ''}
    ${opps.map(createHuntUnitItem).join('')}
  `;
};

module.exports = (opportunities) => {
  const groupedOpps = helpers.groupBy(opportunities, 'properties.OrgName');
  return `
    <h2>Hunts available for ${opportunities[0].properties.Species}</h2>
    <p class="regulation-details">State regulations for method of take, date/times and bag limit apply unless otherwise noted.</p>
    ${Object.keys(groupedOpps).map((key) => createFacilityItem(key, groupedOpps[key])).join('')}
  `;
};
