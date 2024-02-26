 // Add your Mapbox access token
 mapboxgl.accessToken = 'pk.eyJ1IjoibWtlbmRhbGw5MyIsImEiOiJjajh1ZnBza3gweWx0MndwNnhqdm4xNWxqIn0.rMuyyrv9yUHGnE0PiXzGLw';
 const map = new mapboxgl.Map({
   container: 'map', // Specify the container ID
   style: 'mapbox://styles/mapbox/streets-v12', // Specify which map style to use
   center: [-77.8599, 40.7982], // Specify the starting position
   zoom: 9, // Specify the starting zoom
 });

// Create constants to use in getIso()
const urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';
// let lon = -79.9959;
// let lat = 40.4406;
let lon = -77.8599;
let lat = 40.7982;
let profile = 'driving'; // Set the default routing profile
let minutes = 60; // Set the default duration

// Create a function that sets up the Isochrone API query then makes an fetch call
async function getIso() {
  const query = await fetch(
    `${urlBase}${profile}/${lon},${lat}?contours_minutes=${minutes}&polygons=true&access_token=${mapboxgl.accessToken}`,
    { method: 'GET' }
  );
  const data = await query.json();
  // Set the 'iso' source's data to what's returned by the API query
map.getSource('iso').setData(data);
}

function createPopUp(marker){
    // Copy coordinates array.
    const coordinates = marker.geometry.coordinates;
    const name = marker.properties.name;
    const description = marker.properties.markertext;
    const county = marker.properties.county;
    const dedicationDate = marker.properties.dedicateddate;

    const popupHTML = `<h3 class="mapboxgl-popup-content--title">${name}</h3>
    <p class="mapboxgl-popup-content--county">${county} County</p>
    <p class="mapboxgl-popup-content--description">${description}</p>
    <p class="mapboxgl-popup-content--dedication-date">Dedication Date: ${dedicationDate}</p>`;

    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML);

    return popup;
}

async function getHistoricalMarkers() {
  const query = await fetch(
    'https://data.pa.gov/resource/xt8f-pzzz.geojson', {method: 'GET'}
  );
  const markers = await query.json();
  console.log(markers);
  map.getSource('historical').setData(markers);

  for (const marker of markers.features) {
    // Create a DOM element for each marker.
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = 'url(images/pa-historical-marker.png)';
    el.style.width = `24px`;
    el.style.height = `32px`;
    el.style.backgroundSize = '100%';
     
    // Add markers to the map.
    if(marker.geometry && marker.geometry.coordinates){

      const markerPopup = createPopUp(marker);
        
      new mapboxgl.Marker(el)
      .setLngLat(marker.geometry.coordinates)
      .setPopup(markerPopup)
      .addTo(map);
      }
  }
}
// Create a LngLat object to use in the marker initialization
// https://docs.mapbox.com/mapbox-gl-js/api/#lnglat
const lngLat = {
  lon: lon,
  lat: lat
};

map.on('load', () => {
    // When the map loads, add the source and layer
    map.addSource('iso', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

     // Add a data source containing one point feature.
     map.addSource('historical', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
  
    map.addLayer(
      {
        id: 'isoLayer',
        type: 'fill',
        // Use "iso" as the data source for this layer
        source: 'iso',
        layout: {},
        paint: {
          // The fill color for the layer is set to a light purple
          'fill-color': '#5a3fc0',
          'fill-opacity': 0.3
        }
      },
      'poi-label'
    );

    // Add a layer to use the image to represent the data.
    map.addLayer({
      'id': 'historical',
      'type': 'symbol',
      'source': 'historical', // reference the data source
      'layout': {}
    });

    //Add geolocation
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
      enableHighAccuracy: true
      },
      // When active the map will receive updates to the device's location as it changes.
      trackUserLocation: true,
      // Draw an arrow next to the location dot to indicate which direction the device is heading.
      showUserHeading: true
    })
    map.addControl(geolocate);

    geolocate.on('geolocate', function(e) {
      console.log(e);
      lon = e.coords.longitude;
      lat = e.coords.latitude
      const position = [lon, lat];
      getIso();
    });


    // Make the API call
    getIso();
    getHistoricalMarkers();
  });


  // Target the "params" form in the HTML portion of your code
const params = document.getElementById('params');

// When a user changes the value of profile or duration by clicking a button, change the parameter's value and make the API query again
params.addEventListener('change', (event) => {
  if (event.target.name === 'profile') {
    profile = event.target.value;
  } else if (event.target.name === 'duration') {
    minutes = event.target.value;
  }
  getIso();
});