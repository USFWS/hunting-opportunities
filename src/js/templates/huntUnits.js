const matchesStateRegs = (val) => val.toLowerCase() === 'state regulations apply';

const createListItem = (o) => {
  const props = o.properties;
  const regs = [props.MethodOfTake, props.DateTime, props.BagLimits].map(matchesStateRegs);
  return `
    ${props.URL ? `<h3><a href="${props.URL}"> ${props.OrgName} in ${props.State}</a></h3>` : ''}
    <p class="hunt-unit-info">Hunt unit: ${props.HuntUnit}</p>
    ${props.OBJECTID ? `<button class="zoom-to-hunt-unit" value="${props.OBJECTID}">Zoom</button>` : ''}
    <ul class="huntable-species-list">
      ${regs.every((r) => r === true) ? '<li>All state regulations apply</li>' : ''}
      ${regs[0] ? '' : `<li>Method of take: ${props.MethodOfTake}</li>`}
      ${regs[1] ? '' : `<li>Date & times: ${props.DateTime}</li>`}
      ${regs[2] ? '' : `<li>Bag limit: ${props.BagLimits}</li>`}
    </ul>
  `;
};

module.exports = (opportunities) => `
  <h2>Hunts available for ${opportunities[0].properties.Species}</h2>
  <p class="regulation-details">State regulations for method of take, date/times and bag limit apply unless otherwise noted.</p>
  ${opportunities.map(createListItem).join('')}
`;
