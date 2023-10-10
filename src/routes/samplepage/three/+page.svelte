<script>
    import { onMount } from 'svelte';
    import { createScene } from '../../common/three/scene';
    /**
   * @type {HTMLCanvasElement}
   */
    let el;
    onMount(() => {
      createScene(el)
    });
  </script>
  
  <canvas bind:this={el}></canvas>