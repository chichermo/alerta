import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "/realtime",
})
export class RealtimeGateway {
  @WebSocketServer()
  server!: Server;

  broadcastIncidentUpdate(payload: unknown) {
    this.server.emit("incident_update", payload);
  }
}
