import { useEffect, useState, useCallback, useRef } from "react";
import { Source, Layer, Marker, useControl } from "react-map-gl/maplibre";
import { useToolbarContext } from "./toolbar/toolbar.context";
import { LatLng } from "../types";
import { api } from "@/trpc/react";
import { toastManager } from "@/components/ui/toast";
import { COLORS } from "../data";
import type {
  IControl,
  Map as MaplibreMap,
  MapMouseEvent,
  LineLayerSpecification,
} from "maplibre-gl";

const dashLinePaint: LineLayerSpecification["paint"] = {
  "line-color": "#ef4444",
  "line-width": 2,
  "line-opacity": 0.8,
  "line-dasharray": [4, 4],
};

const previewLinePaint: LineLayerSpecification["paint"] = {
  "line-color": "#ef4444",
  "line-width": 2,
  "line-opacity": 0.5,
  "line-dasharray": [4, 4],
};

class DrawControl implements IControl {
  onAdd() {
    return document.createElement("div");
  }
  onRemove() {}
}

export function DrawPathLayer() {
  const {
    mode,
    drawingPoints,
    addDrawingPoint,
    cancelDrawing,
    setSelectedMarker,
  } = useToolbarContext();
  const [mousePosition, setMousePosition] = useState<LatLng | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);

  const stateRef = useRef({ mode, drawingPoints, addDrawingPoint, closeAndSavePath: () => {} });

  const createMakerMutation = api.marker.create.useMutation({
    onSuccess: created => {
      toastManager.add({
        title: "Shape created successfully",
        type: "success",
      });
      setSelectedMarker(created);
    },
    onError: error => {
      toastManager.add({
        title: "Failed to create shape",
        description: error.message,
        type: "error",
      });
    },
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelDrawing();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const closeAndSavePath = useCallback(() => {
    if (drawingPoints.length < 3) return;
    const points = [...drawingPoints, drawingPoints[0]];

    createMakerMutation.mutate({
      lat: points[0].lat,
      lng: points[0].lng,
      type: "area",
      paths: points.map(p => [p.lat, p.lng]),
      color: COLORS[0],
      fillOpacity: 0.1,
      isClosedPath: true,
    });

    cancelDrawing();
  }, [drawingPoints, cancelDrawing, createMakerMutation]);

  stateRef.current = { mode, drawingPoints, addDrawingPoint, closeAndSavePath };

  const handleClick = useCallback((e: MapMouseEvent) => {
    const { mode, drawingPoints, addDrawingPoint, closeAndSavePath } =
      stateRef.current;
    const m = mapRef.current;
    if (mode !== "draw-path" || !m) return;

    if (drawingPoints.length >= 3) {
      const startPoint = drawingPoints[0];
      const clickedPixel = m.project([e.lngLat.lng, e.lngLat.lat]);
      const startPixel = m.project([startPoint.lng, startPoint.lat]);
      const distance = Math.sqrt(
        Math.pow(clickedPixel.x - startPixel.x, 2) +
          Math.pow(clickedPixel.y - startPixel.y, 2),
      );
      if (distance < 15) {
        closeAndSavePath();
        return;
      }
    }

    addDrawingPoint({ lat: e.lngLat.lat, lng: e.lngLat.lng });
  }, []);

  const handleMouseMove = useCallback((e: MapMouseEvent) => {
    if (stateRef.current.mode === "draw-path") {
      setMousePosition({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    }
  }, []);

  const handleMouseOut = useCallback(() => {
    if (stateRef.current.mode === "draw-path") setMousePosition(null);
  }, []);

  useControl(
    () => new DrawControl(),
    ({ map }) => {
      const m = map.getMap();
      mapRef.current = m;
      m.on("click", handleClick);
      m.on("mousemove", handleMouseMove);
      m.on("mouseout", handleMouseOut);
    },
    ({ map }) => {
      const m = map.getMap();
      m.off("click", handleClick);
      m.off("mousemove", handleMouseMove);
      m.off("mouseout", handleMouseOut);
      mapRef.current = null;
    },
  );

  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;
    if (mode === "draw-path") {
      m.dragPan.disable();
    } else {
      m.dragPan.enable();
    }
    return () => {
      m.dragPan.enable();
    };
  }, [mode]);

  if (mode !== "draw-path" || drawingPoints.length === 0) return null;

  const lineCoords = drawingPoints.map(p => [p.lng, p.lat]);

  const previewLineCoords =
    mousePosition ?
      [
        [
          drawingPoints[drawingPoints.length - 1].lng,
          drawingPoints[drawingPoints.length - 1].lat,
        ],
        [mousePosition.lng, mousePosition.lat],
      ]
    : null;

  return (
    <>
      <Source
        id="drawing-line"
        type="geojson"
        data={{
          type: "Feature",
          geometry: { type: "LineString", coordinates: lineCoords },
          properties: {},
        }}
      >
        <Layer id="drawing-line-layer" type="line" paint={dashLinePaint} />
      </Source>

      {previewLineCoords && (
        <Source
          id="drawing-preview-line"
          type="geojson"
          data={{
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: previewLineCoords,
            },
            properties: {},
          }}
        >
          <Layer
            id="drawing-preview-line-layer"
            type="line"
            paint={previewLinePaint}
          />
        </Source>
      )}

      {mousePosition && (
        <Marker
          longitude={mousePosition.lng}
          latitude={mousePosition.lat}
          anchor="center"
        >
          <div
            className="rounded-full cursor-crosshair"
            style={{
              width: 8,
              height: 8,
              backgroundColor: "rgba(239, 68, 68, 0.5)",
              border: "1px solid #ef4444",
            }}
          />
        </Marker>
      )}

      {drawingPoints.map((point, index) => {
        const isFirst = index === 0;
        const canClose = isFirst && drawingPoints.length >= 3;
        return (
          <Marker
            key={index}
            longitude={point.lng}
            latitude={point.lat}
            anchor="center"
          >
            <div
              className="rounded-full"
              style={{
                width: canClose ? 20 : 12,
                height: canClose ? 20 : 12,
                backgroundColor: isFirst ? "#22c55e" : "#fff",
                border: `${canClose ? 3 : 2}px solid ${
                  canClose || isFirst ? "#22c55e" : "#ef4444"
                }`,
                cursor: canClose ? "pointer" : "crosshair",
              }}
              onClick={e => {
                if (canClose) {
                  e.stopPropagation();
                  closeAndSavePath();
                }
              }}
            />
          </Marker>
        );
      })}
    </>
  );
}
