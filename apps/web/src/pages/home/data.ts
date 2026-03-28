export const provinceOptions = [
  {
    label: "Miền Trung trọng điểm",
    latlng: [15.794, 108.11],
  },
  {
    label: "Quảng Trị",
    latlng: [16.75, 107.13],
  },
  {
    label: "Đà Nẵng",
    latlng: [16.0544, 108.2022],
  },
  {
    label: "Quảng Nam",
    latlng: [15.5394, 108.0191],
  },
  {
    label: "Bình Định",
    latlng: [13.782, 109.219],
  },
  {
    label: "Đồng bằng sông Cửu Long",
    latlng: [10.155, 105.72],
  },
  {
    label: "Cần Thơ",
    latlng: [10.0314, 105.7736],
  },
];

import type { StyleSpecification } from "maplibre-gl";

type TileProvider = {
  id: string;
  name: string;
  style: StyleSpecification;
  preview: string;
};

export const TILE_PROVIDERS: TileProvider[] = [
  {
    id: "carto-light",
    name: "Sáng",
    style: {
      version: 8,
      sources: {
        "base-tiles": {
          type: "raster",
          tiles: [
            "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
            "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
            "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
            "https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
          ],
          tileSize: 256,
          maxzoom: 20,
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        },
      },
      layers: [
        { id: "base-tiles-layer", type: "raster", source: "base-tiles" },
      ],
    },
    preview: "/tiles/light.png",
  },
  {
    id: "satellite",
    name: "Vệ tinh",
    style: {
      version: 8,
      sources: {
        "base-tiles": {
          type: "raster",
          tiles: [
            "https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=sModJ27dvEwgTYKeBYp5",
          ],
          tileSize: 256,
          maxzoom: 19,
          attribution:
            '&copy; <a href="http://osm.org/copyright">Maptiler</a> contributors',
        },
      },
      layers: [
        { id: "base-tiles-layer", type: "raster", source: "base-tiles" },
      ],
    },
    preview: "/tiles/satellite.png",
  },
];

export const COLORS = [
  "#ef4444",
  "#d97706",
  "#16a34a",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
  "#e11d48",
  "#404040",
];
