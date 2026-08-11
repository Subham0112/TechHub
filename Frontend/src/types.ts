export type Role = "user" | "admin";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "on the way"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "esewa" | "khalti" | "cod";
export type PaymentStatus = "paid" | "unpaid";

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: Role;
  profile_pic?: string;
  avatar?: string;
  createdAt?: string;
}

export interface Product {
  _id: string;
  id?: string;
  name: string;
  price: number;
  description: string;
  slug: string;
  image: string;
  category: "mobile-accessories" | "gadgets" | string;
  type: string;
  stock: number;
  createdAt?: string;
}

export interface CartItem {
  productId: Product | string;
  quantity: number;
  _id?: string;
}

export interface Cart {
  _id?: string;
  userId?: string;
  items: CartItem[];
  createdAt?: string;
}

export interface OrderItem {
  productId: Product | { name?: string; image?: string } | string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  userId: User | { name?: string; email?: string } | string;
  items: OrderItem[];
  totalPrice: number;
  shippingAddress: string;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface AlertData {
  type: "success" | "danger" | "info";
  title: string;
  description?: string;
}

export interface AdminStats {
  totalRevenue: number;
  deliveredRevenue: number;
  pendingRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  averageOrderValue: number;
  statusCounts: Partial<Record<OrderStatus, number>>;
  salesByDay: { date: string; label: string; revenue: number; orders: number }[];
  recentOrders: Order[];
  topProducts: { _id: string; name: string; image: string; unitsSold: number; revenue: number }[];
  lowStockProducts: Product[];
}

export interface AdminCustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}
