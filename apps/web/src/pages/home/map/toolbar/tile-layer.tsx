import { cn } from "@/lib/utils";
import { TILE_PROVIDERS } from "../../data";
import { useMapContext } from "../map.context";

export function TileLayerSwitcher() {
  const { tileProvider, setTileProvider } = useMapContext();

  return (
    <div className="absolute bottom-6 right-3 z-50">
      <div className="">
        <div className="flex flex-col gap-1">
          {TILE_PROVIDERS.map(provider => (
            <button
              type="button"
              key={provider.id}
              onClick={() => setTileProvider(provider.id)}
              className={cn(
                "text-xs font-medium cursor-pointer transition-colors rounded-lg overflow-hidden",
                provider.id === tileProvider.id
                  ? "ring-2 ring-primary"
                  : "opacity-50",
                tileProvider.id === provider.id
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              <img
                src={provider.preview}
                alt={provider.name}
                className="size-16"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
