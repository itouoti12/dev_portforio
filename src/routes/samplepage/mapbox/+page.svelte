<script lang="ts">
  import Map from '../../common/map/Map.svelte';
  import '../../../app.css';
  import type mapboxgl from 'mapbox-gl';
  import TerrainLayer from '../../common/map/TerrainLayer.svelte';
  import BuildingLayer from '../../common/map/BuildingLayer.svelte';
  import { gltfModelLayer } from '../../common/map/GltfModelLayer';
  import GltfModel from '../../common/map/GltfModel.svelte';
  import soldierModel from '$lib/assets/three/models/Soldier.glb';

  // 0.5 〜 22
  let zoom = 21;
  // 0 〜 90 0が真上90が水平
  let pitch = 80;
  // -180 〜 180 0が正面 -が左旋回 +が右旋回
  let bearing = -58;
  let lng = 139.776617;
  // let lng = 139.776627;
  let lat = 35.716932;
  // let lat = 35.716939;
  const movingOffset = 0.00000005;

  function changeZoom(event: CustomEvent<{ zoom: number }>) {
    zoom = event.detail.zoom;
  }
  function changePitch(event: CustomEvent<{ pitch: number; bearing: number }>) {
    pitch = event.detail.pitch;
    bearing = event.detail.bearing;
  }
  function changeCenter(event: CustomEvent<{ center: mapboxgl.LngLat }>) {
    lng = event.detail.center.lng;
    lat = event.detail.center.lat;
  }
</script>

<div class="fixed top-0 left-0 h-20 w-56 z-10 text-zinc-50">
  <h1>zoom:{zoom} pitch:{pitch} bearing:{bearing}</h1>
  <h1>[{lng} {lat}]</h1>
</div>
<div class="h-screen w-screen">
  <Map
    lon={lng}
    {lat}
    {bearing}
    {pitch}
    {zoom}
    on:changePich={changePitch}
    on:changeRotate={changePitch}
    on:changeZoom={changeZoom}
    on:changeCenter={changeCenter}>
    <!-- <TerrainLayer /> -->
    <BuildingLayer />
    <GltfModel
      layerId="soldier"
      modelOrigin={[lng, lat]}
      modelPath={soldierModel}
      scale={2}
      {bearing}
      {movingOffset}
      isTrackingModel />
  </Map>
</div>
