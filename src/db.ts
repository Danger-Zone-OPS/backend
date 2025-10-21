import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import type { Database, RiskArea } from "./types.js";

const DB_PATH = join(process.cwd(), "data", "db.json");

const initialDb: Database = {
  riskAreas: [],
};

async function ensureDbExists(): Promise<void> {
  const dir = dirname(DB_PATH);

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  if (!existsSync(DB_PATH)) {
    await writeFile(DB_PATH, JSON.stringify(initialDb, null, 2), "utf-8");
  }
}

export async function readDb(): Promise<Database> {
  await ensureDbExists();
  const data = await readFile(DB_PATH, "utf-8");
  return JSON.parse(data);
}

export async function writeDb(db: Database): Promise<void> {
  await ensureDbExists();
  await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export async function getAllRiskAreas(): Promise<RiskArea[]> {
  const db = await readDb();
  return db.riskAreas;
}

export async function getRiskAreaById(id: string): Promise<RiskArea | undefined> {
  const db = await readDb();
  return db.riskAreas.find((area) => area.id === id);
}

export async function createRiskArea(riskArea: RiskArea): Promise<RiskArea> {
  const db = await readDb();
  db.riskAreas.push(riskArea);
  await writeDb(db);
  return riskArea;
}

export async function updateRiskArea(id: string, updates: Partial<RiskArea>): Promise<RiskArea | undefined> {
  const db = await readDb();
  const index = db.riskAreas.findIndex((area) => area.id === id);

  if (index === -1) {
    return undefined;
  }

  db.riskAreas[index] = {
    ...db.riskAreas[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await writeDb(db);
  return db.riskAreas[index];
}

export async function deleteRiskArea(id: string): Promise<boolean> {
  const db = await readDb();
  const initialLength = db.riskAreas.length;
  db.riskAreas = db.riskAreas.filter((area) => area.id !== id);

  if (db.riskAreas.length === initialLength) {
    return false;
  }

  await writeDb(db);
  return true;
}
