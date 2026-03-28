import type * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetPanel,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useCallback } from "react";
import { EventEmitter } from "events";
import { api } from "@/trpc/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Control } from "react-hook-form";
import { SelectField } from "@/components/form/select-field";
import { toastManager } from "@/components/ui/toast";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  Pencil,
} from "lucide-react";
import Markdown from "react-markdown";
import { cn } from "@/lib/utils";

const events = new EventEmitter();

type RescuePlan = {
  id?: string;
  title?: string;
  description?: string | null;
  status: "draft" | "active" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  locationIds?: string[];
  rescuerIds?: string[];
  vehicleIds?: string[];
};

export type OpenArgs = {
  plan?: RescuePlan;
  defaultStatus?: "draft" | "active" | "completed" | "cancelled";
  readOnly?: boolean;
};

const schema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "completed", "cancelled"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  locationIds: z.array(z.string()),
  rescuerIds: z.array(z.string()).min(1, "Cần ít nhất một cứu hộ viên"),
  vehicleIds: z.array(z.string()),
});

type Values = z.infer<typeof schema>;

function PickerList<T extends { id: string }>({
  items,
  selected,
  onToggle,
  renderItem,
  loading,
  emptyText,
  disabled = false,
  sortSelected = false,
  selectedBg = "bg-blue-50",
  checkColor = "bg-blue-600 border-blue-600",
}: {
  items: T[];
  selected: string[];
  onToggle: (id: string) => void;
  renderItem: (item: T) => React.ReactNode;
  loading: boolean;
  emptyText: string;
  disabled?: boolean;
  sortSelected?: boolean;
  selectedBg?: string;
  checkColor?: string;
}) {
  if (loading)
    return <p className="text-sm text-muted-foreground py-2">Đang tải...</p>;
  if (!items.length)
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <AlertCircle className="size-4" /> {emptyText}
      </div>
    );
  const sorted = sortSelected
    ? [...items].sort((a, b) => {
        const aSelected = selected.includes(a.id) ? 0 : 1;
        const bSelected = selected.includes(b.id) ? 0 : 1;
        return aSelected - bSelected;
      })
    : items;
  return (
    <div
      className={cn(
        "w-full max-h-60 overflow-y-auto border rounded-lg divide-y",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      {sorted.map(item => {
        const isSelected = selected.includes(item.id);
        return (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors",
              isSelected && selectedBg,
            )}
            onClick={() => onToggle(item.id)}
          >
            <div
              className={cn(
                "size-4 rounded border flex items-center justify-center shrink-0",
                isSelected ? checkColor : "border-input",
              )}
            >
              {isSelected && <Check className="size-3 text-white" />}
            </div>
            {renderItem(item)}
          </div>
        );
      })}
    </div>
  );
}

const DescriptionField: React.FC<{
  control: Control<Values>;
  selectedLocationIds: string[];
  isPending: boolean;
  onGenerate: () => void;
  defaultPreview?: boolean;
  disabled?: boolean;
}> = ({
  control,
  selectedLocationIds,
  isPending,
  onGenerate,
  defaultPreview = true,
  disabled = false,
}) => {
  const [preview, setPreview] = useState(defaultPreview);

  return (
    <Controller
      name="description"
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <div className="flex items-center justify-between">
            <Label>Mô tả</Label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreview(false)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors",
                  !preview
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Pencil className="size-3" /> Soạn thảo
              </button>
              <button
                type="button"
                onClick={() => setPreview(true)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors",
                  preview
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Eye className="size-3" /> Xem trước
              </button>
              <div className="w-px h-4 bg-border mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-violet-600 hover:text-violet-700"
                disabled={disabled || !selectedLocationIds.length || isPending}
                onClick={onGenerate}
              >
                {isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
                Tạo bằng AI
              </Button>
            </div>
          </div>

          {preview ? (
            <div className="w-full min-h-[104px] rounded-md border bg-muted/30 px-3 py-2 text-sm prose prose-sm !max-w-none">
              {field.value ? (
                <Markdown>{field.value}</Markdown>
              ) : (
                <p className="text-muted-foreground italic">
                  Không có nội dung để xem trước.
                </p>
              )}
            </div>
          ) : (
            <Textarea
              placeholder="Tình huống, phương tiện cần triển khai, vật tư cần mang... (hỗ trợ **markdown**)"
              rows={4}
              disabled={disabled}
              {...field}
            />
          )}

          {!selectedLocationIds.length && (
            <p className="text-xs text-muted-foreground">
              Chọn địa điểm để bật tính năng tạo mô tả AI
            </p>
          )}
          {fieldState.error?.message && (
            <p className="text-sm text-destructive">
              {fieldState.error.message}
            </p>
          )}
        </Field>
      )}
    />
  );
};

