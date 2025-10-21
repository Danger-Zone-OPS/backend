import type { WebSocket } from "ws";

const clients = new Set<WebSocket>();

export function addClient(socket: WebSocket): void {
  clients.add(socket);
  console.log(`Client connected. Total clients: ${clients.size}`);

  socket.on("close", () => {
    clients.delete(socket);
    console.log(`Client disconnected. Total clients: ${clients.size}`);
  });
}

export function broadcast(message: unknown): void {
  const data = JSON.stringify(message);
  console.log(`Broadcasting to ${clients.size} clients:`, message);

  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
}

export interface BroadcastMessage {
  type: "create" | "update" | "delete";
  data: unknown;
}
