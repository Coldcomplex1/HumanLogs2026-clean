import type * as React from "react";
import { toastManager } from "@/components/ui/toast";
import { CopyIcon, TriangleAlert, User } from "lucide-react";
import { PropsWithChildren, useEffect, useState } from "react";
import { createLocationModal } from "../../../modals/location.modal";
import { openMarkerModal } from "@/modals/marker.modal";
import { useMapContext } from "./map.context";

export function ContextMenuMap() {
  const { map } = useMapContext();
  const [menuState, setMenuState] = useState<{
    position: { x: number; y: number };
    latlng: { lat: number; lng: number };
  } | null>(null);

  useEffect(() => {
    if (!map) return;
    const m = map.getMap();

    const handleContextMenu = (e: maplibregl.MapMouseEvent) => {
      e.originalEvent.preventDefault();
      setMenuState({
        position: { x: e.originalEvent.clientX, y: e.originalEvent.clientY },
        latlng: { lat: e.lngLat.lat, lng: e.lngLat.lng },
      });
    };

    const handleClick = () => {
      setTimeout(() => setMenuState(null), 100);
    };

    const handleDragStart = () => {
      setMenuState(null);
    };

    m.on("contextmenu", handleContextMenu);
    m.on("click", handleClick);
    m.on("dragstart", handleDragStart);

    return () => {
      m.off("contextmenu", handleContextMenu);
      m.off("click", handleClick);
      m.off("dragstart", handleDragStart);
    };
  }, [map]);

  const handleCopyLatLng = () => {
    if (menuState) {
      const text = `${menuState.latlng.lat.toFixed(6)}, ${menuState.latlng.lng.toFixed(6)}`;
      navigator.clipboard.writeText(text).then(
        () => {
          toastManager.add({
            title: "Đã sao chép tọa độ",
            type: "success",
          });
        },
        err => {
          console.error("Failed to copy: ", err);
        },
      );
      setMenuState(null);
    }
  };

  const handleCreateMarker = () => {
    if (menuState) {
      openMarkerModal({
        mode: "create",
        latlng: {
          lat: menuState.latlng.lat,
          lng: menuState.latlng.lng,
        },
      });
      setMenuState(null);
    }
  };

  const handleAddVictim = () => {
    if (menuState) {
      createLocationModal({
        lat: menuState.latlng.lat,
        lng: menuState.latlng.lng,
      });
      setMenuState(null);
    }
  };

  if (!menuState) return null;

  const menuWidth = 180;
  const menuHeight = 160;
  const flipX = menuState.position.x + menuWidth > window.innerWidth;
  const flipY = menuState.position.y + menuHeight > window.innerHeight;

  return (
    <div
      className="fixed z-1000 bg-white border p-1 rounded-xl shadow-xl py-1 min-w-[180px]"
      style={{
        left: flipX ? menuState.position.x - menuWidth : menuState.position.x,
        top: flipY ? menuState.position.y - menuHeight : menuState.position.y,
      }}
    >
      <div className="absolute bottom-full translate-x-1/2 right-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
        >
          <path
            fill="#888888"
            d="M12 12q.825 0 1.413-.587T14 10t-.587-1.412T12 8t-1.412.588T10 10t.588 1.413T12 12m0 10q-4.025-3.425-6.012-6.362T4 10.2q0-3.75 2.413-5.975T12 2t5.588 2.225T20 10.2q0 2.5-1.987 5.438T12 22"
          />
        </svg>
      </div>
      <ContextMenuItem
        icon={<User />}
        label="Thêm hộ dân cần hỗ trợ"
        onClick={handleAddVictim}
      />
      <ContextMenuItem
        icon={<TriangleAlert />}
        label="Thêm điểm cảnh báo"
        onClick={handleCreateMarker}
      />
      <ContextMenuItem
        icon={<CopyIcon />}
        label="Sao chép tọa độ"
        onClick={handleCopyLatLng}
      />
    </div>
  );
}

const ContextMenuItem: React.FC<
  PropsWithChildren<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }>
> = ({ icon, label, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-2 rounded-lg [&>svg]:size-4 py-1.5 text-left text-sm hover:bg-accent cursor-pointer flex items-center gap-2"
    >
      {icon}
      {label}
    </button>
  );
};
