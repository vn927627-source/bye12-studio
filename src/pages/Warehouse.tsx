import { useState } from "react";
import { Plus, Search, Shirt, Edit2, Trash2, Tag } from "lucide-react";
import { useStore } from "../lib/store";
import {
  availableStock,
  fmtMoney,
  timesRented,
  totalStock,
} from "../lib/utils";
import { AMBER, GREEN, PINK, NumberInput } from "../components/common";
import { ProductModal } from "../components/modals/ProductModal";
import type { Gender, Product } from "../lib/types";

export function Warehouse() {
  const { data, deleteProduct } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Gender>("all");
  const [editing, setEditing] = useState<Product | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  const filtered = data.products.filter((p) => {
    if (filter !== "all" && p.category !== filter) return false;
    return p.name.toLowerCase().includes(query.toLowerCase());
  });

  const lowStockCount = data.products.filter(
    (p) => availableStock(p, data.orders) <= data.settings.lowStockThreshold,
  ).length;

  return (
    <div className="p-7 h-full overflow-y-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Kho đồ</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data.products.length} mặt hàng · {lowStockCount} sắp hết hàng
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
          <Plus size={14} /> Thêm sản phẩm
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
            placeholder="Tìm kiếm sản phẩm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 bg-card border border-white/[0.06] rounded-xl p-1">
          {(
            [
              { id: "all", label: "Tất cả" },
              { id: "nam", label: "Nam" },
              { id: "nu", label: "Nữ" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={
                filter === f.id
                  ? {
                      background: `linear-gradient(135deg, ${PINK}, #A855F7)`,
                      color: "#fff",
                    }
                  : { color: "#7A6F8A" }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-white/[0.06] rounded-2xl px-6 py-14 text-center text-sm text-muted-foreground">
          {data.products.length === 0
            ? 'Kho đồ đang trống. Bấm "Thêm sản phẩm" để bắt đầu nhập đồ.'
            : "Không tìm thấy sản phẩm phù hợp."}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {filtered.map((p) => {
            const total = totalStock(p);
            const left = availableStock(p, data.orders);
            const low = left <= data.settings.lowStockThreshold;
            return (
              <div
                key={p.id}
                className="bg-card border border-white/[0.06] rounded-2xl overflow-hidden group relative"
              >
                <div className="h-40 bg-white/[0.03] flex items-center justify-center relative">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Shirt size={36} className="text-muted-foreground/40" />
                  )}
                  <span
                    className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={
                      low
                        ? {
                            color: AMBER,
                            background: `${AMBER}20`,
                            border: `1px solid ${AMBER}30`,
                          }
                        : {
                            color: GREEN,
                            background: `${GREEN}20`,
                            border: `1px solid ${GREEN}30`,
                          }
                    }
                  >
                    {low ? `Sắp hết (${left})` : `Còn hàng (${left})`}
                  </span>
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] bg-black/40 text-muted-foreground">
                    {p.category === "nam" ? "Nam" : "Nữ"}
                  </span>
                  <div className="absolute bottom-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setShowModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-black/50 text-white/80 hover:text-white"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="p-1.5 rounded-lg bg-black/50 text-white/80 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-foreground">
                    {p.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {p.desc || "Chưa có mô tả"}
                  </p>
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                      <span>Tồn kho</span>
                      <span style={low ? { color: AMBER } : {}}>
                        {left}/{total}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${total ? Math.max(0, Math.min(100, (left / total) * 100)) : 0}%`,
                          background: low ? AMBER : GREEN,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span
                      className="text-base font-semibold"
                      style={{ color: PINK }}
                    >
                      {fmtMoney(p.price)}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Tag size={11} /> {timesRented(p.id, data.orders)} lần
                      thuê
                    </span>
                  </div>
                  {p.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {p.sizes.map((s) => (
                        <span
                          key={s.size}
                          className="px-1.5 py-0.5 rounded-md bg-white/[0.05] text-[10px] text-muted-foreground"
                        >
                          {s.size}: {s.qty}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ProductModal product={editing} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
