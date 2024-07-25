<script lang="ts">
  import { onDestroy, onMount, setContext } from 'svelte';
  import { mapbox, mapstyle, key } from './mapbox';
  import { mapbox as mapboxV3, mapstyle as mapstyleV3, key as keyV3 } from './mapbox_v3';
  import { storemap } from '../store';
  import { createEventDispatcher } from 'svelte';
  import _ from 'lodash';

  const dispatch = createEventDispatcher();

  export let lat = 0;
  export let lon = 0;
  export let zoom = 18;
  export let pitch = 0;
  export let bearing = 0;
  type LIGHT_PRESET = 'dusk' | 'dawn' | 'day' | 'night';
  export let lightPreset: LIGHT_PRESET = 'day';
  export let glVer: 'v2' | 'v3' = 'v2';
  setContext(glVer === 'v2' ? key : keyV3, {
    getMap: () => map
  });

  let container: HTMLElement;
  let map: mapboxgl.Map;
  let resizer: ResizeObserver;

  onMount(() => {
    if (glVer === 'v2') {
      map = new mapbox.Map({
        container,
        style: mapstyle,
        center: [lon, lat],
        zoom,
        pitch,
        bearing,
        useWebGL2: true,
        antialias: true // create the gl context with MSAA antialiasing, so custom layers are antialiased
      } as any);
    } else {
      map = new mapboxV3.Map({
        container,
        style: mapstyleV3,
        center: [lon, lat],
        zoom,
        pitch,
        bearing,
        useWebGL2: true,
        antialias: true // create the gl context with MSAA antialiasing, so custom layers are antialiased
      } as any);

      map.on('style.load', () => {
        map.setConfigProperty('basemap', 'showPointOfInterestLabels', false);
        map.setConfigProperty('basemap', 'showTransitLabels', false);
        map.setConfigProperty('basemap', 'showRoadLabels', false);
        map.setConfigProperty('basemap', 'showPlaceLabels', false);
        map.setConfigProperty('basemap', 'lightPreset', lightPreset);
      });
    }
    storemap.set(map);

    map.on('pitchend', () => {
      dispatch('changePich', { pitch: map.getPitch(), bearing: map.getBearing() });
    });
    map.on('zoomend', () => {
      dispatch('changeZoom', { zoom: map.getZoom() });
    });
    map.on('rotateend', () => {
      dispatch('changeRotate', { pitch: map.getPitch(), bearing: map.getBearing() });
    });
    map.on('dragend', () => {
      dispatch('changeCenter', { center: map.getCenter() });
    });

    resizer = new ResizeObserver(_.debounce(() => map.resize(), 100));
    resizer.observe(container);
  });

  onDestroy(() => {
    resizer?.disconnect();
    // if (map) map.remove();
  });
</script>

<div bind:this={container}>
  {#if map}
    <slot />
  {/if}
</div>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
