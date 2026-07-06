import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import type { OrderStatus } from "../lib/types";

export const PINK = "#D946A8";
export const VIOLET = "#A855F7";
export const GREEN = "#34D399";
export const AMBER = "#FBBF24";
export const RED = "#F87171";
export const BLUE = "#60A5FA";

export const GRADIENT = `linear-gradient(135deg, ${PINK}, ${VIOLET})`;

export const STATUS_MAP: Record<OrderStatus, { label: string; color: string }> =
  {
    deposit: { label: "Đặt cọc", color: AMBER },
    paid: { label: "Đã thanh toán", color: GREEN },
    pending: { label: "Chưa cọc", color: RED },
  };

export function Badge({
  status,
  depositPercent,
}: {
  status: OrderStatus;
  depositPercent?: number;
}) {
  const s = STATUS_MAP[status];
  const label =
    status === "deposit" && depositPercent
      ? `${s.label} (${depositPercent}%)`
      : s.label;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap"
      style={{
        color: s.color,
        background: `${s.color}20`,
        border: `1px solid ${s.color}30`,
      }}
    >
      {status === "paid" && <CheckCircle2 size={9} />}
      {status === "pending" && <Clock size={9} />}
      {status === "deposit" && <AlertTriangle size={9} />}
      {label}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  color,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 border border-white/[0.06] bg-card group hover:border-white/10 transition-all duration-300">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 0% 0%, ${color}08 0%, transparent 60%)`,
        }}
      />
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className="flex items-center gap-0.5 text-[11px] font-medium"
            style={{ color: trend.startsWith("-") ? RED : GREEN }}
          >
            <ArrowUpRight
              size={12}
              style={
                trend.startsWith("-") ? { transform: "rotate(90deg)" } : {}
              }
            />
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold text-foreground mb-0.5">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sub && (
        <p className="text-[11px] mt-1" style={{ color }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  width = 560,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="bg-[#120E1A] border border-white/[0.08] rounded-2xl shadow-2xl max-h-[88vh] overflow-y-auto"
        style={{ width }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-white/[0.06] sticky top-0 bg-[#120E1A] z-10">
          <div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputCls =
  "w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-white/20 transition-colors";

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-white"
      style={{ background: GRADIENT }}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all"
    >
      {children}
    </button>
  );
}

export function NumberInput({
  value,
  onChange,
  placeholder,
  className = inputCls,
  min = 0,
}: {
  value?: number;
  onChange: (v: number) => void;
  placeholder?: string;
  className?: string;
  min?: number;
}) {
  const [input, setInput] = useState(value?.toString() ?? "");
  useEffect(() => {
    setInput(value?.toString() ?? "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= min) {
      onChange(num);
    } else if (val === "") {
      onChange(0);
    }
  };

  return (
    <input
      type="number"
      min={min}
      className={className}
      placeholder={placeholder}
      value={input}
      onChange={handleChange}
    />
  );
}
