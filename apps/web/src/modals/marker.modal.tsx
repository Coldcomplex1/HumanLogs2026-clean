import { useCallback, useEffect, useState } from "react";
import { EventEmitter } from "events";
import {
  Sheet,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@/components/ui/sheet";
import { api } from "@/trpc/react";
import z from "zod";
import { LatLng } from "@/pages/home/types";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toastManager } from "@/components/ui/toast";
import { Trash } from "lucide-react";

const events = new EventEmitter();

type Args =
  | {
      mode: "create";
      latlng: LatLng;
    }
  | {
      mode: "edit";
      markerId: string;
    };

const markerTypeOptions = [
  { label: "Điểm cảnh báo", value: "mark" },
  { label: "Vùng / khu vực", value: "area" },
  { label: "Tuyến đường", value: "route" },
] as const;

const markTypeOptions = [
  { label: "Vùng ngập", value: "flood_area" },
  { label: "Nước chảy xiết", value: "strong_current" },
  { label: "Đường bị chặn", value: "blocked_road" },
  { label: "Rò điện", value: "electric_hazard" },
  { label: "Rác / chướng ngại", value: "debris" },
  { label: "Nguy hiểm", value: "dangerous" },
  { label: "Điểm tập kết an toàn", value: "safe_pickup" },
  { label: "Nơi trú ẩn", value: "shelter" },
  { label: "Điểm y tế", value: "medical_point" },
  { label: "Điểm thả hàng", value: "supply_drop" },
] as const;

const colorOptions = [
  "#0f766e",
  "#0891b2",
  "#1d4ed8",
  "#dc2626",
  "#ea580c",
  "#f59e0b",
  "#16a34a",
  "#7c3aed",
];

