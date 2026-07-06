import type { Order, Product } from "./types";

export function fmtMoney(n: number): string {
  return Math.round(n).toLocaleString("vi-VN") + "đ";
}

export function fmtMoneyShort(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return (Number.isInteger(v) ? v : v.toFixed(1)) + "M";
  }
  if (n >= 1_000) return Math.round(n / 1000) + "k";
  return String(Math.round(n));
}

export function randomId(prefix = ""): string {
  return prefix + Math.random().toString(36).slice(2, 10);
}

export function nextOrderCode(orders: Order[]): string {
  const nums = orders
    .map((o) => parseInt(o.id.replace("#", ""), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return "#" + String(max + 1).padStart(3, "0");
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Total physical stock owned for a product across all sizes. */
export function totalStock(p: Product): number {
  return p.sizes.reduce((s, sz) => s + sz.qty, 0);
}

/**
 * Units of a product currently out on rent: sum of qty across all
 * orders that reference this product and have not yet been returned.
 */
export function rentedUnits(productId: string, orders: Order[]): number {
  let count = 0;
  for (const o of orders) {
    if (o.returned) continue;
    for (const it of [...o.maleItems, ...o.femaleItems]) {
      if (it.productId === productId) count += it.qty;
    }
  }
  return count;
}

export function availableStock(p: Product, orders: Order[]): number {
  return totalStock(p) - rentedUnits(p.id, orders);
}

export function timesRented(productId: string, orders: Order[]): number {
  return orders.filter((o) =>
    [...o.maleItems, ...o.femaleItems].some((it) => it.productId === productId)
  ).length;
}

/** Auto-computed order total: (sum of male-item prices * maleCount) + (sum of female-item prices * femaleCount) */
export function computeOrderTotal(
  maleItems: { productId: string; qty: number }[],
  femaleItems: { productId: string; qty: number }[],
  products: Product[]
): number {
  const priceOf = (id: string) => products.find((p) => p.id === id)?.price ?? 0;
  const maleTotal = maleItems.reduce((s, it) => s + priceOf(it.productId) * it.qty, 0);
  const femaleTotal = femaleItems.reduce((s, it) => s + priceOf(it.productId) * it.qty, 0);
  return maleTotal + femaleTotal;
}

export function paidAmount(total: number, status: string, depositPercent: number): number {
  if (status === "paid") return total;
  if (status === "deposit") return Math.round((total * depositPercent) / 100);
  return 0;
}

export function debtAmount(total: number, status: string, depositPercent: number): number {
  return total - paidAmount(total, status, depositPercent);
}

export const MONTH_LABELS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
