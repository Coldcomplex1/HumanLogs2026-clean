import type * as React from "react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Source, Layer, Popup } from "react-map-gl/maplibre";
import type { Location } from "../app.context";
import { Phone, ChevronsUp, ChevronUp, Users, StickyNote, Check } from "lucide-react";
import { useMapContext } from "./map.context";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { prettyDate } from "@/lib/dayjs";
import { HighestPriorityIcon } from "@/icons/priority.icons";

const EMERGENCY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#eab308",
  medium: "#3b82f6",
};
const RESOLVED_COLOR = "#22c55e";

type Props = {
  locations: Location[];
};

export const ClusteredLocations: React.FC<Props> = ({ locations }) => {
  const { map } = useMapContext();
  const [popupLocation, setPopupLocation] = useState<Location | null>(null);

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: locations.map(loc => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [loc.lng, loc.lat] as [number, number],
        },
        properties: {
          id: loc.id,
          emergencyLevel: loc.emergencyLevel || "medium",
          isResolved: loc.isResolved ?? false,
        },
      })),
    }),
    [locations],
  );

  const handleClusterClick = useCallback(
    (
      e: maplibregl.MapMouseEvent & { features?: maplibregl.GeoJSONFeature[] },
    ) => {
      const feature = e.features?.[0];
      if (!feature || !map) return;

      const clusterId = feature.properties?.cluster_id;
      const source = map.getSource(
        "locations-source",
      ) as maplibregl.GeoJSONSource;
      source.getClusterExpansionZoom(clusterId).then(zoom => {
        map.easeTo({
          center: (feature.geometry as GeoJSON.Point).coordinates as [
            number,
            number,
          ],
          zoom,
          duration: 300,
        });
      });
    },
    [map],
  );

  const handlePointClick = useCallback(
    (
      e: maplibregl.MapMouseEvent & { features?: maplibregl.GeoJSONFeature[] },
    ) => {
      const feature = e.features?.[0];
      if (!feature) return;

      const id = feature.properties?.id;
      const loc = locations.find(l => l.id === id);
      if (loc) setPopupLocation(loc);
    },
    [locations],
  );

  useEffect(() => {
    if (!map) return;

    map.on("click", "location-clusters", handleClusterClick);
    map.on("click", "location-unclustered", handlePointClick);

    return () => {
      map.off("click", "location-clusters", handleClusterClick);
      map.off("click", "location-unclustered", handlePointClick);
    };
  }, [map, handleClusterClick, handlePointClick]);

  return (
    <>
      <Source
        id="locations-source"
        type="geojson"
        data={geojson}
        cluster
        clusterMaxZoom={16}
        clusterRadius={50}
        clusterProperties={{
          hasCritical: ["any", ["==", ["get", "emergencyLevel"], "critical"]],
          hasHigh: ["any", ["==", ["get", "emergencyLevel"], "high"]],
          allResolved: ["all", ["==", ["get", "isResolved"], true]],
        }}
      >
        <Layer
          id="location-clusters-glow"
          type="circle"
          filter={["has", "point_count"]}
          paint={{
            "circle-color": [
              "case",
              ["get", "allResolved"],
              RESOLVED_COLOR,
              ["get", "hasCritical"],
              EMERGENCY_COLORS.critical,
              ["get", "hasHigh"],
              EMERGENCY_COLORS.high,
              EMERGENCY_COLORS.medium,
            ],
            "circle-opacity": 0.18,
            "circle-blur": 0.45,
            "circle-radius": [
              "step",
              ["get", "point_count"],
              24,
              5,
              30,
              15,
              38,
              50,
              46,
            ],
          }}
        />
        <Layer
          id="location-clusters"
          type="circle"
          filter={["has", "point_count"]}
          paint={{
            "circle-color": [
              "case",
              ["get", "allResolved"],
              RESOLVED_COLOR,
              ["get", "hasCritical"],
              EMERGENCY_COLORS.critical,
              ["get", "hasHigh"],
              EMERGENCY_COLORS.high,
              EMERGENCY_COLORS.medium,
            ],
            "circle-opacity": 0.85,
            "circle-radius": [
              "step",
              ["get", "point_count"],
              16,
              5,
              20,
              15,
              26,
              50,
              32,
            ],
            "circle-stroke-width": 3,
            "circle-stroke-color": "#ffffff",
          }}
        />

        <Layer
          id="location-cluster-count"
          type="symbol"
          filter={["has", "point_count"]}
          layout={{
            "text-field": "{point_count_abbreviated}",
            "text-size": 13,
            "text-font": ["Open Sans Bold"],
            "text-allow-overlap": true,
          }}
          paint={{
            "text-color": "#ffffff",
          }}
        />

        <Layer
          id="location-unclustered-glow"
          type="circle"
          filter={["!", ["has", "point_count"]]}
          paint={{
            "circle-color": [
              "case",
              ["==", ["get", "isResolved"], true],
              RESOLVED_COLOR,
              [
                "match",
                ["get", "emergencyLevel"],
                "critical", EMERGENCY_COLORS.critical,
                "high", EMERGENCY_COLORS.high,
                EMERGENCY_COLORS.medium,
              ],
            ],
            "circle-radius": 16,
            "circle-opacity": 0.22,
            "circle-blur": 0.55,
          }}
        />
        <Layer
          id="location-unclustered"
          type="circle"
          filter={["!", ["has", "point_count"]]}
          paint={{
            "circle-color": [
              "case",
              ["==", ["get", "isResolved"], true],
              RESOLVED_COLOR,
              [
                "match",
                ["get", "emergencyLevel"],
                "critical", EMERGENCY_COLORS.critical,
                "high", EMERGENCY_COLORS.high,
                EMERGENCY_COLORS.medium,
              ],
            ],
            "circle-radius": 9,
            "circle-stroke-width": 3.5,
            "circle-stroke-color": "#ffffff",
          }}
        />
      </Source>

      {popupLocation && (
        <Popup
          longitude={popupLocation.lng}
          latitude={popupLocation.lat}
          anchor="bottom"
          offset={[0, -12] as [number, number]}
          onClose={() => setPopupLocation(null)}
          closeButton={false}
          className="[&_.maplibregl-popup-content]:rounded-xl [&_.maplibregl-popup-content]:shadow-lg [&_.maplibregl-popup-content]:p-0"
        >
          <LocationPopup location={popupLocation} />
        </Popup>
      )}
    </>
  );
};

