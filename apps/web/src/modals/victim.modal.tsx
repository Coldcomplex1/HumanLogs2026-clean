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
import { genderEnumValues, needTypeEnumValues } from "@repo/api/share";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TextField } from "@/components/form/text-field";
import { SelectField } from "@/components/form/select-field";
import { toastManager } from "@/components/ui/toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

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

export type VictimData = {
  id: string;
  fullname: string;
  phone?: string | null;
  phone2?: string | null;
  email?: string | null;
  age?: number | null;
  gender?: "male" | "female" | "other" | null;
  note?: string | null;
  facebookURL?: string | null;
  addressText?: string | null;
  householdSize?: number | null;
  hasChildren?: boolean | null;
  hasElderly?: boolean | null;
  hasDisability?: boolean | null;
  isPregnant?: boolean | null;
  needsMedical?: boolean | null;
  needTypes?: string[] | null;
  medicineList?: string[] | null;
  daysWithoutAid?: number | null;
  waterDepthEstimate?: string | null;
  boatAccessible?: boolean | null;
  locationId?: string | null;
};

export type OpenArgs = {
  victim?: VictimData;
};

const schema = z.object({
  fullname: z.string().min(1, "Họ tên là bắt buộc"),
  phone: z.string().optional(),
  phone2: z.string().optional(),
  email: z.string().optional(),
  age: z.string().optional(),
  gender: z.enum(genderEnumValues).optional(),
  note: z.string().optional(),
  facebookURL: z.string().optional(),
  addressText: z.string().optional(),
  householdSize: z.string().optional(),
  hasChildren: z.boolean().optional(),
  hasElderly: z.boolean().optional(),
  hasDisability: z.boolean().optional(),
  isPregnant: z.boolean().optional(),
  needsMedical: z.boolean().optional(),
  needTypes: z.array(z.enum(needTypeEnumValues)).optional(),
  medicineListText: z.string().optional(),
  daysWithoutAid: z.string().optional(),
  waterDepthEstimate: z.string().optional(),
  boatAccessible: z.boolean().optional(),
});

type Values = z.infer<typeof schema>;

const emptyDefaults: Values = {
  fullname: "",
  phone: "",
  phone2: "",
  email: "",
  age: "",
  gender: undefined,
  note: "",
  facebookURL: "",
  addressText: "",
  householdSize: "",
  hasChildren: false,
  hasElderly: false,
  hasDisability: false,
  isPregnant: false,
  needsMedical: false,
  needTypes: [],
  medicineListText: "",
  daysWithoutAid: "",
  waterDepthEstimate: "",
  boatAccessible: false,
};

