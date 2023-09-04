<script lang="ts">
  import Map from '../../common/map/Map.svelte';
  import '../../../app.css';
  import type mapboxgl from 'mapbox-gl';
  import TerrainLayer from '../../common/map/TerrainLayer.svelte';
  import BuildingLayer from '../../common/map/BuildingLayer.svelte';
  import { gltfModelLayer } from '../../common/map/GltfModelLayer';
  import GltfModel from '../../common/map/GltfModel.svelte';
  import soldierModel from '$lib/assets/three/models/Soldier.glb';

  // TODO: achexを使ってwebsocketを繋ぐ
  // TODO: websocketから他のブラウザで表示しているモデルの座標を取得し、ブラウザに表示する
  /*
  // login時
  {
    "toH":"hubname",
    "modelInfo":{
      lat:0,
      lng:0,
      elevation:0,
      direction:0,
      modelBinaly:'xxxxxx'
    },
  }
  // 移動時
  {
    "toH":"hubname",
    "modelInfo":{
      lat:0,
      lng:0,
      elevation:0,
      direction:0,
    },
    "msg":"hello boy"
  }
  */

  // NOTE: 東京タワーふもとの一定区画の範囲でランダムに座標を取りたい
  // 139.74601546518954 ~ 139.7461369537515,
  //  35.658179853793584 ~ 35.65828650653174
  const LNG_PREFIX= 139.746;
  const LNG_INIT=parseFloat(`${LNG_PREFIX}${Math.floor(Math.random() * ((1369537515 + 1)-1546518954)) + 1546518954}`);
  const LAT_PREFIX= 35.658;
  const LAT_INIT=parseFloat(`${LAT_PREFIX}${Math.floor(Math.random() * ((28650653174 + 1)-179853793584)) + 179853793584}`);

  // 0.5 〜 22
  let zoom = 21;
  // 0 〜 90 0が真上90が水平
  let pitch = 80;
  // -180 〜 180 0が正面 -が左旋回 +が右旋回
  let bearing = -58;
  let lng = LNG_INIT;
  let lat = LAT_INIT;
  let modelLng = LNG_INIT;
  let modelLat = LAT_INIT;
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
  let isAutowalk = false;
  function changeWalk(isAuto:boolean){
    isAutowalk = isAuto;
  }
  let isTracking = true;
  function toggleTracking(){
    isTracking = !isTracking;
  }

  function  updateModelPositionOnMap(event: CustomEvent<{ lngLat: mapboxgl.LngLat,isTracking:boolean }> ) {
    modelLng = event.detail.lngLat.lng;
    modelLat = event.detail.lngLat.lat;
    if(isTracking){
      lng = event.detail.lngLat.lng;
      lat = event.detail.lngLat.lat;
    }
  }
</script>

<div class="fixed top-0 left-0 h-20 w-[30rem] z-10 text-zinc-50">
  <h1>zoom:{zoom} pitch:{pitch} bearing:{bearing}</h1>
  <h1>viewPosition: [{lng} {lat}]</h1>
  <h1>modelPosition: [{modelLng} {modelLat}]</h1>
  <button class="bg-sky-500/75" on:click={()=>changeWalk(true)}>AutoWalk</button>
  <button class="bg-sky-500/75" on:click={()=>changeWalk(false)}>ManualWalk</button>
  <button class="bg-lime-500/75" on:click={()=>toggleTracking()}>Tracking</button>
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
    <TerrainLayer />
    <BuildingLayer />
    <GltfModel
      layerId="soldier"
      modelOrigin={[lng, lat]}
      modelPath={soldierModel}
      scale={2}
      {bearing}
      {movingOffset}
      isAutowalk={isAutowalk}
      isTrackingModel={isTracking}
      on:changeLngLat={updateModelPositionOnMap}
      />
  </Map>
</div>