const EMERGENCY_LABELS: Record<string, string> = {
  critical: "Nguy kịch",
  high: "Khẩn cấp",
  medium: "Cần hỗ trợ",
};

const ROUTE_CONFIDENCE_LABELS: Record<string, string> = {
  high: "Tin cậy cao",
  medium: "Tin cậy vừa",
  low: "Tin cậy thấp",
  unverified: "Chưa xác minh",
  dangerous: "Nguy hiểm",
};

const TRANSPORT_MODE_LABELS: Record<string, string> = {
  road: "Đường bộ",
  boat: "Xuồng/thuyền",
  walk: "Đi bộ",
  ambulance: "Xe cứu thương",
  drone: "Drone",
  hand_off: "Trung chuyển",
};

const LocationPopup: React.FC<{ location: Location }> = ({ location }) => {
  const emergencyLevel = location.emergencyLevel || "medium";
  const victims = location.victims || [];

  return (
    <div className="w-56">
      <div
        className={cn("px-3 py-2 flex items-center gap-2 rounded-t-xl", {
          "text-green-700": location.isResolved,
          "text-red-700": !location.isResolved && emergencyLevel === "critical",
          "text-yellow-700": !location.isResolved && emergencyLevel === "high",
          "text-blue-700": !location.isResolved && emergencyLevel === "medium",
        })}
      >
        <div className="shrink-0 [&>svg]:size-4">
          {location.isResolved
            ? <Check className="size-4" />
            : emergencyLevel === "critical" ? <HighestPriorityIcon />
            : emergencyLevel === "high" ? <ChevronsUp className="size-4" />
            : <ChevronUp className="size-4" />}
        </div>
        <span className="text-xs font-semibold">{location.title}</span>
        <div className="ml-auto flex items-center gap-1 text-xs opacity-70">
          <Users className="size-3" />
          {victims.length}
        </div>
      </div>

      <div className="px-3 py-2 space-y-2">
        {location.address && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="line-clamp-2">{location.address}</span>
                  </div>
                )}

        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {EMERGENCY_LABELS[emergencyLevel]}
          </Badge>
          {location.routeConfidence && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {ROUTE_CONFIDENCE_LABELS[location.routeConfidence] ??
                location.routeConfidence}
            </Badge>
          )}
          {location.preferredTransportMode && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              Tiếp cận:{" "}
              {TRANSPORT_MODE_LABELS[location.preferredTransportMode] ??
                location.preferredTransportMode}
            </Badge>
          )}
        </div>

        {location.note && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <StickyNote className="size-3 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{location.note}</span>
          </div>
        )}

        {location.tags && location.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {location.tags.map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] px-1.5 py-0"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {victims.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-slate-700">
              Hộ trong điểm ({victims.length})
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {victims.map((victim, idx) => (
                <div
                  key={victim.id || idx}
                  className="p-1.5 rounded-md border text-xs space-y-0.5"
                >
                  <div className="font-semibold text-slate-800">
                    {victim.fullname}
                    {victim.age && (
                      <span className="font-normal text-muted-foreground ml-1">
                        ({victim.age} tuổi)
                      </span>
                    )}
                  </div>
                  {victim.phone && (
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Phone className="size-3" />
                      {victim.phone}
                    </div>
                  )}
                  {victim.tags && victim.tags.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                      {victim.tags.map(tag => (
                        <span
                          key={tag.id ?? `${victim.id}-${tag.name}`}
                          className="inline-flex items-center rounded px-1 py-0 text-[10px] font-medium"
                          style={{
                            backgroundColor: `${tag.color}20`,
                            color: tag.color,
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {victims.length === 0 && (
          <div className="text-xs text-muted-foreground py-1">
            Chưa có hộ dân nào gắn với điểm này.
          </div>
        )}

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          {prettyDate(location.createdAt)}
        </div>
      </div>
    </div>
  );
};
