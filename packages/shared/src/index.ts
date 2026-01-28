export type IncidentType =
  | "corte_luz"
  | "corte_agua"
  | "incendio"
  | "transporte"
  | "protesta"
  | "clima"
  | "otro";

export type ConfidenceLevel =
  | "confirmado"
  | "alta_probabilidad"
  | "observacion"
  | "descartado";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Incident {
  id: string;
  title: string;
  type: IncidentType;
  confidence: ConfidenceLevel;
  location: GeoPoint;
  createdAt: string;
  updatedAt: string;
  reportsCount: number;
  source: "ciudadano" | "oficial" | "social";
}

export interface ReportPayload {
  type: IncidentType;
  title: string;
  description?: string;
  location: GeoPoint;
  evidenceUrl?: string;
}
