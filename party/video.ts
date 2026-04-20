import type * as Party from "partykit/server";

type Conn = Party.Connection<{ userId?: string; username?: string; name?: string; guest?: boolean }>;

export default class VideoRoomServer implements Party.Server {
  options: Party.ServerOptions = { hibernate: true };
  constructor(readonly room: Party.Room) {}

  async onConnect(conn: Conn, ctx: Party.ConnectionContext) {
    const url = new URL(ctx.request.url);
    conn.setState({
      userId: url.searchParams.get("userId") ?? undefined,
      username: url.searchParams.get("username") ?? undefined,
      name: url.searchParams.get("name") ?? undefined,
      guest: url.searchParams.get("guest") === "1"
    });
    this.broadcastPresence();
  }

  onClose(_conn: Conn) {
    this.broadcastPresence();
  }

  async onMessage(message: string, sender: Conn) {
    try {
      const msg = JSON.parse(message);
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "comment" && msg.comment) {
        const out = JSON.stringify({ type: "comment", comment: msg.comment });
        for (const c of this.room.getConnections()) {
          if (c.id !== sender.id) c.send(out);
        }
      } else if (msg.type === "typing") {
        const out = JSON.stringify({
          type: "typing",
          userId: sender.state?.userId ?? null,
          username: sender.state?.username ?? "guest"
        });
        for (const c of this.room.getConnections()) {
          if (c.id !== sender.id) c.send(out);
        }
      } else if (msg.type === "reaction") {
        const out = JSON.stringify({ type: "reaction", kind: msg.kind ?? "heart" });
        for (const c of this.room.getConnections()) c.send(out);
      }
    } catch {
      /* ignore malformed */
    }
  }

  private broadcastPresence() {
    const count = [...this.room.getConnections()].length;
    const out = JSON.stringify({ type: "presence", count });
    for (const c of this.room.getConnections()) c.send(out);
  }
}

VideoRoomServer satisfies Party.Worker;
