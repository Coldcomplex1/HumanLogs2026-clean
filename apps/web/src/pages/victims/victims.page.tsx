import { useState } from "react";
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
import { VictimModal, openVictimModal } from "@/modals/victim.modal";
import { VictimDetailModal, openVictimDetailModal } from "@/modals/victim-detail.modal";
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

export default function VictimsPage() {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const utils = api.useUtils();

  const victimsQuery = api.victim.findMany.useQuery(
    { search: search || undefined },
    { placeholderData: prev => prev || [] },
  );

  const deleteVictimMutation = api.victim.delete.useMutation({
    onSuccess: () => {
      toastManager.add({
        title: "Đã xóa nạn nhân",
        type: "success",
      });
      utils.victim.findMany.invalidate();
      setDeleteId(null);
    },
    onError: error => {
      toastManager.add({
        title: "Xóa nạn nhân thất bại",
        description: error.message,
        type: "error",
      });
      setDeleteId(null);
    },
  });

  const victims = victimsQuery.data || [];

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-cyan-700 font-semibold">
              Điều phối hộ dân
            </div>
            <h1 className="text-2xl font-bold">Hộ dân / người cần hỗ trợ</h1>
          </div>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tìm theo tên, số điện thoại hoặc địa chỉ..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64"
            />
            <Button onClick={() => openVictimModal()}>Thêm hộ dân</Button>
          </div>
        </div>

        <div className="">
          <Frame className="bg-white/90 backdrop-blur-xl border-white/70">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Điện thoại</TableHead>
                  <TableHead>Tuổi</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead>Loại nhu cầu</TableHead>
                  <TableHead>Mức khẩn cấp</TableHead>
                  <TableHead>Tình trạng</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Nhãn</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {victimsQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : victims.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Không tìm thấy hộ dân cần hỗ trợ
                    </TableCell>
                  </TableRow>
                ) : (
                  victims.map(victim => (
                    <TableRow key={victim.id}>
                      <TableCell className="font-medium">
                        {victim.fullname}
                      </TableCell>
                      <TableCell>{victim.phone || "-"}</TableCell>
                      <TableCell>{victim.age ?? "-"}</TableCell>
                      <TableCell className="capitalize">
                        {victim.gender === "male"
                          ? "Nam"
                          : victim.gender === "female"
                            ? "Nữ"
                            : victim.gender === "other"
                              ? "Khác"
                              : "-"}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate">
                        {victim.needTypes?.length ? victim.needTypes.join(", ") : "-"}
                      </TableCell>
                      <TableCell>
                        {victim.location?.emergencyLevel === "critical"
                          ? "Nguy kịch"
                          : victim.location?.emergencyLevel === "high"
                            ? "Khẩn cấp"
                            : victim.location?.emergencyLevel === "medium"
                              ? "Cần hỗ trợ"
                              : "-"}
                      </TableCell>
                      <TableCell>
                        {victim.location?.status === "safe"
                          ? "An toàn"
                          : victim.location?.status === "in_progress"
                            ? "Đang tiếp cận"
                            : victim.location?.status === "active"
                              ? "Đang mở"
                              : "-"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {victim.addressText || victim.location?.address || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {victim.tags?.map(tag => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              style={{ backgroundColor: tag.color }}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex h-1 items-center justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openVictimDetailModal({ victimId: victim.id })}
                          >
                            <Eye />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openVictimModal({ victim })}
                          >
                            <Pencil />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDeleteId(victim.id)}
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

      <VictimModal />
      <VictimDetailModal />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Thông tin nạn nhân sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="outline">Hủy</Button>} />
            <AlertDialogClose
              render={
                <Button
                  variant="destructive"
                  onClick={() => deleteId && deleteVictimMutation.mutate({ id: deleteId })}
                  disabled={deleteVictimMutation.isPending}
                >
                  {deleteVictimMutation.isPending ? "Đang xóa..." : "Xóa"}
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
