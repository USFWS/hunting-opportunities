const matchesStateRegs = (val) => val.toLowerCase() === 'state regulations apply';

const createListItem = (o) => {
  const atts = o.unit && o.unit.attributes ? o.unit.attributes : null;
  const regs = [o.MethodOfTake, o.DateTime, o.BagLimits].map(matchesStateRegs);
  return `
    ${atts ? `<h3><a href="${o.unit.attributes.URL}"> ${o.unit.attributes.OrgName} in ${o.State}</a></h3>` : ''}
    <p class="hunt-unit-info">Hunt unit: ${o.HuntUnit}</p>
    ${atts ? `<button class="zoom-to-unit" name=${o.unit.attributes.OBJECTID}>Zoom to unit</button>` : ''}
    <ul class="huntable-species-list">
      ${regs.every((r) => r === true) ? '<li>All state regulations apply</li>' : ''}
      ${regs[0] ? '' : `<li>Method of take: ${o.MethodOfTake}</li>`}
      ${regs[1] ? '' : `<li>Date & times: ${o.DateTime}</li>`}
      ${regs[2] ? '' : `<li>Bag limit: ${o.BagLimits}</li>`}
    </ul>
  `;
};

module.exports = (opportunities) => `
  <h2>Hunts available for ${opportunities[0].Species}</h2>
  <p class="regulation-details">State regulations for method of take, date/times and bag limit apply unless otherwise noted.</p>
  ${opportunities.map(createListItem).join('')}
`;
