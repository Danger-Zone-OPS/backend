export type SeverityLevel = "low" | "medium" | "high" | "critical";

export type Coordinate = [number, number];

export interface RiskArea {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  coordinates: Coordinate[];
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  riskAreas: RiskArea[];
}

export interface CreateRiskAreaInput {
  title: string;
  description: string;
  severity: SeverityLevel;
  coordinates: Coordinate[];
}

export interface UpdateRiskAreaInput {
  title?: string;
  description?: string;
  severity?: SeverityLevel;
  coordinates?: Coordinate[];
}
