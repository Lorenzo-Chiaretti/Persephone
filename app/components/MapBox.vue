<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// TODO: spostalo in file .env
mapboxgl.accessToken = 'pk.eyJ1IjoibWFyY28tYWJiYWRlc3NhIiwiYSI6ImNtbm9ua3BvbjF5c2EycXI2Y29zeWZvNnIifQ.szLcHVfJyZppGQthIeR3rQ';

const mapContainer = ref(null);
const map = shallowRef(null);
// TODO: attiva lo store
//const store = useStore(); //usa il nome della funzione che sceglie scuro

onMounted(() => {
  // Initialize map on Milan
  map.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v12', //Default style
    center: [9.1899, 45.4702], // Milan Coordinates [LNG, LAT]
    zoom: 12,
    minZoom: 9
  });

  // Wait for map to load style to add data
  map.value.on('load', () => {
    setupMapLayers();
  });
});

// RENDER MAP LAYERS (Navigli overlay and pois)
const setupMapLayers = () => {

  renderNavigliOverlay();
  renderPois();

  // Handle hovering effect

  const hoverPopup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 15 // Aggiunge 15px di distanza dal puntatore per non coprirlo
  });

  map.value.on('mousemove', (e) => {
    
    // Create bounding box around the cursor for better UX
    const offset = 8;
    const bbox = [
      [e.point.x - offset, e.point.y - offset],
      [e.point.x + offset, e.point.y + offset]
    ];

    const features = map.value.queryRenderedFeatures(bbox, {
      layers: ['navigli-line', 'navigli-fill']
    });

    if (features.length > 0) {
      const hoveredFeature = features[0];

      map.value.getCanvas().style.cursor = 'pointer';

      const hoveredGroup = hoveredFeature.properties.group;
      const hoveredName = hoveredFeature.properties.name;

      if (hoveredGroup) {
        map.value.setFilter('polygons-highlight', ['==', ['get', 'group'], hoveredGroup]);

        hoverPopup
          .setLngLat(e.lngLat)
          .setHTML(`<div class="polygon-tooltip">${hoveredName}</div>`)
          .addTo(map.value);
      }
      
    } else {
      map.value.setFilter('polygons-highlight', ['==', ['get', 'group'], '']);
      map.value.getCanvas().style.cursor = '';
      hoverPopup.remove();
    }
  });

  map.value.on('mouseout', () => {
    map.value.setFilter('polygons-highlight', ['==', ['get', 'group'], '']);
    map.value.getCanvas().style.cursor = '';

    hoverPopup.remove();
  }); 
};

// RENDER NAVIGLI OVERLAY
const renderNavigliOverlay = () => {
  //Load GeoJSON data
  map.value.addSource('navigli_src', {
    type: 'geojson',
    data: '/data/navigli-overlay.geojson'
  });

  //Render navigli polygons and lines

  map.value.addLayer({
    id: 'navigli-fill',
    type: 'fill',
    source: 'navigli_src',
    filter: ['==', '$type', 'Polygon'],
    paint: {
      'fill-color': '#004080',
      'fill-opacity': 1,
    }
  });

  map.value.addLayer({
    id: 'navigli-outline',
    type: 'line',
    source: 'navigli_src',
    filter: ['==', '$type', 'Polygon'],
    paint: {
      'line-color': '#004080',
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        8, 3,   // A zoom 8, il bordo è spesso 3px (molto visibile)
        15, 1   // A zoom 15, il bordo è sottile 1px
      ]
    }
  });

    map.value.addLayer({
    id: 'navigli-line',
    type: 'line',
    source: 'navigli_src',
    filter: ['==', '$type', 'LineString'],
    paint: {
      'line-color': '#004080',
      'line-width': 3,
    }
  });

    map.value.addLayer({
    id: 'polygons-highlight',
    type: 'line',
    source: 'navigli_src',
    filter: ['==', ['get', 'group'], ''], // Inizialmente non mostra nulla
    paint: {
      'line-color': '#ffcc00', // Colore di illuminazione (es. Giallo)
      'line-opacity': 0.6,
      'line-width': 5,
    }
  });
}

// RENDER POI MARKERS
const renderPois = async () => {

    try {
      const response = await fetch('/data/pois-overlay.geojson');
      const poisData = await response.json();

      //Iteration on loaded data
      poisData.features.forEach((feature) => {

        const marker = new mapboxgl.Marker()
            .setLngLat(feature.geometry.coordinates)
            .addTo(map.value);

        const el = marker.getElement();

        el.style.cursor = 'pointer';

        el.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = feature.properties.id;
          console.log(`Clicked on POI with ID: ${id}`);

          try {

            const selectedPoi = await $fetch(`/api/pois/${id}`); //If dynamic routes

            if (selectedPoi) {
              console.log('Data fetched for POI: ', selectedPoi.id);
              // Adds selectedPoi to Pinia store
              // TODO: quando Scuro è pronto, aggiungere selectedPoi allo store Pinia
              //store.selectedPoi = selectedPoi;
            } else {
              console.warn(`POI with ID ${id} not found.`);
            }

          } catch (error) {
            console.error('Error during fetch from pois.json:', error);
          }

        });

      });

  } catch (error) {
    console.error('Error during fetch from pois.json:', error);
  }
  
}

</script>

<style scoped>
.map-container {
  width: 100%;
  height: 500px;
}
</style>