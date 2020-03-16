const helpers = require('../helpers');

const createListItem = (info) => {
  console.log(info);
  const regs = [info.MethodOfTake, info.DateTime, info.BagLimits].map(helpers.matchesStateRegs);
  const isOpen = info.Access.includes('Open');
  return `
    <h4><strong>${info.Species}</strong></h4>
    <ul class="huntable-species-list">
      ${regs[0] ? '' : `<li>Method of take: <a href="${info.url}" target="_blank">${info.MethodOfTake}</a></li>`}
      ${regs[1] ? '' : `<li>Date & times: <a href="${info.url}" target="_blank">${info.DateTime}</a></li>`}
      ${regs[2] ? '' : `<li>Bag limit: <a href="${info.url}" target="_blank">${info.BagLimits}</a></li>`}
      ${!isOpen ? `<li>Access: <a href="${info.url}" target="_blank">${info.Label}</a></li>` : '' }
    </ul>
  `;
};

module.exports = (props) => `
  <button class="zoom-to-refuge hidden-button" value="${props.OrgCode}">
    <h2>${props.OrgName}</h2>
  </button>
  <p><strong>Hunt unit: ${props.HuntUnit.replace('_', ' ')} (${helpers.formatAcreage(props.Acreage)} acres)</strong></p>
  ${props.Huntable === 'No' ? '<p><strong>Hunting is not permitted on this unit</strong></p>' : ''}
  ${props.facility.DescHunt ? `<p>${props.facility.DescHunt}</p>` : ''}
  ${props.species && props.species.length ? '<h3>Huntable species</h3>' : ''}
  ${props.Huntable === 'Yes' ? '<p>State regulations for method of take, date/times and bag limit apply unless otherwise noted.</p>' : ''}
  ${props.species
    .map((species) => createListItem({ ...species, url: props.facility.properties.UrlHunting }))
    .join('')
}`;
