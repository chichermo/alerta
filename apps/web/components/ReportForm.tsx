"use client";

import { FormEvent, useState } from "react";
import { createReport } from "../lib/api";
import { incidentTypes } from "../lib/incident-meta";

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
  const [geoStatus, setGeoStatus] = useState("");

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

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setGeoStatus("Geolocalización no disponible.");
      return;
    }
    setGeoStatus("Obteniendo ubicación...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm({
          ...form,
          lat: Number(position.coords.latitude.toFixed(5)),
          lng: Number(position.coords.longitude.toFixed(5)),
        });
        setGeoStatus("Ubicación actualizada.");
      },
      () => {
        setGeoStatus("No se pudo obtener ubicación.");
      }
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div>
        <div className="text-sm font-semibold text-slate-900">
          Reportar incidente
        </div>
        <p className="text-xs text-slate-500">
          Tu reporte ayuda a validar alertas en tiempo real.
        </p>
      </div>
      <input
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        placeholder="Título del incidente"
        value={form.title}
        onChange={(event) => setForm({ ...form, title: event.target.value })}
        required
      />
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Tipo de evento
        </div>
        <div className="flex flex-wrap gap-2">
          {incidentTypes.map((type) => (
            <button
              type="button"
              key={type.value}
              onClick={() => setForm({ ...form, type: type.value })}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                form.type === type.value
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
      <textarea
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        placeholder="Descripción (opcional)"
        value={form.description}
        onChange={(event) =>
          setForm({ ...form, description: event.target.value })
        }
      />
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Ubicación</span>
          <button
            type="button"
            onClick={handleUseLocation}
            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
          >
            Usar mi ubicación
          </button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            type="number"
            step="0.0001"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.lat}
            onChange={(event) =>
              setForm({ ...form, lat: Number(event.target.value) })
            }
          />
          <input
            type="number"
            step="0.0001"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.lng}
            onChange={(event) =>
              setForm({ ...form, lng: Number(event.target.value) })
            }
          />
        </div>
        {geoStatus && <div className="mt-2 text-xs text-slate-500">{geoStatus}</div>}
      </div>
      <button
        className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        disabled={loading}
      >
        {loading ? "Enviando..." : "Enviar reporte"}
      </button>
      {status && <div className="text-xs text-slate-600">{status}</div>}
    </form>
  );
}
