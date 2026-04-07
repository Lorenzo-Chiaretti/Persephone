<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
    data: '/data/geoJSON_test.geojson'
  });

  //Visualize GeoJSON data
  map.value.addLayer({
    id: 'navigli-layer',
    type: 'line',
    source: 'navigli_src',
    filter: ['==', '$type', 'LineString'],
    paint: {
      'line-color': '#FF0000',
      'line-opacity': 1,
      'line-width': 2,
    }
  });

  //TODO: maybe toglilo
  map.value.addLayer({
    id: 'navigli-points',
    type: 'circle',
    source: 'navigli_src',
    filter: ['==', '$type', 'Point'],
    paint: {
      'circle-color': '#FF0000',
      'circle-opacity': 1,
    }
  });
};

</script>

<style scoped>
.map-container {
  width: 100%;
  height: 500px;
}
</style>