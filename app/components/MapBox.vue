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
const map = ref(null);

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

  //Load GeoJSON data

  map.value.addSource('navigli_src', {
    type: 'geojson',
    data: '/data/navigli-overlay.geojson'
  });

    map.value.addSource('pois_src', {
      type: 'geojson',
      data: '/data/pois-overlay.geojson'
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


  // Render pois

  map.value.addLayer({
    id: 'pois-layer',
    type: 'circle',
    source: 'pois_src',
    paint: {
      'circle-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        '#ffcc00',
        '#ff0000'
      ],
      'circle-radius': 10,
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


  // Handle click event

  map.value.on('click', 'pois-layer', async (e) => {
    const id = e.features[0].properties.id;
    console.log(`Clicked on POI with ID: ${id}`);

    try {
      // Calls fetch api
      // TODO: quando Gab è pronto, aggiorna chiamata dal JSON alla sua api. Puoi togliere allPois e uncommentare selectedPoi
      const allPois = await $fetch('/data/pois.json'); // TODO: cancella
      
      const selectedPoi = allPois.find((poi) => poi.id === id); // TODO: cancella
      //const selectedPoi = await $fetch('/api/pois/${id}'); //If dynamic routes
      //const selectedPoi = await $fetch('/api/pois', {
      //  query : {id: id}
      //}); //If static routes

      if (selectedPoi) {
        console.log('Selected POI: ', selectedPoi.title);
        // Adds selectedPoi to Pinia store
        // TODO: quando Scuro è pronto, aggiungere selectedPoi allo store Pinia
      } else {
        console.warn(`POI with ID ${id} not found.`);
      }

    } catch (error) {
      console.error('Error during fetch from pois.json:', error);
    }

  });

  map.value.on('mousemove', 'pois-layer', (e) => {
    map.value.getCanvas().style.cursor = 'pointer';
  });

  map.value.on('mouseleave', 'pois-layer', () => {
    map.value.getCanvas().style.cursor = '';
  });


  // Handle hovering effect

  map.value.on('mousemove', ['navigli-line', 'navigli-fill'], (e) => {
    if (e.features.length > 0) {
      const hoveredGroup = e.features[0].properties.group;

      // Cambiamo il filtro del layer highlight per mostrare tutti i poligoni 
      // che hanno lo stesso valore nella proprietà 'group'
      map.value.setFilter('polygons-highlight', ['==', ['get', 'group'], hoveredGroup]);
      
      map.value.getCanvas().style.cursor = 'pointer';
  }
  });

  map.value.on('mouseleave', ['navigli-line', 'navigli-fill'], () => {
    // Nascondiamo di nuovo il layer highlight
    map.value.setFilter('polygons-highlight', ['==', ['get', 'group'], '']);
    map.value.getCanvas().style.cursor = '';
  });  

};

</script>

<style scoped>
.map-container {
  width: 100%;
  height: 500px;
}
</style>