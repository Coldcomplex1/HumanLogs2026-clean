import type * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { EventEmitter } from "events";
import { api } from "@/trpc/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RescuerAvatar } from "@/components/rescuer-avatar";
import { uploadAvatar } from "@/lib/cloudinary";
import { toastManager } from "@/components/ui/toast";
import { Camera, Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const events = new EventEmitter();

export type OpenArgs = { rescuerId: string };

const statusConfig: Record<string, { label: string; className: string }> = {
  available: { label: "Sẵn sàng", className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  on_mission: { label: "Đang làm nhiệm vụ", className: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
  off_duty: { label: "Nghỉ phép", className: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200" },
  injured: { label: "Bị thương", className: "bg-red-50 text-red-700 ring-1 ring-red-200" },
};

const roleLabels: Record<string, string> = {
  medic: "Y tế",
  boat_operator: "Lái xuồng",
  driver: "Tài xế",
  diver: "Thợ lặn",
  logistics: "Hậu cần",
  coordinator: "Điều phối viên",
  volunteer: "Tình nguyện viên",
};


export const RescuerDetailModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [rescuerId, setRescuerId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = api.useUtils();

  const rescuerQuery = api.rescuer.findById.useQuery(
    { id: rescuerId || "" },
    { enabled: !!rescuerId },
  );

  const updateMutation = api.rescuer.update.useMutation({
    onSuccess: () => {
      utils.rescuer.findMany.invalidate();
      rescuerQuery.refetch();
    },
  });

  useEffect(() => {
    const onOpen = (args: OpenArgs) => {
      setRescuerId(args.rescuerId);
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
      setRescuerId(null);
      cancelPreview();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toastManager.add({ title: "Vui lòng chọn một tệp hình ảnh", type: "error" });
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPendingFile(file);
    setPreviewUrl(objectUrl);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const cancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(null);
    setPreviewUrl(null);
  };

  const confirmUpload = async () => {
    if (!pendingFile || !rescuerId) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(pendingFile);
      await updateMutation.mutateAsync({ id: rescuerId, data: { avatarUrl: url } });
      toastManager.add({ title: "Đã cập nhật ảnh đại diện", type: "success" });
      cancelPreview();
    } catch (err: unknown) {
      toastManager.add({
        title: "Tải lên thất bại",
        description: err instanceof Error ? err.message : "Lỗi không xác định",
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const rescuer = rescuerQuery.data;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
        {/* Visually hidden for a11y */}
        <SheetHeader className="sr-only">
          <SheetTitle>Hồ sơ thành viên cứu trợ</SheetTitle>
          <SheetDescription>Thông tin điều phối và trạng thái hoạt động.</SheetDescription>
        </SheetHeader>

        {rescuerQuery.isLoading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Đang tải…
          </div>
        ) : !rescuer ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Không tìm thấy cứu hộ viên.
          </div>
        ) : (
          <ScrollArea className="flex-1">
            {/* Hero section */}
            <div className="flex flex-col items-center gap-4 px-6 pb-6 pt-10 border-b bg-muted/30">
              {/* Avatar with hover-to-change */}
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => !previewUrl && fileInputRef.current?.click()}
                  disabled={uploading}
                  className="relative group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900 disabled:cursor-not-allowed"
                >
                  {previewUrl ? (
                    <div className="size-24 rounded-full overflow-hidden shadow-md ring-4 ring-white">
                      <img src={previewUrl} alt="preview" className="size-full object-cover" />
                    </div>
                  ) : (
                    <RescuerAvatar
                      id={rescuer.id}
                      name={rescuer.fullName}
                      avatarUrl={rescuer.avatarUrl}
                      size="xl"
                    />
                  )}
                  {!previewUrl && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <Camera className="size-5 text-white" />
                      <span className="text-white text-[10px] font-semibold tracking-wide">ĐỔI ẢNH</span>
                    </div>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Instruction / confirm row */}
                {previewUrl ? (
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={confirmUpload} disabled={uploading} className="gap-1.5 h-8 text-xs">
                      {uploading
                        ? <Loader2 className="size-3.5 animate-spin" />
                        : <Check className="size-3.5" />}
                      {uploading ? "Đang tải lên…" : "Lưu ảnh"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelPreview} disabled={uploading} className="gap-1.5 h-8 text-xs">
                      <X className="size-3.5" />
                      Hủy
                    </Button>
                  </div>
                ) : (
                  null
                )}
              </div>

              {/* Name + badges */}
              <div className="text-center space-y-2">
                <p className="text-xl font-semibold tracking-tight">{rescuer.fullName}</p>
                <div className="flex items-center justify-center flex-wrap gap-2">
                  {rescuer.role && (
                    <Badge variant="secondary" className="font-normal">
                      {roleLabels[rescuer.role] ?? rescuer.role}
                    </Badge>
                  )}
                  {rescuer.status && (
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      statusConfig[rescuer.status]?.className
                    )}>
                      {statusConfig[rescuer.status]?.label ?? rescuer.status}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Info sections */}
            <div className="px-6 py-5 space-y-6">
              {/* Contact */}
              <Section title="Liên hệ">
                <InfoGrid>
                  <InfoRow label="Điện thoại" value={rescuer.phone} />
                  <InfoRow label="Điện thoại phụ" value={rescuer.secondaryPhone} />
                  <InfoRow label="Email" value={rescuer.email} />
                  <InfoRow label="Địa chỉ" value={rescuer.address} wrap />
                  <InfoRow label="Khu vực" value={rescuer.region} />
                  <InfoRow label="Kế hoạch đang tham gia" value={rescuer.currentPlan?.title} />
                </InfoGrid>
              </Section>

              {!!rescuer.certifications?.length && (
                <Section title="Chứng chỉ / năng lực">
                  <div className="flex flex-wrap gap-2">
                    {rescuer.certifications.map((item: string) => (
                      <Badge key={item} variant="secondary" className="font-normal">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </Section>
              )}

              {/* Notes */}
              {rescuer.note && (
                <Section title="Ghi chú">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {rescuer.note}
                  </p>
                </Section>
              )}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
};

/* ── Sub-components ──────────────────────────────────────── */

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2.5">
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
      {title}
    </p>
    {children}
  </div>
);

const InfoGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-lg border bg-card divide-y">
    {children}
  </div>
);

const InfoRow: React.FC<{ label: string; value?: string | null; wrap?: boolean }> = ({
  label,
  value,
  wrap = false,
}) => {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 px-3.5 py-2.5">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className={cn(
        "text-sm font-medium text-right",
        wrap ? "break-words" : "truncate",
      )}>
        {value}
      </span>
    </div>
  );
};

export const openRescuerDetailModal = (args: OpenArgs) => {
  events.emit("open", args);
};
