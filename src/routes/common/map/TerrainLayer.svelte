<script lang="ts">
  import { getContext } from 'svelte';
  import { mapbox, key } from './mapbox';
  import { mapbox as mapboxV3, key as keyV3 } from './mapbox_v3';
  export let glVer: 'v2'|'v3'= 'v2';
  const { getMap }: { getMap: () => mapbox.Map } = getContext(glVer==='v2'?key:keyV3);
  const map = getMap();
  const EXAGGERATION = 1.0;

  export let exaggeration = 0;

  map.once('style.load', () => {
    map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.terrain-rgb',
      tileSize: 512,
      maxzoom: 14
    });
    map.setTerrain({ source: 'mapbox-dem', exaggeration: exaggeration ? exaggeration : EXAGGERATION });
  });
</script>
