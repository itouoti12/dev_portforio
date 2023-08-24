<script lang="ts">
  import { afterUpdate, getContext, onDestroy, onMount } from 'svelte';
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
  export let isAutowalk = false;
  export let movingOffset:number;
  let model = gltfModelLayer({
    id: layerId,
    url: modelPath,
    origin: modelOrigin,
    altitude,
    scale,
    bearing,
    isTrackingModel,
    movingOffset
  });

  onMount(()=>{
    if(!map.getLayer(layerId))map.once('idle', () => {
      map.addLayer(model);
      if(isAutowalk){
        if(model.autoWakingChange)model.autoWakingChange(true);
      }
    });
  });

  afterUpdate(()=>{
    if(!isAutowalk){
      console.log('autoWakingStop')
        if(model.autoWakingChange)model.autoWakingChange(false);
    }else{
      console.log('autoWakingStart')
        if(model.autoWakingChange)model.autoWakingChange(true);
    }

    if(isTrackingModel){
      if(model.trackingChange)model.trackingChange(true);
    }else{
      if(model.trackingChange)model.trackingChange(false);
    }

  })

  onDestroy(()=>{
    if(map.getLayer(layerId))map.removeLayer(layerId);
    if(map.getSource(layerId))map.removeSource(layerId);
  })
</script>
