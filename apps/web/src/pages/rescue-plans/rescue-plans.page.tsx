import type * as React from "react";
import { useState, useCallback } from "react";
import { DashboardLayout } from "../dashboard.layout";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { toastManager } from "@/components/ui/toast";
import { RescuePlanModal, openRescuePlanModal } from "@/modals/rescue-plan.modal";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";

type PlanStatus = "draft" | "active" | "completed" | "cancelled";
type Priority = "low" | "medium" | "high" | "critical";

type Plan = {
  id: string;
  title: string;
  description?: string | null;
  status: PlanStatus;
  priority: Priority;
  createdAt: string;
  locations: { location: { id: string; address: string | null } }[];
  rescuers: { rescuer: { id: string; fullName: string } }[];
  vehicles: { vehicle: { id: string; name: string | null } }[];
};

// A plan is "fully locked" (view-only) only when completed or cancelled.
// Active plans open with only status editable (handled inside the modal).
function isPlanLocked(plan: Plan): boolean {
  return plan.status === "completed" || plan.status === "cancelled";
}

const COLUMNS: { status: PlanStatus; label: string }[] = [
  { status: "draft",     label: "NHÁP"         },
  { status: "active",    label: "ĐANG HOẠT ĐỘNG" },
  { status: "completed", label: "HOÀN THÀNH"   },
  { status: "cancelled", label: "ĐÃ HỦY"       },
];

const PRIORITY_LEFT: Record<Priority, string> = {
  low:      "border-l-2 border-l-slate-300",
  medium:   "border-l-2 border-l-sky-400",
  high:     "border-l-2 border-l-orange-400",
  critical: "border-l-2 border-l-red-500",
};

const PRIORITY_DOT: Record<Priority, string> = {
  low:      "bg-slate-300",
  medium:   "bg-sky-400",
  high:     "bg-orange-400",
  critical: "bg-red-500",
};

const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Thấp", medium: "Trung bình", high: "Cao", critical: "Khẩn cấp",
};

const AVATAR_COLORS = [
  "#E74C3C","#E67E22","#F39C12","#27AE60",
  "#16A085","#2980B9","#8E44AD","#D35400",
];
function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const MiniAvatar: React.FC<{ id: string; name: string }> = ({ id, name }) => (
  <div
    className="size-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white ring-2 ring-white shrink-0"
    style={{ backgroundColor: AVATAR_COLORS[hashStr(id) % AVATAR_COLORS.length] }}
    title={name}
  >
    {name.trim()[0]?.toUpperCase() ?? "?"}
  </div>
);

