const analytics = window.gtag;
const emitter = require('./emitter');

// Google Custom Events (https://developers.google.com/analytics/devguides/collection/gtagjs/events)
// gtag('event', <action>, { 'event_category': <category>, 'event_label': <label>, 'value': <value> });

// Entered search term (3 seconds after they finish typing)
emitter.on('search:term', (query) => {
  analytics('event', 'search:query', {
    event_label: query,
    event_category: 'Hunting Opportunities Mapper'
  });
});

// Selected state from dropdown
emitter.on('select:state', (state) => {
  analytics('event', 'search:state', {
    event_label: state,
    event_category: 'Hunting Opportunities Mapper'
  });
});

// Selected species from dropdown
emitter.on('select:species', (species) => {
  analytics('event', 'search:species', {
    event_label: species,
    event_category: 'Hunting Opportunities Mapper'
  });
});

// Selected special hunt from dropdown
emitter.on('select:special', (special) => {
  analytics('event', 'search:special', {
    event_label: special,
    event_category: 'Hunting Opportunities Mapper'
  });
});

// Selected refuge from sidebar
emitter.on('zoom:refuge', (refuge) => {
  analytics('event', 'zoom:refuge', {
    event_label: refuge.properties.OrgName,
    event_category: 'Hunting Opportunities Mapper'
  });
});

// Selected refuge from map
emitter.on('click:refuge', (refuge) => {
  analytics('event', 'click:refuge', {
    event_label: refuge.OrgName,
    event_category: 'Hunting Opportunities Mapper'
  });
});

// Selected hunt unit
emitter.on('zoom:unit', (unit) => {
  analytics('event', 'zoom:unit', {
    event_label: `${unit.properties.OrgName}: ${unit.properties.HuntUnit}`,
    event_category: 'Hunting Opportunities Mapper'
  });
});

// Toggled results
emitter.on('toggle:results', (status) => analytics('event', 'toggle:results', {
  event_label: status,
  event_category: 'Hunting Opportunities Mapper'
}));
