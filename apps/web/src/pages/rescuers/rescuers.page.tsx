import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "../dashboard.layout";
import { Badge } from "@/components/ui/badge";
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
import { Eye, Pencil, Trash } from "lucide-react";
import { RescuerModal, openRescuerModal } from "@/modals/rescuer.modal";
import { RescuerDetailModal, openRescuerDetailModal } from "@/modals/rescuer-detail.modal";
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
import { RescuerAvatar } from "@/components/rescuer-avatar";
import { useSocket } from "@/context/socket.context";

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  on_mission: "bg-blue-100 text-blue-800",
  off_duty: "bg-gray-100 text-gray-700",
  injured: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  available: "Sẵn sàng",
  on_mission: "Đang làm nhiệm vụ",
  off_duty: "Nghỉ phép",
  injured: "Bị thương",
};

const roleLabels: Record<string, string> = {
  medic: "Y tá / Cứu thương",
  boat_operator: "Lái xuồng",
  driver: "Tài xế",
  diver: "Thợ lặn",
  logistics: "Hậu cần",
  coordinator: "Điều phối viên",
  volunteer: "Tình nguyện viên",
};


export default function RescuersPage() {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const utils = api.useUtils();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      utils.rescuer.findMany.invalidate();
    };
    socket.on("rescuer:modified", handler);
    return () => { socket.off("rescuer:modified", handler); };
  }, [socket, utils]);

  const rescuersQuery = api.rescuer.findMany.useQuery(
    { search: search || undefined },
    { placeholderData: prev => prev || [] },
  );

  const plansQuery = api.rescuePlan.findMany.useQuery(
    {},
    { placeholderData: prev => prev || [] },
  );

  // Build a map: rescuerId → plan title (prefer active plans first)
  const rescuerPlanMap = useMemo(() => {
    const plans = plansQuery.data ?? [];
    const map = new Map<string, string>();
    const priority: Record<string, number> = { active: 0, draft: 1, completed: 2, cancelled: 3 };
    const sorted = [...plans].sort((a, b) => (priority[a.status] ?? 9) - (priority[b.status] ?? 9));
    for (const plan of sorted) {
      for (const { rescuer } of plan.rescuers) {
        if (!map.has(rescuer.id)) map.set(rescuer.id, plan.title);
      }
    }
    return map;
  }, [plansQuery.data]);

  const deleteMutation = api.rescuer.delete.useMutation({
    onSuccess: () => {
      toastManager.add({ title: "Đã xóa cứu hộ viên", type: "success" });
      utils.rescuer.findMany.invalidate();
      setDeleteId(null);
    },
    onError: error => {
      toastManager.add({
        title: "Xóa cứu hộ viên thất bại",
        description: error.message,
        type: "error",
      });
      setDeleteId(null);
    },
  });

  const rescuers = rescuersQuery.data || [];

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-cyan-700 font-semibold">
              Điều phối nhân lực
            </div>
            <h1 className="text-2xl font-bold">Đội cứu trợ</h1>
          </div>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64"
            />
            <Button onClick={() => openRescuerModal()}>Thêm cứu hộ viên</Button>
          </div>
        </div>

        <Frame className="bg-white/90 backdrop-blur-xl border-white/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thành viên</TableHead>
                <TableHead>Điện thoại</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Kế hoạch hiện tại</TableHead>
                <TableHead>Khu vực</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rescuersQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : rescuers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Không tìm thấy cứu hộ viên
                  </TableCell>
                </TableRow>
              ) : (
                rescuers.map(rescuer => (
                  <TableRow key={rescuer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <RescuerAvatar
                          id={rescuer.id}
                          name={rescuer.fullName}
                          avatarUrl={rescuer.avatarUrl}
                          size="sm"
                        />
                        <div>
                          <div className="font-medium">{rescuer.fullName}</div>
                          {rescuer.email && (
                            <div className="text-xs text-muted-foreground">{rescuer.email}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{rescuer.phone}</div>
                      {rescuer.secondaryPhone && (
                        <div className="text-xs text-muted-foreground">{rescuer.secondaryPhone}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {rescuer.role ? (
                        <Badge variant="outline">{roleLabels[rescuer.role] ?? rescuer.role}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {rescuer.status ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[rescuer.status] ?? ""}`}
                        >
                          {statusLabels[rescuer.status] ?? rescuer.status}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {rescuerPlanMap.has(rescuer.id) ? (
                        <span className="font-medium text-neutral-700">{rescuerPlanMap.get(rescuer.id)}</span>
                      ) : (
                        <span className="text-muted-foreground">Chưa được phân công kế hoạch</span>
                      )}
                    </TableCell>
                    <TableCell>{rescuer.region || "—"}</TableCell>
                    <TableCell>
                      <div className="flex h-1 items-center justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openRescuerDetailModal({ rescuerId: rescuer.id })}
                        >
                          <Eye />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openRescuerModal({ rescuer })}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(rescuer.id)}
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

      <RescuerModal />
      <RescuerDetailModal />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Thông tin cứu hộ viên sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="outline">Hủy</Button>} />
            <AlertDialogClose
              render={
                <Button
                  variant="destructive"
                  onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
