import { useState } from "react";
import { Plus, Eye, Edit2, Trash2, Search } from "lucide-react";
import { useStore } from "../lib/store";
import { orderTotal } from "../lib/selectors";
import { fmtMoney } from "../lib/utils";
import { Badge, Modal, PINK } from "../components/common";
import { OrderModal } from "../components/modals/OrderModal";
import type { Order, OrderStatus } from "../lib/types";

const TABS: { id: "all" | OrderStatus; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "deposit", label: "Đặt cọc" },
  { id: "paid", label: "Đã thanh toán" },
  { id: "pending", label: "Chưa cọc" },
];

export function Orders() {
  const { data, deleteOrder } = useStore();
  const [tab, setTab] = useState<"all" | OrderStatus>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Order | undefined>(undefined);
  const [viewing, setViewing] = useState<Order | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  const classOf = (id: string) =>
    data.customers.find((c) => c.id === id)?.className ?? "—";

  const filtered = data.orders.filter((o) => {
    if (tab !== "all" && o.status !== tab) return false;
    const q = query.toLowerCase();
    return (
      !q ||
      o.id.toLowerCase().includes(q) ||
      classOf(o.customerId).toLowerCase().includes(q)
    );
  });

  const pendingCount = data.orders.filter((o) => o.status !== "paid").length;

  return (
    <div className="p-7 h-full overflow-y-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Quản lý Đơn thuê
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data.orders.length} đơn · {pendingCount} đơn chờ thanh toán đủ
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(undefined);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110"
          style={{ background: `linear-gradient(135deg, ${PINK}, #A855F7)` }}
        >
          <Plus size={14} /> Tạo đơn thuê
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-white/20"
            placeholder="Tìm kiếm mã đơn hoặc lớp..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 bg-card border border-white/[0.06] rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={
                tab === t.id
                  ? {
                      background: `linear-gradient(135deg, ${PINK}, #A855F7)`,
                      color: "#fff",
                    }
                  : { color: "#7A6F8A" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-white/[0.06] rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="px-6 py-10 text-sm text-muted-foreground text-center">
            {data.orders.length === 0
              ? 'Chưa có đơn thuê nào. Bấm "Tạo đơn thuê" để bắt đầu.'
              : "Không có đơn nào khớp bộ lọc."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground/70">
                <th className="text-left font-medium px-6 py-3">Mã đơn</th>
                <th className="text-left font-medium px-6 py-3">Lớp</th>
                <th className="text-left font-medium px-6 py-3">SL nam/nữ</th>
                <th className="text-left font-medium px-6 py-3">Tổng tiền</th>
                <th className="text-left font-medium px-6 py-3">Ngày thuê</th>
                <th className="text-left font-medium px-6 py-3">Trạng thái</th>
                <th className="text-right font-medium px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-t border-white/[0.04] group">
                  <td className="px-6 py-3 text-muted-foreground">{o.id}</td>
                  <td className="px-6 py-3 text-foreground font-medium">
                    {classOf(o.customerId)}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {o.maleCount} / {o.femaleCount}
                  </td>
                  <td className="px-6 py-3 text-foreground font-medium">
                    {fmtMoney(orderTotal(o, data.products))}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {o.rentDate}
                  </td>
                  <td className="px-6 py-3">
                    <Badge
                      status={o.status}
                      depositPercent={o.depositPercent}
                    />
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setViewing(o)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground hover:text-foreground"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(o);
                          setShowModal(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => deleteOrder(o.id)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <OrderModal order={editing} onClose={() => setShowModal(false)} />
      )}

      {viewing && (
        <Modal
          title={`Chi tiết đơn ${viewing.id}`}
          subtitle={classOf(viewing.customerId)}
          onClose={() => setViewing(undefined)}
          width={480}
        >
          <div className="space-y-3 text-sm">
            <Row label="Ngày thuê" value={viewing.rentDate} />
            <Row
              label="Ngày trả"
              value={viewing.returnDate || "Chưa xác định"}
            />
            <Row
              label="Số lượng nam / nữ"
              value={`${viewing.maleCount} / ${viewing.femaleCount}`}
            />
            <Row
              label="Đồ nam thuê"
              value={
                viewing.maleItems
                  .map(
                    (i) =>
                      data.products.find((p) => p.id === i.productId)?.name,
                  )
                  .filter(Boolean)
                  .join(", ") || "—"
              }
            />
            <Row
              label="Đồ nữ thuê"
              value={
                viewing.femaleItems
                  .map(
                    (i) =>
                      data.products.find((p) => p.id === i.productId)?.name,
                  )
                  .filter(Boolean)
                  .join(", ") || "—"
              }
            />
            <Row
              label="Tổng tiền"
              value={fmtMoney(orderTotal(viewing, data.products))}
            />
            <Row label="Ghi chú" value={viewing.note || "—"} />
          </div>
        </Modal>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-white/[0.05] last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium text-right">{value}</span>
    </div>
  );
}
