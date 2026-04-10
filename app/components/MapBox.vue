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
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        12, // Raggio grande se hover
        8   // Raggio normale
      ],
      'circle-color': '#ff0000'
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


  // Handle click event on pois
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

  // Handle hovering effect
  let hoveredPoiId = null;
  map.value.on('mousemove', (e) => {
    
    // Create bounding box around the cursor for better UX
    const offset = 8;
    const bbox = [
      [e.point.x - offset, e.point.y - offset],
      [e.point.x + offset, e.point.y + offset]
    ];

    const features = map.value.queryRenderedFeatures(bbox, {
      layers: ['pois-layer', 'navigli-line', 'navigli-fill']
    });

    if (features.length > 0) {
      const hoveredFeature = features[0];
      const layerId = hoveredFeature.layer.id;

      map.value.getCanvas().style.cursor = 'pointer';

      if (layerId === 'navigli-line' || layerId === 'navigli-fill') {
        const hoveredGroup = hoveredFeature.properties.group;

        if (hoveredGroup) {
          map.value.setFilter('polygons-highlight', ['==', ['get', 'group'], hoveredGroup]);
        }

        if (hoveredPoiId !== null) {
          map.value.setFeatureState({ source: 'pois_src', id: hoveredPoiId }, { hover: false });
          hoveredPoiId = null;
        }

      } else if (layerId === 'pois-layer') {
        map.value.setFilter('polygons-highlight', ['==', ['get', 'group'], '']);

        if (hoveredFeature.id !== undefined) {
          if (hoveredPoiId !== null) {
            // Spegni il vecchio
            map.value.setFeatureState({ source: 'pois_src', id: hoveredPoiId }, { hover: false });
          }
          hoveredPoiId = hoveredFeature.id;
          // Accendi il nuovo
          map.value.setFeatureState({ source: 'pois_src', id: hoveredPoiId }, { hover: true });
        }
      }
      
    } else {
      map.value.setFilter('polygons-highlight', ['==', ['get', 'group'], '']);
      map.value.getCanvas().style.cursor = '';

      if (hoveredPoiId !== null) {
        map.value.setFeatureState({ source: 'pois_src', id: hoveredPoiId }, { hover: false });
        hoveredPoiId = null;
      }
    }
  });

  map.value.on('mouseout', () => {
    map.value.setFilter('polygons-highlight', ['==', ['get', 'group'], '']);
    map.value.getCanvas().style.cursor = '';

    if (hoveredPoiId !== null) {
      map.value.setFeatureState({ source: 'pois_src', id: hoveredPoiId }, { hover: false });
      hoveredPoiId = null;
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