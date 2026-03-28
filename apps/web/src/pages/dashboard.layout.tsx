import { cn } from "@/lib/utils";
import { env } from "@/env";
import { paths } from "@/paths";
import {
  Ambulance,
  ClipboardList,
  Map,
  MessageSquareText,
  PhoneCall,
  Shield,
  Users,
} from "lucide-react";
import type React from "react";
import { Link, useLocation } from "react-router-dom";

type DashboardLayoutProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
};

const navItems = [
  { title: "Bản đồ", path: paths.home(), icon: Map },
  { title: "Hộ dân", path: paths.victims(), icon: Users },
  { title: "Đội cứu trợ", path: paths.rescuers(), icon: Shield },
  { title: "Phương tiện", path: paths.vehicles(), icon: Ambulance },
  { title: "Kế hoạch", path: paths.rescuePlans(), icon: ClipboardList },
  { title: "Nhật ký", path: paths.conversations(), icon: MessageSquareText },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  header = <DefaultHeader />,
}) => {
  const pathname = useLocation().pathname;

  return (
    <div className="w-screen h-screen overflow-hidden bg-background text-foreground">
      <header className="h-header border-b border-white/60 bg-white/70 backdrop-blur-xl px-5">
        <div className="h-full flex items-center">{header}</div>
      </header>
      <div className="flex h-[calc(100vh-var(--height-header))]">
        <nav className="w-sidebar shrink-0 border-r border-white/10 bg-[linear-gradient(180deg,#0d2236_0%,#123e66_100%)] text-sidebar-foreground flex flex-col items-center py-4 gap-4 shadow-[18px_0_40px_rgba(11,34,54,0.18)]">
          <div className="size-12 overflow-hidden rounded-2xl bg-white/8 backdrop-blur border border-white/10 shadow-[0_10px_24px_rgba(7,23,40,0.18)]">
            <img
              src="/hackthon-logo-256.png"
              alt="Hackthon Humanitarian Logistics"
              className="size-full object-cover object-center"
            />
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.path === "/"
                  ? pathname === item.path
                  : pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="group flex flex-col items-center gap-1"
                >
                  <div
                    className={cn(
                      "size-11 rounded-2xl border flex items-center justify-center transition-all duration-200",
                      active
                        ? "bg-cyan-400/18 text-cyan-100 border-cyan-300/30 shadow-[0_10px_28px_rgba(56,189,248,0.18)]"
                        : "border-white/8 text-slate-300 hover:bg-white/8 hover:text-white",
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <span className="text-[11px] text-center leading-tight opacity-90 max-w-16">
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="mt-auto px-3">
            <Link
              to={paths.call()}
              className="size-11 rounded-2xl border border-amber-300/30 bg-amber-400/10 text-amber-100 flex items-center justify-center hover:bg-amber-400/16 transition-colors"
              title="Gọi điện AI"
            >
              <PhoneCall className="size-5" />
            </Link>
          </div>
        </nav>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};

const DefaultHeader = () => {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="size-10 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_24px_rgba(14,30,60,0.18)]">
        <img
          src="/hackthon-logo-256.png"
          alt="Hackthon Humanitarian Logistics"
          className="size-full object-cover object-center"
        />
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
          Flood Operations Center
        </div>
        <div className="text-lg font-extrabold text-slate-900">
          HumanLogs2026
        </div>
      </div>
      {env.VITE_USE_MOCK_DATA && (
        <div className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <div className="size-2 animate-pulse rounded-full bg-emerald-500"></div>
          Đang kết nối trực tuyến
        </div>
      )}
    </div>
  );
};
