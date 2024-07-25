<!-- NOTE: mapbox-gl v2でのbuilding -->
<script lang="ts">
  import { getContext, onDestroy, onMount } from 'svelte';
  import { mapbox, key } from './mapbox';
  const { getMap }: { getMap: () => mapbox.Map } = getContext(key);
  const map = getMap();
  const layerId='3d-buildings';


  onMount(()=>{
    if(!map.getLayer(layerId))map.once('idle', () => {
      map.addLayer({
        id: layerId,
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#ccc',
          'fill-extrusion-height': ['get', 'height']
        }
      });
    });
  })

  onDestroy(() => {
    if(map.getLayer(layerId))map.removeLayer(layerId);
    if(map.getSource(layerId))map.removeSource(layerId);
  });
  
</script>
