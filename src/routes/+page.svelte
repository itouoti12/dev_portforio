<script lang="ts">
  import '../app.css';
  import Map from './common/map/Map.svelte';
</script>


<div class="relative h-screen w-screen">
  <div class="absolute top-0 left-0 h-full w-full -z-50">
    <Map lat={35.6829} lon={139.7651} zoom={18} />
  </div>

  <div>
  <h1 class="text-3xl font-bold underline">Hello world!</h1>

  </div>

</div>

<style lang="postcss">
  :global(html) {
    background-color: theme(colors.gray.100);
  }
</style>
