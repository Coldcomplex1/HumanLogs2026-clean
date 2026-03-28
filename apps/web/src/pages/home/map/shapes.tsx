import type * as React from "react";
import { PropsWithChildren, useEffect } from "react";
import { useAppContext } from "../app.context";
import { Source, Layer } from "react-map-gl/maplibre";
import { useToolbarContext } from "./toolbar/toolbar.context";
import { useMapContext } from "./map.context";

export const Shapes: React.FC<PropsWithChildren<{}>> = () => {
  const { markers } = useAppContext();
  const { setSelectedMarker } = useToolbarContext();
  const { map } = useMapContext();
  const areaMarkers = markers.filter(marker => marker.type === "area");
  const routeMarkers = markers.filter(
    marker => marker.type === "route" && (marker.paths?.length ?? 0) >= 2,
  );

  useEffect(() => {
    if (!map) return;
    const m = map.getMap();

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const layerIds = areaMarkers
        .map(m => `shape-fill-${m.id}`)
        .filter(id => m.getLayer(id));

      if (layerIds.length === 0) return;

      const features = m.queryRenderedFeatures(e.point, { layers: layerIds });
      if (features.length > 0) {
        const markerId = features[0].properties?.markerId;
        const marker = areaMarkers.find(m => m.id === markerId);
        if (marker) {
          setSelectedMarker(marker);
        }
      }
    };

    m.on("click", handleClick);
    return () => {
      m.off("click", handleClick);
    };
  }, [areaMarkers, map, setSelectedMarker]);

  return (
    <>
      {areaMarkers.map(
        marker =>
          (
            <Source
              key={marker.id}
              id={`shape-${marker.id}`}
              type="geojson"
              data={{
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: [
                    marker.paths?.map(p => [p[1], p[0]]) || [],
                  ],
                },
                properties: { markerId: marker.id },
              }}
            >
              <Layer
                id={`shape-glow-${marker.id}`}
                type="line"
                layout={{
                  "line-cap": "round",
                  "line-join": "round",
                }}
                paint={{
                  "line-color": marker.color || "#3b82f6",
                  "line-width": 8,
                  "line-opacity": 0.14,
                  "line-blur": 2,
                }}
              />
              <Layer
                id={`shape-line-${marker.id}`}
                type="line"
                layout={{
                  "line-cap": "round",
                  "line-join": "round",
                }}
                paint={{
                  "line-color": marker.color || "#3b82f6",
                  "line-width": 2.6,
                  "line-opacity": 0.9,
                }}
              />
              <Layer
                id={`shape-fill-${marker.id}`}
                type="fill"
                paint={{
                  "fill-color": marker.color || "#3b82f6",
                  "fill-opacity": marker.fillOpacity || 0,
                }}
              />
            </Source>
          ),
      )}
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
              "line-width": 10,
              "line-opacity": 0.18,
              "line-blur": 2,
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
              "line-width": 4,
              "line-opacity": 0.96,
              "line-dasharray": [2, 1.25],
            }}
          />
        </Source>
      ))}
    </>
  );
};
