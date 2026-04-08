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
    zoom: 12
  });

  // Wait for map to load style to add data
  map.value.on('load', () => {
    setupMapLayers();
  });
});

const setupMapLayers = () => {

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


  // Handle hovering effect

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