<script lang="ts">
  import Map from '../../common/map/Map.svelte';
  import '../../../app.css';
  import type mapboxgl from 'mapbox-gl';
  import TerrainLayer from '../../common/map/TerrainLayer.svelte';
  import BuildingLayer from '../../common/map/BuildingLayer.svelte';
  import { SEND_PER_DURATION } from '../../common/map/GltfModelLayer';
  import GltfModel from '../../common/map/GltfModel.svelte';
  import soldierModel from '$lib/assets/three/models/Soldier.glb';
  import { afterUpdate, onDestroy, onMount } from 'svelte';
  import moment from 'moment';

  // NOTE: 東京タワーふもとの一定区画の範囲でランダムに座標を取りたい
  // 139.74601546518954 ~ 139.7461369537515,
  //  35.658179853793584 ~ 35.65828650653174
  const LNG_PREFIX = 139.746;
  const LNG_INIT = parseFloat(`${LNG_PREFIX}${Math.floor(Math.random() * (1369537515 + 1 - 1546518954)) + 1546518954}`);
  const LAT_PREFIX = 35.658;
  const LAT_INIT = parseFloat(
    `${LAT_PREFIX}${Math.floor(Math.random() * (28650653174 + 1 - 179853793584)) + 179853793584}`
  );

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
  let modelDirection = 0;
  let modelElevation = 0;
  let isRunning = true;

  // NOTE: setting websocket
  let ws: WebSocket;
  let wsSid: number = 0;

  // NOTE: otherModelInformation
  interface OhterModelPorps {
    [key: number]: {
      lat: number;
      lng: number;
      elevation: number;
      direction: number;
      timestamp: number;
      moving:boolean;
      isRunning:boolean;
    };
  }
  let others: OhterModelPorps = {};
  const DELETE_JUDGE_DURATION = 120 * 1000;

  onMount(() => {
    // WS接続(to Achex)
    ws = new WebSocket('wss://cloud.achex.ca/itouoti_samplepage');
    // WS接続時callback
    ws.onopen = (e) => {
      console.log('open websocket');
      // Authentificate request
      ws.send(JSON.stringify({ auth: 'model', password: '9999' }));
    };

    // WS受信時callback
    ws.onmessage = (e) => {
      var msg = JSON.parse(e.data);
      if (!wsSid && msg.auth === 'OK') {
        console.log('Authentificate oK');
        wsSid = msg.SID;
        // join Hub
        ws.send(JSON.stringify({ joinHub: 'mapboxwalking' }));
        ws.send(
          JSON.stringify({
            to: 'model',
            lat: modelLat,
            lng: modelLng,
            elevation: modelElevation,
            direction: modelDirection,
            timestamp: moment().valueOf(),
            isRunning,
            moving:false,
            // modelBinaly: 'xxxxxx'
          })
        );
        return;
      }

      if (msg.joinHub === 'OK') {
        console.log('join hub oK');
        return;
      }

      if (wsSid === msg.sID) {
        return;
      }

      // NOTE: use Debug
      // console.log(msg);

      // NOTE: 他のユーザーがセッションを抜けた
      if(msg.leftHub === 'mapboxwalking'){
        console.log(`${msg.sID}:leave session`);
        delete others[msg.sID];
        // NOTE: renderをトリガー
        others = others;
        return;
      }

      // NOTE: 他のモデルの情報を更新
      others[msg.sID] = {
        lat: msg.lat,
        lng: msg.lng,
        elevation: msg.elevation,
        direction: msg.direction,
        timestamp: msg.timestamp,
        moving:msg.moving,
        isRunning:msg.isRunning,
      };
      // console.log(others)

      // NOTE: 他のモデルで一定時間動きがない場合は表示を消す
      const nowTimestamp = moment().valueOf();
      let dleteTargetSID: number[] = [];
      Object.keys(others).forEach((other) => {
        const targetTimestamp = others[Number(other)].timestamp;
        if (nowTimestamp - targetTimestamp === DELETE_JUDGE_DURATION) {
          dleteTargetSID.push(Number(other));
        }
      });
      dleteTargetSID.forEach((target) => {
        console.log(`${msg.sID}: session timeout`);
        delete others[target];
      });
      // NOTE: renderをトリガー
      others = others;
    };

    // WS切断時callback
    ws.onclose = (e) => {
      console.log('closed');
      // leave message
      // ws.send(JSON.stringify({ to: 'model', leave: 'OK' }));
    };
  });
  onDestroy(() => {
    ws.close();
  });

  let latestSendTime = moment().valueOf();
  let needupdate = false;
  afterUpdate(() => {
    if (!needupdate) return;

    if (!!ws && ws.readyState === ws.OPEN) {
      const nowTimestamp = moment().valueOf();
      // NOTE: 0.5秒ごとにsendするように
      if (nowTimestamp - latestSendTime > SEND_PER_DURATION) {
        console.log('send position');
        ws.send(
          JSON.stringify({
            to: 'model',
            lat: modelLat,
            lng: modelLng,
            elevation: modelElevation,
            direction: modelDirection,
            timestamp: nowTimestamp,
            isRunning,
            moving:true
          })
        );
        latestSendTime = nowTimestamp;
      }
    }
    needupdate = false;
  });

  function changeZoom(event: CustomEvent<{ zoom: number }>) {
    zoom = event.detail.zoom;
  }
  function changePitch(event: CustomEvent<{ pitch: number; bearing: number }>) {
    pitch = event.detail.pitch;
    bearing = event.detail.bearing;
  }
  function changeCenter(event: CustomEvent<{ center: mapboxgl.LngLat }>) {
    needupdate = true;
    lng = event.detail.center.lng;
    lat = event.detail.center.lat;
  }
  let isAutowalk = false;
  function changeWalk(isAuto: boolean) {
    isAutowalk = isAuto;
  }
  let isTracking = true;
  function toggleTracking() {
    isTracking = !isTracking;
  }

  function stopMove(event: CustomEvent){
    console.log('stop move')
    if (!!ws && ws.readyState === ws.OPEN) {
      ws.send(
        JSON.stringify({
          to: 'model',
          lat: modelLat,
          lng: modelLng,
          elevation: modelElevation,
          direction: modelDirection,
          timestamp: moment().valueOf(),
          isRunning,
          moving:false
        })
      );
    }
  }

  function updateModelPositionOnMap(
    event: CustomEvent<{ lngLat: mapboxgl.LngLat; isTracking: boolean; directionOnMap: number; elevation: number,isRun:boolean }>
  ) {
    needupdate = true;
    modelLng = event.detail.lngLat.lng;
    modelLat = event.detail.lngLat.lat;
    if (isTracking) {
      lng = event.detail.lngLat.lng;
      lat = event.detail.lngLat.lat;
    }
    modelDirection = event.detail.directionOnMap;
    modelElevation = event.detail.elevation;
    isRunning = event.detail.isRun;
  }
