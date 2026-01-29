"use client";

import { useMemo, useState } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl";
import { Incident } from "@alerta/shared";
import { getTypeMeta } from "../lib/incident-meta";

const defaultCenter = { lat: -33.45, lng: -70.66 };

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
  const [selected, setSelected] = useState<Incident | null>(null);

  const mapStyleUrl = useMemo(() => {
    if (!showLabels) {
      return "mapbox://styles/mapbox/satellite-v9";
    }
    return mapStyle === "dark"
      ? "mapbox://styles/mapbox/dark-v11"
      : "mapbox://styles/mapbox/light-v11";
  }, [mapStyle, showLabels]);

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-white/90 shadow-lg shadow-slate-900/40">
      <Map
        initialViewState={{
          latitude: defaultCenter.lat,
          longitude: defaultCenter.lng,
          zoom: 11,
        }}
        mapStyle={mapStyleUrl}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        reuseMaps
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="bottom-right" />
        {incidents.map((incident) => {
          const size = intensityMode
            ? Math.min(28, 12 + incident.reportsCount * 1.6)
            : 12;
          const color = getTypeMeta(incident.type).mapColor;
          return (
            <Marker
              key={incident.id}
              longitude={incident.location.lng}
              latitude={incident.location.lat}
              anchor="center"
            >
              <button
                type="button"
                onClick={() => setSelected(incident)}
                className="incident-pulse rounded-full border border-white/80"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: color,
                  boxShadow: `0 0 12px ${color}66`,
                }}
                aria-label={`Incidente ${incident.title}`}
              />
            </Marker>
          );
        })}
        {selected && (
          <Popup
            longitude={selected.location.lng}
            latitude={selected.location.lat}
            closeButton
            closeOnClick={false}
            onClose={() => setSelected(null)}
            anchor="top"
          >
            <div className="space-y-1 text-slate-900">
              <div className="font-semibold">{selected.title}</div>
              <div className="text-xs text-slate-600">
                {selected.type} · {selected.confidence} · {selected.reportsCount} reportes
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
