"use client";

export default function AlertPanel({
  alerts,
}: {
  alerts: Array<{ incident: { title: string; type: string }; prediction: { risk: string } }>;
}) {
  return (
    <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-lg shadow-amber-100/60">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800/80">
            Alertas activas
          </div>
          <div className="text-lg font-semibold text-amber-900">
            {alerts.length > 0
              ? `${alerts.length} evento(s) con alta probabilidad`
              : "Sin alertas de alta prioridad"}
          </div>
        </div>
        <div className="rounded-full bg-amber-200/60 px-4 py-2 text-xs font-semibold text-amber-900">
          Nivel crítico
        </div>
      </div>
      <div className="mt-4 space-y-3 text-sm">
        {alerts.map((alert, index) => (
          <div
            key={`${alert.incident.title}-${index}`}
            className="flex items-center justify-between rounded-xl border border-amber-200/60 bg-white/70 px-4 py-3"
          >
            <div>
              <div className="font-semibold text-amber-900">
                {alert.incident.title}
              </div>
              <div className="text-xs text-amber-700">
                {alert.incident.type}
              </div>
            </div>
            <span className="rounded-full bg-amber-900 px-3 py-1 text-xs font-semibold text-white">
              riesgo {alert.prediction.risk}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
