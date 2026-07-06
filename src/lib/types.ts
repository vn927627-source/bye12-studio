export type Gender = "nam" | "nu";
export type OrderStatus = "pending" | "deposit" | "paid";

export interface SizeStock {
  size: string;
  qty: number;
}

export interface Product {
  id: string;
  name: string;
  desc: string;
  image?: string;
  category: Gender;
  price: number;
  sizes: SizeStock[];
  createdAt: number;
}

export interface Student {
  id: string;
  customerId: string;
  name: string;
  height: number;
  weight: number;
  size: string;
  note?: string;
  createdAt: number;
}

export interface Customer {
  id: string;
  className: string;
  teacherName?: string;
  school?: string;
  phone: string;
  studentCount?: number;
  note: string;
  createdAt: number;
}

export interface OrderItem {
  productId: string;
  qty: number;
  priceOverride?: number;
}

export interface Order {
  id: string;
  customerId: string;
  maleCount: number;
  femaleCount: number;
  maleItems: OrderItem[];
  femaleItems: OrderItem[];
  rentDate: string;
  returnDate?: string;
  depositPercent: number;
  status: OrderStatus;
  returned: boolean;
  note?: string;
  extraFee?: number;
  createdAt: number;
}

export interface ScheduleEvent {
  id: string;
  date: string;
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
  lowStockThreshold: number;
  sizeMapping?: Record<string, string>;
}

export interface AppData {
  customers: Customer[];
  products: Product[];
  orders: Order[];
  events: ScheduleEvent[];
  notes: Note[];
  students: Student[];
  settings: Settings;
}
