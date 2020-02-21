# Hunting Opportunities Mapper

[An interactive web map of hunting opportunities on U.S. Fish and Wildlife Service lands](https://www.fws.gov/refuges/hunting/map).

## Deep Linking

Deep linking refers to using a URL to link to a resource within a page or application. This application supports deep linking to initializing the map over a state (or states), a facility, a hunt unit. You can also select the search option and query you'd like to open the map with.

### Initialize over a state or states

<application-url>?state=Florida
<application-url>?state=Florida&state=Georgia&state=South+Carolina

### Initialize over a facility

We use the facility name because it is unique and easy to recognize compared to an OrgCode. We only support one facility at a time.

<application-url>?facility=Blackwater+National+Wildlife+Refuge

### Initialize over a hunt unit

We use the hunt unit ObjectID because the hunt unit names are not unique. We only support one hunt unit at a time.

<application-url>?unit=1491

### Initialize with a certain search term

<application-url>?query=Your+search+term

### Initialize with a certain search method

<application-url>?method=species (possible values include 'facility', 'state', 'zipcode', species', 'special')

### A combination of these values

When a facility and unit are both present in the URL the hunt unit is prioritized.

<application-url>?method=species&query=Moose&state=Maine

## Data Layers

### 2019-2020 Hunt Units

[The 2019-2020 hunt unit dataset](https://fws.maps.arcgis.com/home/item.html?id=f59cbff6b219440a93f045ee583263dd) delineates the hunt unit boundaries of the U.S. Fish and Wildlife Service identified in [50 CFR Part 32](https://www.ecfr.gov/cgi-bin/text-idx?SID=113703f759b8c62678f92666efe3bf5a&node=pt50.9.32&rgn=div5).  This dataset does not include Wetland Management Districts and two Wildlife Management Areas.

### FWS National Hunting and Fishing Opportunities

[The Service's national hunting and fishing opportunities layer](https://fws.maps.arcgis.com/home/item.html?id=3cd79202923141aca12ec8025f001aaf) depicts a single point for all lands and waters administered by the U.S. Fish and Wildlife Service (USFWS) in North America, U.S. Trust Territories and Possessions where hunting and fishing opportunities exist.

### Zipcode Service

[U.S. ZIP Code Points](https://www.arcgis.com/home/item.html?id=dc123f738bf846779c49db6472f82a4b) represents the five-digit U.S. ZIP Code areas as points, plus all ZIP Codes that have no associated area such as post office box ZIP Codes and single site ZIP Codes (government, building, or large volume customer). We use this service to get the user’s location and compare it against the nearest hunting opportunities.

### FWS Visitors Services Amenities

This [visitor services dataset](https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_National_Visitor_Service_Amenities_View/FeatureServer/0) contains those refuge features and assets that identify public access, assistance, information, recreation, and enjoyment locations.

### CMT API

The [Corporate Master Table (CMT)](https://intranet.fws.gov/cmt/HelpFiles/14_getOrgsGeo.htm) includes information on Service facilities, namely their physical mailing address. Since this information is not included in the hunting database we need to fire off a query in order to display this information alongside data from the hunting feature services. The CMT is likely to be replaced when the new national website built on Drupal is launched.

### FWS Refuge Ownership Boundaries

A national WMS layer of [National Wildlife Refuge Boundaries](https://gis.fws.gov/arcgis/rest/services/FWS_Refuge_Boundaries/MapServer/3).

## Development

1. Install all of the dependencies with `npm i`.
2. `npm start` for a development server
3. `npm build` for a production ready build

## License

As a work of the United States Government, this project is in the public domain within the United States.

Additionally, we waive copyright and related rights in the work worldwide through the CC0 1.0 Universal public domain dedication.

Check out [the license](https://github.com/USFWS/hunting-opportunities/blob/master/LICENSE.md).
