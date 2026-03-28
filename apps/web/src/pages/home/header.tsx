import type * as React from "react";
import { useEffect } from "react";
import { parseAsString, useQueryState } from "nuqs";
import { provinceOptions } from "./data";
import { useMapContext } from "./map/map.context";
import {
  Select,
  SelectContent,
  SelectValue,
  SelectTrigger,
  SelectItem,
} from "@/components/ui/select";
import { useSocket } from "@/context/socket.context";
import { Button } from "@/components/ui/button";
import { MessageCircleIcon, MoreVerticalIcon, PhoneIcon } from "lucide-react";
import { paths } from "@/paths";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/menu";

export const Header: React.FC = () => {
  const [location, setLocation] = useQueryState(
    "location",
    parseAsString.withDefault(provinceOptions[0].label),
  );
  const { flyToLocation, map } = useMapContext();
  useEffect(() => {
    if (location && map) {
      const latlng = provinceOptions.find(l => l.label === location)?.latlng;
      if (latlng) {
        flyToLocation({ lat: latlng[0], lng: latlng[1] }, 10, 0);
      }
    }
  }, [location, map]);

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="hidden md:flex flex-col leading-none">
        <div className="text-xs uppercase tracking-[0.18em] text-cyan-700 font-semibold">
          HumanLogs2026
        </div>
        <div className="font-bold text-slate-900">Bảng điều phối lũ lụt</div>
      </div>
      <div className="ml-2">
        <Select
          value={location ?? undefined}
          onValueChange={value =>
            setLocation(value as (typeof provinceOptions)[number]["label"])
          }
        >
          <SelectTrigger className="min-w-56 bg-white/80">
            <SelectValue placeholder="Chọn vùng hiển thị" />
          </SelectTrigger>
          <SelectContent>
            {provinceOptions.map(location => (
              <SelectItem key={location.label} value={location.label}>
                {location.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ConnectionStatus />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button className="" variant="outline" size="icon">
              <MoreVerticalIcon className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => openInNewTab(paths.call())}>
              <PhoneIcon className="w-4 h-4" />
              Gọi điện AI
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openInNewTab(paths.chat())}>
              <MessageCircleIcon className="w-4 h-4" />
              Nhắn tin AI
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

const openInNewTab = (path: string) => {
  window.open(path, "_blank");
};

const ConnectionStatus: React.FC = () => {
  const { loading, isConnected } = useSocket();

  if (loading)
    return (
      <div className="ml-4 text-amber-700 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs flex gap-1 items-center">
        <div className="size-2 animate-pulse rounded-full bg-orange-600"></div>
        Đang kết nối...
      </div>
    );

  if (isConnected)
    return (
      <div className="ml-4 text-emerald-700 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs flex gap-1 items-center">
        <div className="size-2 animate-pulse rounded-full bg-green-600"></div>
        Kết nối thời gian thực ổn định
      </div>
    );

  return (
    <div className="ml-4 text-rose-700 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs flex gap-1 items-center">
      <div className="size-2 animate-pulse rounded-full bg-red-600"></div>
      Kết nối thời gian thực gián đoạn
    </div>
  );
};
