const L = require('leaflet');

const blueMarker = new L.Icon({
  iconSize: [12, 12],
  iconAnchor: [5, 5],
  popupAnchor: [1, -5],
  iconUrl: './images/blue.svg',
});

const yellowMarker = new L.Icon({
  iconSize: [12, 12],
  iconAnchor: [5, 5],
  popupAnchor: [1, -5],
  iconUrl: './images/yellow.svg',
});

const orangeMarker = new L.Icon({
  iconSize: [18, 18],
  iconAnchor: [8, 8],
  popupAnchor: [1, -8],
  iconUrl: './images/orange.svg',
});

const whiteMarker = new L.Icon({
  iconSize: [12, 12],
  iconAnchor: [5, 5],
  popupAnchor: [1, -5],
  iconUrl: './images/white.svg',
});

module.exports = {
  blueMarker,
  whiteMarker,
  yellowMarker,
  orangeMarker,
};
