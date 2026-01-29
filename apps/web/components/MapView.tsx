"use client";

import { CircleMarker, MapContainer, Popup, TileLayer, ZoomControl } from "react-leaflet";
import { Incident } from "@alerta/shared";
import { getTypeMeta } from "../lib/incident-meta";
import type { LatLngExpression } from "leaflet";
import { useState } from "react";

const defaultCenter: [number, number] = [-33.45, -70.66];

export default function MapView({
  incidents,
  mapStyle,
  showLabels,
  intensityMode,
}: {
  incidents: Incident[];
  mapStyle: "light" | "dark";
  showLabels: boolean;
  intensityMode: boolean;
}) {
  const [isReady, setIsReady] = useState(false);
  const baseUrl =
    mapStyle === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const labelUrl =
    mapStyle === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png";

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-white/90 shadow-lg shadow-slate-900/40">
      {!isReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-slate-100 to-white">
          <div className="flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-slate-700 shadow">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Cargando mapa...
          </div>
        </div>
      )}
      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom
        className="h-full w-full"
        zoomControl={false}
        whenReady={() => setIsReady(true)}
      >
        <TileLayer
          url={baseUrl}
          attribution='&copy; OpenStreetMap contributors'
          detectRetina
        />
        {showLabels && <TileLayer url={labelUrl} />}
        <ZoomControl position="bottomright" />
        {incidents.map((incident) => (
          (() => {
            const position: LatLngExpression = [
              incident.location.lat,
              incident.location.lng,
            ];
            const radius = intensityMode
              ? Math.min(18, 8 + incident.reportsCount * 1.2)
              : 10;
            return (
          <CircleMarker
            key={incident.id}
            center={position}
            radius={radius}
            className="incident-pulse"
            pathOptions={{
              color: getTypeMeta(incident.type).mapColor,
              fillColor: getTypeMeta(incident.type).mapColor,
              fillOpacity: 0.65,
              weight: 2,
            }}
          >
            <Popup>
              <div className="space-y-1 text-slate-900">
                <div className="font-semibold">{incident.title}</div>
                <div className="text-xs text-slate-600">
                  {incident.type} · {incident.confidence} · {incident.reportsCount} reportes
                </div>
              </div>
            </Popup>
          </CircleMarker>
            );
          })()
        ))}
      </MapContainer>
    </div>
  );
}
