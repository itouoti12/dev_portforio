<script>
    import { onMount } from 'svelte';
  import { createGltfScene } from './scene';
    /**
   * @type {HTMLCanvasElement}
   */
    let el;
    onMount(() => {
      createGltfScene(el)
    });
  </script>
  
  <canvas bind:this={el}></canvas>