import type * as React from "react";
import { cn } from "@/lib/utils";
import { Hand, Lasso, Pencil, Waypoints, X } from "lucide-react";
import { useToolbarContext } from "./toolbar.context";
import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
import { TileLayerSwitcher } from "./tile-layer";

export const MapToolbar: React.FC = () => {
  const { mode, setMode, cancelDrawing } = useToolbarContext();

  return (
    <>
      <div className="absolute top-20 right-6 z-50 bg-white/92 backdrop-blur p-1.5 shadow-[0_20px_40px_rgba(15,58,95,0.18)] rounded-full border border-slate-200/70">
        <TooButton
          icon={<Hand className="size-5" />}
          active={mode === "idle"}
          onClick={() => setMode("idle")}
        />
        <TooButton
          icon={<Pencil className="size-5" />}
          active={mode === "draw-path"}
          onClick={() => setMode("draw-path")}
        />
        <TooButton
          icon={<Lasso className="size-5" />}
          active={mode === "zone-select"}
          onClick={() => setMode(mode === "zone-select" ? "idle" : "zone-select")}
        />
      </div>
      <TileLayerSwitcher />

      {mode === "draw-path" && (
        <div className="z-50 absolute bottom-6 right-3 bg-white/94 backdrop-blur px-4 py-3 text-sm rounded-2xl shadow-[0_20px_40px_rgba(15,58,95,0.18)] border border-slate-200/70 flex gap-2">
          <Waypoints className="size-6 mt-2" />
          <div>
            <div className="font-medium">Chế độ vẽ vùng cảnh báo</div>
            <div className="text-xs">
              Nhấp vào bản đồ để thêm từng điểm của vùng.
              <br />
              Khép lại tại điểm đầu để tạo vùng ngập hoặc vùng nguy hiểm.
            </div>
            <div className="text-xs mt-1">
              <Kbd>Esc</Kbd> để hủy vẽ bất kỳ lúc nào.
            </div>
          </div>
          <div>
            <Button variant="ghost" size="icon-sm" onClick={cancelDrawing}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {mode === "zone-select" && (
        <div className="z-50 absolute bottom-6 right-3 bg-white/94 backdrop-blur px-4 py-3 text-sm rounded-2xl shadow-[0_20px_40px_rgba(15,58,95,0.18)] border border-slate-200/70 flex gap-2">
          <Lasso className="size-6 mt-2 text-blue-500" />
          <div>
            <div className="font-medium">Chế độ chọn vùng</div>
            <div className="text-xs">
              Nhấp vào bản đồ để khoanh vùng các điểm cần hỗ trợ.
              <br />
              Khép vùng để mở nhanh form tạo kế hoạch điều phối.
            </div>
            <div className="text-xs mt-1">
              <Kbd>Esc</Kbd> để hủy bất kỳ lúc nào.
            </div>
          </div>
          <div>
            <Button variant="ghost" size="icon-sm" onClick={() => setMode("idle")}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

const TooButton: React.FC<{
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  active: boolean;
}> = ({ icon, onClick, className, active }) => {
  return (
    <button
      type="button"
      className={cn(
        "size-9 cursor-pointer rounded-full bg-white flex items-center justify-center",
        active
          ? "bg-blue-100 text-blue-500"
          : "hover:bg-neutral-100 text-neutral-500",
        className,
      )}
      onClick={onClick}
    >
      {icon}
    </button>
  );
};