const toOptionalInt = (value?: string) => {
  if (!value?.trim()) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const parseMedicineList = (value?: string) =>
  value
    ?.split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

export const VictimModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [args, setArgs] = useState<OpenArgs | null>(null);
  const utils = api.useUtils();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  });

  const createVictimMutation = api.victim.create.useMutation({
    onSuccess: () => {
      toastManager.add({
        title: "Đã thêm hộ dân cần hỗ trợ",
        type: "success",
      });
      void utils.victim.findMany.invalidate();
      void utils.location.findMany.invalidate();
      setOpen(false);
    },
  });

  const updateVictimMutation = api.victim.update.useMutation({
    onSuccess: () => {
      toastManager.add({
        title: "Đã cập nhật hộ dân cần hỗ trợ",
        type: "success",
      });
      void utils.victim.findMany.invalidate();
      void utils.location.findMany.invalidate();
      setOpen(false);
    },
  });

  useEffect(() => {
    const onOpen = (openArgs?: OpenArgs) => {
      setOpen(true);
      setArgs(openArgs || null);

      if (openArgs?.victim) {
        const victim = openArgs.victim;
        form.reset({
          fullname: victim.fullname || "",
          phone: victim.phone || "",
          phone2: victim.phone2 || "",
          email: victim.email || "",
          age: victim.age?.toString() || "",
          gender: victim.gender || undefined,
          note: victim.note || "",
          facebookURL: victim.facebookURL || "",
          addressText: victim.addressText || "",
          householdSize: victim.householdSize?.toString() || "",
          hasChildren: !!victim.hasChildren,
          hasElderly: !!victim.hasElderly,
          hasDisability: !!victim.hasDisability,
          isPregnant: !!victim.isPregnant,
          needsMedical: !!victim.needsMedical,
          needTypes:
            (victim.needTypes?.filter((item): item is (typeof needTypeEnumValues)[number] =>
              needTypeEnumValues.includes(item as (typeof needTypeEnumValues)[number]),
            ) as (typeof needTypeEnumValues)[number][]) ?? [],
          medicineListText: victim.medicineList?.join("\n") || "",
          daysWithoutAid: victim.daysWithoutAid?.toString() || "",
          waterDepthEstimate: victim.waterDepthEstimate || "",
          boatAccessible: !!victim.boatAccessible,
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
  }, [form]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setArgs(null);
    }
  };

  const handleSubmit: SubmitHandler<Values> = (values) => {
    const payload = {
      fullname: values.fullname,
      phone: values.phone || undefined,
      phone2: values.phone2 || undefined,
      email: values.email || undefined,
      age: toOptionalInt(values.age),
      gender: values.gender,
      note: values.note || undefined,
      facebookURL: values.facebookURL || undefined,
      addressText: values.addressText || undefined,
      householdSize: toOptionalInt(values.householdSize),
      hasChildren: values.hasChildren || false,
      hasElderly: values.hasElderly || false,
      hasDisability: values.hasDisability || false,
      isPregnant: values.isPregnant || false,
      needsMedical: values.needsMedical || false,
      needTypes: values.needTypes || [],
      medicineList: parseMedicineList(values.medicineListText),
      daysWithoutAid: toOptionalInt(values.daysWithoutAid),
      waterDepthEstimate: values.waterDepthEstimate || undefined,
      boatAccessible: values.boatAccessible || false,
    };

    if (args?.victim?.id) {
      updateVictimMutation.mutate({
        id: args.victim.id,
        data: payload,
      });
      return;
    }

    createVictimMutation.mutate(payload);
  };

  const isPending =
    createVictimMutation.isPending || updateVictimMutation.isPending;
  const isEdit = !!args?.victim;
  const mutationError = createVictimMutation.error ?? updateVictimMutation.error;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isEdit
              ? "Chỉnh sửa hộ dân / người cần hỗ trợ"
              : "Thêm hộ dân / người cần hỗ trợ"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Cập nhật nhu yếu phẩm, mức dễ tổn thương và tình trạng tiếp cận."
              : "Nhập nhanh hồ sơ hộ dân để điều phối cứu trợ và lập kế hoạch tiếp cận."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <SheetPanel className="space-y-4">
            {mutationError && (
              <Alert variant="warning">
                <AlertTitle>Không thể lưu hồ sơ</AlertTitle>
                <AlertDescription>{mutationError.message}</AlertDescription>
              </Alert>
            )}

            <Controller
              name="fullname"
              control={form.control}
              render={(props) => (
                <TextField
                  autoFocus
                  label="Họ và tên"
                  placeholder="Ví dụ: Nguyễn Thị Lan"
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
                    placeholder="Ví dụ: 0912345678"
                    {...props}
                  />
                )}
              />
              <Controller
                name="phone2"
                control={form.control}
                render={(props) => (
                  <TextField
                    label="Số điện thoại phụ"
                    placeholder="Số người thân hoặc hàng xóm"
                    {...props}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Controller
                name="age"
                control={form.control}
                render={(props) => (
                  <TextField
                    label="Tuổi"
                    placeholder="Ví dụ: 62"
                    inputMode="numeric"
                    {...props}
                  />
                )}
              />
              <Controller
                name="gender"
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
                name="householdSize"
                control={form.control}
                render={(props) => (
                  <TextField
                    label="Số người trong hộ"
                    placeholder="Ví dụ: 4"
                    inputMode="numeric"
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
                    placeholder="Nếu có"
                    {...props}
                  />
                )}
              />
              <Controller
                name="daysWithoutAid"
                control={form.control}
                render={(props) => (
                  <TextField
                    label="Số ngày chưa nhận hỗ trợ"
                    placeholder="Ví dụ: 2"
                    inputMode="numeric"
                    {...props}
                  />
                )}
              />
            </div>

            <Controller
              name="addressText"
              control={form.control}
              render={(props) => (
                <TextField
                  label="Địa chỉ mô tả"
                  placeholder="Ví dụ: Tổ 3, thôn Phú Sơn, gần trường tiểu học"
                  {...props}
                />
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="waterDepthEstimate"
                control={form.control}
                render={(props) => (
                  <TextField
                    label="Ước tính mực nước"
                    placeholder="Ví dụ: ngập 80cm trước sân"
                    {...props}
                  />
                )}
              />
              <Controller
                name="facebookURL"
                control={form.control}
                render={(props) => (
                  <TextField
                    label="Liên kết Facebook"
                    placeholder="Nếu hộ dân gửi qua mạng xã hội"
                    {...props}
                  />
                )}
              />
            </div>

            <Controller
              name="needTypes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <Label>Nhu yếu phẩm / hỗ trợ cần thiết</Label>
                  <div className="flex flex-wrap gap-2">
                    {needTypeEnumValues.map((item) => {
                      const active = field.value?.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            const current = field.value || [];
                            field.onChange(
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
                name="needsMedical"
                control={form.control}
                render={({ field }) => (
                  <BooleanCard
                    label="Cần hỗ trợ y tế"
                    description="Có người bệnh, chấn thương hoặc cần thuốc."
                    checked={!!field.value}
                    onToggle={() => field.onChange(!field.value)}
                  />
                )}
              />
              <Controller
                name="boatAccessible"
                control={form.control}
                render={({ field }) => (
                  <BooleanCard
                    label="Tiếp cận bằng xuồng"
                    description="Đường bộ bị chia cắt hoặc xuồng là phương án chính."
                    checked={!!field.value}
                    onToggle={() => field.onChange(!field.value)}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="hasChildren"
                control={form.control}
                render={({ field }) => (
                  <ToggleTag
                    label="Có trẻ em"
                    active={!!field.value}
                    onClick={() => field.onChange(!field.value)}
                  />
                )}
              />
              <Controller
                name="hasElderly"
                control={form.control}
                render={({ field }) => (
                  <ToggleTag
                    label="Có người cao tuổi"
                    active={!!field.value}
                    onClick={() => field.onChange(!field.value)}
                  />
                )}
              />
              <Controller
                name="hasDisability"
                control={form.control}
                render={({ field }) => (
                  <ToggleTag
                    label="Có người khuyết tật"
                    active={!!field.value}
                    onClick={() => field.onChange(!field.value)}
                  />
                )}
              />
              <Controller
                name="isPregnant"
                control={form.control}
                render={({ field }) => (
                  <ToggleTag
                    label="Có phụ nữ mang thai"
                    active={!!field.value}
                    onClick={() => field.onChange(!field.value)}
                  />
                )}
              />
            </div>

            <Controller
              name="medicineListText"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <Label>Danh sách thuốc cần thiết</Label>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Mỗi dòng một loại, ví dụ: Thuốc huyết áp&#10;Insulin"
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
                  <Label>Ghi chú hiện trường</Label>
                  <Textarea
                    {...field}
                    rows={4}
                    placeholder="Tình trạng ngập, điểm mốc nhận diện, yêu cầu đặc biệt..."
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
                "Thêm hộ dân"
              )}
            </Button>
          </SheetPanel>
        </form>
      </SheetContent>
    </Sheet>
  );
};

const BooleanCard: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}> = ({ label, description, checked, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "rounded-xl border p-3 text-left transition-colors",
        checked
          ? "border-cyan-600 bg-cyan-50"
          : "border-border bg-background hover:border-cyan-300",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <span
          className={cn(
            "mt-0.5 inline-flex rounded-full px-2 py-1 text-[11px] font-medium",
            checked
              ? "bg-cyan-700 text-white"
              : "bg-muted text-muted-foreground",
          )}
        >
          {checked ? "Có" : "Không"}
        </span>
      </div>
    </button>
  );
};

const ToggleTag: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "rounded-xl border px-3 py-2 text-sm text-left transition-colors",
      active
        ? "border-amber-500 bg-amber-50 text-amber-900"
        : "border-border bg-background text-muted-foreground hover:border-amber-300",
    )}
  >
    {label}
  </button>
);

export const openVictimModal = (args?: OpenArgs) => {
  events.emit("open", args);
};
