import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { setupRoutes } from "./routes.js";
import { addClient } from "./websocket.js";

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

await fastify.register(websocket);

await setupRoutes(fastify);

fastify.get("/", async () => {
  return { message: "Danger Zone API - Online", version: "1.0.0" };
});

fastify.register(async function (fastify) {
  fastify.get("/ws", { websocket: true }, (socket) => {
    addClient(socket);

    socket.send(
      JSON.stringify({
        type: "connection",
        message: "Connected to Danger Zone real-time updates",
      })
    );
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
