"use client";

export default function AlertPanel({
  alerts,
}: {
  alerts: Array<{ incident: { title: string; type: string }; prediction: { risk: string } }>;
}) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
      <div className="mb-2 font-semibold text-amber-900">Alertas activas</div>
      <div className="space-y-2">
        {alerts.map((alert, index) => (
          <div key={`${alert.incident.title}-${index}`}>
            <span className="font-medium">{alert.incident.title}</span>{" "}
            <span className="text-amber-800">
              ({alert.incident.type}) · riesgo {alert.prediction.risk}
            </span>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="text-amber-700">Sin alertas de alta prioridad.</div>
        )}
      </div>
    </div>
  );
}
