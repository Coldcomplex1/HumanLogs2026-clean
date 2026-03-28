import type * as React from "react";
import { MapPin, Pencil, Share2 } from "lucide-react";
import { useAppContext } from "../../app.context";
import { Button } from "@/components/ui/button";
import { openMarkerModal } from "@/modals/marker.modal";

export const MarkerTab: React.FC = props => {
  const { markers } = useAppContext();

  return (
    <div className="flex-1 overflow-y-auto px-4 space-y-1">
      <div className="h-4"></div>
      {markers.map(marker => (
        <div
          className="p-2 relative text-sm rounded-md border hover:border-neutral-300 bg-white cursor-pointer flex gap-2 items-start"
          key={marker.id}
        >
          <div className="[&>svg]:size-4">
            {marker.type === "mark" ? <MapPin /> : <Share2 />}
          </div>
          <div className="flex-1">
            <div className="font-medium capitalize">
              {marker.name || marker.markType || "Chưa đặt tên"}
            </div>
            {marker.note && (
              <div className="text-xs text-muted-foreground mt-1 italic">
                {marker.note}
              </div>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                openMarkerModal({
                  mode: "edit",
                  markerId: marker.id,
                });
              }}
            >
              <Pencil />
            </Button>
          </div>
        </div>
      ))}
      <div className="h-8"></div>
    </div>
  );
};
