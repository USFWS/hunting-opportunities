const helpers = require('../helpers');

const createListItem = (o) => {
  const props = o.properties;
  return `
  <li>
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve">
      <path fill="#f0af3b" stroke="#FFFFFF" stroke-width="3" stroke-miterlimit="10" d="M25,48.3C12,48.3,1.5,37.8,1.5,25S12,1.7,25,1.7S48.4,12.1,48.4,25S37.9,48.3,25,48.3z"/>
      <path fill="#FFFFFF" d="M25,1c13.2,0,24,10.8,24,24S38.2,49,25,49S1,38.2,1,25S11.8,1,25,1 M25,0C11.2,0,0,11.2,0,25s11.2,25,25,25s25-11.2,25-25S38.8,0,25,0z"/>
    </svg>

    <div class="facility-info">
      <p class="facility-name">${props.OrgName}</p>
      <ul class="facility-links">
        <li><p class="facility-location">${props.State_Label}</p></li>
        <li>
          <button class="zoom-to-office">
            <img class="facility-icon" src="./images/zoom.svg" alt="A zoom icon; click to zoom the map to the refuge's location" title="Zoom to Refuge">
          </button>
        </li>
        <li>
          <a href="${props.URL}" target="_blank">
            <img class="facility-icon" src="./images/world.svg" alt="A world icon; click to visit the refuge's website" title="Visit refuge website" />
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
