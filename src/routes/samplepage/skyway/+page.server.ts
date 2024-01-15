import {
  SkyWayAuthToken,
  nowInSec,
  uuidV4,
} from '@skyway-sdk/room';

export function load() {
  const token = new SkyWayAuthToken({
    jti: uuidV4(),
    iat: nowInSec(),
    exp: nowInSec() + 60 * 60 * 24,
    scope: {
      app: {
        id: '52f48016-2c91-46be-829e-a3706d3070d2',
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
  }).encode('I9RB+1GpAkGZmD9aDFXoXnMUUGptysmB2uejF+jV9L4=');
  //   52f48016-2c91-46be-829e-a3706d3070d2
  // I9RB+1GpAkGZmD9aDFXoXnMUUGptysmB2uejF+jV9L4=

  return {token};
}
