import type * as React from "react";
import { PropsWithChildren, useEffect, useState } from "react";
import { useToolbarContext } from "./toolbar.context";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { COLORS } from "../../data";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { toastManager } from "@/components/ui/toast";
import { Loader2, Trash } from "lucide-react";
import { Slider, SliderValue } from "@/components/ui/slider";
import { Field, FieldLabel } from "@/components/ui/field";

export const ShapeDetail: React.FC<PropsWithChildren<{}>> = props => {
  const { selectedMarker, mode, setSelectedMarker } = useToolbarContext();
  const [color, setColor] = useState<string>();
  const [fillOpacity, setFillOpacity] = useState<number>(10);
  const [name, setName] = useState<string>();
  const [note, setNote] = useState<string>();

  const updateMarkerMutation = api.marker.update.useMutation({
    onSuccess: () => {
      toastManager.add({
        title: "Đã cập nhật vùng vẽ",
        type: "success",
      });
    },
  });

  const deleteMarkerMutation = api.marker.delete.useMutation({
    onSuccess: () => {
      toastManager.add({
        title: "Đã xóa vùng vẽ",
        type: "success",
      });
      setSelectedMarker(null);
    },
    onError: error => {
      toastManager.add({
        title: "Xóa vùng vẽ thất bại",
        description: error.message,
        type: "error",
      });
    },
  });

  useEffect(() => {
    if (!selectedMarker) return;
    setName(selectedMarker.name!);
    setColor(selectedMarker.color!);
    setNote(selectedMarker.note!);
    setFillOpacity(selectedMarker.fillOpacity! * 100);
  }, [selectedMarker]);

  if (!selectedMarker || mode !== "idle") return null;

  const handleSave = () => {
    if (!selectedMarker) return;
    if (!color) return;

    updateMarkerMutation.mutate({
      id: selectedMarker.id,
      data: {
        name: name ?? undefined,
        note: note ?? undefined,
        color: color,
        fillOpacity: fillOpacity / 100,
      },
    });
  };

  return (
    <div className="absolute top-40 right-3 z-50 bg-white px-4 py-3 text-sm rounded-xl shadow-lg flex gap-2">
      <div className="space-y-2">
        <div className="text-sm font-medium">Chi tiết vùng vẽ</div>
        <div className="text-xs text-muted-foreground space-y-2">
          <Input
            value={name || ""}
            onChange={e => setName(e.target.value)}
            placeholder="Tên khu vực"
            onKeyDown={e => {
              if (e.key === "Enter") {
                handleSave();
              }
            }}
          />
          <Textarea
            value={note || ""}
            onChange={e => setNote(e.target.value)}
            placeholder="Ghi chú"
            onKeyDown={e => {
              if (e.key === "Enter") {
                handleSave();
              }
            }}
          />
          <div className="">
            <Label>Màu hiển thị</Label>
            <div className="flex mt-1 flex-wrap gap-1">
              {COLORS.map(hex => (
                <div
                  role="button"
                  title={hex}
                  key={hex}
                  className={cn(
                    "size-6 rounded-md",
                    hex === color ? "ring-2 ring-offset-1 ring-primary" : "",
                  )}
                  style={{ backgroundColor: hex }}
                  onClick={() => setColor(hex)}
                />
              ))}
            </div>
          </div>
          <div>
            <Field>
              <Slider
                value={fillOpacity}
                onValueChange={value => setFillOpacity(value as number)}
              >
                <div className="mb-2 flex items-center justify-between gap-1">
                  <FieldLabel className="font-medium text-sm">
                    Độ đậm vùng phủ
                  </FieldLabel>
                  <SliderValue />
                </div>
              </Slider>
            </Field>
          </div>
          <div className="flex justify-end gap-1 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                deleteMarkerMutation.mutate({
                  id: selectedMarker.id,
                });
              }}
              disabled={deleteMarkerMutation.isPending}
            >
              <Trash className="size-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedMarker(null);
                setColor(selectedMarker.color!);
              }}
            >
              Hủy
            </Button>
            <Button
              disabled={updateMarkerMutation.isPending}
              onClick={handleSave}
            >
              {updateMarkerMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Lưu"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
