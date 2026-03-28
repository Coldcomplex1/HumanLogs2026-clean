import type * as React from "react";
import { api, RouterInputs } from "@/trpc/react";
import {
  Navigation,
  Ellipsis,
  Pencil,
  Trash,
  User,
  ArrowDownUp,
  Search,
  Loader2,
  ChevronsUp,
  ChevronUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/menu";
import { prettyDate } from "@/lib/dayjs";
import { useMapContext } from "../map.context";
import { cn } from "@/lib/utils";
import { LocationDetailModal, openLocationDetailModal } from "@/modals/location-details.modal";
import { useSocket } from "@/context/socket.context";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import { HighestPriorityIcon } from "@/icons/priority.icons";
import { Badge } from "@/components/ui/badge";

type Sort = RouterInputs["location"]["findMany"]["sort"];

const sortOptions: {
  id: Sort;
  label: string;
}[] = [
  {
    id: "newest",
    label: "Mới nhất",
  },
  {
    id: "oldest",
    label: "Cũ nhất",
  },
  {
    id: "emergency",
    label: "Khẩn cấp nhất trước",
  },
  {
    id: "a-z",
    label: "A-Z",
  },
  {
    id: "z-a",
    label: "Z-A",
  },
];

export const LocationsTab: React.FC = props => {
  const { socket } = useSocket();
  const { flyToLocation } = useMapContext();
  const removeLocationMutation = api.location.delete.useMutation();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue] = useDebounce(searchValue, 100);
  const [sortValue, setSortValue] = useState<Sort>("newest");

  const locationQuery = api.location.findMany.useQuery(
    {
      search: debouncedSearchValue || undefined,
      sort: sortValue || undefined,
    },
    { placeholderData: prev => prev || [] },
  );
  const locations = locationQuery.data || [];

  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      locationQuery.refetch();
    };
    socket.on("location:modified", handler);
    return () => {
      socket.off("location:modified", handler);
    };
  }, [socket, locationQuery]);

  return (
    <div className="flex-1 overflow-y-auto px-4 space-y-1">
      <div className="flex gap-1 w-full py-4">
        <div className="flex-1 relative">
          <Input
            placeholder="Tìm theo hộ dân, số điện thoại hoặc địa chỉ..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className="pl-6"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          {locationQuery.isFetching && (
            <Loader2 className="absolute z-10 right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            <ArrowDownUp />
            {sortValue !== "newest" && (
              <div className="absolute rounded-full bg-primary top-0 right-0 size-3 translate-x-1/3 -translate-y-1/3" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sortOptions.map(option => (
              <DropdownMenuCheckboxItem
                key={option.id}
                checked={sortValue === option.id}
                onCheckedChange={() => setSortValue(option.id)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {locations.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-3 text-center py-12">
          <Navigation size={40} className="mb-4 opacity-20" />
          <p className="text-sm">Chưa có vị trí nào được thêm.</p>
          <p className="text-xs mt-1 opacity-70">
            Nhấp chuột phải trên bản đồ để tạo điểm hỗ trợ mới.
          </p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {locations.map(loc => {
            return (
              <motion.div
                key={loc.id}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                // onClick={() => flyToLocation(loc, 18.5)}
              >
                <div className="p-2 relative rounded-md border hover:border-neutral-300 bg-white flex gap-2 items-start">
                  <div
                    className={cn(
                      "shrink-0 h-full absolute left-0 top-0 pl-0.5 py-2",
                    )}
                  >
                    <div
                      className={cn("h-full w-1 rounded-full", {
                        "bg-red-500": loc.emergencyLevel === "critical",
                        "bg-yellow-500": loc.emergencyLevel === "high",
                        "bg-blue-500": loc.emergencyLevel === "medium",
                      })}
                    ></div>
                  </div>
                  <div
                    className={cn("shrink-0 [&>svg]:size-5", {
                      "text-red-500 animate-pulse":
                        loc.emergencyLevel === "critical",
                      "text-yellow-500": loc.emergencyLevel === "high",
                      "text-blue-500": loc.emergencyLevel === "medium",
                    })}
                  >
                    {loc.emergencyLevel === "critical" && (
                      <HighestPriorityIcon />
                    )}
                    {loc.emergencyLevel === "high" && <ChevronsUp />}
                    {loc.emergencyLevel === "medium" && <ChevronUp />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-slate-800 truncate text-sm hover:underline cursor-pointer"
                      onClick={() => flyToLocation(loc, 18.5)}
                    >
                      {loc.title}
                    </h3>
                    {loc.summary && (
                      <div className="text-sm text-muted-foreground mt-1 italic">
                        {loc.summary}
                      </div>
                    )}
                    <ul className="space-y-1 mt-1">
                      {loc.victims.map(v => (
                        <li key={v.id} className="text-xs text-muted-foreground p-1 border rounded-lg flex px-2">
                          <div className="font-semibold">{v.fullname}</div>
                          <div className="mx-1">•</div>
                          <div>{v.phone}</div>
                        </li>
                      ))}
                    </ul>
                    <ul className="flex gap-1 mt-1 flex-wrap">
                      {loc.tags?.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </ul>

                    <div className="text-xs text-muted-foreground mt-1">
                      {loc.address}
                    </div>
                    <div className="text-xs text-foreground mt-1">
                      {prettyDate(loc.createdAt)}
                    </div>
                  </div>
                  <div className="gap-0.5 shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-sm" />}
                        onClick={e => e.stopPropagation()}
                      >
                        <Ellipsis />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            openLocationDetailModal({ locationId: loc.id })
                          }
                        >
                          <User />
                          Mở chi tiết
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem>
                          <Pencil />
                          Chỉnh sửa
                        </DropdownMenuItem> */}
                        <DropdownMenuItem
                          onClick={() => flyToLocation(loc, 16.5)}
                        >
                          <Navigation />
                          Xem trên bản đồ
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            if (
                              confirm("Bạn có chắc chắn muốn xóa vị trí này?")
                            ) {
                              removeLocationMutation.mutate({ id: loc.id });
                            }
                          }}
                        >
                          <Trash />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
      <div className="h-8"></div>
    </div>
  );
};
