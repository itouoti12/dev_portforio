<script lang="ts">
  import { afterUpdate, createEventDispatcher, getContext, onDestroy, onMount } from 'svelte';
  import { mapbox, key } from './mapbox';
  import { mapbox as mapboxV3, key as keyV3 } from './mapbox_v3';
  import { gltfModelLayer, type CustomLayer } from './GltfModelLayer';
  import type { modelPositionProps } from '../three/characterControlsOnMapbox';

  export let glVer: 'v2'|'v3'= 'v2';
  const { getMap }: { getMap: () => mapbox.Map } = getContext(glVer==='v2'?key:keyV3);
  const dispatch = createEventDispatcher();
  const map = getMap();

  export let layerId: string;
  export let modelPath: string;
  export let scale = 1;
  export let modelOrigin: mapbox.LngLatLike;
  export let bearing = 0;
  export let isTrackingModel = false;
  export let isAutowalk = false;
  export let movingOffset: number;
  export let isMe =  false;
  let model: mapbox.AnyLayer & CustomLayer;

  
  export let elevation = 0; 
  export let direction = 0;
  export let isRunning = true;

  function updatePosition({ lngLat, directionOnMap, elevation, isTracking,isRun }: modelPositionProps){
    dispatch('changeLngLat',{lngLat,directionOnMap,elevation,isTracking,isRun});
  }

  function onStopMove(){
    dispatch('stopMove');
  }

  onMount(() => {
    if (!map.getLayer(layerId))
      map.once('idle', () => {
        const elevation = map.queryTerrainElevation(modelOrigin, { exaggerated: false }) || 0;

        model = gltfModelLayer({
          id: layerId,
          url: modelPath,
          origin: modelOrigin,
          altitude: elevation,
          scale,
          bearing,
          isTrackingModel,
          movingOffset,
          updateModelPositionOnMap:updatePosition,
          isMe,
          onStopMove
        });

        map.addLayer(model);
        if (isAutowalk) {
          if (model.autoWakingChange) model.autoWakingChange(true);
        }
      });
  });

  afterUpdate(() => {
    if(!model)return;
    if(isMe){
      if (model.autoWakingChange) model.autoWakingChange(isAutowalk);
      if (model.trackingChange) model.trackingChange(isTrackingModel);
    } else {

      if (model.autoWakingChange) model.autoWakingChange(isAutowalk);
      if (model.walkMotionChange) model.walkMotionChange(isRunning);

      // NOTE: propsの更新によってmodelを動かす
      if(model.updateLngLat)model.updateLngLat({
        lngLat:modelOrigin,
        altitude:elevation,
        deg:direction
      });
    }

  });

  onDestroy(() => {
    if(!model)return;
    if (model.autoWakingChange) model.autoWakingChange(false);
    if (model.trackingChange) model.trackingChange(false);
    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(layerId)) map.removeSource(layerId);
  });
</script>
