import { nowInSec, SkyWayAuthToken, uuidV4 } from '@skyway-sdk/room';

// TODO: push前に戻す！！
const ROOM_NAME = import.meta.env.VITE_SKYWAY_ROOM_NAME;
const PROJECT_ID = import.meta.env.VITE_SKYWAY_PROJECT_ID;
const SKYWAY_SECRET = import.meta.env.VITE_SKYWAY_SECRET;

export function getSkyWayToken() {
  return new SkyWayAuthToken({
    jti: uuidV4(),
    iat: nowInSec(),
    exp: nowInSec() + 60 * 60 * 24,
    scope: {
      app: {
        id: PROJECT_ID,
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
  }).encode(SKYWAY_SECRET);
}

export function getRoomType(): { type: 'p2p'; name: string } {
  return {
    type: 'p2p',
    name: ROOM_NAME
  };
}