import "dotenv/config";
import Fastify from "fastify";
import websocket from "@fastify/websocket";
import type { RawData } from "ws";

const fastify = Fastify({
  logger: true,
});

await fastify.register(websocket);

fastify.get("/", async () => {
  return { message: "Hello from Fastify!" };
});

fastify.register(async function (fastify) {
  fastify.get("/ws", { websocket: true }, (socket) => {
    socket.on("message", (message: RawData) => {
      // Echo the message back
      const data = message.toString();
      fastify.log.info(`Received: ${data}`);
      socket.send(`Echo: ${data}`);
    });

    socket.on("close", () => {
      fastify.log.info("Client disconnected");
    });

    socket.send("WebSocket connection established!");
  });
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const host = process.env.HOST || "0.0.0.0";

    await fastify.listen({ port, host });
    console.log(`Server listening on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
