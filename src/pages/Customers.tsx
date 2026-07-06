import { useState } from "react";
import { Plus, Edit2, Trash2, RefreshCw, Search } from "lucide-react";
import { useStore } from "../lib/store";
import { CustomerModal } from "../components/modals/CustomerModal";
import { PINK } from "../components/common";
import type { Customer } from "../lib/types";

export function Customers() {
  const { data, deleteCustomer } = useStore();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Customer | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  const filtered = data.customers.filter((c) => c.className.toLowerCase().includes(query.toLowerCase()));

  function orderCount(customerId: string) {
    return data.orders.filter((o) => o.customerId === customerId).length;
  }

  return (
    <div className="p-7 h-full overflow-y-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Quản lý Khách hàng</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data.customers.length} lớp
            {data.settings.googleSheetLink ? " · đối chiếu Google Sheets" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data.settings.googleSheetLink && (
            <a
              href={data.settings.googleSheetLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-white/[0.08] text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw size={13} /> Mở Google Sheets
            </a>
          )}
          <button
            onClick={() => { setEditing(undefined); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110"
            style={{ background: `linear-gradient(135deg, ${PINK}, #A855F7)` }}
          >
            <Plus size={14} /> Thêm khách hàng
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-white/20"
          placeholder="Tìm kiếm theo lớp..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="bg-card border border-white/[0.06] rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="px-6 py-10 text-sm text-muted-foreground text-center">
            {data.customers.length === 0 ? 'Chưa có lớp nào. Bấm "Thêm khách hàng" để bắt đầu.' : "Không tìm thấy lớp phù hợp."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground/70">
                <th className="text-left font-medium px-6 py-3">Lớp</th>
                <th className="text-left font-medium px-6 py-3">Số điện thoại</th>
                <th className="text-left font-medium px-6 py-3">Sĩ số</th>
                <th className="text-left font-medium px-6 py-3">Đơn thuê</th>
                <th className="text-left font-medium px-6 py-3">Ghi chú</th>
                <th className="text-right font-medium px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-white/[0.04] group">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${PINK}, #A855F7)` }}
                      >
                        {c.className.slice(0, 1)}
                      </span>
                      <span className="text-foreground font-medium">{c.className}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{c.phone || "—"}</td>
                  <td className="px-6 py-3 text-muted-foreground">{c.studentCount || "—"}</td>
                  <td className="px-6 py-3 text-muted-foreground">{orderCount(c.id)} đơn</td>
                  <td className="px-6 py-3 text-muted-foreground truncate max-w-[220px]">{c.note || "—"}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditing(c); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground hover:text-foreground">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => deleteCustomer(c.id)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground hover:text-red-400">
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

      {showModal && <CustomerModal customer={editing} onClose={() => setShowModal(false)} />}
    </div>
  );
}
