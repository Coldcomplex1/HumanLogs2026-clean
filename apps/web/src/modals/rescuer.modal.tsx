import type * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { EventEmitter } from "events";
import { api } from "@/trpc/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { toastManager } from "@/components/ui/toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { RescuerAvatar } from "@/components/rescuer-avatar";
import { uploadAvatar } from "@/lib/cloudinary";
import { Camera, Check, Loader2, X } from "lucide-react";

const events = new EventEmitter();

const roleOptions = [
  { label: "Y tế", value: "medic" },
  { label: "Lái xuồng", value: "boat_operator" },
  { label: "Tài xế", value: "driver" },
  { label: "Hậu cần", value: "logistics" },
  { label: "Điều phối viên", value: "coordinator" },
  { label: "Thợ lặn", value: "diver" },
  { label: "Tình nguyện viên", value: "volunteer" },
] as const;

const statusOptions = [
  { label: "Sẵn sàng", value: "available" },
  { label: "Đang làm nhiệm vụ", value: "on_mission" },
  { label: "Nghỉ trực", value: "off_duty" },
  { label: "Bị thương", value: "injured" },
] as const;

const experienceOptions = [
  { label: "Mới", value: "junior" },
  { label: "Có kinh nghiệm", value: "intermediate" },
  { label: "Lão luyện", value: "senior" },
  { label: "Chỉ huy", value: "lead" },
] as const;

export type RescuerData = {
  id: string;
  fullName: string;
  phone: string;
  secondaryPhone?: string | null;
  email?: string | null;
  address?: string | null;
  role?:
    | "medic"
    | "boat_operator"
    | "driver"
    | "logistics"
    | "coordinator"
    | "diver"
    | "volunteer"
    | null;
  status?: "available" | "on_mission" | "off_duty" | "injured" | null;
  experienceLevel?: "junior" | "intermediate" | "senior" | "lead" | null;
  certifications?: string[] | null;
  region?: string | null;
  avatarUrl?: string | null;
  note?: string | null;
};

export type OpenArgs = {
  rescuer?: RescuerData;
};

const schema = z.object({
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  phone: z.string().min(1, "Số điện thoại là bắt buộc"),
  secondaryPhone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  role: z
    .enum([
      "medic",
      "boat_operator",
      "driver",
      "logistics",
      "coordinator",
      "diver",
      "volunteer",
    ])
    .optional(),
  status: z.enum(["available", "on_mission", "off_duty", "injured"]).optional(),
  experienceLevel: z
    .enum(["junior", "intermediate", "senior", "lead"])
    .optional(),
  certificationsText: z.string().optional(),
  region: z.string().optional(),
  note: z.string().optional(),
});

type Values = z.infer<typeof schema>;

const emptyDefaults: Values = {
  fullName: "",
  phone: "",
  secondaryPhone: "",
  email: "",
  address: "",
  role: undefined,
  status: undefined,
  experienceLevel: undefined,
  certificationsText: "",
  region: "",
  note: "",
};

const parseLines = (value?: string) =>
  value
    ?.split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

