<template>
  <div ref="mapContainer" class="w-full h-[500px]" />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useAppStore } from '~/stores/appState'
const store = useAppStore()
const config = useRuntimeConfig()
const mapContainer = ref(null)
const map = shallowRef(null)
let isHoveringMarker = false

onMounted(() => {
  mapboxgl.accessToken = config.public.mapboxKey
  // Initialize map on Milan
  map.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/marco-abbadessa/cmnyf24zr000801sg1lsdfrnr',
    center: [9.1899, 45.4702], // Milan Coordinates [LNG, LAT]
    zoom: 12,
    minZoom: 9,
    pitch: 60,
  })

  // Wait for map to load style to add data
  map.value.on('load', () => {      
    setupMapLayers()
  })
})

// RENDER MAP LAYERS (Navigli overlay and pois)
const setupMapLayers = () => {
  renderNavigliOverlay()
  renderPois()

  // Handle hovering effect

  const hoverPopup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 15 // Aggiunge 15px di distanza dal puntatore per non coprirlo
  })

  map.value.on('mousemove', (e) => {
    if (isHoveringMarker) return;
    // Create bounding box around the cursor for better UX
    const offset = 8
    const bbox = [
      [e.point.x - offset, e.point.y - offset],
      [e.point.x + offset, e.point.y + offset]
    ]

    const features = map.value.queryRenderedFeatures(bbox, {
      layers: ['navigli-line', 'navigli-fill']
    })

    if (features.length > 0) {
      const hoveredFeature = features[0]

      const hoveredGroup = hoveredFeature.properties.group
      const hoveredName = hoveredFeature.properties.name

      if (hoveredGroup) {
        map.value.setFilter('polygons-highlight', [
          '==',
          ['get', 'group'],
          hoveredGroup
        ])

        hoverPopup
          .setLngLat(e.lngLat)
          .setHTML(`<div class="polygon-tooltip">${hoveredName}</div>`)
          .addTo(map.value)
      }
    } else {
      map.value.setFilter('polygons-highlight', ['==', ['get', 'group'], ''])
      map.value.getCanvas().style.cursor = ''
      hoverPopup.remove()
    }
  })

  map.value.on('mouseout', () => {
    map.value.setFilter('polygons-highlight', ['==', ['get', 'group'], ''])

    hoverPopup.remove()
  })
}

// RENDER NAVIGLI OVERLAY
const renderNavigliOverlay = () => {
  //Load GeoJSON data
  map.value.addSource('navigli_src', {
    type: 'geojson',
    data: '/data/navigli-overlay.geojson'
  })

  //Render navigli polygons and lines

  map.value.addLayer({
    id: 'navigli-fill',
    type: 'fill',
    source: 'navigli_src',
    filter: ['==', '$type', 'Polygon'],
    paint: {
      'fill-color': '#004080',
      'fill-opacity': 1
    }
  })

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
        8,
        3, // A zoom 8, il bordo è spesso 3px (molto visibile)
        15,
        1 // A zoom 15, il bordo è sottile 1px
      ]
    }
  })

  map.value.addLayer({
    id: 'navigli-line',
    type: 'line',
    source: 'navigli_src',
    filter: ['==', '$type', 'LineString'],
    paint: {
      'line-color': '#004080',
      'line-width': 3
    }
  })

  map.value.addLayer({
    id: 'polygons-highlight',
    type: 'line',
    source: 'navigli_src',
    filter: ['==', ['get', 'group'], ''], // Inizialmente non mostra nulla
    paint: {
      'line-color': '#0080ff', // Colore di illuminazione (es. Giallo)
      'line-opacity': 0.9,
      'line-width': 8,
      'line-blur': 10
    }
  })
}

// RENDER POI MARKERS
const renderPois = async () => {
  try {
    const response = await fetch('/data/pois-overlay.geojson')
    const poisData = await response.json()

    //Iteration on loaded data
    poisData.features.forEach((feature) => {
      const marker = new mapboxgl.Marker()
        .setLngLat(feature.geometry.coordinates)
        .addTo(map.value)

      const el = marker.getElement()
      el.style.cursor = 'pointer'

      el.classList.add('glow-marker');

      el.addEventListener('click', async (e) => {
        e.stopPropagation()
        const id = feature.properties.id
        console.log(`Clicked on POI with ID: ${id}`)

        try {
          const selectedPoi = await $fetch(`/api/pois/${id}`) //If dynamic routes

          if (selectedPoi) {
            console.log('Data fetched for POI: ', selectedPoi.id)
            store.selectedPoi = selectedPoi
            store.isModelOpen = true
          } else {
            console.warn(`POI with ID ${id} not found.`)
          }
        } catch (error) {
          console.error('Error during fetch from pois.json:', error)
        }
      })

      el.addEventListener('mouseenter', () => {
        isHoveringMarker = true
        map.value.setFilter('polygons-highlight', ['==', ['get', 'group'], '']);
        hoverPopup.remove();
      })

      el.addEventListener('mouseleave', () => {
        isHoveringMarker = false; // Abbassiamo il semaforo
      });
    })
  } catch (error) {
    console.error('Error during fetch from pois.json:', error)
  }
}
</script>

<style>
.polygon-tooltip {
  font-family: Arial, sans-serif;
  font-size: 14px;
  font-weight: bold;
  color: #333333;
  text-transform: capitalize; /* Rende la prima lettera maiuscola */
  padding: 4px 8px;
}
.mapboxgl-popup-content {
  @apply bg-white/95 rounded-lg shadow-md p-1 !important;
}
.mapboxgl-popup-tip {
  @apply hidden !important;
}

.glow-marker svg {
  transition: transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), filter 0.2s ease;
  transform-origin: bottom center; 
}
.glow-marker:hover svg {
  transform: scale(1.2);
  filter: drop-shadow(0px 0px 8px rgba(0, 128, 255, 0.9)); 
}
</style>

<!-- <style scoped>
.map-container {
  width: 100%;
  height: 500px;
}
</style> -->