const schema = z.object({
  markerType: z.enum(["mark", "area", "route"]),
  markType: z
    .enum([
      "flood_area",
      "strong_current",
      "blocked_road",
      "electric_hazard",
      "debris",
      "dangerous",
      "safe_pickup",
      "shelter",
      "medical_point",
      "supply_drop",
    ])
    .optional(),
  note: z.string().optional(),
  name: z.string().optional(),
  color: z.string().optional(),
  fillOpacity: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const MarkerModal = () => {
  const [open, setOpen] = useState(false);
  const [args, setArgs] = useState<Args | null>(null);
  const utils = api.useUtils();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      markerType: "mark",
      markType: "dangerous",
      note: "",
      name: "",
      color: "#dc2626",
      fillOpacity: "0.35",
    },
  });

  const markerQuery = api.marker.findById.useQuery(
    { id: args?.mode === "edit" ? args.markerId : "" },
    {
      enabled: args?.mode === "edit" && !!args.markerId,
    },
  );

  const createMarker = api.marker.create.useMutation({
    onSuccess: () => {
      toastManager.add({ title: "Đã tạo điểm cảnh báo", type: "success" });
      void utils.marker.findMany.invalidate();
      handleClose();
    },
  });

  const updateMarker = api.marker.update.useMutation({
    onSuccess: () => {
      toastManager.add({ title: "Đã cập nhật đối tượng cảnh báo", type: "success" });
      void utils.marker.findMany.invalidate();
      handleClose();
    },
  });

  const deleteMarker = api.marker.delete.useMutation({
    onSuccess: () => {
      toastManager.add({ title: "Đã xóa đối tượng cảnh báo", type: "success" });
      void utils.marker.findMany.invalidate();
      handleClose();
    },
  });

  const editMarker = markerQuery.data;
  const selectedType = form.watch("markerType");

  useEffect(() => {
    const handleOpen = (nextArgs: Args) => {
      setArgs(nextArgs);
      setOpen(true);
      if (nextArgs.mode === "create") {
        form.reset({
          markerType: "mark",
          markType: "dangerous",
          note: "",
          name: "",
          color: "#dc2626",
          fillOpacity: "0.35",
        });
      }
    };

    events.on("open", handleOpen);
    events.on("close", handleClose);
    return () => {
      events.off("open", handleOpen);
      events.off("close", handleClose);
    };
  }, [form]);

  useEffect(() => {
    if (!editMarker) return;

    form.reset({
      markerType: editMarker.type ?? "mark",
      markType: editMarker.markType ?? "dangerous",
      note: editMarker.note ?? "",
      name: editMarker.name ?? "",
      color: editMarker.color ?? "#dc2626",
      fillOpacity: editMarker.fillOpacity?.toString() ?? "0.35",
    });
  }, [editMarker, form]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setArgs(null);
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleClose();
    }
  };

  const handleSubmit = (data: FormValues) => {
    const payload = {
      type: data.markerType,
      markType: data.markerType === "mark" ? data.markType : undefined,
      note: data.note || undefined,
      name: data.name || undefined,
      color: data.color || undefined,
      fillOpacity: data.fillOpacity ? Number(data.fillOpacity) : undefined,
    };

    if (args?.mode === "create") {
      createMarker.mutate({
        lat: args.latlng.lat,
        lng: args.latlng.lng,
        ...payload,
      });
      return;
    }

    if (args?.mode === "edit") {
      updateMarker.mutate({
        id: args.markerId,
        data: payload,
      });
    }
  };

  const isLoading = createMarker.isPending || updateMarker.isPending;
  const isEditMode = args?.mode === "edit";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetPopup>
        <SheetHeader>
          <SheetTitle>
            {isEditMode ? "Chỉnh sửa điểm / vùng cảnh báo" : "Tạo điểm cảnh báo"}
          </SheetTitle>
        </SheetHeader>
        <SheetPanel>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {(createMarker.error || updateMarker.error) && (
              <Alert variant="warning">
                <AlertTitle>Không thể lưu đối tượng cảnh báo</AlertTitle>
                <AlertDescription>
                  {(createMarker.error ?? updateMarker.error)?.message}
                </AlertDescription>
              </Alert>
            )}

            <Controller
              name="markerType"
              control={form.control}
              render={(props) => (
                <SelectField
                  label="Loại đối tượng"
                  placeholder="Chọn loại"
                  options={markerTypeOptions.map((item) => ({
                    label: item.label,
                    value: item.value,
                  }))}
                  {...props}
                />
              )}
            />

            {selectedType === "mark" && (
              <Controller
                name="markType"
                control={form.control}
                render={(props) => (
                  <SelectField
                    label="Nhóm cảnh báo"
                    placeholder="Chọn nhóm"
                    options={markTypeOptions.map((item) => ({
                      label: item.label,
                      value: item.value,
                    }))}
                    {...props}
                  />
                )}
              />
            )}

            <Controller
              name="name"
              control={form.control}
              render={(props) => (
                <TextField
                  label="Tên hiển thị"
                  placeholder="Ví dụ: Điểm trú ẩn trường tiểu học"
                  {...props}
                />
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
                    placeholder="Mô tả tình hình, điều kiện tiếp cận, cảnh báo bổ sung..."
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
              name="fillOpacity"
              control={form.control}
              render={(props) => (
                <TextField
                  label="Độ đậm vùng phủ"
                  placeholder="Ví dụ: 0.35"
                  helperText="Áp dụng rõ nhất cho polygon hoặc route."
                  {...props}
                />
              )}
            />

            <Controller
              name="color"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <Label>Màu hiển thị</Label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        title={color}
                        onClick={() => field.onChange(color)}
                        className="size-8 rounded-full border-2"
                        style={{
                          backgroundColor: color,
                          borderColor: field.value === color ? "#111827" : "transparent",
                        }}
                      />
                    ))}
                  </div>
                </Field>
              )}
            />

            <div className="mt-6 flex gap-2">
              {isEditMode && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    deleteMarker.mutate({
                      id: args?.mode === "edit" ? args.markerId : "",
                    })
                  }
                  disabled={deleteMarker.isPending}
                >
                  <Trash className="size-4" />
                  Xóa đối tượng
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isEditMode
                    ? "Đang cập nhật..."
                    : "Đang tạo..."
                  : isEditMode
                    ? "Lưu thay đổi"
                    : "Tạo điểm cảnh báo"}
              </Button>
            </div>
          </form>
        </SheetPanel>
      </SheetPopup>
    </Sheet>
  );
};

export const openMarkerModal = (args: Args) => {
  events.emit("open", args);
};
