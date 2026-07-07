// src/components/modals/OrderModal.tsx
import React, { useMemo, useState } from "react";
import { useStore } from "../../lib/store";
import type { Order, OrderItem, OrderStatus } from "../../lib/types";
import {
  availableStock,
  computeOrderTotalWithOverride,
  fmtMoney,
  todayISO,
} from "../../lib/utils";
import {
  Field,
  GhostButton,
  Modal,
  PrimaryButton,
  inputCls,
  PINK,
  AMBER,
  GREEN,
  RED,
  NumberInput,
} from "../common";

export function OrderModal({
  order,
  onClose,
}: {
  order?: Order;
  onClose: () => void;
}) {
  const { data, addOrder, updateOrder, addCustomer } = useStore();
  const isEdit = !!order;

  const [customerId, setCustomerId] = useState(order?.customerId ?? "");
  const [newClassName, setNewClassName] = useState("");
  const [creatingClass, setCreatingClass] = useState(
    data.customers.length === 0,
  );
  const [maleCount, setMaleCount] = useState(order?.maleCount ?? 0);
  const [femaleCount, setFemaleCount] = useState(order?.femaleCount ?? 0);
  const [maleItems, setMaleItems] = useState<OrderItem[]>(
    order?.maleItems ?? [],
  );
  const [femaleItems, setFemaleItems] = useState<OrderItem[]>(
    order?.femaleItems ?? [],
  );
  const [rentDate, setRentDate] = useState(order?.rentDate ?? todayISO());
  const [returnDate, setReturnDate] = useState(order?.returnDate ?? "");
  const [status, setStatus] = useState<OrderStatus>(order?.status ?? "pending");
  const [depositPercent, setDepositPercent] = useState(
    order?.depositPercent ?? data.settings.defaultDepositPercent,
  );
  const [note, setNote] = useState(order?.note ?? "");
  const [extraFee, setExtraFee] = useState(order?.extraFee ?? 0);

  const maleProducts = data.products.filter((p) => p.category === "nam");
  const femaleProducts = data.products.filter((p) => p.category === "nu");

  const total = useMemo(
    () =>
      computeOrderTotalWithOverride(
        maleItems,
        femaleItems,
        data.products,
        extraFee,
      ),
    [maleItems, femaleItems, data.products, extraFee],
  );

  function toggleProduct(
    items: OrderItem[],
    setItems: (v: OrderItem[]) => void,
    productId: string,
  ) {
    const exists = items.find((it) => it.productId === productId);
    if (exists) {
      setItems(items.filter((it) => it.productId !== productId));
    } else {
      setItems([...items, { productId, qty: 0, priceOverride: undefined }]);
    }
  }

  function updateQty(
    items: OrderItem[],
    setItems: (v: OrderItem[]) => void,
    productId: string,
    qty: number,
  ) {
    setItems(
      items.map((it) =>
        it.productId === productId ? { ...it, qty: Math.max(0, qty) } : it,
      ),
    );
  }

  function updatePriceOverride(
    items: OrderItem[],
    setItems: (v: OrderItem[]) => void,
    productId: string,
    val: number | undefined,
  ) {
    setItems(
      items.map((it) =>
        it.productId === productId ? { ...it, priceOverride: val } : it,
      ),
    );
  }

  function stockLeft(productId: string) {
    const p = data.products.find((x) => x.id === productId)!;
    const left = availableStock(
      p,
      data.orders.filter((o) => o.id !== order?.id),
    );
    return left;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let finalCustomerId = customerId;
    if (creatingClass) {
      if (!newClassName.trim()) return;
      const c = addCustomer({
        className: newClassName.trim(),
        phone: "",
        note: "",
        teacherName: "",
        school: "",
        studentCount: 0,
      });
      finalCustomerId = c.id;
    }
    if (!finalCustomerId) return;

    const payload = {
      customerId: finalCustomerId,
      maleCount,
      femaleCount,
      maleItems: maleItems.map((it) => ({ ...it, qty: maleCount })),
      femaleItems: femaleItems.map((it) => ({ ...it, qty: femaleCount })),
      rentDate,
      returnDate: returnDate || undefined,
      depositPercent,
      status,
      returned: order?.returned ?? false,
      note,
      extraFee,
    };

    if (isEdit && order) {
      updateOrder(order.id, payload);
    } else {
      addOrder(payload);
    }
    onClose();
  }

  return (
    <Modal
      title={isEdit ? `Sửa đơn ${order!.id}` : "Tạo đơn thuê mới"}
      subtitle="Mã đơn sẽ được tạo tự động"
      onClose={onClose}
      width={720}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Lớp thuê đồ">
          {creatingClass ? (
            <div className="flex gap-2">
              <input
                autoFocus
                className={inputCls}
                placeholder="Nhập tên lớp, ví dụ 12A1"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
              />
              {data.customers.length > 0 && (
                <GhostButton onClick={() => setCreatingClass(false)}>
                  Chọn có sẵn
                </GhostButton>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <select
                className={inputCls}
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">— Chọn lớp —</option>
                {data.customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.className}
                  </option>
                ))}
              </select>
              <GhostButton onClick={() => setCreatingClass(true)}>
                + Lớp mới
              </GhostButton>
            </div>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Số lượng nam">
            <NumberInput value={maleCount} onChange={setMaleCount} min={0} />
          </Field>
          <Field label="Số lượng nữ">
            <NumberInput
              value={femaleCount}
              onChange={setFemaleCount}
              min={0}
            />
          </Field>
        </div>

        {/* Đồ nam */}
        <Field label={`Đồ nam thuê (áp dụng cho ${maleCount} bạn nam)`}>
          {maleProducts.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Chưa có đồ nam trong kho. Vào Kho đồ để thêm.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {maleProducts.map((p) => {
                const left = stockLeft(p.id);
                const item = maleItems.find((it) => it.productId === p.id);
                const selected = !!item;
                const insufficient =
                  maleCount > 0 && left < maleCount && !selected;
                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      selected
                        ? "border-white/25 bg-white/[0.06]"
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    } ${insufficient ? "opacity-50" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        toggleProduct(maleItems, setMaleItems, p.id)
                      }
                      disabled={insufficient}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-foreground font-medium">
                        {p.name}
                      </span>
                      <span className="block text-muted-foreground">
                        {fmtMoney(p.price)} · còn {left}
                      </span>
                    </span>
                    {selected && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-muted-foreground text-[10px]">
                          Giá thủ công:
                        </span>
                        <NumberInput
                          value={item.priceOverride}
                          onChange={(v) =>
                            updatePriceOverride(
                              maleItems,
                              setMaleItems,
                              p.id,
                              v,
                            )
                          }
                          className="w-20 px-1 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-xs"
                          placeholder="Giá"
                        />
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </Field>

        {/* Đồ nữ */}
        <Field label={`Đồ nữ thuê (áp dụng cho ${femaleCount} bạn nữ)`}>
          {femaleProducts.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Chưa có đồ nữ trong kho. Vào Kho đồ để thêm.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {femaleProducts.map((p) => {
                const left = stockLeft(p.id);
                const item = femaleItems.find((it) => it.productId === p.id);
                const selected = !!item;
                const insufficient =
                  femaleCount > 0 && left < femaleCount && !selected;
                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      selected
                        ? "border-white/25 bg-white/[0.06]"
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    } ${insufficient ? "opacity-50" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        toggleProduct(femaleItems, setFemaleItems, p.id)
                      }
                      disabled={insufficient}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-foreground font-medium">
                        {p.name}
                      </span>
                      <span className="block text-muted-foreground">
                        {fmtMoney(p.price)} · còn {left}
                      </span>
                    </span>
                    {selected && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-muted-foreground text-[10px]">
                          Giá thủ công:
                        </span>
                        <NumberInput
                          value={item.priceOverride}
                          onChange={(v) =>
                            updatePriceOverride(
                              femaleItems,
                              setFemaleItems,
                              p.id,
                              v,
                            )
                          }
                          className="w-20 px-1 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-xs"
                          placeholder="Giá"
                        />
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Ngày thuê">
            <input
              type="date"
              className={inputCls}
              value={rentDate}
              onChange={(e) => setRentDate(e.target.value)}
            />
          </Field>
          <Field label="Ngày trả (tùy chọn)">
            <input
              type="date"
              className={inputCls}
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Tiền phát sinh">
          <NumberInput
            value={extraFee}
            onChange={setExtraFee}
            placeholder="0"
          />
        </Field>

        <Field label="Trạng thái thanh toán">
          <div className="flex gap-2">
            {(
              [
                { id: "pending", label: "Chưa cọc", color: RED },
                { id: "deposit", label: "Đặt cọc", color: AMBER },
                { id: "paid", label: "Đã thanh toán", color: GREEN },
              ] as const
            ).map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => setStatus(s.id)}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-medium border transition-colors"
                style={
                  status === s.id
                    ? {
                        color: s.color,
                        background: `${s.color}18`,
                        borderColor: `${s.color}40`,
                      }
                    : {
                        color: "#7A6F8A",
                        borderColor: "rgba(255,255,255,0.06)",
                      }
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        {status === "deposit" && (
          <Field label={`% đặt cọc (${depositPercent}%)`}>
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={depositPercent}
              onChange={(e) => setDepositPercent(+e.target.value)}
              className="w-full"
            />
          </Field>
        )}

        <Field label="Ghi chú">
          <textarea
            className={inputCls}
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú thêm cho đơn..."
          />
        </Field>

        <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03]">
          <span className="text-sm text-muted-foreground">
            Tổng tiền (tự động)
          </span>
          <span className="text-lg font-semibold" style={{ color: PINK }}>
            {fmtMoney(total)}
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <GhostButton onClick={onClose}>Hủy</GhostButton>
          <PrimaryButton type="submit">
            {isEdit ? "Lưu thay đổi" : "Tạo đơn thuê"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
