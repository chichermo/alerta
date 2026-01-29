"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [showReport, setShowReport] = useState(false);
  const [neighborhood, setNeighborhood] = useState<{
    enabled: boolean;
    center: { lat: number; lng: number } | null;
  }>({ enabled: false, center: null });
  const neighborhoodRadiusKm = 3;
  const [activeSection, setActiveSection] = useState("mapa");
  const [mapStyle, setMapStyle] = useState<"light" | "dark">("light");
  const [showLabels, setShowLabels] = useState(true);
  const [intensityMode, setIntensityMode] = useState(true);

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

  useEffect(() => {
    const stored = window.localStorage.getItem("alerta-neighborhood");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          enabled: boolean;
          center: { lat: number; lng: number } | null;
        };
        if (parsed.center) {
          setNeighborhood(parsed);
        }
      } catch {
        window.localStorage.removeItem("alerta-neighborhood");
      }
    }
  }, []);

  useEffect(() => {
    const sections = [
      "mapa",
      "indicadores",
      "timeline",
      "reportes",
    ].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0.1 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  function toRad(value: number) {
    return (value * Math.PI) / 180;
  }

  function distanceKm(
    a: { lat: number; lng: number },
    b: { lat: number; lng: number }
  ) {
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLng / 2) *
        Math.sin(dLng / 2) *
        Math.cos(lat1) *
        Math.cos(lat2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  async function handleToggleNeighborhood() {
    if (neighborhood.enabled) {
      const next = { enabled: false, center: null };
      setNeighborhood(next);
      window.localStorage.removeItem("alerta-neighborhood");
      return;
    }
    if (!navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const center = {
          lat: Number(position.coords.latitude.toFixed(5)),
          lng: Number(position.coords.longitude.toFixed(5)),
        };
        const next = { enabled: true, center };
        setNeighborhood(next);
        window.localStorage.setItem(
          "alerta-neighborhood",
          JSON.stringify(next)
        );
      },
      () => {
        setNeighborhood({ enabled: false, center: null });
      }
    );
  }

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

  const visibleIncidents = useMemo(() => {
    if (!neighborhood.enabled || !neighborhood.center) return filteredIncidents;
    return filteredIncidents.filter(
      (incident) =>
        distanceKm(neighborhood.center!, incident.location) <=
        neighborhoodRadiusKm
    );
  }, [filteredIncidents, neighborhood]);

  const timeline = [...visibleIncidents]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 8);

  function insightText(incident: Incident) {
    if (incident.confidence === "confirmado") {
      return "Confirmado por fuente oficial o múltiples señales.";
    }
    if (incident.reportsCount >= 3) {
      return "Validado por reportes cercanos recientes.";
    }
    if (incident.type === "incendio") {
      return "Riesgo elevado en temporada de calor.";
    }
    return "En observación, esperando más señales.";
  }

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
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-8 pb-28">
        <header className="flex flex-wrap items-center justify-between gap-4 fade-up">
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
            <span className="badge-glow rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200">
              Realtime activo
            </span>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div
            id="mapa"
            className="section-anchor rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-900/40 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-2xl fade-up delay-1"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Mapa en vivo</h2>
                <p className="text-sm text-slate-300">
                  Seguimiento en tiempo casi real con filtros dinámicos.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                  {visibleIncidents.length} en vista
                </span>
                <button
                  type="button"
                  onClick={handleToggleNeighborhood}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    neighborhood.enabled
                      ? "bg-emerald-400 text-slate-900"
                      : "bg-white/10 text-slate-200 hover:bg-white/20"
                  }`}
                >
                  {neighborhood.enabled ? "Mi barrio activo" : "Activar Mi barrio"}
                </button>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  Tipo de alerta
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, type: "all" })}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      filters.type === "all"
                        ? "bg-white text-slate-900"
                        : "bg-white/10 text-slate-200 hover:bg-white/20"
                    }`}
                  >
                    Todos
                  </button>
                  {incidentTypes.map((type) => (
                    <button
                      type="button"
                      key={type.value}
                      onClick={() => setFilters({ ...filters, type: type.value })}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        filters.type === type.value
                          ? "bg-white text-slate-900"
                          : "bg-white/10 text-slate-200 hover:bg-white/20"
                      }`}
                    >
                      <span className="mr-1">{type.emoji}</span>
                      {type.shortLabel || type.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  Nivel de confianza
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, confidence: "all" })}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      filters.confidence === "all"
                        ? "bg-white text-slate-900"
                        : "bg-white/10 text-slate-200 hover:bg-white/20"
                    }`}
                  >
                    Todos
                  </button>
                  {Object.entries(confidenceMeta).map(([key, meta]) => (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setFilters({ ...filters, confidence: key })}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        filters.confidence === key
                          ? "bg-white text-slate-900"
                          : "bg-white/10 text-slate-200 hover:bg-white/20"
                      }`}
                    >
                      {meta.shortLabel}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  Buscar
                </div>
                <div className="flex-1">
                  <input
                    placeholder="Nombre del incidente, comuna, zona..."
                    className="w-full rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-xs text-slate-100 placeholder:text-slate-500"
                    value={filters.search}
                    onChange={(event) =>
                      setFilters({ ...filters, search: event.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  Capas del mapa
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setMapStyle(mapStyle === "light" ? "dark" : "light")
                    }
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      mapStyle === "dark"
                        ? "bg-slate-100 text-slate-900"
                        : "bg-white/10 text-slate-200 hover:bg-white/20"
                    }`}
                  >
                    {mapStyle === "dark" ? "Modo oscuro" : "Modo claro"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLabels((prev) => !prev)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      showLabels
                        ? "bg-slate-100 text-slate-900"
                        : "bg-white/10 text-slate-200 hover:bg-white/20"
                    }`}
                  >
                    {showLabels ? "Etiquetas on" : "Etiquetas off"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIntensityMode((prev) => !prev)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      intensityMode
                        ? "bg-slate-100 text-slate-900"
                        : "bg-white/10 text-slate-200 hover:bg-white/20"
                    }`}
                  >
                    {intensityMode ? "Intensidad on" : "Intensidad off"}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-5 h-[520px] glass-panel floaty transition-all duration-300 ease-out">
              <MapView
                incidents={visibleIncidents}
                mapStyle={mapStyle}
                showLabels={showLabels}
                intensityMode={intensityMode}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="text-slate-400">Leyenda:</span>
              {incidentTypes.map((type) => (
                <span
                  key={type.value}
                  className="rounded-full bg-white/10 px-2 py-1"
                >
                  <span className="mr-1">{type.emoji}</span>
                  {type.label}
                </span>
              ))}
              {neighborhood.enabled && neighborhood.center && (
                <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-200">
                  Mi barrio · {neighborhoodRadiusKm} km
                </span>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4">
              <div
                id="indicadores"
                className="section-anchor rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg fade-up delay-2"
              >
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
            <div
              id="timeline"
              className="section-anchor rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg fade-up delay-3"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Timeline inteligente
              </div>
              <div className="mt-3 space-y-3">
                {timeline.map((incident) => (
                  <div
                    key={incident.id}
                    className={`rounded-xl border border-white/10 bg-gradient-to-r ${incidentTypes.find((type) => type.value === incident.type)?.gradientClass || "from-white/10 via-transparent to-transparent"} p-3`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{incident.title}</div>
                      <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-slate-300">
                        {new Date(incident.updatedAt).toLocaleTimeString("es-CL", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="rounded-full bg-white/10 px-2 py-1">
                        {incidentTypes.find((type) => type.value === incident.type)
                          ?.emoji}{" "}
                        {incidentTypes.find((type) => type.value === incident.type)
                          ?.label}
                      </span>
                      <span className="rounded-full bg-white/10 px-2 py-1">
                        {confidenceMeta[incident.confidence]?.shortLabel ||
                          incident.confidence}
                      </span>
                      <span>{incident.reportsCount} reportes</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      {insightText(incident)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div id="reportes" className="section-anchor space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg fade-up delay-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Reportes ciudadanos
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  Reporta en segundos y fortalece la verificación comunitaria.
                </p>
              </div>
              <IncidentList incidents={visibleIncidents} />
            </div>
          </div>
        </section>
      </div>
      <button
        type="button"
        onClick={() => setShowReport(true)}
        className="fixed bottom-24 right-6 z-40 flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-xl shadow-emerald-400/40 pulse-glow"
      >
        + Reportar
      </button>
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-white p-5 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Reporte rápido
                </div>
                <div className="text-lg font-semibold">
                  Comparte un incidente en segundos
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReport(false)}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 text-xs text-slate-500">
                Información protegida · No expongas datos personales.
              </div>
              <ReportForm
                onCreated={() => {
                  refreshData();
                  setShowReport(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
      <nav className="fixed bottom-4 left-0 right-0 z-30">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-around rounded-full border border-white/10 bg-slate-950/80 px-6 py-3 text-xs text-slate-300 shadow-2xl shadow-slate-950/60 backdrop-blur">
          <a
            href="#mapa"
            className={`flex flex-col items-center gap-1 ${
              activeSection === "mapa"
                ? "text-emerald-200"
                : "text-slate-300"
            }`}
          >
            <span className="text-lg">🗺️</span>
            <span className={`rounded-full px-3 py-1 ${activeSection === "mapa" ? "bg-emerald-500/20" : ""}`}>Mapa</span>
          </a>
          <a
            href="#indicadores"
            className={`flex flex-col items-center gap-1 ${
              activeSection === "indicadores"
                ? "text-emerald-200"
                : "text-slate-300"
            }`}
          >
            <span className="text-lg">📊</span>
            <span className={`rounded-full px-3 py-1 ${activeSection === "indicadores" ? "bg-emerald-500/20" : ""}`}>Indicadores</span>
          </a>
          <a
            href="#timeline"
            className={`flex flex-col items-center gap-1 ${
              activeSection === "timeline"
                ? "text-emerald-200"
                : "text-slate-300"
            }`}
          >
            <span className="text-lg">⏱️</span>
            <span className={`rounded-full px-3 py-1 ${activeSection === "timeline" ? "bg-emerald-500/20" : ""}`}>Timeline</span>
          </a>
          <a
            href="#reportes"
            className={`flex flex-col items-center gap-1 ${
              activeSection === "reportes"
                ? "text-emerald-200"
                : "text-slate-300"
            }`}
          >
            <span className="text-lg">🧾</span>
            <span className={`rounded-full px-3 py-1 ${activeSection === "reportes" ? "bg-emerald-500/20" : ""}`}>Reportes</span>
          </a>
        </div>
      </nav>
    </main>
  );
}
