<script lang="ts">
  import Map from '../../common/map/Map.svelte';
  import '../../../app.css';
  import type mapboxgl from 'mapbox-gl';
  import TerrainLayer from '../../common/map/TerrainLayer.svelte';
  import { SEND_PER_DURATION } from '../../common/map/GltfModelLayer';
  import GltfModel from '../../common/map/GltfModel.svelte';
  import soldierModel from '$lib/assets/three/models/Soldier.glb';
  import { afterUpdate, onDestroy, onMount } from 'svelte';
  import moment from 'moment';
  import {
    LocalDataStream,
    RemoteDataStream,
    SkyWayContext,
    SkyWayRoom,
    SkyWayStreamFactory,
    uuidV4
  } from '@skyway-sdk/room';
  import type {
    DataStreamMessageType,
    RoomSubscription,
    RoomPublication,
    LocalP2PRoomMember,
    RemoteRoomMember
  } from '@skyway-sdk/room';
  import { getRoomType, getSkyWayToken } from '../../common/skyway/skywayConfig';
  import { exchangeBlobToUrl, generateRandomColor, initOtherState, initState } from './settings';
  import type { ModelProps, SendLatLngProps, SendModelProps } from './settings';

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
  // NOTE: using webRTC
  let dataStream: LocalDataStream;
  let me: LocalP2PRoomMember;
  let myPublication: RoomPublication<LocalDataStream>;
  let subscriptions: { [key: string]: RoomSubscription<RemoteDataStream> } = {};

  let others: { [key: string]: ModelProps } = {};
  let myState: ModelProps & { name: string } = initState();

  onMount(() => {
    const initialize = async () => {
      // NOTE: initialize
      dataStream = await SkyWayStreamFactory.createDataStream();
      const context = await SkyWayContext.Create(getSkyWayToken());
      // NOTE: create and get room
      const room = await SkyWayRoom.FindOrCreate(context, getRoomType());
      // NOTE: setting my Status
      myState.name = uuidV4();
      myState.color = generateRandomColor();
      // NOTE: join room
      me = await room.join({
        name: myState.name,
        metadata: JSON.stringify({ color: myState.color, model: '' })
      });
      myState.id = me.id;
      myState = myState;
      // NOTE: 配信開始
      myPublication = await me.publish(dataStream);
      // NOTE: 現在参加/配信中のmemberの設定
      room.publications
        .filter((p) => p.publisher.id !== me.id)
        .forEach(async (p) => {
          // NOTE: 初期情報設定
          if (p.publisher.name) {
            console.log('既にいるメンバー');

            const metadataJson = p.publisher.metadata ? JSON.parse(p.publisher.metadata) : {};
            others[p.publisher.name] = initOtherState(p.publisher.id, metadataJson.color);
            // NOTE: モデル設定済みの場合設定
            if (metadataJson.model) {
              const url = exchangeBlobToUrl(metadataJson.model);
              // TODO: モデルの描画

              others[p.publisher.name].model = url;
              others[p.publisher.name].modelType = metadataJson.modelType;
            }
            others = others;
          }

          // NOTE: subscribe設定
          const remoteMember = await me.subscribe<RemoteDataStream>(p.id);
          subscriptions[p.id] = remoteMember.subscription;
          remoteMember.stream.onData.add(updateOthersState);
        });

      // NOTE: roomにメンバーが新規参加
      room.onMemberJoined.add(async (event) => {
        if (event.member.name) {
          console.log('メンバー新規参加');
          // NOTE: 初期情報設定
          const metadataJson = event.member.metadata ? JSON.parse(event.member.metadata) : {};
          others[event.member.name] = initOtherState(event.member.id, metadataJson.color);
          others = others;
        }
      });

      // NOTE: roomからメンバーが離脱
      room.onMemberLeft.add((event) => {
        if (event.member.id === me.id) return;
        subscriptions[event.member.id]?.cancel();
        if (event.member.name) {
          console.log('メンバー離脱');
          delete others[event.member.name];
          others = others;
        }
      });

      // NOTE: roomに新規メンバーがpublish開始した時
      room.onStreamPublished.add(async (event) => {
        if (event.publication.id === me.id) return;
        const remoteMember = await me.subscribe<RemoteDataStream>(event.publication.id);
        subscriptions[event.publication.id] = remoteMember.subscription;
        remoteMember.stream.onData.add(updateOthersState);
      });
    };
    initialize();
  });
  onDestroy(() => {
    // NOTE: publishを停止
    myPublication?.cancel();
    // NOTE: subscribeを停止
    Object.keys(subscriptions).forEach((key) => {
      subscriptions[key].cancel();
    });
  });

  let latestSendTime = moment().valueOf();
  let needupdate = false;
  afterUpdate(() => {
    if (!needupdate) return;

    // NOTE: 位置情報送信
    if (!dataStream) return;
    const nowTimestamp = moment().valueOf();
    // NOTE: 0.5秒ごとに送信する
    if (nowTimestamp - latestSendTime > SEND_PER_DURATION) {
      const writeObject: SendLatLngProps = {
        name: myState.name,
        lat: modelLat,
        lng: modelLng,
        direction: modelDirection,
        elevation: modelElevation,
        isRunning,
        moving: true,
        timestamp: nowTimestamp
      };
      dataStream.write(writeObject);
      myState = { ...myState, ...writeObject };
      myState = myState;

      latestSendTime = nowTimestamp;
    }

    needupdate = false;
  });

  const updateOthersState = (data: DataStreamMessageType) => {
    // NOTE: 位置情報受信時
    if ((data as SendLatLngProps).direction) {
      others[(data as SendLatLngProps).name] = {
        ...others[(data as SendLatLngProps).name],
        ...(data as SendLatLngProps)
      };
      others = others;
    }

    // NOTE: モデルデータ受信時
    if ((data as SendModelProps).model) {
      if (others[(data as SendModelProps).name]) {
        const url = exchangeBlobToUrl((data as SendModelProps).model);
        // TODO: モデルの描画
        others[(data as SendModelProps).name].model = url;
        others[(data as SendModelProps).name].modelType = (data as SendModelProps).modelType;
        others = others;
      }
    }
  };

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

  function stopMove(event: CustomEvent) {
    if (!dataStream) return;
    const writeObject: SendLatLngProps = {
      name: myState.name,
      lat: modelLat,
      lng: modelLng,
      direction: modelDirection,
      elevation: modelElevation,
      isRunning,
      moving: false,
      timestamp: moment().valueOf()
    };
    dataStream.write(writeObject);
    myState = { ...myState, ...writeObject };
    myState = myState;
  }

  function updateModelPositionOnMap(
    event: CustomEvent<{
      lngLat: mapboxgl.LngLat;
      isTracking: boolean;
      directionOnMap: number;
      elevation: number;
      isRun: boolean;
    }>
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
  <!-- NOTE: DEAD -->
  <div>now login session: me and {Object.keys(others).length}people.</div>
</div>
<div class="h-screen w-screen">
  <Map
    lon={lng}
    {lat}
    {bearing}
    {pitch}
    {zoom}
    glVer="v3"
    lightPreset="dusk"
    on:changePich={changePitch}
    on:changeRotate={changePitch}
    on:changeZoom={changeZoom}
    on:changeCenter={changeCenter}>
    <TerrainLayer glVer="v3" />
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
      glVer="v3"
      color={myState.color}
      on:changeLngLat={updateModelPositionOnMap}
      on:stopMove={stopMove} />

    <!-- 他の人がアクセスしてきた時 -->
    {#each Object.keys(others) as key}
      <GltfModel
        layerId={key}
        modelOrigin={[others[key].lng, others[key].lat]}
        modelPath={soldierModel}
        scale={2.5}
        {movingOffset}
        glVer="v3"
        elevation={others[key].elevation}
        direction={others[key].direction}
        isAutowalk={others[key].moving}
        isRunning={others[key].isRunning}
        color={others[key].color} />
    {/each}
  </Map>
</div>