export const RescuePlanModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [args, setArgs] = useState<OpenArgs | null>(null);
  const utils = api.useUtils();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      status: "draft",
      priority: "medium",
      locationIds: [],
      rescuerIds: [],
      vehicleIds: [],
    },
  });

  const selectedLocationIds = form.watch("locationIds");
  const selectedRescuerIds = form.watch("rescuerIds");
  const selectedVehicleIds = form.watch("vehicleIds");

  const locationsQuery = api.location.findMany.useQuery({}, { enabled: open });
  const rescuersQuery = api.rescuer.findMany.useQuery({}, { enabled: open });
  const vehiclesQuery = api.vehicle.findMany.useQuery({}, { enabled: open });

  const createMutation = api.rescuePlan.create.useMutation({
    onSuccess: () => {
      toastManager.add({ title: "Đã tạo kế hoạch cứu hộ", type: "success" });
      utils.rescuePlan.findMany.invalidate();
      utils.rescuer.findMany.invalidate();
      setOpen(false);
    },
    onError: e =>
      toastManager.add({
        title: "Tạo kế hoạch thất bại",
        description: e.message,
        type: "error",
      }),
  });

  const updateMutation = api.rescuePlan.update.useMutation({
    onSuccess: () => {
      toastManager.add({
        title: "Đã cập nhật kế hoạch cứu hộ",
        type: "success",
      });
      utils.rescuePlan.findMany.invalidate();
      utils.rescuer.findMany.invalidate();
      setOpen(false);
    },
    onError: e =>
      toastManager.add({
        title: "Cập nhật kế hoạch thất bại",
        description: e.message,
        type: "error",
      }),
  });

  const generateDescriptionMutation =
    api.rescuePlan.generateDescription.useMutation({
      onSuccess: data => {
        form.setValue("description", data.content);
        toastManager.add({ title: "Đã tạo mô tả", type: "success" });
      },
      onError: e =>
        toastManager.add({
          title: "Tạo mô tả thất bại",
          description: e.message,
          type: "error",
        }),
    });

  useEffect(() => {
    const onOpen = (openArgs?: OpenArgs) => {
      setOpen(true);
      setArgs(openArgs || null);
      const plan = openArgs?.plan;
      form.reset({
        title: plan?.title ?? "",
        description: plan?.description ?? "",
        status: plan?.status ?? openArgs?.defaultStatus ?? "draft",
        priority: plan?.priority ?? "medium",
        locationIds: plan?.locationIds ?? [],
        rescuerIds: plan?.rescuerIds ?? [],
        vehicleIds: plan?.vehicleIds ?? [],
      });
    };
    events.on("open", onOpen);
    return () => {
      events.off("open", onOpen);
    };
  }, [form]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) setArgs(null);
  };

  const isEdit = !!args?.plan?.id;
  const isNonDraft = isEdit && args?.plan?.status !== "draft";
  // Fully read-only: completed/cancelled plans opened from the kanban card
  const isFullyReadOnly = !!args?.readOnly;
  // Fields locked (everything except status): any non-draft plan
  const isReadOnly = isFullyReadOnly || isNonDraft;
  const isRescuerLocked = isNonDraft;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = form.handleSubmit(values => {
    if (isFullyReadOnly) return;
    if (args?.plan?.id) {
      updateMutation.mutate({ id: args.plan.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  });

  const toggleId = useCallback(
    (field: "locationIds" | "rescuerIds" | "vehicleIds", id: string) => {
      if (isReadOnly) return;
      const current = form.getValues(field);
      form.setValue(
        field,
        current.includes(id) ? current.filter(x => x !== id) : [...current, id],
      );
    },
    [form, isReadOnly],
  );
  const locations = locationsQuery.data ?? [];
  const allRescuers = rescuersQuery.data ?? [];
  // When rescuers are locked (plan not in draft), show all assigned rescuers regardless of status.
  // Otherwise only show available rescuers for selection.
  const rescuers = isRescuerLocked
    ? allRescuers.filter(r => selectedRescuerIds.includes(r.id))
    : allRescuers.filter(r => r.status === "available");
  const vehicles = vehiclesQuery.data ?? [];

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>
            {isFullyReadOnly
              ? "Chi tiết kế hoạch cứu hộ"
              : isEdit
                ? "Chỉnh sửa kế hoạch cứu hộ"
                : "Tạo kế hoạch cứu hộ"}
          </SheetTitle>
          <SheetDescription>
            {isFullyReadOnly
              ? "Kế hoạch đã kết thúc — chỉ xem."
              : isNonDraft
                ? "Chỉ có thể thay đổi trạng thái kế hoạch."
                : isEdit
                  ? "Cập nhật kế hoạch cứu hộ."
                  : "Phân công địa điểm, cứu hộ viên và phương tiện cho kế hoạch mới."}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <SheetPanel className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="col-span-2">
                    <Label>Tiêu đề kế hoạch</Label>
                    <input
                      {...field}
                      disabled={isReadOnly}
                      placeholder="Ví dụ: Tiếp cận cụm hộ ngập sâu xã Đại Hồng"
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
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
                name="status"
                control={form.control}
                render={props => (
                  <SelectField
                    label="Trạng thái"
                    disabled={!!args?.readOnly}
                    options={[
                      { label: "Nháp", value: "draft" },
                      { label: "Đang hoạt động", value: "active" },
                      { label: "Hoàn thành", value: "completed" },
                      { label: "Đã hủy", value: "cancelled" },
                    ]}
                    {...props}
                  />
                )}
              />
              <Controller
                name="priority"
                control={form.control}
                render={props => (
                  <SelectField
                    label="Mức độ ưu tiên"
                    disabled={isReadOnly}
                    options={[
                      { label: "Thấp", value: "low" },
                      { label: "Trung bình", value: "medium" },
                      { label: "Cao", value: "high" },
                      { label: "Khẩn cấp", value: "critical" },
                    ]}
                    {...props}
                  />
                )}
              />
            </div>

            {/* Locations */}
            <Field>
              <Label>
                Địa điểm
                {selectedLocationIds.length > 0 && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    ({selectedLocationIds.length})
                  </span>
                )}
              </Label>

              <PickerList
                items={locations}
                selected={selectedLocationIds}
                onToggle={id => toggleId("locationIds", id)}
                loading={locationsQuery.isLoading}
                emptyText="Không tìm thấy địa điểm"
                disabled={isReadOnly}
                sortSelected
                selectedBg="bg-blue-50"
                checkColor="bg-blue-600 border-blue-600"
                renderItem={location => (
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {location.address ?? `${location.lat}, ${location.lng}`}
                      </div>
                      {location.summary && (
                        <div className="text-xs text-muted-foreground truncate">
                          {location.summary}
                        </div>
                      )}
                    </div>
                    {location.emergencyLevel && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs flex-shrink-0",
                          location.emergencyLevel === "critical" &&
                            "border-red-300 text-red-700 bg-red-50",
                          location.emergencyLevel === "high" &&
                            "border-orange-300 text-orange-700 bg-orange-50",
                          location.emergencyLevel === "medium" &&
                            "border-yellow-300 text-yellow-700 bg-yellow-50",
                        )}
                      >
                        {location.emergencyLevel === "critical"
                          ? "Nguy kịch"
                          : location.emergencyLevel === "high"
                            ? "Khẩn cấp"
                            : "Cần hỗ trợ"}
                      </Badge>
                    )}
                  </div>
                )}
              />
            </Field>

            {/* Rescuers */}
            <Field>
              <Label>
                Cứu hộ viên
                {selectedRescuerIds.length > 0 && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    ({selectedRescuerIds.length})
                  </span>
                )}
                {isRescuerLocked && (
                  <span className="ml-1.5 text-xs text-muted-foreground italic">
                    — đang làm nhiệm vụ
                  </span>
                )}
              </Label>
              <PickerList
                items={rescuers}
                selected={selectedRescuerIds}
                onToggle={id => toggleId("rescuerIds", id)}
                loading={rescuersQuery.isLoading}
                emptyText="Không có cứu hộ viên nào được phân công"
                disabled={isReadOnly || isRescuerLocked}
                selectedBg="bg-green-50"
                checkColor="bg-green-600 border-green-600"
                renderItem={rescuer => (
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {rescuer.fullName}
                      </div>
                      {rescuer.role && (
                        <div className="text-xs text-muted-foreground">
                          {rescuer.role === "boat_operator"
                            ? "Lái xuồng"
                            : rescuer.role === "driver"
                              ? "Tài xế"
                              : rescuer.role === "medic"
                                ? "Y tế"
                                : rescuer.role === "diver"
                                  ? "Thợ lặn"
                                  : rescuer.role === "logistics"
                                    ? "Hậu cần"
                                    : rescuer.role === "coordinator"
                                      ? "Điều phối viên"
                                      : "Tình nguyện viên"}
                        </div>
                      )}
                    </div>
                    {rescuer.status && (
                      <span
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded-full flex-shrink-0",
                          rescuer.status === "available" &&
                            "bg-green-100 text-green-700",
                          rescuer.status === "on_mission" &&
                            "bg-blue-100 text-blue-700",
                          rescuer.status === "off_duty" &&
                            "bg-gray-100 text-gray-600",
                          rescuer.status === "injured" &&
                            "bg-red-100 text-red-700",
                        )}
                      >
                        {rescuer.status === "on_mission"
                          ? "Đang làm nhiệm vụ"
                          : rescuer.status === "available"
                            ? "Sẵn sàng"
                            : rescuer.status === "off_duty"
                              ? "Nghỉ phép"
                              : "Bị thương"}
                      </span>
                    )}
                  </div>
                )}
              />
              {form.formState.errors.rescuerIds && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.rescuerIds.message}
                </p>
              )}
            </Field>

            {/* Vehicles */}
            <Field>
              <Label>
                Phương tiện
                {selectedVehicleIds.length > 0 && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    ({selectedVehicleIds.length})
                  </span>
                )}
              </Label>
              <PickerList
                items={vehicles}
                selected={selectedVehicleIds}
                onToggle={id => toggleId("vehicleIds", id)}
                loading={vehiclesQuery.isLoading}
                emptyText="Không tìm thấy phương tiện"
                disabled={isReadOnly}
                selectedBg="bg-orange-50"
                checkColor="bg-orange-500 border-orange-500"
                renderItem={vehicle => (
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {vehicle.name}
                    </div>
                    {vehicle.note && (
                      <div className="text-xs text-muted-foreground truncate">
                        {vehicle.note}
                      </div>
                    )}
                  </div>
                )}
              />
            </Field>

            {/* Description */}
            <DescriptionField
              control={form.control}
              selectedLocationIds={selectedLocationIds}
              isPending={generateDescriptionMutation.isPending}
              defaultPreview={isEdit || isReadOnly}
              disabled={isReadOnly}
              onGenerate={() =>
                generateDescriptionMutation.mutate({
                  title: form.getValues("title") || undefined,
                  locationIds: selectedLocationIds,
                })
              }
            />

            {!isFullyReadOnly && (
              <Button disabled={isPending} type="submit" className="w-full">
                {isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" /> Đang lưu...
                  </>
                ) : isEdit ? (
                  "Lưu thay đổi"
                ) : (
                  "Tạo kế hoạch"
                )}
              </Button>
            )}
          </SheetPanel>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export const openRescuePlanModal = (args?: OpenArgs) => {
  events.emit("open", args);
};
