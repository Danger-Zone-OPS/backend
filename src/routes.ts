import type { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";
import type {
  CreateRiskAreaInput,
  UpdateRiskAreaInput,
  RiskArea,
} from "./types.js";
import * as db from "./db.js";
import { broadcast } from "./websocket.js";

export async function setupRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get("/api/risk-areas", async () => {
    const riskAreas = await db.getAllRiskAreas();
    return { data: riskAreas };
  });

  fastify.get<{ Params: { id: string } }>(
    "/api/risk-areas/:id",
    async (request, reply) => {
      const { id } = request.params;
      const riskArea = await db.getRiskAreaById(id);

      if (!riskArea) {
        reply.code(404);
        return { error: "Risk area not found" };
      }

      return { data: riskArea };
    }
  );

  fastify.post<{ Body: CreateRiskAreaInput }>(
    "/api/risk-areas",
    async (request, reply) => {
      const { title, description, severity, coordinates } = request.body;

      if (!title || !description || !severity || !coordinates) {
        reply.code(400);
        return {
          error:
            "Missing required fields: title, description, severity, coordinates",
        };
      }

      if (!["low", "medium", "high", "critical"].includes(severity)) {
        reply.code(400);
        return {
          error:
            "Invalid severity level. Must be one of: low, medium, high, critical",
        };
      }

      if (!Array.isArray(coordinates) || coordinates.length === 0) {
        reply.code(400);
        return { error: "Coordinates must be a non-empty array" };
      }

      const now = new Date().toISOString();
      const newRiskArea: RiskArea = {
        id: randomUUID(),
        title,
        description,
        severity,
        coordinates,
        createdAt: now,
        updatedAt: now,
      };

      await db.createRiskArea(newRiskArea);

      broadcast({
        type: "create",
        data: newRiskArea,
      });

      reply.code(201);
      return { data: newRiskArea };
    }
  );

  fastify.put<{ Params: { id: string }; Body: UpdateRiskAreaInput }>(
    "/api/risk-areas/:id",
    async (request, reply) => {
      const { id } = request.params;
      const updates = request.body;

      if (Object.keys(updates).length === 0) {
        reply.code(400);
        return { error: "No update fields provided" };
      }

      if (
        updates.severity &&
        !["low", "medium", "high", "critical"].includes(updates.severity)
      ) {
        reply.code(400);
        return {
          error:
            "Invalid severity level. Must be one of: low, medium, high, critical",
        };
      }

      const updatedRiskArea = await db.updateRiskArea(id, updates);

      if (!updatedRiskArea) {
        reply.code(404);
        return { error: "Risk area not found" };
      }

      broadcast({
        type: "update",
        data: updatedRiskArea,
      });

      return { data: updatedRiskArea };
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    "/api/risk-areas/:id",
    async (request, reply) => {
      const { id } = request.params;
      const deleted = await db.deleteRiskArea(id);

      if (!deleted) {
        reply.code(404);
        return { error: "Risk area not found" };
      }

      broadcast({
        type: "delete",
        data: { id },
      });

      return { data: { id, deleted: true } };
    }
  );
}
