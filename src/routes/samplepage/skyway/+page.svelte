<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import '../../../app.css';

  import {
    RemoteDataStream,
    SkyWayRoom,
    SkyWayContext,
    SkyWayStreamFactory,
    SkyWayAuthToken,
    nowInSec,
    uuidV4,
    LocalDataStream
  } from '@skyway-sdk/room';
  import type { RoomSubscription, RoomPublication, LocalP2PRoomMember, RemoteRoomMember } from '@skyway-sdk/room';

  const ROOM_NAME = import.meta.env.VITE_SKYWAY_ROOM_NAME;
  // export let data : any;

  const token = new SkyWayAuthToken({
    jti: uuidV4(),
    iat: nowInSec(),
    exp: nowInSec() + 60 * 60 * 24,
    scope: {
      app: {
        id: import.meta.env.VITE_SKYWAY_PROJECT_ID,
        turn: true,
        actions: ['read'],
        channels: [
          {
            id: '*',
            name: '*',
            actions: ['write'],
            members: [
              {
                id: '*',
                name: '*',
                actions: ['write'],
                publication: {
                  actions: ['write']
                },
                subscription: {
                  actions: ['write']
                }
              }
            ],
            sfuBots: [
              {
                actions: ['write'],
                forwardings: [
                  {
                    actions: ['write']
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  }).encode(import.meta.env.VITE_SKYWAY_SECRET);

  let dataStream: LocalDataStream;
  let me: LocalP2PRoomMember;
  let myId: string;
  let myColor: string;
  let myPublication: RoomPublication<LocalDataStream>;
  let subscriptions: { [key: string]: RoomSubscription<RemoteDataStream> } = {};

  // NOTE: otherModelInformation
  interface OhterModelPorps {
    lat: number;
    lng: number;
    elevation: number;
    direction: number;
    timestamp: number;
    moving: boolean;
    isRunning: boolean;
    color: string;
    id: string;
    model?: string;
  }
  let others: { [key: string]: OhterModelPorps } = {};
  let myState: OhterModelPorps & { name: string } = {
    lat: 0,
    lng: 0,
    elevation: 0,
    direction: 0,
    timestamp: 0,
    moving: false,
    isRunning: false,
    color: '#000000',
    id: '',
    name: ''
  };

  onMount(() => {
    const initialize = async () => {
      dataStream = await SkyWayStreamFactory.createDataStream();

      const context = await SkyWayContext.Create(token);
      // NOTE: create or get room
      const room = await SkyWayRoom.FindOrCreate(context, {
        type: 'p2p',
        name: ROOM_NAME
      });

      myId = uuidV4();
      const randomColor = () => {
        return '#' + [0, 1, 2, 3, 4, 5].map((_) => Math.floor(Math.random() * 0x10).toString(16)).join('');
      };
      myColor = randomColor();
      me = await room.join({
        name: myId,
        metadata: JSON.stringify({ color: myColor, model: '' })
      });
      console.log('i am joining', me.id);
      myState.id = me.id;
      myState.color = myColor;
      myState.name = myId;
      myState = myState;

      // NOTE: dataを配信
      myPublication = await me.publish(dataStream);

      // NOTE: 現在参加/配信中のmemberをsubscribe
      room.publications
        .filter((p) => p.publisher.id !== me.id)
        .forEach(async (p) => {
          console.log('already joined member', p.id);

          if (p.publisher.name) {
            const metadataJson =p.publisher.metadata ? JSON.parse(p.publisher.metadata):{};
            others[p.publisher.name] = {
              lat: 0,
              lng: 0,
              direction: 0,
              elevation: 0,
              isRunning: true,
              moving: false,
              timestamp: 0,
              id: p.publisher.id,
              color: metadataJson.color ? metadataJson.color : '#000000'
            };
            if(metadataJson.model){
                const blob = new Blob([metadataJson.model as ArrayBuffer], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                console.log(url);
                others[p.publisher.name].model = url;
            }
            others = others;
          }

          const remoteMember = await me.subscribe<RemoteDataStream>(p.id);
          subscriptions[p.id] = remoteMember.subscription;
          remoteMember.stream.onData.add((data) => {
            console.log('すでにいたメンバーからpublish');
            console.log(data);

            if ((data as any).direction) {
              others[(data as any).name] = {
                ...others[(data as any).name],
                ...(data as OhterModelPorps)
              };
              others = others;
              console.log(others[(data as any).name]);
            }

            // ドラッグされたモデルデータの読み込み
            if ((data as any).model) {
              if (others[(data as any).name]) {
                const blob = new Blob([(data as any).model as ArrayBuffer], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                console.log(url);
                others[(data as any).name].model = url;
                others = others;
              }
            }
          });
        });

      // roomにだれか参加
      room.onMemberJoined.add(async (event) => {
        // const isNewComer = subscribeMemberList.every(alreadyMember=>event.member.id !== alreadyMember);

        // if(isNewComer){
        console.log('join :', event.member.name);
        // const {subscription} = await (event.member as RemoteRoomMember).subscribe(publication.id);

        // }
        if (event.member.name) {
          others[event.member.name] = {
            lat: 0,
            lng: 0,
            direction: 0,
            elevation: 0,
            isRunning: true,
            moving: false,
            timestamp: 0,
            id: event.member.id,
            color: event.member.metadata ? JSON.parse(event.member.metadata).color : '#000000'
          };
          others = others;
        }
      });

      // roomからだれかが離脱
      room.onMemberLeft.add((event) => {
        if (event.member.id === me.id) return;
        console.log('leave :', event.member.name);
        subscriptions[event.member.id]?.cancel();

        if (event.member.name) {
          delete others[event.member.name];
          others = others;
        }
      });

      // roomにだれかがpublishした
      room.onStreamPublished.add(async (event) => {
        if (event.publication.id === me.id) return;

        const remoteMember = await me.subscribe<RemoteDataStream>(event.publication.id);
        subscriptions[event.publication.id] = remoteMember.subscription;

        remoteMember.stream.onData.add((data) => {
          console.log('新規参加メンバーからpublish');
          console.log(data);

          if ((data as any).direction) {
            others[(data as any).name] = {
              ...others[(data as any).name],
              ...(data as OhterModelPorps)
            };
            others = others;
            console.log(others[(data as any).name]);
          }

          // ドラッグされたモデルデータの読み込み
          if ((data as any).model) {
            if (others[(data as any).name]) {
              const blob = new Blob([(data as any).model as ArrayBuffer], { type: 'application/octet-stream' });
              const url = URL.createObjectURL(blob);
              console.log(url);
              others[(data as any).name].model = url;
              others = others;
            }
          }
        });
      });
    };
    initialize();
  });

  onDestroy(() => {
    console.log('destory');
    // publishを停止
    myPublication?.cancel();
    // subscribeを停止
    Object.keys(subscriptions).forEach((key) => {
      subscriptions[key].cancel();
    });
  });

  function getRandomLatLon(isLat: boolean): number {
    const upper = isLat ? 180 : 360;
    const lower = isLat ? 90 : 180;
    return parseFloat((Math.random() * upper - lower).toFixed(9));
  }
  function getRandomDirection(): number {
    return parseFloat((Math.random() * 360).toFixed(6));
  }
  function getRandomElevation(): number {
    return parseFloat((Math.random() * 1000).toFixed(6));
  }

  function sendJson() {
    if (!dataStream) return;
    const writeObj = {
      name: myState.name,
      lat: getRandomLatLon(true),
      lng: getRandomLatLon(false),
      direction: getRandomDirection(),
      elevation: getRandomElevation(),
      isRunning: Math.random() < 0.5,
      moving: Math.random() < 0.5,
      timestamp: Date.now()
    };
    dataStream.write(writeObj);
    myState = { ...myState, ...writeObj };
    myState = myState;
  }

  // Drag&Drop Handler
  document.addEventListener('dragover', (event) => {
    event.preventDefault();
  });
  document.addEventListener('drop', async (event) => {
    event.preventDefault();
    // read given file then convert it to blob url
    const files = event.dataTransfer?.files;
    if (!files || !files[0]) return;

    const blob = new Blob([files[0]], { type: 'application/octet-stream' });
    // 自分のMetadataの更新
    const url = URL.createObjectURL(blob);
    console.log(url);
    myState.model = url;
    myState = myState;
    me.updateMetadata(JSON.stringify({ color: myState.color, model: await blob.arrayBuffer() }));

    if (dataStream) dataStream.write({ name: myState.name, model: await blob.arrayBuffer() });
  });
</script>

<div class="bg-slate-50/25 dark:bg-slate-700/25">
  SkywayによるWebRTC検証
  <button
    class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
    on:click={sendJson}>座標をランダムに送信</button>
</div>

{#if me}
  <div class="dynamic-bg" style="--theme-bg:{myColor}">
    <p>自分</p>
    <p>NAME:{myState.name}</p>
    <p>ID:{myState.id}</p>
    <p>METADATA:{myState.color}</p>
    <p>座標:[{myState.lat},{myState.lng}]</p>
    <p>高度: {myState.elevation}</p>
    <p>方角: {myState.direction}</p>
    <p>更新時間: {myState.timestamp}</p>
    <p>移動中: {myState.moving}</p>
    <p>走っている: {myState.isRunning}</p>
    <p>カスタムモデル: {myState.model?myState.model:'未使用'}</p>
  </div>
{/if}

{#each Object.keys(others) as key}
  <div class="dynamic-bg" style="--theme-bg:{others[key].color}">
    <p>NAME:{key}</p>
    <p>ID:{others[key].id}</p>
    <p>METADATA:{others[key].color}</p>
    <p>座標:[{others[key].lat},{others[key].lng}]</p>
    <p>高度: {others[key].elevation}</p>
    <p>方角: {others[key].direction}</p>
    <p>更新時間: {others[key].timestamp}</p>
    <p>移動中: {others[key].moving}</p>
    <p>走っている: {others[key].isRunning}</p>
    <p>カスタムモデル: {others[key].model?others[key].model:'未使用'}</p>
  </div>
{/each}

<style lang="postcss">
  .dynamic-bg {
    background-color: var(--theme-bg);
    opacity: 0.5;
  }
</style>