</script>

<div class="fixed top-0 left-0 h-20 w-[30rem] z-10 text-zinc-50">
  <h1>zoom:{zoom} pitch:{pitch} bearing:{bearing}</h1>
  <h1>viewPosition: [{lng} {lat}]</h1>
  <h1>modelPosition: [{modelLng} {modelLat}]</h1>
  <h1>modelDirection: {modelDirection}</h1>
  <button class="bg-sky-500/75" on:click={() => changeWalk(true)}>AutoWalk</button>
  <button class="bg-sky-500/75" on:click={() => changeWalk(false)}>ManualWalk</button>
  <button class="bg-lime-500/75" on:click={() => toggleTracking()}>Tracking</button>
  <div>now login session: me and {Object.keys(others).length}people.</div>
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
      {isAutowalk}
      isTrackingModel={isTracking}
      isMe
      on:changeLngLat={updateModelPositionOnMap} 
      on:stopMove={stopMove}
    />

    <!-- 他の人がアクセスしてきた時 -->
    {#each Object.keys(others) as key}
      <GltfModel
        layerId={key}
        modelOrigin={[others[Number(key)].lng, others[Number(key)].lat]}
        modelPath={soldierModel}
        scale={2}
        {movingOffset}
        elevation={others[Number(key)].elevation}
        direction={others[Number(key)].direction}
        isAutowalk={others[Number(key)].moving}
        isRunning={others[Number(key)].isRunning}
      />
    {/each}
  </Map>
</div>
