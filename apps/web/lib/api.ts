export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function fetchIncidents() {
  const response = await fetch(`${API_URL}/incidents`, { cache: "no-store" });
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export async function createReport(payload: {
  title: string;
  type: string;
  description?: string;
  location: { lat: number; lng: number };
  evidenceUrl?: string;
}) {
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
  const response = await fetch(`${API_URL}/alerts`, { cache: "no-store" });
  if (!response.ok) {
    return [];
  }
  return response.json();
}
