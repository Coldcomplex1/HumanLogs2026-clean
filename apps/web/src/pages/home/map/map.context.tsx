import type * as React from "react";
import { createContext, useContext, useState } from "react";
import type { LatLng } from "../types";
import type { MapRef } from "react-map-gl/maplibre";
import { TILE_PROVIDERS } from "../data";

type Mode = "view" | "draw-path";

const MapContext = createContext<{
  mode: Mode;
  setMode: (mode: Mode) => void;
  map: MapRef | null;
  setMap: (map: MapRef) => void;
  flyToLocation: (location: LatLng, zoom?: number, duration?: number) => void;
  tileProvider: (typeof TILE_PROVIDERS)[number];
  setTileProvider: (id: string) => void;
}>(null as any);
export const useMapContext = () => useContext(MapContext);

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [map, setMap] = useState<MapRef | null>(null);
  const [mode, setMode] = useState<Mode>("view");
  const [tileProvider, setTileProviderState] = useState<
    (typeof TILE_PROVIDERS)[number]
  >(TILE_PROVIDERS[0]);

  const setTileProvider = (id: string) => {
    const provider = TILE_PROVIDERS.find(p => p.id === id);
    if (provider) {
      setTileProviderState(provider);
    }
  };

  const flyToLocation = (
    { lat, lng }: LatLng,
    zoom: number = 15,
    duration = 0.5,
  ) => {
    if (!map) return console.error("Map not found");
    if (duration === 0) {
      map.jumpTo({ center: [lng, lat], zoom });
    } else {
      map.flyTo({ center: [lng, lat], zoom, duration: duration * 1000 });
    }
  };

  return (
    <MapContext.Provider
      value={{
        mode,
        setMode,
        map,
        setMap,
        flyToLocation,
        tileProvider,
        setTileProvider,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
