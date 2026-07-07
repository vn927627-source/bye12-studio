// src/lib/utils.ts
import type { Order, Product, OrderItem } from "./types";

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

export function totalStock(p: Product): number {
  return p.sizes.reduce((s, sz) => s + sz.qty, 0);
}

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
    [...o.maleItems, ...o.femaleItems].some((it) => it.productId === productId),
  ).length;
}

export function computeOrderTotal(
  maleItems: { productId: string; qty: number }[],
  femaleItems: { productId: string; qty: number }[],
  products: Product[],
): number {
  const priceOf = (id: string) => products.find((p) => p.id === id)?.price ?? 0;
  const maleTotal = maleItems.reduce(
    (s, it) => s + priceOf(it.productId) * it.qty,
    0,
  );
  const femaleTotal = femaleItems.reduce(
    (s, it) => s + priceOf(it.productId) * it.qty,
    0,
  );
  return maleTotal + femaleTotal;
}

export function paidAmount(
  total: number,
  status: string,
  depositPercent: number,
): number {
  if (status === "paid") return total;
  if (status === "deposit") return Math.round((total * depositPercent) / 100);
  return 0;
}

export function debtAmount(
  total: number,
  status: string,
  depositPercent: number,
): number {
  return total - paidAmount(total, status, depositPercent);
}

export const MONTH_LABELS = [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
];

// Tính size dựa trên chiều cao và cân nặng
export function calculateSize(height: number, weight: number): string {
  if (height <= 0 || weight <= 0) return "";
  const bmi = weight / (height / 100) ** 2;
  if (height < 155) {
    if (bmi < 18.5) return "XS";
    if (bmi < 23) return "S";
    if (bmi < 27) return "M";
    if (bmi < 32) return "L";
    return "XL";
  } else if (height < 165) {
    if (bmi < 18.5) return "S";
    if (bmi < 23) return "M";
    if (bmi < 27) return "L";
    if (bmi < 32) return "XL";
    return "XXL";
  } else if (height < 175) {
    if (bmi < 18.5) return "M";
    if (bmi < 23) return "L";
    if (bmi < 27) return "XL";
    if (bmi < 32) return "XXL";
    return "3XL";
  } else {
    if (bmi < 18.5) return "L";
    if (bmi < 23) return "XL";
    if (bmi < 27) return "XXL";
    if (bmi < 32) return "3XL";
    return "4XL";
  }
}

export function computeOrderTotalWithOverride(
  maleItems: OrderItem[],
  femaleItems: OrderItem[],
  products: Product[],
  extraFee: number = 0,
): number {
  const priceOf = (item: OrderItem) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return 0;
    return (item.priceOverride ?? product.price) * item.qty;
  };
  const maleTotal = maleItems.reduce((s, it) => s + priceOf(it), 0);
  const femaleTotal = femaleItems.reduce((s, it) => s + priceOf(it), 0);
  return maleTotal + femaleTotal + extraFee;
}
