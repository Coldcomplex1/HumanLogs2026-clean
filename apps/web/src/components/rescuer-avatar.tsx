import type * as React from "react";
import { cn } from "@/lib/utils";

const BG_COLORS = [
  "#E74C3C", "#E67E22", "#F39C12", "#27AE60",
  "#16A085", "#2980B9", "#8E44AD", "#D35400",
  "#C0392B", "#1ABC9C", "#2ECC71", "#3498DB",
];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

type RescuerAvatarProps = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizes = {
  sm: { container: "size-8 text-base", ring: "ring-2" },
  md: { container: "size-10 text-xl", ring: "ring-2" },
  lg: { container: "size-16 text-4xl", ring: "ring-2" },
  xl: { container: "size-24 text-5xl", ring: "ring-4" },
};

export const RescuerAvatar: React.FC<RescuerAvatarProps> = ({
  id,
  name,
  avatarUrl,
  size = "md",
  className,
}) => {
  const { container, ring } = sizes[size];

  if (avatarUrl) {
    return (
      <div
        className={cn(
          "rounded-full overflow-hidden shrink-0 ring ring-white",
          ring,
          container,
          className,
        )}
      >
        <img
          src={avatarUrl}
          alt="avatar"
          className="size-full object-cover"
        />
      </div>
    );
  }

  const initial = (name?.trim()?.[0] ?? "?").toUpperCase();
  const bg = BG_COLORS[hashId(id) % BG_COLORS.length];

  return (
    <div
      className={cn(
        "rounded-full shrink-0 flex items-center justify-center ring ring-white select-none font-semibold text-white",
        ring,
        container,
        className,
      )}
      style={{ backgroundColor: bg }}
    >
      {initial}
    </div>
  );
};
