"use client";

import { CircleMarker, MapContainer, Popup, TileLayer, ZoomControl } from "react-leaflet";
import { Incident } from "@alerta/shared";
import { getTypeMeta } from "../lib/incident-meta";
import type { LatLngExpression } from "leaflet";

const defaultCenter: [number, number] = [-33.45, -70.66];

export default function MapView({ incidents }: { incidents: Incident[] }) {
  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-white/90 shadow-lg shadow-slate-900/40">
      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="bottomright" />
        {incidents.map((incident) => (
          (() => {
            const position: LatLngExpression = [
              incident.location.lat,
              incident.location.lng,
            ];
            return (
          <CircleMarker
            key={incident.id}
            center={position}
            radius={10}
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
                  {incident.type} · {incident.confidence}
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
