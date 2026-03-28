import type * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEffect, useMemo, useState } from "react";
import { EventEmitter } from "events";
import { api } from "@/trpc/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const events = new EventEmitter();

const needTypeLabels: Record<string, string> = {
  thuoc: "Thuốc",
  nuoc: "Nước sạch",
  luong_thuc: "Lương thực",
  sua_em_be: "Sữa em bé",
  so_tan: "Sơ tán",
  sac_dien: "Sạc điện",
  ao_phao: "Áo phao",
  ve_sinh: "Đồ vệ sinh",
  lien_lac: "Hỗ trợ liên lạc",
};

type OpenArgs = {
  victimId: string;
};

export const VictimDetailModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [victimId, setVictimId] = useState<string | null>(null);

  const victimQuery = api.victim.findById.useQuery(
    { id: victimId || "" },
    { enabled: !!victimId },
  );

  useEffect(() => {
    const onOpen = (args: OpenArgs) => {
      setVictimId(args.victimId);
      setOpen(true);
    };
    const onClose = () => setOpen(false);

    events.on("open", onOpen);
    events.on("close", onClose);
    return () => {
      events.off("open", onOpen);
      events.off("close", onClose);
    };
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setVictimId(null);
    }
  };

  const victim = victimQuery.data;

  const linkedConversationIds = useMemo(
    () => (victim?.conversations || []).filter(Boolean),
    [victim?.conversations],
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Chi tiết hộ dân / người cần hỗ trợ</SheetTitle>
          <SheetDescription>
            Xem nhanh hồ sơ, nhu cầu cứu trợ và lịch sử trao đổi đã lưu.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex-1 overflow-hidden">
          {victimQuery.isLoading ? (
            <div className="flex justify-center p-8 text-muted-foreground">
              Đang tải dữ liệu...
            </div>
          ) : !victim ? (
            <div className="flex justify-center p-8 text-muted-foreground">
              Không tìm thấy hồ sơ này.
            </div>
          ) : (
            <Tabs defaultValue="info" className="flex h-full flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Thông tin</TabsTrigger>
                <TabsTrigger value="interactions">Tương tác</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4 flex-1 overflow-auto">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-6">
                    <section className="space-y-3">
                      <div>
                        <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                          Họ tên
                        </h4>
                        <p className="text-base font-semibold">{victim.fullname}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="Điện thoại" value={victim.phone} />
                        <InfoItem label="Điện thoại phụ" value={victim.phone2} />
                        <InfoItem label="Tuổi" value={victim.age} />
                        <InfoItem
                          label="Giới tính"
                          value={
                            victim.gender === "male"
                              ? "Nam"
                              : victim.gender === "female"
                                ? "Nữ"
                                : victim.gender === "other"
                                  ? "Khác"
                                  : undefined
                          }
                        />
                        <InfoItem label="Số người trong hộ" value={victim.householdSize} />
                        <InfoItem
                          label="Ngày chưa nhận hỗ trợ"
                          value={victim.daysWithoutAid}
                        />
                      </div>

                      <InfoItem label="Địa chỉ" value={victim.addressText} />
                      <InfoItem label="Email" value={victim.email} />

                      {victim.location && (
                        <div className="rounded-xl border bg-muted/30 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <Badge variant="outline">
                              {victim.location.emergencyLevel === "critical"
                                ? "Nguy kịch"
                                : victim.location.emergencyLevel === "high"
                                  ? "Khẩn cấp"
                                  : "Cần hỗ trợ"}
                            </Badge>
                            <Badge variant="secondary">
                              {victim.location.status === "safe"
                                ? "An toàn"
                                : victim.location.status === "in_progress"
                                  ? "Đang tiếp cận"
                                  : "Đang mở"}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">
                            {victim.location.summary || "Điểm hỗ trợ chưa có tóm tắt"}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {victim.location.address || "Chưa có địa chỉ chi tiết"}
                          </p>
                        </div>
                      )}
                    </section>

                    <section className="space-y-3">
                      <h4 className="text-sm font-medium">Nhu cầu và mức độ dễ tổn thương</h4>
                      <div className="flex flex-wrap gap-2">
                        {(victim.needTypes || []).map((item) => (
                          <Badge key={item} variant="outline">
                            {needTypeLabels[item] ?? item}
                          </Badge>
                        ))}
                        {!victim.needTypes?.length && (
                          <span className="text-sm text-muted-foreground">
                            Chưa ghi nhận nhu cầu cụ thể.
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FlagCell label="Cần y tế" active={!!victim.needsMedical} />
                        <FlagCell
                          label="Tiếp cận bằng xuồng"
                          active={!!victim.boatAccessible}
                        />
                        <FlagCell label="Có trẻ em" active={!!victim.hasChildren} />
                        <FlagCell label="Có người cao tuổi" active={!!victim.hasElderly} />
                        <FlagCell
                          label="Có người khuyết tật"
                          active={!!victim.hasDisability}
                        />
                        <FlagCell
                          label="Có phụ nữ mang thai"
                          active={!!victim.isPregnant}
                        />
                      </div>

                      <InfoItem
                        label="Mực nước ước tính"
                        value={victim.waterDepthEstimate}
                      />
                      <InfoItem
                        label="Danh sách thuốc"
                        value={victim.medicineList?.join(", ")}
                      />
                      <InfoItem label="Facebook" value={victim.facebookURL} />
                      <InfoItem label="Ghi chú" value={victim.note} multiline />
                    </section>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="interactions"
                className="mt-4 flex-1 overflow-auto"
              >
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    {!!victim.relatedConversations?.length && (
                      <section className="space-y-3">
                        <h4 className="text-sm font-medium">Nhật ký cuộc gọi / nhắn tin</h4>
                        {victim.relatedConversations.map((conversation) => (
                          <div
                            key={conversation.id}
                            className="rounded-xl border bg-muted/20 p-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {conversation.channel === "call" ? "Cuộc gọi" : "Nhắn tin"}
                                </Badge>
                                <Badge variant="secondary">
                                  {conversation.status === "completed"
                                    ? "Hoàn tất"
                                    : conversation.status === "active"
                                      ? "Đang diễn ra"
                                      : conversation.status === "failed"
                                        ? "Lỗi"
                                        : "Đã kết thúc"}
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(conversation.startedAt).toLocaleString("vi-VN")}
                              </span>
                            </div>
                            <p className="mt-2 text-sm">
                              {conversation.summary || "Chưa có tóm tắt nội dung."}
                            </p>
                          </div>
                        ))}
                      </section>
                    )}

                    <section className="space-y-3">
                      <h4 className="text-sm font-medium">Mã conversation đã liên kết</h4>
                      {linkedConversationIds.length ? (
                        <div className="space-y-2">
                          {linkedConversationIds.map((conversationId) => (
                            <div
                              key={conversationId}
                              className="rounded-lg border bg-background px-3 py-2 font-mono text-xs"
                            >
                              {conversationId}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                          Chưa có conversation ID nào được gắn với hồ sơ này.
                        </div>
                      )}
                    </section>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const InfoItem: React.FC<{
  label: string;
  value?: string | number | null;
  multiline?: boolean;
}> = ({ label, value, multiline = false }) => (
  <div>
    <h4 className="mb-1 text-sm font-medium text-muted-foreground">{label}</h4>
    <p
      className={multiline ? "whitespace-pre-wrap text-sm" : "text-sm"}
    >
      {value || "-"}
    </p>
  </div>
);

const FlagCell: React.FC<{ label: string; active: boolean }> = ({
  label,
  active,
}) => (
  <div className="rounded-lg border px-3 py-2 text-sm">
    <div className="font-medium">{label}</div>
    <div className="mt-1 text-xs text-muted-foreground">
      {active ? "Có ghi nhận" : "Không ghi nhận"}
    </div>
  </div>
);

export const openVictimDetailModal = (args: OpenArgs) => {
  events.emit("open", args);
};
