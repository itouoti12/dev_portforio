<script lang="ts">
  import { afterUpdate, getContext, onDestroy, onMount } from 'svelte';
  import { mapbox, key } from './mapbox';
  import { gltfModelLayer, type CustomLayer } from './GltfModelLayer';
  const { getMap }: { getMap: () => mapbox.Map } = getContext(key);
  const map = getMap();

  export let layerId: string;
  export let modelPath: string;
  export let scale = 1;
  export let modelOrigin: mapbox.LngLatLike;
  export let bearing = 0;
  export let isTrackingModel = false;
  export let isAutowalk = false;
  export let movingOffset: number;
  let model: mapbox.AnyLayer & CustomLayer;

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
          movingOffset
        });

        map.addLayer(model);
        if (isAutowalk) {
          if (model.autoWakingChange) model.autoWakingChange(true);
        }
      });
  });

  afterUpdate(() => {
    if (model.autoWakingChange) model.autoWakingChange(isAutowalk);
    if (model.trackingChange) model.trackingChange(isTrackingModel);
  });

  onDestroy(() => {
    if (model.autoWakingChange) model.autoWakingChange(false);
    if (model.trackingChange) model.trackingChange(false);
    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(layerId)) map.removeSource(layerId);
  });
</script>
