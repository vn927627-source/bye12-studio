export type Gender = "nam" | "nu";

export type OrderStatus = "pending" | "deposit" | "paid";

export interface SizeStock {
  size: string; // "S" | "M" | "L" | "XL" | ...
  qty: number;
}

export interface Product {
  id: string;
  name: string;
  desc: string;
  image?: string; // base64 or url
  category: Gender;
  price: number;
  sizes: SizeStock[]; // total stock = sum of qty
  createdAt: number;
}

export interface Customer {
  id: string;
  className: string; // Lớp, e.g. "12A1"
  phone: string;
  studentCount?: number;
  note: string;
  createdAt: number;
}

export interface OrderItem {
  productId: string;
  qty: number; // units rented of this product
}

export interface Order {
  id: string; // "#001"
  customerId: string;
  maleCount: number;
  femaleCount: number;
  maleItems: OrderItem[]; // products selected for nam
  femaleItems: OrderItem[]; // products selected for nữ
  rentDate: string; // ISO yyyy-mm-dd
  returnDate?: string; // ISO yyyy-mm-dd
  depositPercent: number; // 0, 50, 100
  status: OrderStatus;
  returned: boolean;
  note?: string;
  createdAt: number;
}

export interface ScheduleEvent {
  id: string;
  date: string; // ISO yyyy-mm-dd
  label: string;
  type: "rent" | "return" | "studio" | "other";
  orderId?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  shopName: string;
  shopTagline: string;
  currency: string;
  defaultDepositPercent: number;
  googleSheetLink: string;
  lowStockThreshold: number;
}

export interface AppData {
  customers: Customer[];
  products: Product[];
  orders: Order[];
  events: ScheduleEvent[];
  notes: Note[];
  settings: Settings;
}
