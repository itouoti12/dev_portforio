<script lang="ts">
  import { getContext, onDestroy, onMount } from 'svelte';
  import { mapbox, key } from './mapbox';
  import { gltfModelLayer } from './GltfModelLayer';
  const { getMap }: { getMap: () => mapbox.Map } = getContext(key);
  const map = getMap();

  export let layerId: string;
  export let modelPath: string;
  export let altitude = 0;
  export let scale = 1;
  export let modelOrigin: mapbox.LngLatLike;
  export let bearing = 0;
  export let isTrackingModel = false;
  let model = gltfModelLayer({
    id: layerId,
    url: modelPath,
    origin: modelOrigin,
    altitude,
    scale,
    bearing,
    isTrackingModel,
  });

  onMount(()=>{
    if(!map.getLayer(layerId))map.once('idle', () => {
      map.addLayer(model);
    });
  });

  onDestroy(()=>{
    if(map.getLayer(layerId))map.removeLayer(layerId);
    if(map.getSource(layerId))map.removeSource(layerId);
  })
</script>
