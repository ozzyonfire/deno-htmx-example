import { upgradeWebSocket } from "@hono/hono/deno";
import { WSContext } from "@hono/hono/ws";
const sockets: Set<WSContext> = new Set();

export async function fileWatcher() {
  const watcher = Deno.watchFs("./");
  for await (const event of watcher) {
    if (["any", "access"].includes(event.kind)) {
      continue;
    }

    // Trigger browser refresh
    for (const ws of sockets) {
      ws.send("refresh");
    }
  }
}

export const watchHandler = upgradeWebSocket(() => {
  return {
    onOpen(_e, ws) {
      sockets.add(ws);
    },
    onClose(_e, ws) {
      sockets.delete(ws);
    },
  };
});

fileWatcher();
