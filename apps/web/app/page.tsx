"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Incident } from "@alerta/shared";
import dynamic from "next/dynamic";
import AlertPanel from "../components/AlertPanel";
import IncidentList from "../components/IncidentList";
import ReportForm from "../components/ReportForm";
import { API_URL, fetchAlerts, fetchIncidents, realtimeEnabled } from "../lib/api";

const MapView = dynamic(() => import("../components/MapView"), { ssr: false });

export default function HomePage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  async function refreshData() {
    try {
      const [incidentsData, alertsData] = await Promise.all([
        fetchIncidents(),
        fetchAlerts(),
      ]);
      setIncidents(incidentsData);
      setAlerts(alertsData);
    } catch {
      setIncidents([]);
      setAlerts([]);
    }
  }

  useEffect(() => {
    refreshData();
    if (!realtimeEnabled) {
      const interval = setInterval(() => {
        refreshData();
      }, 20000);
      return () => clearInterval(interval);
    }
    const socket = io(`${API_URL}/realtime`);
    socket.on("incident_update", (incident: Incident) => {
      setIncidents((prev) => {
        const existing = prev.find((item) => item.id === incident.id);
        if (existing) {
          return prev.map((item) => (item.id === incident.id ? incident : item));
        }
        return [incident, ...prev];
      });
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alerta Pública – Chile</h1>
          <p className="text-sm text-slate-600">
            Radar ciudadano inteligente de incidentes críticos
          </p>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">
          MVP
        </span>
      </header>

      <AlertPanel alerts={alerts} />

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="h-[520px]">
          <MapView incidents={incidents} />
        </div>
        <div className="space-y-6">
          <ReportForm onCreated={refreshData} />
          <IncidentList incidents={incidents} />
        </div>
      </section>
    </main>
  );
}
