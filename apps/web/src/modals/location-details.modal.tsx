import type * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { EventEmitter } from "events";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Check } from "lucide-react";

const events = new EventEmitter();

type Args = {
  locationId: string;
};

const emergencyLabels: Record<string, string> = {
  critical: "Nguy kịch",
  high: "Khẩn cấp",
  medium: "Cần hỗ trợ",
};

const statusLabels: Record<string, string> = {
  active: "Đang mở",
  in_progress: "Đang tiếp cận",
  safe: "An toàn",
};

const transportLabels: Record<string, string> = {
  road: "Đường bộ",
  boat: "Xuồng / thuyền",
  walk: "Đi bộ",
  ambulance: "Xe cứu thương",
  drone: "Drone",
  hand_off: "Trung chuyển",
};

const confidenceLabels: Record<string, string> = {
  high: "Tin cậy cao",
  medium: "Tin cậy trung bình",
  low: "Tin cậy thấp",
  unverified: "Chưa xác minh",
  dangerous: "Nguy hiểm",
};

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

export const LocationDetailModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [args, setArgs] = useState<Args | null>(null);

  useEffect(() => {
    const onOpen = (nextArgs: Args) => {
      setArgs(nextArgs);
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
      setArgs(null);
    }
  };

  const locationQuery = api.location.findById.useQuery(
    { id: args?.locationId || "" },
    { enabled: !!args?.locationId },
  );

  const location = locationQuery.data;
  const victims = location?.victims || [];
  const routeReports = location?.routeReports || [];
  const conversations = location?.relatedConversations || [];

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Chi tiết điểm hỗ trợ</SheetTitle>
          <SheetDescription>
            Theo dõi tình trạng điểm, hướng tiếp cận và các hộ dân đang liên quan.
          </SheetDescription>
        </SheetHeader>

        <SheetPanel className="space-y-5">
          {locationQuery.isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Đang tải chi tiết điểm...
            </div>
          ) : !location ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Không tìm thấy điểm hỗ trợ này.
            </div>
          ) : (
            <>
              <div className="space-y-3 rounded-2xl border bg-slate-950 p-4 text-white">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="warning">
                    {emergencyLabels[location.emergencyLevel] ?? location.emergencyLevel}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/10 text-white">
                    {statusLabels[location.status] ?? location.status}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 bg-white/5 text-white">
                    {confidenceLabels[location.routeConfidence] ??
                      location.routeConfidence}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {location.summary || "Điểm chưa có tóm tắt AI"}
                  </h3>
                  <p className="mt-1 text-sm text-white/70">
                    {location.address || "Chưa có địa chỉ mô tả"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <MetricCard
                    label="Phương án tiếp cận"
                    value={
                      transportLabels[location.preferredTransportMode] ??
                      location.preferredTransportMode
                    }
                  />
                  <MetricCard
                    label="Nguồn dữ liệu"
                    value={
                      location.source === "call"
                        ? "Cuộc gọi"
                        : location.source === "chat"
                          ? "Nhắn tin"
                          : location.source === "web"
                            ? "Web"
                            : "Nhập tay"
                    }
                  />
                </div>
              </div>

              <Section title="Thông tin hiện trường">
                <InfoRow label="Địa chỉ" value={location.address} />
                <CoordinateRow lat={location.lat} lng={location.lng} />
                <InfoRow
                  label="Tạo lúc"
                  value={new Date(location.createdAt).toLocaleString("vi-VN")}
                />
                <InfoRow
                  label="Xác minh gần nhất"
                  value={
                    location.lastVerifiedAt
                      ? new Date(location.lastVerifiedAt).toLocaleString("vi-VN")
                      : "Chưa xác minh"
                  }
                />
                <InfoRow label="Ghi chú" value={location.note} multiline />
              </Section>

              <Separator />

              <Section title={`Hộ dân liên quan (${victims.length})`}>
                {victims.length === 0 ? (
                  <EmptyBlock text="Chưa có hộ dân nào được gắn vào điểm này." />
                ) : (
                  <div className="space-y-3">
                    {victims.map((victim, index) => (
                      <div
                        key={victim.id}
                        className="rounded-xl border bg-white p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">
                              {index + 1}. {victim.fullname}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {victim.phone || "Chưa có số điện thoại"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {victim.needsMedical && (
                              <Badge variant="destructive">Cần y tế</Badge>
                            )}
                            {victim.boatAccessible && (
                              <Badge variant="info">Tiếp cận bằng xuồng</Badge>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          <InfoRow label="Số người trong hộ" value={victim.householdSize} />
                          <InfoRow label="Mực nước" value={victim.waterDepthEstimate} />
                          <InfoRow
                            label="Ngày chưa hỗ trợ"
                            value={victim.daysWithoutAid}
                          />
                          <InfoRow
                            label="Thuốc cần"
                            value={victim.medicineList?.join(", ")}
                          />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {(victim.needTypes || []).map((item) => (
                            <Badge key={item} variant="outline">
                              {needTypeLabels[item] ?? item}
                            </Badge>
                          ))}
                          {victim.hasChildren && <Badge variant="secondary">Có trẻ em</Badge>}
                          {victim.hasElderly && (
                            <Badge variant="secondary">Có người cao tuổi</Badge>
                          )}
                          {victim.hasDisability && (
                            <Badge variant="secondary">Có người khuyết tật</Badge>
                          )}
                          {victim.isPregnant && (
                            <Badge variant="secondary">Có phụ nữ mang thai</Badge>
                          )}
                        </div>

                        {victim.note && (
                          <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                            {victim.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Separator />

              <Section title={`Báo cáo tuyến đường (${routeReports.length})`}>
                {routeReports.length === 0 ? (
                  <EmptyBlock text="Chưa có báo cáo tuyến đường cho điểm này." />
                ) : (
                  <div className="space-y-3">
                    {routeReports.map((report) => (
                      <div key={report.id} className="rounded-xl border bg-muted/20 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={
                              report.confidence === "dangerous"
                                ? "destructive"
                                : report.confidence === "high"
                                  ? "success"
                                  : report.confidence === "medium"
                                    ? "info"
                                    : "warning"
                            }
                          >
                            {confidenceLabels[report.confidence] ?? report.confidence}
                          </Badge>
                          <Badge variant="outline">
                            {transportLabels[report.transportMode] ??
                              report.transportMode}
                          </Badge>
                          <Badge variant={report.isPassable ? "success" : "destructive"}>
                            {report.isPassable ? "Đi qua được" : "Không thể đi qua"}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm">
                          {report.note || "Không có ghi chú bổ sung."}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                          <InfoRow label="Độ sâu nước" value={report.waterDepthText} />
                          <InfoRow
                            label="Dòng chảy"
                            value={report.currentStrengthText}
                          />
                          <InfoRow
                            label="Người báo cáo"
                            value={report.reporter?.fullName}
                          />
                          <InfoRow
                            label="Thời điểm"
                            value={new Date(report.reportedAt).toLocaleString("vi-VN")}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Separator />

              <Section title={`Nhật ký AI (${conversations.length})`}>
                {conversations.length === 0 ? (
                  <EmptyBlock text="Chưa có cuộc gọi hoặc phiên nhắn tin nào gắn với điểm này." />
                ) : (
                  <div className="space-y-3">
                    {conversations.map((conversation) => (
                      <div key={conversation.id} className="rounded-xl border p-3">
                        <div className="flex flex-wrap items-center gap-2">
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
                        <p className="mt-2 text-sm">
                          {conversation.summary || "Chưa có tóm tắt."}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(conversation.startedAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </>
          )}
        </SheetPanel>
      </SheetContent>
    </Sheet>
  );
};

export const openLocationDetailModal = (args: Args) => {
  events.emit("open", args);
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="space-y-3">
    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {title}
    </h3>
    {children}
  </div>
);

const MetricCard: React.FC<{ label: string; value?: string | null }> = ({
  label,
  value,
}) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
    <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">{label}</p>
    <p className="mt-1 text-sm font-medium">{value || "Chưa có dữ liệu"}</p>
  </div>
);

const EmptyBlock: React.FC<{ text: string }> = ({ text }) => (
  <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
    {text}
  </div>
);

const InfoRow: React.FC<{
  label: string;
  value?: string | number | null;
  multiline?: boolean;
}> = ({ label, value, multiline = false }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
      {label}
    </p>
    <p className={multiline ? "mt-1 whitespace-pre-wrap text-sm" : "mt-1 text-sm"}>
      {value || "-"}
    </p>
  </div>
);

const CoordinateRow: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const [copied, setCopied] = useState(false);
  const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(coords);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Tọa độ
      </p>
      <div className="mt-1 flex items-center gap-2">
        <span className="font-mono text-sm">{coords}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
        </button>
      </div>
    </div>
  );
};
