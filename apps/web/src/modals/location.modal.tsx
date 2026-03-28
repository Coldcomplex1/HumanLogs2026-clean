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
import {
  Controller,
  type SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { emergencyLevelEnumValues, genderEnumValues, needTypeEnumValues } from "@repo/api/share";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { toastManager } from "@/components/ui/toast";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Trash2 } from "lucide-react";

const events = new EventEmitter();

const needTypeLabels: Record<(typeof needTypeEnumValues)[number], string> = {
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
  lat: number;
  lng: number;
};

const victimSchema = z.object({
  fullname: z.string().min(1, "Họ tên là bắt buộc"),
  phone: z.string().optional(),
  phone2: z.string().optional(),
  age: z.string().optional(),
  gender: z.enum(genderEnumValues).optional(),
  householdSize: z.string().optional(),
  needTypes: z.array(z.enum(needTypeEnumValues)).optional(),
  needsMedical: z.boolean().optional(),
  medicineListText: z.string().optional(),
  waterDepthEstimate: z.string().optional(),
  boatAccessible: z.boolean().optional(),
  hasChildren: z.boolean().optional(),
  hasElderly: z.boolean().optional(),
  hasDisability: z.boolean().optional(),
  isPregnant: z.boolean().optional(),
  daysWithoutAid: z.string().optional(),
  note: z.string().optional(),
});

const schema = z.object({
  summary: z.string().optional(),
  note: z.string().optional(),
  address: z.string().optional(),
  emergencyLevel: z.enum(emergencyLevelEnumValues).optional(),
  tagsText: z.string().optional(),
  victims: z.array(victimSchema).min(1, "Cần ít nhất một người trong điểm"),
});

type Values = z.infer<typeof schema>;

const emptyVictim: Values["victims"][number] = {
  fullname: "",
  phone: "",
  phone2: "",
  age: "",
  gender: undefined,
  householdSize: "",
  needTypes: [],
  needsMedical: false,
  medicineListText: "",
  waterDepthEstimate: "",
  boatAccessible: false,
  hasChildren: false,
  hasElderly: false,
  hasDisability: false,
  isPregnant: false,
  daysWithoutAid: "",
  note: "",
};