export const RescuerModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [args, setArgs] = useState<OpenArgs | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = api.useUtils();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  });

  const createMutation = api.rescuer.create.useMutation({
    onSuccess: () => {
      toastManager.add({ title: "Đã thêm thành viên cứu trợ", type: "success" });
      void utils.rescuer.findMany.invalidate();
      setOpen(false);
    },
  });

  const updateMutation = api.rescuer.update.useMutation({
    onSuccess: () => {
      toastManager.add({
        title: "Đã cập nhật thành viên cứu trợ",
        type: "success",
      });
      void utils.rescuer.findMany.invalidate();
      setOpen(false);
    },
  });

  const avatarUpdateMutation = api.rescuer.update.useMutation({
    onSuccess: () => {
      void utils.rescuer.findMany.invalidate();
      toastManager.add({ title: "Đã cập nhật ảnh đại diện", type: "success" });
    },
  });

  const clearAvatarState = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPendingFile(null);
  };

  useEffect(() => {
    const onOpen = (openArgs?: OpenArgs) => {
      setOpen(true);
      setArgs(openArgs || null);
      clearAvatarState();

      if (openArgs?.rescuer) {
        const rescuer = openArgs.rescuer;
        form.reset({
          fullName: rescuer.fullName || "",
          phone: rescuer.phone || "",
          secondaryPhone: rescuer.secondaryPhone || "",
          email: rescuer.email || "",
          address: rescuer.address || "",
          role: rescuer.role || undefined,
          status: rescuer.status || undefined,
          experienceLevel: rescuer.experienceLevel || undefined,
          certificationsText: rescuer.certifications?.join("\n") || "",
          region: rescuer.region || "",
          note: rescuer.note || "",
        });
        return;
      }

      form.reset(emptyDefaults);
    };

    const onClose = () => setOpen(false);

    events.on("open", onOpen);
    events.on("close", onClose);
    return () => {
      events.off("open", onOpen);
      events.off("close", onClose);
    };
  }, [form, previewUrl]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setArgs(null);
      clearAvatarState();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toastManager.add({
        title: "Vui lòng chọn một tệp hình ảnh",
        type: "error",
      });
      return;
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
    setPendingFile(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const confirmAvatarUpload = async () => {
    if (!pendingFile || !args?.rescuer?.id) return;

    setAvatarUploading(true);
    try {
      const url = await uploadAvatar(pendingFile);
      await avatarUpdateMutation.mutateAsync({
        id: args.rescuer.id,
        data: { avatarUrl: url },
      });
      setArgs((previous) =>
        previous?.rescuer
          ? {
              ...previous,
              rescuer: { ...previous.rescuer, avatarUrl: url },
            }
          : previous,
      );
      clearAvatarState();
    } catch (error: unknown) {
      toastManager.add({
        title: "Tải ảnh thất bại",
        description:
          error instanceof Error ? error.message : "Không thể tải ảnh lên lúc này.",
        type: "error",
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit: SubmitHandler<Values> = (values) => {
    const payload = {
      fullName: values.fullName,
      phone: values.phone,
      secondaryPhone: values.secondaryPhone || undefined,
      email: values.email || undefined,
      address: values.address || undefined,
      role: values.role,
      status: values.status,
      experienceLevel: values.experienceLevel,
      certifications: parseLines(values.certificationsText),
      region: values.region || undefined,
      note: values.note || undefined,
    };

    if (args?.rescuer?.id) {
      updateMutation.mutate({ id: args.rescuer.id, data: payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isEdit = !!args?.rescuer;
  const mutationError = createMutation.error ?? updateMutation.error;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Chỉnh sửa thành viên cứu trợ" : "Thêm thành viên cứu trợ"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Cập nhật hồ sơ, vai trò và năng lực triển khai ngoài hiện trường."
              : "Tạo hồ sơ đội cứu trợ để phục vụ điều phối trên bản đồ và kế hoạch."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <SheetPanel className="space-y-4">
            {mutationError && (
              <Alert variant="warning">
                <AlertTitle>Không thể lưu dữ liệu</AlertTitle>
                <AlertDescription>{mutationError.message}</AlertDescription>
              </Alert>
            )}

            {isEdit && args?.rescuer && (
              <div className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4">
                <div className="relative shrink-0">
                  {previewUrl ? (
                    <div className="size-16 overflow-hidden rounded-full ring-2 ring-white shadow">
                      <img
                        src={previewUrl}
                        alt="Xem trước ảnh đại diện"
                        className="size-full object-cover"
                      />
                    </div>
                  ) : (
                    <RescuerAvatar
                      id={args.rescuer.id}
                      name={args.rescuer.fullName}
                      avatarUrl={args.rescuer.avatarUrl}
                      size="lg"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-sm font-medium leading-none">
                    Ảnh đại diện
                  </p>
                  <p className="mb-2.5 text-xs text-muted-foreground">
                    JPG, PNG hoặc GIF. Nếu thiếu Cloudinary, có thể để trống ảnh.
                  </p>

                  {previewUrl ? (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={confirmAvatarUpload}
                        disabled={avatarUploading}
                        className="h-7 gap-1.5 text-xs"
                      >
                        {avatarUploading ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Check className="size-3" />
                        )}
                        {avatarUploading ? "Đang tải ảnh..." : "Lưu ảnh"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={clearAvatarState}
                        disabled={avatarUploading}
                        className="h-7 gap-1.5 text-xs text-muted-foreground"
                      >
                        <X className="size-3" />
                        Hủy
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-7 gap-1.5 text-xs"
                    >
                      <Camera className="size-3" />
                      Đổi ảnh
                    </Button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}

            <Controller
              name="fullName"
              control={form.control}
              render={(props) => (
                <TextField
                  autoFocus
                  label="Họ và tên"
                  placeholder="Ví dụ: Trần Văn Long"
                  required
                  {...props}
                />
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="phone"
                control={form.control}
                render={(props) => (
                  <TextField
                    label="Số điện thoại"
                    placeholder="Ví dụ: 0901234567"
                    required
                    {...props}
                  />
                )}
              />
              <Controller
                name="secondaryPhone"
                control={form.control}
                render={(props) => (
                  <TextField
                    label="Số điện thoại phụ"
                    placeholder="Số liên hệ dự phòng"
                    {...props}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="email"
                control={form.control}
                render={(props) => (
                  <TextField
                    label="Email"
                    placeholder="Ví dụ: doi.cuutro@humanlogs.vn"
                    {...props}
                  />
                )}
              />
              <Controller
                name="region"
                control={form.control}
                render={(props) => (
                  <TextField
                    label="Khu vực phụ trách"
                    placeholder="Ví dụ: Hòa Vang, Đà Nẵng"
                    {...props}
                  />
                )}
              />
            </div>

            <Controller
              name="address"
              control={form.control}
              render={(props) => (
                <TextField
                  label="Địa chỉ liên hệ"
                  placeholder="Địa chỉ tạm trú hoặc nơi tập kết"
                  {...props}
                />
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <Controller
                name="role"
                control={form.control}
                render={(props) => (
                  <SelectField
                    label="Vai trò"
                    placeholder="Chọn vai trò"
                    options={roleOptions.map((item) => ({
                      label: item.label,
                      value: item.value,
                    }))}
                    {...props}
                  />
                )}
              />
              <Controller
                name="status"
                control={form.control}
                render={(props) => (
                  <SelectField
                    label="Trạng thái"
                    placeholder="Chọn trạng thái"
                    options={statusOptions.map((item) => ({
                      label: item.label,
                      value: item.value,
                    }))}
                    {...props}
                  />
                )}
              />
              <Controller
                name="experienceLevel"
                control={form.control}
                render={(props) => (
                  <SelectField
                    label="Mức kinh nghiệm"
                    placeholder="Chọn mức"
                    options={experienceOptions.map((item) => ({
                      label: item.label,
                      value: item.value,
                    }))}
                    {...props}
                  />
                )}
              />
            </div>

            <Controller
              name="certificationsText"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <Label>Chứng chỉ / năng lực</Label>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Mỗi dòng một mục, ví dụ: Sơ cứu\nLái xuồng máy\nBơi cứu nạn"
                  />
                  {fieldState.error?.message && (
                    <p className="text-sm text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </Field>
              )}
            />

            <Controller
              name="note"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <Label>Ghi chú vận hành</Label>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Ca trực, điểm mạnh chuyên môn, lưu ý an toàn..."
                  />
                  {fieldState.error?.message && (
                    <p className="text-sm text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </Field>
              )}
            />

            <Button disabled={isPending} type="submit" className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {isEdit ? "Đang lưu thay đổi..." : "Đang tạo hồ sơ..."}
                </>
              ) : isEdit ? (
                "Lưu thay đổi"
              ) : (
                "Thêm thành viên cứu trợ"
              )}
            </Button>
          </SheetPanel>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export const openRescuerModal = (args?: OpenArgs) => {
  events.emit("open", args);
};
