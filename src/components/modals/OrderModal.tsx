import React, { useMemo, useState } from "react";
import { useStore } from "../../lib/store";
import type { Order, OrderItem, OrderStatus } from "../../lib/types";
import { availableStock, computeOrderTotal, fmtMoney, todayISO } from "../../lib/utils";
import { Field, GhostButton, Modal, PrimaryButton, inputCls, PINK, AMBER, GREEN, RED } from "../common";

export function OrderModal({ order, onClose }: { order?: Order; onClose: () => void }) {
  const { data, addOrder, updateOrder, addCustomer } = useStore();
  const isEdit = !!order;

  const [customerId, setCustomerId] = useState(order?.customerId ?? "");
  const [newClassName, setNewClassName] = useState("");
  const [creatingClass, setCreatingClass] = useState(data.customers.length === 0);
  const [maleCount, setMaleCount] = useState(order?.maleCount ?? 0);
  const [femaleCount, setFemaleCount] = useState(order?.femaleCount ?? 0);
  const [maleIds, setMaleIds] = useState<string[]>(order?.maleItems.map((i) => i.productId) ?? []);
  const [femaleIds, setFemaleIds] = useState<string[]>(order?.femaleItems.map((i) => i.productId) ?? []);
  const [rentDate, setRentDate] = useState(order?.rentDate ?? todayISO());
  const [returnDate, setReturnDate] = useState(order?.returnDate ?? "");
  const [status, setStatus] = useState<OrderStatus>(order?.status ?? "pending");
  const [depositPercent, setDepositPercent] = useState(order?.depositPercent ?? data.settings.defaultDepositPercent);
  const [note, setNote] = useState(order?.note ?? "");

  const maleProducts = data.products.filter((p) => p.category === "nam");
  const femaleProducts = data.products.filter((p) => p.category === "nu");

  const maleItems: OrderItem[] = maleIds.map((id) => ({ productId: id, qty: maleCount }));
  const femaleItems: OrderItem[] = femaleIds.map((id) => ({ productId: id, qty: femaleCount }));
  const total = useMemo(() => computeOrderTotal(maleItems, femaleItems, data.products), [maleIds, femaleIds, maleCount, femaleCount, data.products]);

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function stockLeft(productId: string) {
    const p = data.products.find((x) => x.id === productId)!;
    const left = availableStock(p, data.orders.filter((o) => o.id !== order?.id));
    return left;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let finalCustomerId = customerId;
    if (creatingClass) {
      if (!newClassName.trim()) return;
      const c = addCustomer({ className: newClassName.trim(), phone: "", note: "", studentCount: maleCount + femaleCount });
      finalCustomerId = c.id;
    }
    if (!finalCustomerId) return;

    const payload = {
      customerId: finalCustomerId,
      maleCount,
      femaleCount,
      maleItems,
      femaleItems,
      rentDate,
      returnDate: returnDate || undefined,
      depositPercent,
      status,
      returned: order?.returned ?? false,
      note,
    };

    if (isEdit && order) {
      updateOrder(order.id, payload);
    } else {
      addOrder(payload);
    }
    onClose();
  }

  return (
    <Modal title={isEdit ? `Sửa đơn ${order!.id}` : "Tạo đơn thuê mới"} subtitle="Mã đơn sẽ được tạo tự động" onClose={onClose} width={640}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Lớp thuê đồ">
          {creatingClass ? (
            <div className="flex gap-2">
              <input autoFocus className={inputCls} placeholder="Nhập tên lớp, ví dụ 12A1" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} />
              {data.customers.length > 0 && (
                <GhostButton onClick={() => setCreatingClass(false)}>Chọn có sẵn</GhostButton>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <select className={inputCls} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">— Chọn lớp —</option>
                {data.customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.className}</option>
                ))}
              </select>
              <GhostButton onClick={() => setCreatingClass(true)}>+ Lớp mới</GhostButton>
            </div>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Số lượng nam">
            <input type="number" min={0} className={inputCls} value={maleCount} onChange={(e) => setMaleCount(Math.max(0, +e.target.value))} />
          </Field>
          <Field label="Số lượng nữ">
            <input type="number" min={0} className={inputCls} value={femaleCount} onChange={(e) => setFemaleCount(Math.max(0, +e.target.value))} />
          </Field>
        </div>

        <Field label={`Đồ nam thuê (áp dụng cho ${maleCount} bạn nam)`}>
          {maleProducts.length === 0 ? (
            <p className="text-xs text-muted-foreground">Chưa có đồ nam trong kho. Vào Kho đồ để thêm.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {maleProducts.map((p) => {
                const left = stockLeft(p.id);
                const selected = maleIds.includes(p.id);
                const insufficient = maleCount > 0 && left < maleCount && !selected;
                return (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      selected ? "border-white/25 bg-white/[0.06]" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    } ${insufficient ? "opacity-50" : ""}`}
                  >
                    <span className="flex items-center gap-2">
                      <input type="checkbox" checked={selected} onChange={() => toggle(maleIds, setMaleIds, p.id)} />
                      <span>
                        <span className="block text-foreground font-medium">{p.name}</span>
                        <span className="block text-muted-foreground">{fmtMoney(p.price)} · còn {left}</span>
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </Field>

        <Field label={`Đồ nữ thuê (áp dụng cho ${femaleCount} bạn nữ)`}>
          {femaleProducts.length === 0 ? (
            <p className="text-xs text-muted-foreground">Chưa có đồ nữ trong kho. Vào Kho đồ để thêm.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {femaleProducts.map((p) => {
                const left = stockLeft(p.id);
                const selected = femaleIds.includes(p.id);
                const insufficient = femaleCount > 0 && left < femaleCount && !selected;
                return (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      selected ? "border-white/25 bg-white/[0.06]" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    } ${insufficient ? "opacity-50" : ""}`}
                  >
                    <span className="flex items-center gap-2">
                      <input type="checkbox" checked={selected} onChange={() => toggle(femaleIds, setFemaleIds, p.id)} />
                      <span>
                        <span className="block text-foreground font-medium">{p.name}</span>
                        <span className="block text-muted-foreground">{fmtMoney(p.price)} · còn {left}</span>
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Ngày thuê">
            <input type="date" className={inputCls} value={rentDate} onChange={(e) => setRentDate(e.target.value)} />
          </Field>
          <Field label="Ngày trả (tùy chọn)">
            <input type="date" className={inputCls} value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
          </Field>
        </div>

        <Field label="Trạng thái thanh toán">
          <div className="flex gap-2">
            {([
              { id: "pending", label: "Chưa cọc", color: RED },
              { id: "deposit", label: "Đặt cọc", color: AMBER },
              { id: "paid", label: "Đã thanh toán", color: GREEN },
            ] as const).map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => setStatus(s.id)}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-medium border transition-colors"
                style={
                  status === s.id
                    ? { color: s.color, background: `${s.color}18`, borderColor: `${s.color}40` }
                    : { color: "#7A6F8A", borderColor: "rgba(255,255,255,0.06)" }
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        {status === "deposit" && (
          <Field label={`% đặt cọc (${depositPercent}%)`}>
            <input type="range" min={10} max={90} step={5} value={depositPercent} onChange={(e) => setDepositPercent(+e.target.value)} className="w-full" />
          </Field>
        )}

        <Field label="Ghi chú">
          <textarea className={inputCls} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú thêm cho đơn..." />
        </Field>

        <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03]">
          <span className="text-sm text-muted-foreground">Tổng tiền (tự động)</span>
          <span className="text-lg font-semibold" style={{ color: PINK }}>{fmtMoney(total)}</span>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <GhostButton onClick={onClose}>Hủy</GhostButton>
          <PrimaryButton type="submit">{isEdit ? "Lưu thay đổi" : "Tạo đơn thuê"}</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
