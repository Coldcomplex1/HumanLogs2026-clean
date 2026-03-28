import { useEffect, useState, useCallback, useRef } from "react";
import { Source, Layer, useControl } from "react-map-gl/maplibre";
import { useToolbarContext } from "./toolbar/toolbar.context";
import { useAppContext } from "../app.context";
import { openRescuePlanModal } from "@/modals/rescue-plan.modal";
import type {
  IControl,
  Map as MaplibreMap,
  MapMouseEvent,
  LineLayerSpecification,
  FillLayerSpecification,
} from "maplibre-gl";

const MIN_PIXEL_DIST = 4;

const outlinePaint: LineLayerSpecification["paint"] = {
  "line-color": "#3b82f6",
  "line-width": 2,
  "line-opacity": 0.9,
  "line-dasharray": [4, 3],
};

const fillPaint: FillLayerSpecification["paint"] = {
  "fill-color": "#3b82f6",
  "fill-opacity": 0.12,
};

function pointInPolygon(
  point: [number, number],
  polygon: [number, number][],
): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]!;
    const [xj, yj] = polygon[j]!;
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function simplifyPath(
  points: [number, number][],
  tolerance: number,
): [number, number][] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIdx = 0;
  const first = points[0]!;
  const last = points[points.length - 1]!;

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDist(points[i]!, first, last);
    if (d > maxDist) {
      maxDist = d;
      maxIdx = i;
    }
  }

  if (maxDist > tolerance) {
    const left = simplifyPath(points.slice(0, maxIdx + 1), tolerance);
    const right = simplifyPath(points.slice(maxIdx), tolerance);
    return [...left.slice(0, -1), ...right];
  }

  return [first, last];
}

function perpendicularDist(
  pt: [number, number],
  lineStart: [number, number],
  lineEnd: [number, number],
): number {
  const [x, y] = pt;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
  const num = Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1);
  return num / Math.sqrt(lenSq);
}

class ZoneControl implements IControl {
  onAdd() {
    return document.createElement("div");
  }
  onRemove() {}
}

export function ZoneSelectLayer() {
  const { mode, setMode } = useToolbarContext();
  const { locations } = useAppContext();
  const [zonePoints, setZonePoints] = useState<[number, number][]>([]);
  const mapRef = useRef<MaplibreMap | null>(null);
  const drawingRef = useRef(false);
  const lastPixelRef = useRef<{ x: number; y: number } | null>(null);
  const pointsRef = useRef<[number, number][]>([]);
  const finishingRef = useRef(false);

  const stateRef = useRef({ mode, locations });
  stateRef.current = { mode, locations };

  useEffect(() => {
    if (mode !== "zone-select") {
      setZonePoints([]);
      drawingRef.current = false;
      lastPixelRef.current = null;
      pointsRef.current = [];
    }
  }, [mode]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMode("idle");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setMode]);

  const finishZone = useCallback(
    (pts: [number, number][]) => {
      if (finishingRef.current) return;
      finishingRef.current = true;

      const { locations } = stateRef.current;
      const map = mapRef.current;

      const simplified = simplifyPath(pts, 0.00005);

      if (simplified.length < 3 || !map) {
        finishingRef.current = false;
        return;
      }

      const polygonPixels = simplified.map(([lng, lat]) => {
        const p = map.project([lng, lat]);
        return [p.x, p.y] as [number, number];
      });

      const locationIds: string[] = [];
      for (const loc of locations) {
        const p = map.project([loc.lng, loc.lat]);
        if (pointInPolygon([p.x, p.y], polygonPixels)) {
          locationIds.push(loc.id);
        }
      }

      openRescuePlanModal({
        plan: { title: "", status: "draft", priority: "medium", locationIds },
      });
      setMode("idle");
      setZonePoints([]);
      pointsRef.current = [];
      setTimeout(() => {
        finishingRef.current = false;
      }, 300);
    },
    [setMode],
  );

  const handleMouseDown = useCallback((e: MapMouseEvent) => {
    if (stateRef.current.mode !== "zone-select") return;
    e.preventDefault();
    drawingRef.current = true;
    const pt: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    pointsRef.current = [pt];
    lastPixelRef.current = { x: e.point.x, y: e.point.y };
    setZonePoints([pt]);
  }, []);

  const handleMouseMove = useCallback((e: MapMouseEvent) => {
    if (!drawingRef.current || stateRef.current.mode !== "zone-select") return;

    const last = lastPixelRef.current;
    if (last) {
      const dx = e.point.x - last.x;
      const dy = e.point.y - last.y;
      if (dx * dx + dy * dy < MIN_PIXEL_DIST * MIN_PIXEL_DIST) return;
    }

    const pt: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    pointsRef.current.push(pt);
    lastPixelRef.current = { x: e.point.x, y: e.point.y };
    setZonePoints([...pointsRef.current]);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPixelRef.current = null;

    const pts = pointsRef.current;
    if (pts.length >= 3) {
      finishZone(pts);
    } else {
      setZonePoints([]);
      pointsRef.current = [];
    }
  }, [finishZone]);

  useControl(
    () => new ZoneControl(),
    ({ map }) => {
      const m = map.getMap();
      mapRef.current = m;
      m.on("mousedown", handleMouseDown);
      m.on("mousemove", handleMouseMove);
      m.on("mouseup", handleMouseUp);
    },
    ({ map }) => {
      const m = map.getMap();
      m.off("mousedown", handleMouseDown);
      m.off("mousemove", handleMouseMove);
      m.off("mouseup", handleMouseUp);
      mapRef.current = null;
    },
  );

  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;
    if (mode === "zone-select") m.dragPan.disable();
    else m.dragPan.enable();
    return () => {
      m.dragPan.enable();
    };
  }, [mode]);

  if (mode !== "zone-select" || zonePoints.length === 0) return null;

  const closedCoords = [...zonePoints, zonePoints[0]!];

  return (
    <>
      {zonePoints.length >= 3 && (
        <Source
          id="zone-fill"
          type="geojson"
          data={{
            type: "Feature",
            geometry: { type: "Polygon", coordinates: [closedCoords] },
            properties: {},
          }}
        >
          <Layer id="zone-fill-layer" type="fill" paint={fillPaint} />
        </Source>
      )}

      <Source
        id="zone-outline"
        type="geojson"
        data={{
          type: "Feature",
          geometry: { type: "LineString", coordinates: closedCoords },
          properties: {},
        }}
      >
        <Layer id="zone-outline-layer" type="line" paint={outlinePaint} />
      </Source>
    </>
  );
}
