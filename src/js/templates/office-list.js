const helpers = require('../helpers');

const createListItem = (o) => {
  const props = o.properties;
  return `
  <li>
    <svg class="orange-marker">
      <use xlink:href="#orange"></use>
    </svg>

    <div class="facility-info">
      <p class="facility-name">${props.OrgName}</p>
      <ul class="facility-links">
        <li><p class="facility-location">${props.State_Label}</p></li>
        <li>
          <button class="zoom-to-office">
            <svg class="zoom-icon"><use xlink:href="#zoom"></use></svg>
          </button>
        </li>
        <li>
          <a href="${props.URL}" target="_blank">
            <svg class="website-icon"><use xlink:href="#world"></use></svg>
          </a>
        </li>
      </ul>
    </div >
  </li > `;
};

const template = (offices) => `
  <ul class="search-results">
    ${offices.sort(helpers.sortByName).map(createListItem).join('')}
  </ul>
`;

module.exports = template;
