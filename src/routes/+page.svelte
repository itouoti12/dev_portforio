<script lang="ts">
  import '../app.css';
  import Map from './common/map/Map.svelte';
</script>

<div class="fixed top-0 left-0 h-full w-full -z-50">
  <Map lat={35.6829} lon={139.7651} zoom={3} />
</div>

<section class="h-screen w-screen flex justify-center items-center">
  <h1 class="text-6xl font-bold">page1</h1>
</section>

<section class="h-screen w-screen flex justify-center items-center">
  <h1 class="text-6xl font-bold">page2</h1>
</section>

<section class="h-screen w-screen flex justify-center items-center">
  <h1 class="text-6xl font-bold">page3</h1>
</section>

<section class="h-screen w-screen flex justify-center items-center">
  <h1 class="text-6xl font-bold">page4</h1>
</section>

<style lang="postcss">
  :global(html) {
    background-color: theme(colors.gray.100);
  }
</style>
