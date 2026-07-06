import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AppData, Customer, Note, Order, Product, ScheduleEvent, Settings } from "./types";
import { randomId } from "./utils";

const STORAGE_KEY = "bye12-studio-data-v1";

const EMPTY_DATA: AppData = {
  customers: [],
  products: [],
  orders: [],
  events: [],
  notes: [],
  settings: {
    shopName: "bye12",
    shopTagline: "studio · kho đồ",
    currency: "VNĐ",
    defaultDepositPercent: 50,
    googleSheetLink: "",
    lowStockThreshold: 3,
  },
};

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(EMPTY_DATA);
    const parsed = JSON.parse(raw);
    // Merge with defaults so newly-added fields don't break old saved data
    return {
      ...structuredClone(EMPTY_DATA),
      ...parsed,
      settings: { ...EMPTY_DATA.settings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return structuredClone(EMPTY_DATA);
  }
}

interface StoreContextType {
  data: AppData;
  // customers
  addCustomer: (c: Omit<Customer, "id" | "createdAt">) => Customer;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  // products
  addProduct: (p: Omit<Product, "id" | "createdAt">) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // orders
  addOrder: (o: Omit<Order, "id" | "createdAt">) => Order;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  // events
  addEvent: (e: Omit<ScheduleEvent, "id">) => ScheduleEvent;
  deleteEvent: (id: string) => void;
  // notes
  addNote: (n: Omit<Note, "id" | "createdAt" | "updatedAt">) => Note;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  // settings
  updateSettings: (patch: Partial<Settings>) => void;
  // global
  resetAll: () => void;
  exportJson: () => string;
  importJson: (json: string) => boolean;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const value = useMemo<StoreContextType>(() => ({
    data,

    addCustomer: (c) => {
      const item: Customer = { ...c, id: randomId("cus_"), createdAt: Date.now() };
      setData((d) => ({ ...d, customers: [...d.customers, item] }));
      return item;
    },
    updateCustomer: (id, patch) =>
      setData((d) => ({
        ...d,
        customers: d.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      })),
    deleteCustomer: (id) =>
      setData((d) => ({
        ...d,
        customers: d.customers.filter((c) => c.id !== id),
        orders: d.orders.filter((o) => o.customerId !== id),
      })),

    addProduct: (p) => {
      const item: Product = { ...p, id: randomId("prod_"), createdAt: Date.now() };
      setData((d) => ({ ...d, products: [...d.products, item] }));
      return item;
    },
    updateProduct: (id, patch) =>
      setData((d) => ({
        ...d,
        products: d.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      })),
    deleteProduct: (id) =>
      setData((d) => ({ ...d, products: d.products.filter((p) => p.id !== id) })),

    addOrder: (o) => {
      const item: Order = { ...o, id: randomId("_tmp_"), createdAt: Date.now() };
      setData((d) => {
        const nums = d.orders
          .map((x) => parseInt(x.id.replace("#", ""), 10))
          .filter((n) => !isNaN(n));
        const code = "#" + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0");
        const finalOrder = { ...item, id: code };
        const newEvents: ScheduleEvent[] = [
          { id: randomId("evt_"), date: finalOrder.rentDate, label: "Ngày thuê", type: "rent", orderId: code },
        ];
        if (finalOrder.returnDate) {
          newEvents.push({ id: randomId("evt_"), date: finalOrder.returnDate, label: "Ngày trả đồ", type: "return", orderId: code });
        }
        return { ...d, orders: [...d.orders, finalOrder], events: [...d.events, ...newEvents] };
      });
      return item;
    },
    updateOrder: (id, patch) =>
      setData((d) => ({
        ...d,
        orders: d.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        events: d.events.map((e) => {
          if (e.orderId !== id) return e;
          if (e.type === "rent" && patch.rentDate) return { ...e, date: patch.rentDate };
          if (e.type === "return" && patch.returnDate) return { ...e, date: patch.returnDate };
          return e;
        }),
      })),
    deleteOrder: (id) =>
      setData((d) => ({
        ...d,
        orders: d.orders.filter((o) => o.id !== id),
        events: d.events.filter((e) => e.orderId !== id),
      })),

    addEvent: (e) => {
      const item: ScheduleEvent = { ...e, id: randomId("evt_") };
      setData((d) => ({ ...d, events: [...d.events, item] }));
      return item;
    },
    deleteEvent: (id) => setData((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) })),

    addNote: (n) => {
      const item: Note = { ...n, id: randomId("note_"), createdAt: Date.now(), updatedAt: Date.now() };
      setData((d) => ({ ...d, notes: [item, ...d.notes] }));
      return item;
    },
    updateNote: (id, patch) =>
      setData((d) => ({
        ...d,
        notes: d.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)),
      })),
    deleteNote: (id) => setData((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== id) })),

    updateSettings: (patch) => setData((d) => ({ ...d, settings: { ...d.settings, ...patch } })),

    resetAll: () => setData(structuredClone(EMPTY_DATA)),
    exportJson: () => JSON.stringify(data, null, 2),
    importJson: (json) => {
      try {
        const parsed = JSON.parse(json);
        setData({ ...structuredClone(EMPTY_DATA), ...parsed });
        return true;
      } catch {
        return false;
      }
    },
  }), [data]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
