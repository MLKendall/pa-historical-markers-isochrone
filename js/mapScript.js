 // Add your Mapbox access token
 mapboxgl.accessToken = 'pk.eyJ1IjoibWtlbmRhbGw5MyIsImEiOiJjajh1ZnBza3gweWx0MndwNnhqdm4xNWxqIn0.rMuyyrv9yUHGnE0PiXzGLw';
 const map = new mapboxgl.Map({
   container: 'map', // Specify the container ID
   style: 'mapbox://styles/mapbox/streets-v12', // Specify which map style to use
   center: [-79.9959, 40.4406], // Specify the starting position
   zoom: 9, // Specify the starting zoom
 });


// Create constants to use in getIso()
const urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';
const lon = -79.9959;
const lat = 40.4406;
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

const marker = new mapboxgl.Marker({
  color: '#314ccd'
});

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
  
    marker.setLngLat(lngLat).addTo(map);


    // Make the API call
    getIso();
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