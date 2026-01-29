"use client";

import { Incident } from "@alerta/shared";
import { confidenceMeta, getTypeMeta } from "../lib/incident-meta";

function formatRelativeTime(date: string) {
  const now = Date.now();
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return "recién";
  const diff = Math.max(0, now - time);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "recién";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export default function IncidentList({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
        Sin incidentes recientes.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident) => {
        const typeMeta = getTypeMeta(incident.type);
        const confidence = confidenceMeta[incident.confidence] || {
          label: incident.confidence,
          className: "bg-slate-100 text-slate-600",
        };
        return (
          <div
            key={incident.id}
            className={`rounded-2xl border border-slate-200 bg-gradient-to-r ${typeMeta.gradientClass} p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {incident.title}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className={`rounded-full px-2 py-1 ${typeMeta.chipClass}`}>
                    {typeMeta.label}
                  </span>
                  <span>{incident.reportsCount} reportes</span>
                  <span>{formatRelativeTime(incident.updatedAt)}</span>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${confidence.className}`}
              >
                {confidence.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
