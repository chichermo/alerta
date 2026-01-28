"use client";

import { Incident } from "@alerta/shared";

const badgeStyles: Record<string, string> = {
  confirmado: "bg-emerald-100 text-emerald-700",
  alta_probabilidad: "bg-amber-100 text-amber-700",
  observacion: "bg-slate-100 text-slate-600",
  descartado: "bg-rose-100 text-rose-700",
};

export default function IncidentList({ incidents }: { incidents: Incident[] }) {
  return (
    <div className="space-y-3">
      {incidents.map((incident) => (
        <div
          key={incident.id}
          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="font-semibold">{incident.title}</div>
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                badgeStyles[incident.confidence] || "bg-slate-100 text-slate-600"
              }`}
            >
              {incident.confidence}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {incident.type} · {incident.reportsCount} reportes
          </div>
        </div>
      ))}
    </div>
  );
}
