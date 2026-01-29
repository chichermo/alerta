export type IncidentTypeValue =
  | "corte_luz"
  | "corte_agua"
  | "incendio"
  | "transporte"
  | "protesta"
  | "clima"
  | "otro";

export const incidentTypes: Array<{
  value: IncidentTypeValue;
  label: string;
  shortLabel?: string;
  emoji: string;
  mapColor: string;
  chipClass: string;
}> = [
  {
    value: "corte_luz",
    label: "Corte de luz",
    shortLabel: "Luz",
    emoji: "💡",
    mapColor: "#ef4444",
    chipClass: "bg-rose-100 text-rose-700",
  },
  {
    value: "corte_agua",
    label: "Corte de agua",
    shortLabel: "Agua",
    emoji: "💧",
    mapColor: "#0ea5e9",
    chipClass: "bg-sky-100 text-sky-700",
  },
  {
    value: "incendio",
    label: "Incendio",
    emoji: "🔥",
    mapColor: "#f97316",
    chipClass: "bg-orange-100 text-orange-700",
  },
  {
    value: "transporte",
    label: "Transporte",
    emoji: "🚇",
    mapColor: "#6366f1",
    chipClass: "bg-indigo-100 text-indigo-700",
  },
  {
    value: "protesta",
    label: "Protesta",
    emoji: "📢",
    mapColor: "#a855f7",
    chipClass: "bg-purple-100 text-purple-700",
  },
  {
    value: "clima",
    label: "Clima extremo",
    shortLabel: "Clima",
    emoji: "🌧️",
    mapColor: "#14b8a6",
    chipClass: "bg-teal-100 text-teal-700",
  },
  {
    value: "otro",
    label: "Otro",
    emoji: "📍",
    mapColor: "#64748b",
    chipClass: "bg-slate-100 text-slate-700",
  },
];

export const confidenceMeta: Record<
  string,
  { label: string; shortLabel: string; className: string }
> = {
  confirmado: {
    label: "Confirmado",
    shortLabel: "Confirmado",
    className: "bg-emerald-100 text-emerald-700",
  },
  alta_probabilidad: {
    label: "Alta prob.",
    shortLabel: "Alta prob.",
    className: "bg-amber-100 text-amber-700",
  },
  observacion: {
    label: "En observación",
    shortLabel: "Observación",
    className: "bg-slate-100 text-slate-600",
  },
  descartado: {
    label: "Descartado",
    shortLabel: "Descartado",
    className: "bg-rose-100 text-rose-700",
  },
};

export function getTypeMeta(value: string) {
  return (
    incidentTypes.find((type) => type.value === value) || {
      value: "otro",
      label: "Otro",
      mapColor: "#64748b",
      chipClass: "bg-slate-100 text-slate-700",
    }
  );
}