export default function RescuePlansPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  // optimistic status overrides while dragging
  const [overrides, setOverrides] = useState<Record<string, PlanStatus>>({});
  const utils = api.useUtils();

  const plansQuery = api.rescuePlan.findMany.useQuery(
    {},
    { placeholderData: prev => prev ?? [] },
  );

  const updateMutation = api.rescuePlan.update.useMutation({
    onSuccess: () => {
      utils.rescuePlan.findMany.invalidate();
      utils.rescuer.findMany.invalidate();
    },
    onError: e => toastManager.add({ title: "Di chuyển kế hoạch thất bại", description: e.message, type: "error" }),
  });

  const deleteMutation = api.rescuePlan.delete.useMutation({
    onSuccess: () => {
      toastManager.add({ title: "Đã xóa kế hoạch", type: "success" });
      utils.rescuePlan.findMany.invalidate();
      utils.rescuer.findMany.invalidate();
      setDeleteId(null);
    },
    onError: e => {
      toastManager.add({ title: "Xóa thất bại", description: e.message, type: "error" });
      setDeleteId(null);
    },
  });

  const rawPlans = (plansQuery.data ?? []) as Plan[];
  // Apply optimistic overrides
  const plans = rawPlans.map(p =>
    overrides[p.id] ? { ...p, status: overrides[p.id] } : p,
  );
  const byStatus = (s: PlanStatus) => plans.filter(p => p.status === s);

  const handleEdit = (plan: Plan) => {
    const locked = isPlanLocked(plan);
    openRescuePlanModal({
      plan: {
        ...plan,
        locationIds: plan.locations.map(l => l.location.id),
        rescuerIds: plan.rescuers.map(r => r.rescuer.id),
        vehicleIds: plan.vehicles.map(v => v.vehicle.id),
      },
      readOnly: locked,
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const onDragStart = useCallback(({ active }: DragStartEvent) => {
    const plan = rawPlans.find(p => p.id === active.id);
    if (plan) setActivePlan(plan);
  }, [rawPlans]);

  const onDragOver = useCallback(({ active, over }: DragOverEvent) => {
    if (!over) return;
    const newStatus = over.id as PlanStatus;
    if (COLUMNS.some(c => c.status === newStatus)) {
      setOverrides(prev => ({ ...prev, [active.id as string]: newStatus }));
    }
  }, []);

  const onDragEnd = useCallback(({ active, over }: DragEndEvent) => {
    setActivePlan(null);
    setOverrides({});

    if (!over) return;

    const newStatus = over.id as PlanStatus;
    const plan = rawPlans.find(p => p.id === active.id);
    if (!plan || !COLUMNS.some(c => c.status === newStatus) || plan.status === newStatus) return;

    // Immediately patch the cache so the card stays put with no flash
    utils.rescuePlan.findMany.setData({}, old =>
      old?.map(p => p.id === plan.id ? { ...p, status: newStatus } : p) as typeof old,
    );

    updateMutation.mutate({ id: plan.id, data: { status: newStatus } });
  }, [rawPlans, updateMutation, utils]);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
          <h1 className="font-semibold text-base">Bảng kế hoạch</h1>
          <Button size="sm" onClick={() => openRescuePlanModal()}>
            <Plus className="size-3.5 mr-1" />
            Tạo mới
          </Button>
        </div>

        {plansQuery.isLoading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Đang tải...
          </div>
        ) : (
          <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
            <div className="flex-1 overflow-hidden bg-white">
              <div className="flex h-full divide-x">
                {COLUMNS.map(col => (
                  <KanbanColumn
                    key={col.status}
                    col={col}
                    plans={byStatus(col.status)}
                    isDragging={!!activePlan}
                    onEdit={handleEdit}
                    onDelete={id => setDeleteId(id)}
                  />
                ))}
              </div>
            </div>

            <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
              {activePlan && (
                <div className="rotate-1 opacity-95 shadow-xl">
                  <PlanCard plan={activePlan} locked={isPlanLocked(activePlan)} onEdit={() => {}} onDelete={() => {}} isDragging />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <RescuePlanModal />

      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa kế hoạch cứu hộ này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Tất cả phân công sẽ bị xóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="outline">Hủy</Button>} />
            <AlertDialogClose
              render={
                <Button
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
                >
                  {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

const KanbanColumn: React.FC<{
  col: { status: PlanStatus; label: string };
  plans: Plan[];
  isDragging: boolean;
  onEdit: (plan: Plan) => void;
  onDelete: (id: string) => void;
}> = ({ col, plans, isDragging, onEdit, onDelete }) => {
  const locked = (plan: Plan) => isPlanLocked(plan);
  const { setNodeRef, isOver } = useDroppable({ id: col.status });

  return (
    <div className="flex flex-col flex-1 min-w-0 bg-[#F4F5F7]">
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <span className="text-xs font-semibold tracking-wide text-[#5E6C84]">
          {col.label}
          <span className="ml-2 font-normal">{plans.length}</span>
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 overflow-y-auto px-2 space-y-2 pb-2 rounded-sm transition-colors duration-150",
          isOver && isDragging && "bg-blue-50/60",
        )}
      >
        {plans.map(plan => (
          <DraggablePlanCard
            key={plan.id}
            plan={plan}
            locked={locked(plan)}
            onEdit={() => onEdit(plan)}
            onDelete={() => onDelete(plan.id)}
          />
        ))}

        {/* Drop indicator when column is empty */}
        {plans.length === 0 && isDragging && isOver && (
          <div className="h-20 rounded-md border-2 border-dashed border-blue-300 bg-blue-50/40" />
        )}
      </div>

      <button
        className="flex items-center gap-1.5 w-full px-3 py-2.5 text-xs text-[#5E6C84] hover:bg-[#EBECF0] transition-colors"
        onClick={() => openRescuePlanModal({ defaultStatus: col.status })}
      >
        <Plus className="size-3.5" />
        Tạo kế hoạch
      </button>
    </div>
  );
};

const DraggablePlanCard: React.FC<{
  plan: Plan;
  locked: boolean;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ plan, locked, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: plan.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(isDragging && "opacity-40")}
    >
      <PlanCard plan={plan} locked={locked} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
};

const PlanCard: React.FC<{
  plan: Plan;
  locked: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
}> = ({ plan, locked, onEdit, onDelete, isDragging }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-md border border-neutral-200 group cursor-grab active:cursor-grabbing transition-all",
        !isDragging && "hover:border-neutral-300 hover:shadow-sm",
        PRIORITY_LEFT[plan.priority],
      )}
      onClick={e => {
        if ((e.target as HTMLElement).closest("[data-no-click]")) return;
        onEdit();
      }}
    >
      <div className="px-3 pt-3 pb-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-neutral-800 leading-snug">{plan.title}</p>
          {!locked && (
            <div
              data-no-click
              className="hidden group-hover:flex items-center gap-0.5 shrink-0 -mt-0.5"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="p-1 rounded hover:bg-neutral-100 transition-colors cursor-pointer"
                onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); onEdit(); }}
              >
                <Pencil className="size-3 text-neutral-400" />
              </button>
              <button
                className="p-1 rounded hover:bg-neutral-100 transition-colors cursor-pointer"
                onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); onDelete(); }}
              >
                <Trash2 className="size-3 text-neutral-400" />
              </button>
            </div>
          )}
        </div>

        {plan.description && (
          <div className="text-xs text-neutral-500 leading-relaxed line-clamp-3 prose prose-xs max-w-none [&_strong]:text-neutral-600 [&_strong]:font-semibold [&_ul]:my-0 [&_ol]:my-0 [&_li]:my-0 [&_p]:my-0">
            <Markdown>{plan.description}</Markdown>
          </div>
        )}

        <div className="flex items-center gap-3 pt-0.5">
          {plan.locations.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Địa điểm</span>
              <span className="text-xs font-semibold text-neutral-600">{plan.locations.length}</span>
            </div>
          )}
          {plan.vehicles.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Phương tiện</span>
              <span className="text-xs font-semibold text-neutral-600">{plan.vehicles.length}</span>
            </div>
          )}
          {plan.rescuers.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Cứu hộ viên</span>
              <span className="text-xs font-semibold text-neutral-600">{plan.rescuers.length}</span>
            </div>
          )}
        </div>

        <div className="border-t border-neutral-100" />

        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full shrink-0", PRIORITY_DOT[plan.priority])} />
            <span className="text-xs text-neutral-400">{PRIORITY_LABEL[plan.priority]}</span>
          </div>
          {plan.rescuers.length > 0 && (
            <div className="flex -space-x-1.5">
              {plan.rescuers.slice(0, 4).map(({ rescuer }) => (
                <MiniAvatar key={rescuer.id} id={rescuer.id} name={rescuer.fullName} />
              ))}
              {plan.rescuers.length > 4 && (
                <div className="size-6 rounded-full bg-neutral-200 ring-2 ring-white flex items-center justify-center text-[10px] font-semibold text-neutral-500">
                  +{plan.rescuers.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
