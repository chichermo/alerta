"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Incident } from "@alerta/shared";

const defaultCenter: [number, number] = [-33.45, -70.66];

export default function MapView({ incidents }: { incidents: Incident[] }) {
  return (
    <div className="h-full w-full rounded-xl border border-slate-200 bg-white shadow-sm">
      <MapContainer center={defaultCenter} zoom={11} scrollWheelZoom>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.location.lat, incident.location.lng]}
          >
            <Popup>
              <div className="space-y-1">
                <div className="font-semibold">{incident.title}</div>
                <div className="text-xs text-slate-600">
                  {incident.type} · {incident.confidence}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
