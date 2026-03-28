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
        </div>
      </div>
      <MapToolbar />
      <ShapeDetail />
    </>
  );
};
