"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Incident } from "@alerta/shared";
import dynamic from "next/dynamic";
import AlertPanel from "../components/AlertPanel";
import IncidentList from "../components/IncidentList";
import ReportForm from "../components/ReportForm";
import { confidenceMeta, incidentTypes } from "../lib/incident-meta";
import {
  API_URL,
  fetchAlerts,
  fetchIncidents,
  realtimeEnabled,
  subscribeToIncidents,
} from "../lib/api";
import { supabaseEnabled } from "../lib/supabase";

const MapView = dynamic(() => import("../components/MapView"), { ssr: false });

export default function HomePage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    type: "all",
    confidence: "all",
    search: "",
  });

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
    if (supabaseEnabled) {
      const unsubscribe = subscribeToIncidents(() => {
        refreshData();
      });
      return () => unsubscribe();
    }
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

  const filteredIncidents = incidents.filter((incident) => {
    if (filters.type !== "all" && incident.type !== filters.type) {
      return false;
    }
    if (
      filters.confidence !== "all" &&
      incident.confidence !== filters.confidence
    ) {
      return false;
    }
    if (
      filters.search &&
      !incident.title.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalReports = incidents.reduce(
    (total, incident) => total + incident.reportsCount,
    0
  );
  const confirmed = incidents.filter(
    (incident) => incident.confidence === "confirmado"
  ).length;
  const highProbability = incidents.filter(
    (incident) => incident.confidence === "alta_probabilidad"
  ).length;

  return (
    <main className="min-h-screen bg-slate-950/95 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Plataforma ciudadana
            </div>
            <h1 className="text-3xl font-semibold">Alerta Pública – Chile</h1>
            <p className="max-w-xl text-sm text-slate-300">
              Radar inteligente de incidentes críticos con validación y
              predicción. Datos ciudadanos + fuentes oficiales.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-white/80">
              MVP avanzado
            </span>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200">
              Realtime activo
            </span>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-900/40">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Mapa en vivo</h2>
                <p className="text-sm text-slate-300">
                  Seguimiento en tiempo casi real con filtros dinámicos.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <select
                  className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1"
                  value={filters.type}
                  onChange={(event) =>
                    setFilters({ ...filters, type: event.target.value })
                  }
                >
                  <option value="all">Todos los tipos</option>
                  {incidentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1"
                  value={filters.confidence}
                  onChange={(event) =>
                    setFilters({ ...filters, confidence: event.target.value })
                  }
                >
                  <option value="all">Todos los niveles</option>
                  {Object.entries(confidenceMeta).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Buscar..."
                  className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-xs"
                  value={filters.search}
                  onChange={(event) =>
                    setFilters({ ...filters, search: event.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-5 h-[520px]">
              <MapView incidents={filteredIncidents} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="text-slate-400">Leyenda:</span>
              {incidentTypes.map((type) => (
                <span
                  key={type.value}
                  className="rounded-full bg-white/10 px-2 py-1"
                >
                  {type.label}
                </span>
              ))}
              <span className="ml-auto text-slate-400">
                {filteredIncidents.length} eventos en vista
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Indicadores
                </div>
                <div className="mt-3 grid gap-3">
                  <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                    <span className="text-sm text-slate-200">Incidentes activos</span>
                    <span className="text-lg font-semibold">{incidents.length}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                    <span className="text-sm text-slate-200">Reportes recibidos</span>
                    <span className="text-lg font-semibold">{totalReports}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                    <span className="text-sm text-slate-200">Confirmados</span>
                    <span className="text-lg font-semibold">{confirmed}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                    <span className="text-sm text-slate-200">Alta prob.</span>
                    <span className="text-lg font-semibold">{highProbability}</span>
                  </div>
                </div>
              </div>
              <AlertPanel alerts={alerts} />
            </div>
            <ReportForm onCreated={refreshData} />
            <IncidentList incidents={filteredIncidents} />
          </div>
        </section>
      </div>
    </main>
  );
}
