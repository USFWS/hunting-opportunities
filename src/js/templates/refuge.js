const { formatAcreage } = require('../helpers');

const huntable = (unit) => unit.Huntable.toLowerCase() === 'yes';

const createListItem = (unit) => `<li>${unit.HuntUnit} (${formatAcreage(unit.Acreage)} acres) <button class="zoom-to-hunt-unit" value=${unit.OBJECTID}>Zoom</button></li>`;

module.exports = (props) => {
  const huntableUnits = props.units.filter(huntable);
  return `
    <h2><a href="${props.UrlHunting}">${props.OrgName}</a></h2>
    <p class="refuge-address">${props.physAdd} <br>${props.physCity}, ${props.physState} ${props.physZip}</p >
    <p>${props.DescHunt ? props.DescHunt : ''}</p>
    ${huntableUnits.length ? '<h3>Refuge units open to hunting</h3>' : '<p>There are no huntable units at this facility.</p>'}
    ${huntableUnits.length ? `<ul>${huntableUnits.map(createListItem).join('')}</ul>` : ''}
  `;
};
