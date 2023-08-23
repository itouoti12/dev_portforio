<script lang="ts">
  import { onDestroy, onMount, setContext } from 'svelte';
  import { mapbox, mapstyle, key } from './mapbox';
  import { storemap } from '../store';
  import { createEventDispatcher } from 'svelte';
  import _ from 'lodash'

  const dispatch = createEventDispatcher();

  setContext(key, {
    getMap: () => map
  });


  export let lat = 0;
  export let lon = 0;
  export let zoom = 18;
  export let pitch = 0;
  export let bearing = 0;

  let container: HTMLElement;
  let map: mapboxgl.Map;
  let resizer: ResizeObserver

  onMount(()=>{
    map = new mapbox.Map({
      container,
      style: mapstyle,
      center: [lon, lat],
      zoom,
      pitch,
      bearing,
      antialias: true // create the gl context with MSAA antialiasing, so custom layers are antialiased
    });
    storemap.set(map);

    map.on('pitchend',()=>{
      dispatch('changePich',{pitch:map.getPitch(),bearing:map.getBearing()})
    });
    map.on('zoomend',()=>{
      dispatch('changeZoom',{zoom:map.getZoom()})
    });
    map.on('rotateend',()=>{
      dispatch('changeRotate',{pitch:map.getPitch(),bearing:map.getBearing()})
    });
    map.on('dragend',()=>{
      dispatch('changeCenter',{center:map.getCenter()})
    });

    resizer = new ResizeObserver(_.debounce(()=>map.resize(),100));
    resizer.observe(container);
  })

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
