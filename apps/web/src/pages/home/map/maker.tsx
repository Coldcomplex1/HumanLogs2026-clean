import type * as React from "react";
import type { Marker as MarkerType } from "../app.context";
import { PropsWithChildren, useState } from "react";
import { Marker } from "react-map-gl/maplibre";
import { openMarkerModal } from "@/modals/marker.modal";

type MakerProps = {
  marker: MarkerType;
};

export const Maker: React.FC<PropsWithChildren<MakerProps>> = ({ marker }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const symbol =
    marker.type === "route"
      ? "→"
      : marker.markType === "blocked_road"
        ? "⛔"
        : marker.markType === "electric_hazard"
          ? "⚡"
          : marker.markType === "strong_current"
            ? "≈"
            : marker.markType === "shelter"
              ? "⌂"
              : marker.markType === "medical_point"
                ? "✚"
                : marker.markType === "safe_pickup"
                  ? "⬤"
                  : marker.markType === "supply_drop"
                    ? "▣"
                    : marker.markType === "debris"
                      ? "◆"
                      : "!";

  return (
    <Marker
      longitude={marker.lng}
      latitude={marker.lat}
      anchor="center"
      onClick={e => {
        e.originalEvent.stopPropagation();
        openMarkerModal({
          mode: "edit",
          markerId: marker.id,
        });
      }}
    >
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div
          className="flex size-8 items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white shadow-lg"
          style={{ backgroundColor: marker.color || "#dc2626" }}
        >
          {symbol}
        </div>
        {showTooltip && (marker.name || marker.note) && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap z-10">
            {marker.name && <div>{marker.name}</div>}
            {marker.note && (
              <div className="text-muted-foreground italic">{marker.note}</div>
            )}
          </div>
        )}
      </div>
    </Marker>
  );
};
