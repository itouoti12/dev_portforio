<script>
  import { onMount } from 'svelte';
  import { createScene } from '../../common/three/vrmScene';
  import '../../../app.css';
  /**
   * @type {HTMLCanvasElement}
   */
  let el;
  onMount(() => {
    createScene(el);
  });
</script>

<div class="relative">
  <div class="font-pixelify absolute top-5 left-5 h-35 w-[30rem] z-10 px-3 py-1 text-slate-800 bg-slate-100 opacity-70 rounded-lg">
    <h1 class="text-2xl">How to control🕹️</h1>
    <p><span class="font-semibold">key W,A,S,D</span> ... moving</p>
    <p><span class="font-semibold">Space</span> ... jump</p>
    <p><span class="font-semibold">key J</span> ... dancing</p>
    <p><span class="font-semibold">drag vrm file</span> ... change model</p>
  </div>
  <!-- <div style="position: absolute; top: 0; left: 0;"> -->
  <div class="absolute top-0 left-0">
    <canvas bind:this={el} />
  </div>
</div>
