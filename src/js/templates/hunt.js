const helpers = require('../helpers');

const createListItem = (info) => {
  const regs = [info.MethodOfTake, info.DateTime, info.BagLimits].map(helpers.matchesStateRegs);
  return `
    <h4><strong>${info.Species}</strong></h4>
    <ul class="huntable-species-list">
      ${regs[0] ? '' : `<li>Method of take: <a href="${info.url}">${info.MethodOfTake}</a></li>`}
      ${regs[1] ? '' : `<li>Date & times: <a href="${info.url}">${info.DateTime}</a></li>`}
      ${regs[2] ? '' : `<li>Bag limit: <a href="${info.url}">${info.BagLimits}</a></li>`}
    </ul>
  `;
};

module.exports = (props) => `
  <h2><a href="${props.URL}" target="_blank">${props.OrgName}</a></h2>
  <p class="hunt-unit-info">Hunt unit: ${props.HuntUnit} (${helpers.formatAcreage(props.Acreage)} acres)</p>
  <p>${props.DescHunt}</p>
  ${props.species.length ? '<h3>Huntable species</h3>' : ''}
  <p class="regulation-details">State regulations for method of take, date/times and bag limit apply unless otherwise noted.</p>
  ${props.species
    .map((species) => createListItem({ ...species, url: props.UrlHunting }))
    .join('')
}
`;
