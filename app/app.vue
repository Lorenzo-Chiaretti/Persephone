<template>
  <h1 class="my-6 text-center text-3xl font-bold text-gray-800">
    Hi! We are the Persephone team: Lorenzo, Gabriele, Marco, Giuseppe
  </h1>
  <div>
    <NuxtRouteAnnouncer />
    <MapBox />
    <PoiDetail />
  </div>
  <ArCanvas :active="arStore.isActive" />
</template>


<script setup>
  import { useArStore } from '~/stores/arState'
  const arStore = useArStore()
</script>

<style>
@import '~/assets/main.css';
</style>