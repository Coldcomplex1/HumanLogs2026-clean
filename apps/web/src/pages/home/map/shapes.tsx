import type * as React from "react";
import { PropsWithChildren } from "react";
import { useAppContext } from "../app.context";
import { Source, Layer } from "react-map-gl/maplibre";

export const Shapes: React.FC<PropsWithChildren<{}>> = () => {
  const { markers } = useAppContext();
  const routeMarkers = markers.filter(
    marker => marker.type === "route" && (marker.paths?.length ?? 0) >= 2,
  );

  return (
    <>
      {routeMarkers.map(marker => (
        <Source
          key={marker.id}
          id={`route-${marker.id}`}
          type="geojson"
          data={{
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: marker.paths?.map(p => [p[1], p[0]]) || [],
            },
            properties: { markerId: marker.id },
          }}
        >
          <Layer
            id={`route-glow-${marker.id}`}
            type="line"
            layout={{
              "line-cap": "round",
              "line-join": "round",
            }}
            paint={{
              "line-color": marker.color || "#38bdf8",
              "line-width": 7,
              "line-opacity": 0.16,
              "line-blur": 1.2,
            }}
          />
          <Layer
            id={`route-casing-${marker.id}`}
            type="line"
            layout={{
              "line-cap": "round",
              "line-join": "round",
            }}
            paint={{
              "line-color": "#ffffff",
              "line-width": 5.5,
              "line-opacity": 0.92,
            }}
          />
          <Layer
            id={`route-line-${marker.id}`}
            type="line"
            layout={{
              "line-cap": "round",
              "line-join": "round",
            }}
            paint={{
              "line-color": marker.color || "#38bdf8",
              "line-width": 3,
              "line-opacity": 0.95,
            }}
          />
        </Source>
      ))}
    </>
  );
};
