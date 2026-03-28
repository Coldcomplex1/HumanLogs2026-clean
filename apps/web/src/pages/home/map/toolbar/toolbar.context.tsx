import type * as React from "react";
import { createContext, useContext, useState } from "react";
import { LatLng } from "../../types";
import { Marker } from "../../app.context";

export type Mode = "idle" | "draw-path" | "zone-select";

const ToolbarContext = createContext<{
  mode: Mode;
  setMode: (mode: Mode) => void;
  drawingPoints: LatLng[];
  addDrawingPoint: (point: LatLng) => void;
  clearDrawingPoints: () => void;
  undoLastPoint: () => void;
  cancelDrawing: () => void;

  selectedMarker: Marker | null;
  setSelectedMarker: (marker: Marker | null) => void;
}>(null as any);

export const useToolbarContext = () => {
  return useContext(ToolbarContext);
};

export const ToolbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mode, setMode] = useState<Mode>("idle");
  const [drawingPoints, setDrawingPoints] = useState<LatLng[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);

  const addDrawingPoint = (point: LatLng) => {
    setDrawingPoints(prev => [...prev, point]);
  };

  const clearDrawingPoints = () => {
    setDrawingPoints([]);
  };

  const undoLastPoint = () => {
    setDrawingPoints(prev => prev.slice(0, -1));
  };

  const cancelDrawing = () => {
    setMode("idle");
    clearDrawingPoints();
  };

  return (
    <ToolbarContext.Provider
      value={{
        mode,
        setMode,
        drawingPoints,
        addDrawingPoint,
        clearDrawingPoints,
        undoLastPoint,
        cancelDrawing,
        selectedMarker,
        setSelectedMarker,
      }}
    >
      {children}
    </ToolbarContext.Provider>
  );
};
