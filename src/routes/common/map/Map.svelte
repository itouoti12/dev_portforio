<script lang="ts">
  import { onDestroy, onMount, setContext } from 'svelte';
  import { mapbox, mapstyle, key } from './mapbox';
  import { storemap } from '../store';

  setContext(key, {
    getMap: () => map
  });


  export let lat = 0;
  export let lon = 0;
  export let zoom = 18;

  let container: HTMLElement;
  let map: mapboxgl.Map;

  onMount(()=>{
    map = new mapbox.Map({
      container,
      style: mapstyle,
      center: [lon, lat],
      zoom
    });
    storemap.set(map);
  })

  onDestroy(() => {
    if (map) map.remove();
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
