const { formatAcreage, titleCase, getStateName } = require('../helpers');

const huntable = (unit) => unit.Huntable.toLowerCase() === 'yes';

const createListItem = (unit) => `
  <li class="refuge-hunt-unit">
    <button class="zoom-to-hunt-unit" value=${unit.OBJECTID}>
      <svg class="zoom-icon"><use xlink:href="#zoom"></use></svg>
    </button>
    <p>${unit.Hunt_Unit_Name} (${formatAcreage(unit.Acreage)} acres)</p>
  </li>`;

module.exports = (facilities) => {
  const props = facilities[0].properties;
  const huntableUnits = props.units.filter(huntable);
  return `
    <button class="zoom-to-refuge hidden-button" value="${props.Organization_Code}">
      <h2>${props.OrgName}</h2>
    </button>
    <p><a href="${props.UrlStation}" target="_blank">Visit us on the web</a></p>
    ${props.physAdd1 ? `<p><strong>${titleCase(props.physAdd1)} <br>${titleCase(props.physCity)}, ${getStateName(props.physStateAbbr)} ${props.physZip}</strong></p>` : ''}
    <p>${props.DescHunt ? props.DescHunt : ''}</p>
    ${huntableUnits.length ? '<h3>Refuge units open to hunting</h3>' : '<p>There are no huntable units at this facility.</p>'}
    ${huntableUnits.length ? `<ul class="no-style-list">${huntableUnits.map(createListItem).join('')}</ul>` : ''}
  `;
};
