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
import { useEffect, useState } from "react";
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
import { ImageUpload } from "@/components/ui/upload";
import { Loader2 } from "lucide-react";

const events = new EventEmitter();

const vehicleTypeOptions = [
  { label: "Xuồng / thuyền", value: "boat" },
  { label: "Xe tải", value: "truck" },
  { label: "Xe cứu thương", value: "ambulance" },
  { label: "Xe máy", value: "motorbike" },
  { label: "Drone", value: "drone" },
] as const;

const vehicleStatusOptions = [
  { label: "Sẵn sàng", value: "available" },
  { label: "Đang nhiệm vụ", value: "on_mission" },
  { label: "Bảo trì", value: "maintenance" },
  { label: "Ngoại tuyến", value: "offline" },
] as const;

export type OpenArgs = {
  vehicleId?: string;
};

const schema = z.object({
  name: z.string().min(1, "Tên phương tiện là bắt buộc"),
  image: z.string().optional(),
  vehicleType: z
    .enum(["boat", "truck", "ambulance", "motorbike", "drone"])
    .optional(),
  capacity: z.string().optional(),
  status: z.enum(["available", "on_mission", "maintenance", "offline"]).optional(),
  baseLocation: z.string().optional(),
  fuelLevel: z.string().optional(),
  tagsText: z.string().optional(),
  note: z.string().optional(),
});

type Values = z.infer<typeof schema>;

const parseStringArray = (value?: string) =>
  value
    ?.split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

const toOptionalInt = (value?: string) => {
  if (!value?.trim()) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const VehicleModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [args, setArgs] = useState<OpenArgs | null>(null);
  const utils = api.useUtils();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      image: "",
      vehicleType: undefined,
      capacity: "",
      status: undefined,
      baseLocation: "",
      fuelLevel: "",
      tagsText: "",
      note: "",
    },
  });

  const createMutation = api.vehicle.create.useMutation({
    onSuccess: () => {
      toastManager.add({ title: "Đã thêm phương tiện", type: "success" });
      void utils.vehicle.findMany.invalidate();
      setOpen(false);
    },
  });

  const updateMutation = api.vehicle.update.useMutation({
    onSuccess: () => {
      toastManager.add({ title: "Đã cập nhật phương tiện", type: "success" });
      void utils.vehicle.findMany.invalidate();
      setOpen(false);
    },
  });

  const vehicleQuery = api.vehicle.findById.useQuery(
    { id: args?.vehicleId || "" },
    { enabled: !!args?.vehicleId },
  );

  useEffect(() => {
    const onOpen = (openArgs?: OpenArgs) => {
      setOpen(true);
      setArgs(openArgs || null);
      if (!openArgs?.vehicleId) {
        form.reset({
          name: "",
          image: "",
          vehicleType: undefined,
          capacity: "",
          status: undefined,
          baseLocation: "",
          fuelLevel: "",
          tagsText: "",
          note: "",
        });
      }
    };

    const onClose = () => setOpen(false);

    events.on("open", onOpen);
    events.on("close", onClose);
    return () => {
      events.off("open", onOpen);
      events.off("close", onClose);
    };
  }, [form]);

  useEffect(() => {
    if (!vehicleQuery.data) return;

    const vehicle = vehicleQuery.data;
    form.reset({
      name: vehicle.name || "",
      image: vehicle.image || "",
      vehicleType: vehicle.vehicleType || undefined,
      capacity: vehicle.capacity?.toString() || "",
      status: vehicle.status || undefined,
      baseLocation: vehicle.baseLocation || "",
      fuelLevel: vehicle.fuelLevel?.toString() || "",
      tagsText: vehicle.tags?.join(", ") || "",
      note: vehicle.note || "",
    });
  }, [vehicleQuery.data, form]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setArgs(null);
    }
  };

  const handleSubmit: SubmitHandler<Values> = (values) => {
    const payload = {
      name: values.name,
      image: values.image || undefined,
      vehicleType: values.vehicleType,
      capacity: toOptionalInt(values.capacity),
      status: values.status,
      baseLocation: values.baseLocation || undefined,
      fuelLevel: toOptionalInt(values.fuelLevel),
      tags: parseStringArray(values.tagsText),
      note: values.note || undefined,
    };

    if (args?.vehicleId) {
      updateMutation.mutate({ id: args.vehicleId, data: payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isEdit = !!args?.vehicleId;
  const mutationError = createMutation.error ?? updateMutation.error;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Chỉnh sửa phương tiện cứu trợ" : "Thêm phương tiện cứu trợ"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Cập nhật phương tiện, tình trạng vận hành và khả năng tải."
              : "Tạo hồ sơ phương tiện để phân công vào các kế hoạch điều phối."}
          </SheetDescription>
        </SheetHeader>

        {isEdit && vehicleQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mb-2 size-6 animate-spin" />
            <p className="text-sm">Đang tải thông tin phương tiện...</p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <SheetPanel className="space-y-4">
              {mutationError && (
                <Alert variant="warning">
                  <AlertTitle>Không thể lưu phương tiện</AlertTitle>
                  <AlertDescription>{mutationError.message}</AlertDescription>
                </Alert>
              )}

              <Controller
                name="name"
                control={form.control}
                render={(props) => (
                  <TextField
                    autoFocus
                    label="Tên phương tiện"
                    placeholder="Ví dụ: Xuồng cứu hộ 02"
                    required
                    {...props}
                  />
                )}
              />

              <Controller
                name="image"
                control={form.control}
                render={({ field }) => (
                  <Field className="w-full">
                    <Label>Ảnh phương tiện</Label>
                    <ImageUpload
                      value={field.value}
                      folder="humanlogs2026/vehicles"
                      onChange={(url) => field.onChange(url ?? "")}
                    />
                  </Field>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="vehicleType"
                  control={form.control}
                  render={(props) => (
                    <SelectField
                      label="Loại phương tiện"
                      placeholder="Chọn loại"
                      options={vehicleTypeOptions.map((item) => ({
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
                      options={vehicleStatusOptions.map((item) => ({
                        label: item.label,
                        value: item.value,
                      }))}
                      {...props}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="capacity"
                  control={form.control}
                  render={(props) => (
                    <TextField
                      label="Sức chứa"
                      placeholder="Ví dụ: 8"
                      inputMode="numeric"
                      {...props}
                    />
                  )}
                />
                <Controller
                  name="fuelLevel"
                  control={form.control}
                  render={(props) => (
                    <TextField
                      label="Mức nhiên liệu (%)"
                      placeholder="Ví dụ: 75"
                      inputMode="numeric"
                      {...props}
                    />
                  )}
                />
              </div>

              <Controller
                name="baseLocation"
                control={form.control}
                render={(props) => (
                  <TextField
                    label="Điểm tập kết"
                    placeholder="Ví dụ: Kho Hội Chữ thập đỏ quận Cẩm Lệ"
                    {...props}
                  />
                )}
              />

              <Controller
                name="tagsText"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <Label>Thẻ phân loại</Label>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder="Ví dụ: ca nô, hàng cứu trợ, tuyến sông"
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
                    <Label>Ghi chú</Label>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Tình trạng máy, vật tư đi kèm, lưu ý điều động..."
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
                    {isEdit ? "Đang lưu..." : "Đang tạo..."}
                  </>
                ) : isEdit ? (
                  "Lưu thay đổi"
                ) : (
                  "Thêm phương tiện"
                )}
              </Button>
            </SheetPanel>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
};

export const openVehicleModal = (args?: OpenArgs) => {
  events.emit("open", args);
};
