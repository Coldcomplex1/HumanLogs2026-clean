import type * as React from "react";
import { useCallback, useState, type PropsWithChildren } from "react";
import { Map as ReactMap, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useAppContext } from "../app.context";
import { Sidebar } from "./sidebar/sidebar";
import { ContextMenuMap } from "./context-menu";
import { DrawPathLayer } from "./draw-path-layer";
import { ZoneSelectLayer } from "./zone-select-layer";
import { useMapContext } from "./map.context";
import { provinceOptions } from "../data";
import { MapToolbar } from "./toolbar/map.toolbar";
import { Shapes } from "./shapes";
import { ShapeDetail } from "./toolbar/shape-detail";
import { ClusteredLocations } from "./clustered-locations";
import { Maker } from "./maker";

const HIDE_MARKERS_ZOOM = 9;

export const Map: React.FC<PropsWithChildren<{}>> = () => {
  const { locations, markers } = useAppContext();
  const { tileProvider, setMap } = useMapContext();
  const [zoom, setZoom] = useState(13);
  const criticalCount = locations.filter(
    location => !location.isResolved && location.emergencyLevel === "critical",
  ).length;
  const areaCount = markers.filter(marker => marker.type === "area").length;
  const routeCount = markers.filter(marker => marker.type === "route").length;
  const hazardCount = markers.filter(
    marker =>
      marker.markType === "blocked_road" ||
      marker.markType === "electric_hazard" ||
      marker.markType === "strong_current" ||
      marker.markType === "dangerous",
  ).length;

  const mapRef = useCallback(
    (ref: MapRef | null) => {
      if (ref) setMap(ref);
    },
    [setMap],
  );

  return (
    <>
      <div className="grid relative z-0 grid-cols-[442px_1fr] h-[calc(100vh-var(--height-header))] w-full font-sans text-slate-800 overflow-hidden">
        <Sidebar />
        <div className="relative w-full h-full">
          <ReactMap
            ref={mapRef}
            initialViewState={{
              latitude: provinceOptions[0].latlng[0],
              longitude: provinceOptions[0].latlng[1],
              zoom: 13,
            }}
            mapStyle={tileProvider.style}
            style={{ width: "100%", height: "100%" }}
            cursor="crosshair"
            onZoom={e => setZoom(e.viewState.zoom)}
          >
            <ContextMenuMap />
            <DrawPathLayer />
            <ZoneSelectLayer />
            <Shapes />
            <ClusteredLocations locations={locations} />
            {zoom >= HIDE_MARKERS_ZOOM &&
              markers.map(
                marker =>
                  marker.type === "mark" && (
                    <Maker key={marker.id} marker={marker} />
                  ),
              )}
          </ReactMap>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_26%),radial-gradient(circle_at_78%_24%,rgba(245,158,11,0.1),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(15,58,95,0.04))]" />
          <div className="pointer-events-none absolute left-5 top-5 z-20 max-w-xs">
            <div className="rounded-3xl border border-white/65 bg-white/82 p-4 shadow-[0_24px_44px_rgba(15,58,95,0.18)] backdrop-blur-xl">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                Bản đồ điều phối
              </div>
              <div className="mt-1 text-base font-bold text-slate-900">
                Trọng tâm vùng ngập và hành lang cứu trợ
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MapStatCard
                  tone="rose"
                  label="Điểm nguy kịch"
                  value={criticalCount}
                />
                <MapStatCard
                  tone="amber"
                  label="Vùng khoanh"
                  value={areaCount}
                />
                <MapStatCard
                  tone="cyan"
                  label="Tuyến cứu trợ"
                  value={routeCount}
                />
                <MapStatCard
                  tone="slate"
                  label="Điểm rủi ro"
                  value={hazardCount}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-700">
                <LegendPill color="bg-rose-500" label="Ngập sâu / sơ tán" />
                <LegendPill color="bg-amber-500" label="Hành lang trung chuyển" />
                <LegendPill color="bg-cyan-500" label="Luồng tiếp cận an toàn" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <MapToolbar />
      <ShapeDetail />
    </>
  );
};

const MapStatCard: React.FC<{
  label: string;
  value: number;
  tone: "rose" | "amber" | "cyan" | "slate";
}> = ({ label, value, tone }) => {
  const toneClasses = {
    rose: "border-rose-200 bg-rose-50/80 text-rose-700",
    amber: "border-amber-200 bg-amber-50/80 text-amber-700",
    cyan: "border-cyan-200 bg-cyan-50/80 text-cyan-700",
    slate: "border-slate-200 bg-slate-50/80 text-slate-700",
  };

  return (
    <div
      className={`rounded-2xl border px-3 py-2 ${toneClasses[tone]}`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em]">
        {label}
      </div>
      <div className="mt-1 text-xl font-extrabold">{value}</div>
    </div>
  );
};

const LegendPill: React.FC<{ color: string; label: string }> = ({
  color,
  label,
}) => {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/85 px-2.5 py-1 shadow-sm">
      <div className={`size-2.5 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
};
