const helpers = require('../helpers');

const createListItem = (o) => {
  const props = o.properties;
  return `
  <li>
    <button class="zoom-to-refuge hidden-button" value="${props.OrgCode}">
      <svg class="orange-marker">
        <use xlink:href="#orange"></use>
      </svg>

      <div class="facility-info">
        <p class="facility-name">${props.OrgName}</p>
        <p class="facility-location">${props.State_Label}</p>
      </div>
    </button>
  </li>`;
};

const template = (offices) => `
  <ul class="search-results">
    ${offices.sort(helpers.sortByName).map(createListItem).join('')}
  </ul>
`;

module.exports = template;
