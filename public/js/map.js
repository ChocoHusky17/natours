/* eslint-disable prefer-destructuring */

export const displayMap = (locations) => {
  let lng = locations[0].coordinates[0];
  let lat = locations[0].coordinates[1];
  let map = L.map('map').setView([lat, lng], 13);

  // L : init in leaflet.js

  // LOADING GOOGLE TILE LAYER
  // Google Street
  // const googleStreets = L.tileLayer(
  //   'http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}',
  //   {
  //     maxZoom: 20,
  //     subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  //   }
  //   );
  // googleStreets.addTo(map);

  // Hybrid
  // googleHybrid = L.tileLayer(
  //   'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
  //   {
  //     maxZoom: 20,
  //     subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  //   }
  // );

  // Terrain
  let googleTerrain = L.tileLayer(
    'http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    {
      maxZoom: 22,
      maxNativeZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }
  );

  // satellite,
  //   (googleSat = L.tileLayer(
  //     'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
  //     {
  //       maxZoom: 20,
  //       subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  //     }
  //   ));
  googleTerrain.addTo(map);

  // ADD CUSTOM ICON/MARKER
  // let greenIcon = L.icon({
  //   iconUrl: '/css/images/marker-icon.png',
  //   shadowUrl: '/css/images/marker-shadow.png',

  //   iconSize: [30, 50], // size of the icon
  //   shadowSize: [30, 50], // size of the shadow
  //   iconAnchor: [18, 74], // point of the icon which will correspond to marker's location
  //   shadowAnchor: [4, 32], // the same for the shadow
  //   popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
  // });

  // FIT ALL MARKER : Zoom to fit all markers on map
  let markers = [];
  let label;

  // loop add marker and label
  locations.forEach((location, i) => {
    lng = location.coordinates[0];
    lat = location.coordinates[1];

    label = `<div style='font-size:13px'><b>Day ${
      location.day
    } : ${location.description.toUpperCase()}</></div>`;
    markers[i] = L.marker([lat, lng]).addTo(map).bindTooltip(label, {
      permanent: true,
      direction: 'right',
    });
  });

  const group = new L.featureGroup(markers);
  map.fitBounds(group.getBounds(), { padding: [100, 100] });

  // DISABLE INTERACTION
  // map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  if (map.tap) map.tap.disable();
};
