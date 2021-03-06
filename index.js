import { serve } from 'https://deno.land/std@0.102.0/http/server.ts';
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
} from 'https://deno.land/std@0.102.0/ws/mod.ts';

const clients = new Set();

async function handleWs(sock) {
  console.log('socket connected!');
  clients.add(sock);

  try {
    for await (const ev of sock) {
      if (typeof ev === 'string') {
        // text message.
        console.log('ws:Text', ev);

        await Promise.all(
          Array.from(clients.values()).map((c) => {
            if (c !== sock) {
              return c.send(ev);
            }

            return Promise.resolve();
          })
        );
      } else if (ev instanceof Uint8Array) {
        // binary message.
        console.log('ws:Binary', ev);
      } else if (isWebSocketPingEvent(ev)) {
        const [, body] = ev;
        // ping.
        console.log('ws:Ping', body);
      } else if (isWebSocketCloseEvent(ev)) {
        // close.
        const { code, reason } = ev;
        console.log('ws:Close', code, reason);
        clients.delete(sock);
      }
    }
  } catch (err) {
    console.error(`failed to receive frame: ${err}`);

    if (!sock.isClosed) {
      await sock.close(1000).catch(console.error);
    }
  }
}

if (import.meta.main) {
  /** websocket echo server */
  const port = Deno.args[0] || '9456';
  console.log(`websocket server is running on :${port}`);
  for await (const req of serve(`:${port}`)) {
    const { conn, r: bufReader, w: bufWriter, headers } = req;
    acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    })
      .then(handleWs)
      .catch(async (err) => {
        console.error(`failed to accept websocket: ${err}`);

        await req.respond({ status: 400 });
      });
  }
}
