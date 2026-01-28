"use client";

import { FormEvent, useState } from "react";
import { createReport } from "../lib/api";

const types = [
  "corte_luz",
  "corte_agua",
  "incendio",
  "transporte",
  "protesta",
  "clima",
  "otro",
];

export default function ReportForm({ onCreated }: { onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    title: "",
    type: "corte_luz",
    description: "",
    lat: -33.45,
    lng: -70.66,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      await createReport({
        title: form.title,
        type: form.type,
        description: form.description,
        location: { lat: Number(form.lat), lng: Number(form.lng) },
      });
      setStatus("Reporte enviado correctamente.");
      setForm({ ...form, title: "", description: "" });
      onCreated();
    } catch (error) {
      setStatus("No se pudo enviar el reporte.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="text-sm font-semibold">Reportar incidente</div>
      <input
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        placeholder="Título"
        value={form.title}
        onChange={(event) => setForm({ ...form, title: event.target.value })}
        required
      />
      <select
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        value={form.type}
        onChange={(event) => setForm({ ...form, type: event.target.value })}
      >
        {types.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <textarea
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        placeholder="Descripción (opcional)"
        value={form.description}
        onChange={(event) =>
          setForm({ ...form, description: event.target.value })
        }
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          step="0.0001"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={form.lat}
          onChange={(event) => setForm({ ...form, lat: Number(event.target.value) })}
        />
        <input
          type="number"
          step="0.0001"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={form.lng}
          onChange={(event) => setForm({ ...form, lng: Number(event.target.value) })}
        />
      </div>
      <button
        className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
        disabled={loading}
      >
        {loading ? "Enviando..." : "Enviar reporte"}
      </button>
      {status && <div className="text-xs text-slate-600">{status}</div>}
    </form>
  );
}
