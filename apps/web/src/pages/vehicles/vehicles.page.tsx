import { useState } from "react";
import { DashboardLayout } from "../dashboard.layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Frame } from "@/components/ui/frame";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { VehicleModal, openVehicleModal } from "@/modals/vehicle.modal";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toastManager } from "@/components/ui/toast";

const vehicleTypeLabels: Record<string, string> = {
  boat: "Xuồng / thuyền",
  truck: "Xe tải",
  ambulance: "Xe cứu thương",
  motorbike: "Xe máy",
  drone: "Drone",
};

const vehicleStatusLabels: Record<string, string> = {
  available: "Sẵn sàng",
  on_mission: "Đang nhiệm vụ",
  maintenance: "Bảo trì",
  offline: "Ngoại tuyến",
};

export default function VehiclesPage() {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const utils = api.useUtils();

  const vehiclesQuery = api.vehicle.findMany.useQuery(
    { search: search || undefined },
    { placeholderData: prev => prev || [] },
  );

  const deleteVehicleMutation = api.vehicle.delete.useMutation({
    onSuccess: () => {
      toastManager.add({
        title: "Đã xóa phương tiện",
        type: "success",
      });
      utils.vehicle.findMany.invalidate();
      setDeleteId(null);
    },
    onError: error => {
      toastManager.add({
        title: "Xóa phương tiện thất bại",
        description: error.message,
        type: "error",
      });
      setDeleteId(null);
    },
  });

  const vehicles = vehiclesQuery.data || [];

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-cyan-700 font-semibold">
              Điều phối phương tiện
            </div>
            <h1 className="text-2xl font-bold">Phương tiện cứu trợ</h1>
          </div>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tìm theo tên..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64"
            />
            <Button onClick={() => openVehicleModal()}>Thêm phương tiện</Button>
          </div>
        </div>

        <div>
          <Frame className="bg-white/90 backdrop-blur-xl border-white/70">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ảnh</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Loại phương tiện</TableHead>
                  <TableHead>Sức chứa</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehiclesQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Không tìm thấy phương tiện
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicles.map(vehicle => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        {vehicle.image ? (
                          <img
                            src={vehicle.image}
                            alt={vehicle.name || "Vehicle"}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                            N/A
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {vehicle.name || "-"}
                      </TableCell>
                      <TableCell>
                        {vehicle.vehicleType
                          ? vehicleTypeLabels[vehicle.vehicleType] ??
                            vehicle.vehicleType
                          : "-"}
                      </TableCell>
                      <TableCell>{vehicle.capacity || "-"}</TableCell>
                      <TableCell>
                        {vehicle.status
                          ? vehicleStatusLabels[vehicle.status] ?? vehicle.status
                          : "-"}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {vehicle.note || vehicle.tags?.join(", ") || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex h-1 items-center justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              openVehicleModal({ vehicleId: vehicle.id })
                            }
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(vehicle.id)}
                          >
                            <Trash />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Frame>
        </div>
      </div>

      <VehicleModal />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Thông tin phương tiện sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose
              render={<Button variant="outline">Hủy</Button>}
            />
            <AlertDialogClose
              render={
                <Button
                  variant="destructive"
                  onClick={() =>
                    deleteId && deleteVehicleMutation.mutate({ id: deleteId })
                  }
                  disabled={deleteVehicleMutation.isPending}
                >
                  {deleteVehicleMutation.isPending ? "Đang xóa..." : "Xóa"}
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
