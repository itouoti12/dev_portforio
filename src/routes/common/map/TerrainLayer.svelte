<script lang="ts">
  import { getContext } from 'svelte';
  import { mapbox, key } from './mapbox';
  const { getMap }: { getMap: () => mapbox.Map } = getContext(key);
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
