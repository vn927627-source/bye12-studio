import type { AppData, Order, Product } from "./types";
import { availableStock, computeOrderTotal, debtAmount, paidAmount, timesRented, totalStock, MONTH_LABELS } from "./utils";

export function orderTotal(o: Order, products: Product[]): number {
  return computeOrderTotal(o.maleItems, o.femaleItems, products);
}

export function orderPaid(o: Order, products: Product[]): number {
  return paidAmount(orderTotal(o, products), o.status, o.depositPercent);
}

export function orderDebt(o: Order, products: Product[]): number {
  return debtAmount(orderTotal(o, products), o.status, o.depositPercent);
}

export function monthKey(dateISO: string): string {
  return dateISO.slice(0, 7); // yyyy-mm
}

/** Revenue grouped by calendar month for the current year, T1..T12. */
export function revenueByMonth(data: AppData, year = new Date().getFullYear()) {
  const totals = Array(12).fill(0);
  const counts = Array(12).fill(0);
  for (const o of data.orders) {
    const d = new Date(o.rentDate);
    if (d.getFullYear() !== year) continue;
    const idx = d.getMonth();
    totals[idx] += orderTotal(o, data.products);
    counts[idx] += 1;
  }
  return MONTH_LABELS.map((label, i) => ({ month: label, revenue: totals[i], orders: counts[i] }));
}

export function dashboardStats(data: AppData) {
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const totalCustomers = data.customers.length;
  const newCustomersThisMonth = data.customers.filter(
    (c) => new Date(c.createdAt).toISOString().slice(0, 7) === thisMonthKey
  ).length;

  const totalOrders = data.orders.length;
  const pendingOrders = data.orders.filter((o) => o.status !== "paid").length;

  const monthOrders = data.orders.filter((o) => monthKey(o.rentDate) === thisMonthKey);
  const monthRevenue = monthOrders.reduce((s, o) => s + orderTotal(o, data.products), 0);
  const monthDebt = monthOrders.reduce((s, o) => s + orderDebt(o, data.products), 0);

  const totalProducts = totalStock2(data.products);
  const lowStockProducts = data.products.filter(
    (p) => availableStock(p, data.orders) <= data.settings.lowStockThreshold
  );

  const topProducts = [...data.products]
    .map((p) => ({ product: p, count: timesRented(p.id, data.orders) }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const recentOrders = [...data.orders]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  return {
    totalCustomers,
    newCustomersThisMonth,
    totalOrders,
    pendingOrders,
    monthRevenue,
    monthDebt,
    totalProducts,
    lowStockProducts,
    topProducts,
    recentOrders,
  };
}

function totalStock2(products: Product[]): number {
  return products.reduce((s, p) => s + totalStock(p), 0);
}

export function revenueSummary(data: AppData) {
  const totalRevenue = data.orders.reduce((s, o) => s + orderTotal(o, data.products), 0);
  const totalPaid = data.orders.reduce((s, o) => s + orderPaid(o, data.products), 0);
  const totalDebt = totalRevenue - totalPaid;
  const percentPaid = totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0;
  return { totalRevenue, totalPaid, totalDebt, percentPaid };
}

/** Percent-change trend vs previous calendar month, for a numeric metric. */
export function trendPercent(current: number, previous: number): string | undefined {
  if (previous <= 0) return undefined;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return undefined;
  return (pct > 0 ? "+" : "") + pct + "%";
}
