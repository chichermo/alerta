import { supabase, supabaseEnabled } from "./supabase";
import { Incident } from "@alerta/shared";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const realtimeEnabled = !supabaseEnabled;

export function subscribeToIncidents(onChange: () => void) {
  if (!supabaseEnabled || !supabase) {
    return () => undefined;
  }

  const channel = supabase
    .channel("incidents_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "incidents" },
      () => onChange()
    )
    .subscribe();

  return () => {
    if (supabase) {
      void supabase.removeChannel(channel);
    }
  };
}

type IncidentRow = {
  id: string;
  title: string;
  type: string;
  confidence: string;
  lat: number;
  lng: number;
  created_at: string;
  updated_at: string;
  reports_count: number;
  source: string;
};

function mapIncidentRow(row: IncidentRow): Incident {
  return {
    id: row.id,
    title: row.title,
    type: row.type as Incident["type"],
    confidence: row.confidence as Incident["confidence"],
    location: { lat: row.lat, lng: row.lng },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reportsCount: row.reports_count,
    source: row.source as Incident["source"],
  };
}

function deriveRisk(type: string) {
  if (type === "incendio" || type === "clima") return "alto";
  if (type === "transporte" || type === "protesta") return "medio";
  return "bajo";
}

export async function fetchIncidents() {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase
      .from("incidents")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error || !data) return [];
    return data.map(mapIncidentRow);
  }
  const response = await fetch(`${API_URL}/incidents`, { cache: "no-store" });
  if (!response.ok) return [];
  return response.json();
}

export async function createReport(payload: {
  title: string;
  type: string;
  description?: string;
  location: { lat: number; lng: number };
  evidenceUrl?: string;
}) {
  if (supabaseEnabled && supabase) {
    const { data: report, error } = await supabase.from("reports").insert([
      {
        title: payload.title,
        type: payload.type,
        description: payload.description,
        lat: payload.location.lat,
        lng: payload.location.lng,
        evidence_url: payload.evidenceUrl,
        source: "ciudadano",
      },
    ]);
    if (error) {
      throw new Error("No se pudo crear el reporte");
    }

    const radius = 0.009;
    const { data: existing } = await supabase
      .from("incidents")
      .select("*")
      .eq("type", payload.type)
      .gte("lat", payload.location.lat - radius)
      .lte("lat", payload.location.lat + radius)
      .gte("lng", payload.location.lng - radius)
      .lte("lng", payload.location.lng + radius)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (existing && existing.length > 0) {
      const current = existing[0] as IncidentRow;
      const reportsCount = (current.reports_count || 1) + 1;
      const confidence =
        reportsCount >= 3 ? "alta_probabilidad" : "observacion";
      const { data: updated } = await supabase
        .from("incidents")
        .update({
          reports_count: reportsCount,
          confidence,
          updated_at: new Date().toISOString(),
        })
        .eq("id", current.id)
        .select("*")
        .single();
      return {
        report,
        incident: updated ? mapIncidentRow(updated as IncidentRow) : current,
        prediction: { risk: deriveRisk(payload.type), confidence: 0.6 },
      };
    }

    const { data: incident } = await supabase
      .from("incidents")
      .insert([
        {
          title: payload.title,
          type: payload.type,
          confidence: "observacion",
          lat: payload.location.lat,
          lng: payload.location.lng,
          reports_count: 1,
          source: "ciudadano",
        },
      ])
      .select("*")
      .single();

    return {
      report,
      incident: incident ? mapIncidentRow(incident as IncidentRow) : null,
      prediction: { risk: deriveRisk(payload.type), confidence: 0.6 },
    };
  }
  const response = await fetch(`${API_URL}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("No se pudo crear el reporte");
  }
  return response.json();
}

export async function fetchAlerts() {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase
      .from("incidents")
      .select("*")
      .eq("confidence", "alta_probabilidad")
      .order("updated_at", { ascending: false });
    if (error || !data) return [];
    return data.map((row) => ({
      incident: mapIncidentRow(row as IncidentRow),
      prediction: { risk: deriveRisk(row.type), confidence: 0.6 },
    }));
  }
  const response = await fetch(`${API_URL}/alerts`, { cache: "no-store" });
  if (!response.ok) return [];
  return response.json();
}
