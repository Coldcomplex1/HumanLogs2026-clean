import type * as React from "react";
import { api } from "@/trpc/react";
import {
  Car,
  Ellipsis,
  Pencil,
  Plus,
  Search,
  Trash,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/menu";
import { useSocket } from "@/context/socket.context";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import { openVehicleModal, VehicleModal } from "@/modals/vehicle.modal";
import { toastManager } from "@/components/ui/toast";

export const VehicleTab: React.FC = () => {
  const { socket } = useSocket();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue] = useDebounce(searchValue, 100);

  const vehicleQuery = api.vehicle.findMany.useQuery(
    { search: debouncedSearchValue || undefined },
    { placeholderData: prev => prev || [] },
  );
  const vehicles = vehicleQuery.data || [];

  const deleteMutation = api.vehicle.delete.useMutation({
    onSuccess: () => {
      toastManager.add({ title: "Đã xóa phương tiện", type: "success" });
      vehicleQuery.refetch();
    },
    onError: error => {
      toastManager.add({
        title: "Xóa phương tiện thất bại",
        description: error.message,
        type: "error",
      });
    },
  });

  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      vehicleQuery.refetch();
    };
    socket.on("vehicle:modified", handler);
    return () => {
      socket.off("vehicle:modified", handler);
    };
  }, [socket, vehicleQuery]);

  return (
    <div className="flex-1 overflow-y-auto px-4 space-y-1">
      <div className="flex gap-1 w-full py-4">
        <div className="flex-1 relative">
          <Input
            placeholder="Tìm kiếm phương tiện..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className="pl-6"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          {vehicleQuery.isFetching && (
            <Loader2 className="absolute z-10 right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
          )}
        </div>
        <Button variant="outline" onClick={() => openVehicleModal()}>
          <Plus />
        </Button>
      </div>
      {vehicles.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-3 text-center py-12">
          <Car size={40} className="mb-4 opacity-20" />
          <p className="text-sm">Chưa có phương tiện nào được thêm.</p>
          <p className="text-xs mt-1 opacity-70">
            Nhấn nút + để thêm phương tiện.
          </p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {vehicles.map(vehicle => (
            <motion.div
              key={vehicle.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <div className="p-2 relative rounded-md border hover:border-neutral-300 bg-white cursor-pointer flex gap-2 items-start">
                {vehicle.image ? (
                  <img
                    src={vehicle.image}
                    alt={vehicle.name || "Phương tiện"}
                    className="w-8 h-8 rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                    <Car className="size-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate text-sm">
                    {vehicle.name || "Chưa đặt tên"}
                  </h3>
                  {vehicle.note && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {vehicle.note}
                    </p>
                  )}
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
                          openVehicleModal({ vehicleId: vehicle.id })
                        }
                      >
                        <Pencil />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          if (
                            confirm(
                              "Bạn có chắc chắn muốn xóa phương tiện này?",
                            )
                          ) {
                            deleteMutation.mutate({ id: vehicle.id });
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
          ))}
        </AnimatePresence>
      )}
      <div className="h-8"></div>
      <VehicleModal />
    </div>
  );
};
