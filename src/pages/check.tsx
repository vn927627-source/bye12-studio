import { useState } from "react";
import { useStore } from "../lib/store";
import { Badge, inputCls } from "../components/common";

export function Check() {
  const { data } = useStore();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [actualQuantities, setActualQuantities] = useState<
    Record<string, number>
  >({});

  const orders = data.orders.filter((o) => o.customerId === selectedCustomerId);
  const customer = data.customers.find((c) => c.id === selectedCustomerId);

  const setActual = (orderId: string, productId: string, qty: number) => {
    const key = `${orderId}-${productId}`;
    setActualQuantities((prev) => ({ ...prev, [key]: qty }));
  };

  const getActual = (orderId: string, productId: string) => {
    const key = `${orderId}-${productId}`;
    return actualQuantities[key] ?? 0;
  };

  return (
    <div className="p-7 h-full overflow-y-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Kiểm đồ</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Đối chiếu số lượng đồ thuê theo lớp
          </p>
        </div>
        <select
          className={inputCls + " w-56"}
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
        >
          <option value="">-- Chọn lớp --</option>
          {data.customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.className}
            </option>
          ))}
        </select>
      </div>

      {selectedCustomerId && customer && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Lớp {customer.className}</h2>
          {orders.length === 0 ? (
            <p className="text-muted-foreground">
              Chưa có đơn thuê nào cho lớp này.
            </p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-white/[0.06] rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Đơn {order.id}</span>
                  <Badge
                    status={order.status}
                    depositPercent={order.depositPercent}
                  />
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-muted-foreground/70">
                      <th className="text-left px-3 py-2">Sản phẩm</th>
                      <th className="text-left px-3 py-2">Số lượng yêu cầu</th>
                      <th className="text-left px-3 py-2">Số lượng thực tế</th>
                      <th className="text-left px-3 py-2">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...order.maleItems, ...order.femaleItems].map((item) => {
                      const product = data.products.find(
                        (p) => p.id === item.productId,
                      );
                      if (!product) return null;
                      const actual = getActual(order.id, item.productId);
                      const diff = actual - item.qty;
                      const status =
                        diff === 0 ? "Đủ" : diff > 0 ? "Thừa" : "Thiếu";
                      const color =
                        diff === 0
                          ? "#34D399"
                          : diff > 0
                            ? "#FBBF24"
                            : "#F87171";
                      return (
                        <tr
                          key={item.productId}
                          className="border-t border-white/[0.04]"
                        >
                          <td className="px-3 py-2">{product.name}</td>
                          <td className="px-3 py-2">{item.qty}</td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min={0}
                              className="w-20 px-2 py-1 rounded bg-white/[0.05] border border-white/[0.08] text-sm"
                              value={actual || ""}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setActual(
                                  order.id,
                                  item.productId,
                                  isNaN(val) ? 0 : val,
                                );
                              }}
                            />
                          </td>
                          <td className="px-3 py-2" style={{ color }}>
                            {status} {diff !== 0 && `(${Math.abs(diff)})`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