const toOptionalInt = (value?: string) => {
  if (!value?.trim()) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const parseStringArray = (value?: string) =>
  value
    ?.split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

export const CreateLocationModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [args, setArgs] = useState<OpenArgs | null>(null);
  const utils = api.useUtils();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      summary: "",
      note: "",
      address: "",
      emergencyLevel: "medium",
      tagsText: "",
      victims: [emptyVictim],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "victims",
  });

  const createLocationMutation = api.location.create.useMutation({
    onSuccess: () => {
      toastManager.add({
        title: "Đã tạo điểm hỗ trợ",
        type: "success",
      });
      void utils.location.findMany.invalidate();
      void utils.victim.findMany.invalidate();
      setOpen(false);
    },
  });

  useEffect(() => {
    const onOpen = (openArgs: OpenArgs) => {
      setOpen(true);
      setArgs(openArgs);
      form.reset({
        summary: "",
        note: "",
        address: "",
        emergencyLevel: "medium",
        tagsText: "",
        victims: [emptyVictim],
      });
    };

    const onClose = () => setOpen(false);

    events.on("open", onOpen);
    events.on("close", onClose);
    return () => {
      events.off("open", onOpen);
      events.off("close", onClose);
    };
  }, [form]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setArgs(null);
    }
  };

  const handleSubmit: SubmitHandler<Values> = (values) => {
    if (!args) return;

    createLocationMutation.mutate({
      summary: values.summary || undefined,
      note: values.note || undefined,
      address: values.address || undefined,
      emergencyLevel: values.emergencyLevel,
      lat: args.lat,
      lng: args.lng,
      tags: parseStringArray(values.tagsText),
      victims: values.victims.map((victim) => ({
        fullname: victim.fullname,
        phone: victim.phone || undefined,
        phone2: victim.phone2 || undefined,
        age: toOptionalInt(victim.age),
        gender: victim.gender,
        householdSize: toOptionalInt(victim.householdSize),
        needTypes: victim.needTypes || [],
        needsMedical: victim.needsMedical || false,
        medicineList: parseStringArray(victim.medicineListText),
        waterDepthEstimate: victim.waterDepthEstimate || undefined,
        boatAccessible: victim.boatAccessible || false,
        hasChildren: victim.hasChildren || false,
        hasElderly: victim.hasElderly || false,
        hasDisability: victim.hasDisability || false,
        isPregnant: victim.isPregnant || false,
        daysWithoutAid: toOptionalInt(victim.daysWithoutAid),
        note: victim.note || undefined,
      })),
    });
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Tạo điểm cần hỗ trợ trên bản đồ</SheetTitle>
          <SheetDescription>
            Tạo một điểm yêu cầu cứu trợ và nhập nhanh các hộ dân đang ở cùng vị trí.
          </SheetDescription>
        </SheetHeader>

        {args && (
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <SheetPanel className="space-y-5">
              {createLocationMutation.error && (
                <Alert variant="warning">
                  <AlertTitle>Không thể tạo điểm hỗ trợ</AlertTitle>
                  <AlertDescription>
                    {createLocationMutation.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="emergencyLevel"
                  control={form.control}
                  render={(props) => (
                    <SelectField
                      label="Mức khẩn cấp"
                      placeholder="Chọn mức"
                      options={[
                        { label: "Nguy kịch", value: "critical" },
                        { label: "Khẩn cấp", value: "high" },
                        { label: "Cần hỗ trợ", value: "medium" },
                      ]}
                      {...props}
                    />
                  )}
                />
                <Controller
                  name="summary"
                  control={form.control}
                  render={(props) => (
                    <TextField
                      label="Tóm tắt nhanh"
                      placeholder="Ví dụ: Hộ 4 người mắc kẹt tầng 2"
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
                      label="Địa chỉ mô tả"
                      placeholder="Có thể để trống để hệ thống tự suy ra địa chỉ nếu đã cấu hình dịch vụ bản đồ"
                      {...props}
                    />
                  )}
              />

              <Controller
                name="tagsText"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <Label>Thẻ hiện trường</Label>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder="Ví dụ: ngập sâu, cầu tạm, gần trạm y tế"
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
                      placeholder="Lưu ý đường vào, điểm mốc, chướng ngại, thời gian xác minh..."
                    />
                    {fieldState.error?.message && (
                      <p className="text-sm text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </Field>
                )}
              />

              <div className="rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground">
                Tọa độ đang chọn:{" "}
                <span className="font-mono">
                  {args.lat.toFixed(6)}, {args.lng.toFixed(6)}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    Hộ dân trong điểm ({fields.length})
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ ...emptyVictim })}
                  >
                    <Plus className="mr-1 size-4" />
                    Thêm người / hộ
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-4 rounded-xl border bg-white p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span
                          className={cn(
                            "inline-flex size-6 items-center justify-center rounded-full",
                            "bg-cyan-100 text-cyan-800",
                          )}
                        >
                          {index + 1}
                        </span>
                        Hồ sơ tại điểm
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    <Controller
                      name={`victims.${index}.fullname`}
                      control={form.control}
                      render={(props) => (
                        <TextField
                          autoFocus={index === 0}
                          label="Họ và tên"
                          placeholder="Ví dụ: Lê Văn Bảy"
                          required
                          {...props}
                        />
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name={`victims.${index}.phone`}
                        control={form.control}
                        render={(props) => (
                          <TextField
                            label="Số điện thoại"
                            placeholder="Nếu có"
                            {...props}
                          />
                        )}
                      />
                      <Controller
                        name={`victims.${index}.phone2`}
                        control={form.control}
                        render={(props) => (
                          <TextField
                            label="Số điện thoại phụ"
                            placeholder="Số dự phòng"
                            {...props}
                          />
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Controller
                        name={`victims.${index}.age`}
                        control={form.control}
                        render={(props) => (
                          <TextField
                            label="Tuổi"
                            placeholder="Ví dụ: 70"
                            inputMode="numeric"
                            {...props}
                          />
                        )}
                      />
                      <Controller
                        name={`victims.${index}.gender`}
                        control={form.control}
                        render={(props) => (
                          <SelectField
                            label="Giới tính"
                            placeholder="Chọn"
                            options={[
                              { label: "Nam", value: "male" },
                              { label: "Nữ", value: "female" },
                              { label: "Khác", value: "other" },
                            ]}
                            {...props}
                          />
                        )}
                      />
                      <Controller
                        name={`victims.${index}.householdSize`}
                        control={form.control}
                        render={(props) => (
                          <TextField
                            label="Số người trong hộ"
                            placeholder="Ví dụ: 5"
                            inputMode="numeric"
                            {...props}
                          />
                        )}
                      />
                    </div>

                    <Controller
                      name={`victims.${index}.needTypes`}
                      control={form.control}
                      render={({ field: controllerField, fieldState }) => (
                        <Field>
                          <Label>Nhu cầu chính</Label>
                          <div className="flex flex-wrap gap-2">
                            {needTypeEnumValues.map((item) => {
                              const active = controllerField.value?.includes(item);
                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => {
                                    const current = controllerField.value || [];
                                    controllerField.onChange(
                                      active
                                        ? current.filter((value) => value !== item)
                                        : [...current, item],
                                    );
                                  }}
                                  className={cn(
                                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                                    active
                                      ? "border-cyan-600 bg-cyan-50 text-cyan-800"
                                      : "border-border bg-background text-muted-foreground hover:border-cyan-300",
                                  )}
                                >
                                  {needTypeLabels[item]}
                                </button>
                              );
                            })}
                          </div>
                          {fieldState.error?.message && (
                            <p className="text-sm text-destructive">
                              {fieldState.error.message}
                            </p>
                          )}
                        </Field>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name={`victims.${index}.waterDepthEstimate`}
                        control={form.control}
                        render={(props) => (
                          <TextField
                            label="Mực nước ước tính"
                            placeholder="Ví dụ: ngập tới đầu gối"
                            {...props}
                          />
                        )}
                      />
                      <Controller
                        name={`victims.${index}.daysWithoutAid`}
                        control={form.control}
                        render={(props) => (
                          <TextField
                            label="Số ngày chưa có hỗ trợ"
                            placeholder="Ví dụ: 1"
                            inputMode="numeric"
                            {...props}
                          />
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Controller
                        name={`victims.${index}.needsMedical`}
                        control={form.control}
                        render={({ field: controllerField }) => (
                          <TogglePill
                            label="Cần y tế"
                            active={!!controllerField.value}
                            onClick={() =>
                              controllerField.onChange(!controllerField.value)
                            }
                          />
                        )}
                      />
                      <Controller
                        name={`victims.${index}.boatAccessible`}
                        control={form.control}
                        render={({ field: controllerField }) => (
                          <TogglePill
                            label="Cần tiếp cận bằng xuồng"
                            active={!!controllerField.value}
                            onClick={() =>
                              controllerField.onChange(!controllerField.value)
                            }
                          />
                        )}
                      />
                      <Controller
                        name={`victims.${index}.hasChildren`}
                        control={form.control}
                        render={({ field: controllerField }) => (
                          <TogglePill
                            label="Có trẻ em"
                            active={!!controllerField.value}
                            onClick={() =>
                              controllerField.onChange(!controllerField.value)
                            }
                          />
                        )}
                      />
                      <Controller
                        name={`victims.${index}.hasElderly`}
                        control={form.control}
                        render={({ field: controllerField }) => (
                          <TogglePill
                            label="Có người cao tuổi"
                            active={!!controllerField.value}
                            onClick={() =>
                              controllerField.onChange(!controllerField.value)
                            }
                          />
                        )}
                      />
                      <Controller
                        name={`victims.${index}.hasDisability`}
                        control={form.control}
                        render={({ field: controllerField }) => (
                          <TogglePill
                            label="Có người khuyết tật"
                            active={!!controllerField.value}
                            onClick={() =>
                              controllerField.onChange(!controllerField.value)
                            }
                          />
                        )}
                      />
                      <Controller
                        name={`victims.${index}.isPregnant`}
                        control={form.control}
                        render={({ field: controllerField }) => (
                          <TogglePill
                            label="Có phụ nữ mang thai"
                            active={!!controllerField.value}
                            onClick={() =>
                              controllerField.onChange(!controllerField.value)
                            }
                          />
                        )}
                      />
                    </div>

                    <Controller
                      name={`victims.${index}.medicineListText`}
                      control={form.control}
                      render={({ field: controllerField, fieldState }) => (
                        <Field>
                          <Label>Danh sách thuốc</Label>
                          <Textarea
                            {...controllerField}
                            rows={2}
                            placeholder="Ví dụ: thuốc hen, thuốc huyết áp"
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
                      name={`victims.${index}.note`}
                      control={form.control}
                      render={({ field: controllerField, fieldState }) => (
                        <Field>
                          <Label>Ghi chú riêng của hộ</Label>
                          <Textarea
                            {...controllerField}
                            rows={2}
                            placeholder="Bệnh nền, điểm đón xuồng, mã cửa, số tầng..."
                          />
                          {fieldState.error?.message && (
                            <p className="text-sm text-destructive">
                              {fieldState.error.message}
                            </p>
                          )}
                        </Field>
                      )}
                    />
                  </div>
                ))}
              </div>

              <Button
                disabled={createLocationMutation.isPending}
                type="submit"
                className="w-full"
              >
                {createLocationMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Đang tạo điểm hỗ trợ...
                  </>
                ) : (
                  "Lưu điểm hỗ trợ"
                )}
              </Button>
            </SheetPanel>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
};

const TogglePill: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "rounded-xl border px-3 py-2 text-left text-sm transition-colors",
      active
        ? "border-amber-500 bg-amber-50 text-amber-900"
        : "border-border bg-background text-muted-foreground hover:border-amber-300",
    )}
  >
    {label}
  </button>
);

export const createLocationModal = (args: OpenArgs) => {
  events.emit("open", args);
};
