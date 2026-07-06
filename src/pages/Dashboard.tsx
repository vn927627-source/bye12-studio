import { useState } from "react";
import { Users, FileText, TrendingUp, Package, Plus, AlertTriangle, BarChart3, Sparkles, Shirt } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useStore } from "../lib/store";
import { dashboardStats, revenueByMonth, orderTotal } from "../lib/selectors";
import { fmtMoney, fmtMoneyShort } from "../lib/utils";
import { Badge, GREEN, PINK, StatCard, VIOLET, AMBER } from "../components/common";
import { OrderModal } from "../components/modals/OrderModal";
import type { Screen } from "../app/App";

export function Dashboard({ onNav }: { onNav: (s: Screen) => void }) {
  const { data } = useStore();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const stats = dashboardStats(data);
  const chartData = revenueByMonth(data);
  const now = new Date();

  return (
    <div className="p-7 space-y-7 overflow-y-auto h-full">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
            Tháng {now.getMonth() + 1} · {now.getFullYear()}
          </p>
          <h1 className="text-2xl font-semibold text-foreground">Xin chào, {data.settings.shopName} 👋</h1>
        </div>
        <button
          onClick={() => setShowOrderModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110"
          style={{ background: `linear-gradient(135deg, ${PINK}, ${VIOLET})` }}
        >
          <Plus size={14} />
          Tạo đơn mới
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Khách hàng"
          value={String(stats.totalCustomers)}
          icon={<Users size={18} />}
          color={PINK}
          sub={stats.newCustomersThisMonth > 0 ? `${stats.newCustomersThisMonth} lớp mới tháng này` : "Chưa có lớp mới tháng này"}
        />
        <StatCard
          label="Đơn thuê"
          value={String(stats.totalOrders)}
          icon={<FileText size={18} />}
          color={VIOLET}
          sub={`${stats.pendingOrders} đơn chờ xử lý`}
        />
        <StatCard
          label="Doanh thu tháng"
          value={fmtMoneyShort(stats.monthRevenue)}
          icon={<TrendingUp size={18} />}
          color={GREEN}
          sub={stats.monthDebt > 0 ? `${fmtMoneyShort(stats.monthDebt)} còn nợ` : "Đã thu đủ"}
        />
        <StatCard
          label="Sản phẩm"
          value={String(stats.totalProducts)}
          icon={<Package size={18} />}
          color={AMBER}
          sub={stats.lowStockProducts.length > 0 ? `${stats.lowStockProducts.length} mặt hàng sắp hết` : "Kho ổn định"}
        />
      </div>

      {stats.lowStockProducts.length > 0 && (
        <button
          onClick={() => onNav("warehouse")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left"
          style={{ background: `${AMBER}10`, borderColor: `${AMBER}30`, color: AMBER }}
        >
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span className="flex-1">
            <strong>Cảnh báo kho:</strong> {stats.lowStockProducts.map((p) => p.name).join(", ")} — tồn kho thấp, cần nhập thêm.
          </span>
          <span className="underline flex-shrink-0">Xem kho →</span>
        </button>
      )}

      <div className="grid grid-cols-[1fr_320px] gap-5">
        <div className="bg-card border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <BarChart3 size={15} style={{ color: PINK }} />
              Doanh thu {chartData.filter((c) => c.revenue > 0).length || 7} tháng
            </div>
            <span className="text-xs text-muted-foreground">đơn vị: {data.settings.currency}</span>
          </div>
          {data.orders.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
              Chưa có dữ liệu đơn thuê. Tạo đơn đầu tiên để xem biểu đồ doanh thu.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PINK} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={PINK} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#7A6F8A", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: "#7A6F8A", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => fmtMoneyShort(v)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-[#1A1424] border border-white/10 rounded-xl px-4 py-3 text-xs">
                        <p className="text-foreground font-medium mb-1">{label}</p>
                        <p style={{ color: PINK }}>Doanh thu: {fmtMoney(payload[0].value as number)}</p>
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke={PINK} strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-4">
            <Sparkles size={14} style={{ color: VIOLET }} />
            Top sản phẩm
          </div>
          {stats.topProducts.length === 0 ? (
            <p className="text-xs text-muted-foreground">Chưa có sản phẩm nào được thuê.</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((tp, i) => (
                <div key={tp.product.id} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-3">{i + 1}</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${PINK}15`, color: PINK }}>
                    <Shirt size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground truncate">{tp.product.name}</p>
                    <p className="text-[11px] text-muted-foreground">{tp.count} lần thuê</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
          <h3 className="text-sm font-medium text-foreground">Đơn thuê gần đây</h3>
          <button onClick={() => onNav("orders")} className="text-xs hover:underline" style={{ color: PINK }}>
            Xem tất cả →
          </button>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground text-center">Chưa có đơn thuê nào. Bấm "Tạo đơn mới" để bắt đầu.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground/70">
                <th className="text-left font-medium px-6 py-3">Mã đơn</th>
                <th className="text-left font-medium px-6 py-3">Lớp</th>
                <th className="text-left font-medium px-6 py-3">Ngày thuê</th>
                <th className="text-left font-medium px-6 py-3">Tổng tiền</th>
                <th className="text-left font-medium px-6 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o) => {
                const cust = data.customers.find((c) => c.id === o.customerId);
                return (
                  <tr key={o.id} className="border-t border-white/[0.04]">
                    <td className="px-6 py-3 text-muted-foreground">{o.id}</td>
                    <td className="px-6 py-3 text-foreground font-medium">{cust?.className ?? "—"}</td>
                    <td className="px-6 py-3 text-muted-foreground">{o.rentDate}</td>
                    <td className="px-6 py-3 text-foreground font-medium">{fmtMoney(orderTotal(o, data.products))}</td>
                    <td className="px-6 py-3"><Badge status={o.status} depositPercent={o.depositPercent} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showOrderModal && <OrderModal onClose={() => setShowOrderModal(false)} />}
    </div>
  );
}
