<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import '../../../app.css';

  import {RemoteDataStream,SkyWayRoom,SkyWayContext,SkyWayStreamFactory,SkyWayAuthToken, nowInSec, uuidV4, LocalDataStream} from '@skyway-sdk/room';
  import type {RoomSubscription,RoomPublication,LocalP2PRoomMember,RemoteRoomMember} from '@skyway-sdk/room';

  const ROOM_NAME = 'itouoti_mapbox_three'; 
  export let data : any;

  // const token = new SkyWayAuthToken({
  //   jti: uuidV4(),
  //   iat: nowInSec(),
  //   exp: nowInSec() + 60 * 60 * 24,
  //   scope: {
  //     app: {
  //       id: '52f48016-2c91-46be-829e-a3706d3070d2',
  //       turn: true,
  //       actions: ['read'],
  //       channels: [
  //         {
  //           id: '*',
  //           name: '*',
  //           actions: ['write'],
  //           members: [
  //             {
  //               id: '*',
  //               name: '*',
  //               actions: ['write'],
  //               publication: {
  //                 actions: ['write']
  //               },
  //               subscription: {
  //                 actions: ['write']
  //               }
  //             }
  //           ],
  //           sfuBots: [
  //             {
  //               actions: ['write'],
  //               forwardings: [
  //                 {
  //                   actions: ['write']
  //                 }
  //               ]
  //             }
  //           ]
  //         }
  //       ]
  //     }
  //   }
  // }).encode('I9RB+1GpAkGZmD9aDFXoXnMUUGptysmB2uejF+jV9L4=');
//   52f48016-2c91-46be-829e-a3706d3070d2
// I9RB+1GpAkGZmD9aDFXoXnMUUGptysmB2uejF+jV9L4=


  let dataStream: LocalDataStream;
  let me:LocalP2PRoomMember;
  let myId:string;
  let myPublication:RoomPublication<LocalDataStream>;
  let subscriptions:{[key:string]:RoomSubscription<RemoteDataStream>} = {};
  onMount(()=>{
    const initialize = async () => {
      dataStream  = await SkyWayStreamFactory.createDataStream();

      const context = await SkyWayContext.Create(data.token);
      // create or get room
      const room = await SkyWayRoom.FindOrCreate(context,{
        type:'p2p',
        name: ROOM_NAME
      });

      myId = uuidV4()
      me = await room.join({
        name:myId
      });
      console.log('i am joining',me.id);

      // dataを配信
      myPublication = await me.publish(dataStream);
      
      // 現在参加/配信中のmemberをsubscribe
      room.publications.filter(p=>p.publisher.id !== me.id)
      .forEach(async p=>{
        console.log('already joined member',p.id);
        const remoteMember = await me.subscribe<RemoteDataStream>(p.id);
        subscriptions[p.id] = remoteMember.subscription;
        remoteMember.stream.onData.add((data)=>{
          console.log(data);
        });
      })

      // roomにだれか参加
      room.onMemberJoined.add(async (event)=>{
        // const isNewComer = subscribeMemberList.every(alreadyMember=>event.member.id !== alreadyMember);

        // if(isNewComer){
          console.log('join :',event.member.name);
          // const {subscription} = await (event.member as RemoteRoomMember).subscribe(publication.id);

        // }
      });

      // roomからだれかが離脱
      room.onMemberLeft.add((event) => {
        if(event.member.id === me.id) return;
        console.log('leave :',event.member.name);
        subscriptions[event.member.id]?.cancel();
      });

      // roomにだれかがpublishした
      room.onStreamPublished.add(async (event)=>{
        if(event.publication.id === me.id) return;

        const remoteMember = await me.subscribe<RemoteDataStream>(event.publication.id);
        subscriptions[event.publication.id] = remoteMember.subscription;
        
        remoteMember.stream.onData.add((data)=>{
          console.log(data);
          console.log((data as any).test);
          if((data as any).data){
            const blob = new Blob([((data as any).data as ArrayBuffer)],{type:'application/octet-stream'});
            const url = URL.createObjectURL(blob);
            console.log(url);
          }
        });

      });


    };
    initialize();
  });

  onDestroy(()=>{
    console.log('destory')
    // publishを停止
    myPublication?.cancel();
    // subscribeを停止
    Object.keys(subscriptions).forEach((key)=>{
      subscriptions[key].cancel();
    });
  })


  function sendJson() {
    if(dataStream)dataStream.write({test:'hoge'})
  }

  // Drag&Drop Handler
  document.addEventListener('dragover',(event)=>{
      event.preventDefault();
  });
  document.addEventListener('drop',async (event)=>{
      event.preventDefault();
      // read given file then convert it to blob url
      const files = event.dataTransfer?.files;
      if(!files || !files[0]) return;

      const blob = new Blob([files[0]],{type:"application/octet-stream"});
      if(dataStream)dataStream.write({test:'hoge',data:await blob.arrayBuffer()});
  });


</script>

<div class="bg-slate-50/25 dark:bg-slate-700/25">main!
  <button class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" on:click={sendJson}>json</button>
</div>
