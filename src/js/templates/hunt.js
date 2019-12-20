const helpers = require('../helpers');

const createListItem = (info) => `
  <h4><strong>${info.Species}</strong></h4>
  <ul>
    <li>Method of take: ${info.MethodOfTake}</li>
    <li>Date & times: ${info.DateTime}</li>
    <li>Bag limit: ${info.BagLimits}</li>
  </ul>
`;

module.exports = (props) => `
  <h2><a href="${props.URL}">${props.OrgName}</a></h2>
  <p class="hunt-unit-info">Hunt unit: ${props.HuntUnit} (${helpers.formatAcreage(props.Acreage)} acres)</p>
  ${props.species.length ? '<h3>Huntable species</h3>' : ''}
  ${props.species.map(createListItem).join('')}
`;
