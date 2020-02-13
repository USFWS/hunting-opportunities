const { formatAcreage, titleCase } = require('../helpers');

const huntable = (unit) => unit.Huntable.toLowerCase() === 'yes';

const createListItem = (unit) => `
  <li class="refuge-hunt-unit">
    <button class="zoom-to-hunt-unit" value=${unit.OBJECTID}>
      <svg class="zoom-icon"><use xlink:href="#zoom"></use></svg>
    </button>
    <p>${unit.HuntUnit} (${formatAcreage(unit.Acreage)} acres)</p>
  </li>`;

module.exports = (facilities) => {
  const props = facilities[0].properties;
  const huntableUnits = props.units.filter(huntable);
  return `
    <h2><a href="${props.UrlHunting}" target="_blank">${props.OrgName}</a></h2>
    ${props.physAdd1 ? `<p><strong>${titleCase(props.physAdd1)} <br>${titleCase(props.physCity)}, ${props.State_Label} ${props.physZip}</strong></p>` : ''}
    <p>${props.DescHunt ? props.DescHunt : ''}</p>
    ${huntableUnits.length ? '<h3>Refuge units open to hunting</h3>' : '<p>There are no huntable units at this facility.</p>'}
    ${huntableUnits.length ? `<ul class="no-style-list">${huntableUnits.map(createListItem).join('')}</ul>` : ''}
  `;
};
