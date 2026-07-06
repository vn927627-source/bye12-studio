import { CheckCircle2, Clock, AlertTriangle, Gem, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useStore } from "../lib/store";
import { orderDebt, orderPaid, orderTotal, revenueByMonth, revenueSummary } from "../lib/selectors";
import { fmtMoney, fmtMoneyShort } from "../lib/utils";
import { Badge, GREEN, AMBER, RED, StatCard, VIOLET, PINK } from "../components/common";

export function Revenue() {
  const { data } = useStore();
  const summary = revenueSummary(data);
  const chartData = revenueByMonth(data);
  const classOf = (id: string) => data.customers.find((c) => c.id === id)?.className ?? "—";

  return (
    <div className="p-7 h-full overflow-y-auto space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Doanh thu</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Theo dõi thu chi & công nợ</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Tổng doanh thu" value={fmtMoney(summary.totalRevenue)} icon={<BarChart3 size={18} />} color={PINK} />
        <StatCard label="Đã thanh toán" value={fmtMoney(summary.totalPaid)} icon={<CheckCircle2 size={18} />} color={GREEN} />
        <StatCard label="Chưa thanh toán" value={fmtMoney(summary.totalDebt)} icon={<Clock size={18} />} color={AMBER} />
        <StatCard label="Còn thiếu" value={fmtMoney(summary.totalDebt)} icon={<AlertTriangle size={18} />} color={RED} />
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-5">
        <div className="bg-card border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-5">
            <BarChart3 size={15} style={{ color: VIOLET }} />
            Đơn / tháng
          </div>
          {data.orders.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">Chưa có dữ liệu.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#7A6F8A", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#7A6F8A", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div className="bg-[#1A1424] border border-white/10 rounded-xl px-4 py-3 text-xs">
                        <p className="text-foreground font-medium mb-1">{label}</p>
                        <p style={{ color: VIOLET }}>{p.orders} đơn · {fmtMoney(p.revenue)}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="orders" fill={VIOLET} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-4">
            <Gem size={14} style={{ color: PINK }} />
            Tóm tắt thanh toán
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full" style={{ background: PINK }} />Tổng doanh thu</span>
              <span style={{ color: PINK }}>{fmtMoney(summary.totalRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />Đã thu</span>
              <span style={{ color: GREEN }}>{fmtMoney(summary.totalPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full" style={{ background: AMBER }} />Còn nợ</span>
              <span style={{ color: AMBER }}>{fmtMoney(summary.totalDebt)}</span>
            </div>
          </div>
          <div className="mt-4 h-1.5 rounded-full bg-white/[0.06] overflow-hidden flex">
            <div className="h-full" style={{ width: `${summary.percentPaid}%`, background: `linear-gradient(90deg, ${GREEN}, ${PINK})` }} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">{summary.percentPaid}% đã thanh toán</p>
        </div>
      </div>

      <div className="bg-card border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.05]">
          <h3 className="text-sm font-medium text-foreground">Chi tiết dòng tiền</h3>
        </div>
        {data.orders.length === 0 ? (
          <p className="px-6 py-10 text-sm text-muted-foreground text-center">Chưa có đơn thuê nào để tính doanh thu.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground/70">
                <th className="text-left font-medium px-6 py-3">Mã đơn</th>
                <th className="text-left font-medium px-6 py-3">Lớp</th>
                <th className="text-left font-medium px-6 py-3">Tổng tiền</th>
                <th className="text-left font-medium px-6 py-3">Đã cọc</th>
                <th className="text-left font-medium px-6 py-3">Còn nợ</th>
                <th className="text-left font-medium px-6 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((o) => (
                <tr key={o.id} className="border-t border-white/[0.04]">
                  <td className="px-6 py-3 text-muted-foreground">{o.id}</td>
                  <td className="px-6 py-3 text-foreground font-medium">{classOf(o.customerId)}</td>
                  <td className="px-6 py-3 text-foreground font-medium">{fmtMoney(orderTotal(o, data.products))}</td>
                  <td className="px-6 py-3" style={{ color: GREEN }}>{fmtMoney(orderPaid(o, data.products))}</td>
                  <td className="px-6 py-3" style={{ color: orderDebt(o, data.products) > 0 ? AMBER : "inherit" }}>
                    {fmtMoney(orderDebt(o, data.products))}
                  </td>
                  <td className="px-6 py-3"><Badge status={o.status} depositPercent={o.depositPercent} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
