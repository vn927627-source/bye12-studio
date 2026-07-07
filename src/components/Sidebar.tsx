// src/components/Sidebar.tsx
import React from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  TrendingUp,
  CalendarDays,
  ShoppingBag,
  Bell,
  StickyNote,
  Settings as SettingsIcon,
  ClipboardCheck,
} from "lucide-react";
import { useStore } from "../lib/store";
import { GRADIENT, PINK } from "./common";
import type { Screen } from "../app/App";

const NAV: { id: Screen; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { id: "customers", label: "Khách hàng", icon: <Users size={16} /> },
  { id: "orders", label: "Đơn thuê", icon: <FileText size={16} /> },
  { id: "warehouse", label: "Kho đồ", icon: <Package size={16} /> },
  { id: "revenue", label: "Doanh thu", icon: <TrendingUp size={16} /> },
  { id: "calendar", label: "Lịch trình", icon: <CalendarDays size={16} /> },
  { id: "check", label: "Kiểm đồ", icon: <ClipboardCheck size={16} /> },
  { id: "notes", label: "Ghi chú", icon: <StickyNote size={16} /> },
  { id: "settings", label: "Cài đặt", icon: <SettingsIcon size={16} /> },
];

export function Sidebar({
  screen,
  onNav,
}: {
  screen: Screen;
  onNav: (s: Screen) => void;
}) {
  const { data } = useStore();
  return (
    <aside className="w-56 flex-shrink-0 bg-[#0E0B15] border-r border-white/[0.05] flex flex-col">
      <div className="px-5 py-5 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: GRADIENT }}
          >
            <ShoppingBag size={15} className="text-white" />
          </div>
          <div>
            <p
              className="text-sm font-bold text-foreground leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {data.settings.shopName}
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {data.settings.shopTagline}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50 px-3 pb-1.5 pt-1">
          Menu
        </p>
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group"
            style={
              screen === item.id
                ? {
                    background: `linear-gradient(135deg, ${PINK}20, #A855F720)`,
                    color: PINK,
                    border: `1px solid ${PINK}25`,
                  }
                : { color: "#7A6F8A" }
            }
          >
            <span
              className="flex-shrink-0"
              style={screen === item.id ? { color: PINK } : {}}
            >
              {item.icon}
            </span>
            <span className="text-xs font-medium group-hover:text-foreground transition-colors">
              {item.label}
            </span>
            {screen === item.id && (
              <span
                className="ml-auto w-1 h-4 rounded-full"
                style={{ background: GRADIENT }}
              />
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-white/[0.05] space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03]">
          <div
            className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
            style={{ background: GRADIENT }}
          >
            A
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              Admin
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {data.settings.shopName}studio.vn
            </p>
          </div>
          <button className="ml-auto p-1 rounded-lg hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-all">
            <Bell size={12} />
          </button>
        </div>
      </div>
    </aside>
  );
}
