const { formatAcreage, titleCase, getStateName } = require('../helpers');

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
  console.log(props);
  return `
    <button class="zoom-to-refuge hidden-button" value="${props.OrgCode}">
      <h2>${props.OrgName}</h2>
    </button>
    ${props.physAdd1 ? `<p><strong>${titleCase(props.physAdd1)} <br>${titleCase(props.physCity)}, ${getStateName(props.physStateAbbr)} ${props.physZip}</strong></p>` : ''}
    <p>${props.DescHunt ? props.DescHunt : ''}</p>
    ${huntableUnits.length ? '<h3>Refuge units open to hunting</h3>' : '<p>There are no huntable units at this facility.</p>'}
    ${huntableUnits.length ? `<ul class="no-style-list">${huntableUnits.map(createListItem).join('')}</ul>` : ''}
  `;
};
