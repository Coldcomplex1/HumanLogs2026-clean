import { Server as Engine } from "@socket.io/bun-engine";
import { Server } from "socket.io";
import { db, type Database } from "@repo/db";
import type { ClientToServerEvents, ServerToClientEvents } from "./ws.share";

class WsServer {
  public io: Server<ClientToServerEvents, ServerToClientEvents>;
  public engine: Engine;

  constructor(private readonly _db: Database) {
    this.io = new Server({
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.engine = new Engine({
      path: "/socket.io/",
    });

    this.io.bind(this.engine);

    this.io.on("connection", (socket) => {
      socket.on("disconnect", () => undefined);
    });
  }

  emitLocationModified() {
    this.io.emit("location:modified");
  }

  emitVictimModified() {
    this.io.emit("victim:modified");
  }

  emitMarkerModified() {
    this.io.emit("marker:modified");
  }

  emitVehicleModified() {
    this.io.emit("vehicle:modified");
  }

  emitRescuerModified() {
    this.io.emit("rescuer:modified");
  }

  emitRescuePlanModified() {
    this.io.emit("rescuePlan:modified");
  }

  emitRouteReportModified() {
    this.io.emit("routeReport:modified");
  }

  getHandler() {
    return this.engine.handler();
  }
}

export const wsServer = new WsServer(db);
export type { WsServer };

export const socketHandler = wsServer.getHandler();
export const io = wsServer.io;
