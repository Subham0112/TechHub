import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiX, FiPackage, FiMapPin, FiClock, FiUser, FiChevronRight, FiCreditCard,
} from "react-icons/fi";
import type { Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus } from "../../types";

const STATUS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:      { label: "Pending",     color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/30" },
  accepted:     { label: "Accepted",    color: "text-[#5B8DEF]",   bg: "bg-[#5B8DEF]/10 border-[#5B8DEF]/30" },
  preparing:    { label: "Preparing",   color: "text-orange-400",  bg: "bg-orange-400/10 border-orange-400/30" },
  "on the way": { label: "On the Way",  color: "text-violet-400",  bg: "bg-violet-400/10 border-violet-400/30" },
  delivered:    { label: "Delivered",   color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" },
  cancelled:    { label: "Cancelled",   color: "text-rose-400",    bg: "bg-rose-400/10 border-rose-400/30" },
};

const NEXT_ACTION: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  pending:      { next: "accepted",   label: "Accept" },
  accepted:     { next: "preparing",  label: "Preparing Order" },
  preparing:    { next: "on the way", label: "Out for Delivery" },
  "on the way": { next: "delivered",  label: "Mark Delivered" },
};

const CANCELLABLE_FROM: OrderStatus[] = ["pending", "accepted", "preparing"];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  esewa: "eSewa",
  khalti: "Khalti",
  cod: "Cash on Delivery",
};

export const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span className={`inline-flex items-center text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wide ${s.color} ${s.bg} whitespace-nowrap`}>
      {s.label}
    </span>
  );
};

const OrderStatusControl: React.FC<{
  orderId: string;
  status: OrderStatus;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
}> = ({ orderId, status, onStatusUpdate }) => {
  const [saving, setSaving] = useState(false);
  const action = NEXT_ACTION[status];
  const canCancel = CANCELLABLE_FROM.includes(status);

  const updateStatus = async (newStatus: OrderStatus) => {
    setSaving(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}`,
        { orderStatus: newStatus },
        { withCredentials: true },
      );
      onStatusUpdate(orderId, newStatus);
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <StatusBadge status={status} />

      {action && (
        <button
          onClick={() => updateStatus(action.next)}
          disabled={saving}
          className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-[#0A0E1A] bg-[#5B8DEF] hover:bg-[#7BA3F5] px-3 py-1.5 rounded-full transition-all disabled:opacity-50 whitespace-nowrap uppercase tracking-wide"
        >
          {saving ? "Updating..." : action.label}
          {!saving && <FiChevronRight className="w-3.5 h-3.5" />}
        </button>
      )}

      {canCancel && (
        <button
          onClick={() => updateStatus("cancelled")}
          disabled={saving}
          title="Cancel order"
          className="p-1.5 rounded-full text-[#5C6270] hover:text-rose-400 hover:bg-rose-400/10 transition-all disabled:opacity-50"
        >
          <FiX className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export const PaymentStatusToggle: React.FC<{
  orderId: string;
  paymentStatus: PaymentStatus;
  onPaymentUpdate: (orderId: string, newStatus: PaymentStatus) => void;
}> = ({ orderId, paymentStatus, onPaymentUpdate }) => {
  const [saving, setSaving] = useState(false);
  const isPaid = paymentStatus === "paid";

  const toggle = async () => {
    setSaving(true);
    const next: PaymentStatus = isPaid ? "unpaid" : "paid";
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}`,
        { paymentStatus: next },
        { withCredentials: true }
      );
      onPaymentUpdate(orderId, next);
    } catch (err) {
      console.error("Payment status update error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className={`inline-flex items-center text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border transition-all disabled:opacity-50 uppercase tracking-wide
        ${isPaid
          ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30 hover:bg-emerald-400/20"
          : "text-rose-400 bg-rose-400/10 border-rose-400/30 hover:bg-rose-400/20"}`}
    >
      {saving ? "..." : (isPaid ? "Paid" : "Unpaid")}
    </button>
  );
};

const productName = (item: OrderItem): string =>
  typeof item.productId === "string" ? "Product" : item.productId?.name || "Product";

const OrderModal: React.FC<{
  order: Order;
  onClose: () => void;
  onPaymentUpdate: (orderId: string, newStatus: PaymentStatus) => void;
}> = ({ order, onClose, onPaymentUpdate }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  const customer = typeof order.userId === "string" ? null : order.userId;
  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#121A2E] border border-[#232F49] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        <div className="sticky top-0 z-10 bg-[#121A2E] border-b border-[#232F49] px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-[#5C6270] font-mono">#{order._id.slice(-8).toUpperCase()}</p>
            <h2 className="text-base font-display font-semibold text-[#EDF1F7] mt-0.5">Order Details</h2>
          </div>
          <button onClick={onClose} className="text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#182238] p-2 rounded-lg transition-all">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0A0E1A] border border-[#232F49] rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-mono font-bold text-[#5C6270] uppercase tracking-widest mb-2">Order Status</span>
              <StatusBadge status={order.orderStatus} />
            </div>
            <div className="bg-[#0A0E1A] border border-[#232F49] rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <FiCreditCard className="w-3.5 h-3.5 text-[#5B8DEF]" />
                <span className="text-[10px] font-mono font-bold text-[#5C6270] uppercase tracking-widest">Payment</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8592AC]">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</span>
                <PaymentStatusToggle orderId={order._id} paymentStatus={order.paymentStatus} onPaymentUpdate={onPaymentUpdate} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0A0E1A] border border-[#232F49] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiUser className="w-3.5 h-3.5 text-[#5B8DEF]" />
                <span className="text-[10px] font-mono font-bold text-[#5C6270] uppercase tracking-widest">Customer</span>
              </div>
              <p className="text-sm font-semibold text-[#EDF1F7]">{customer?.name || "N/A"}</p>
              <p className="text-xs text-[#8592AC] mt-0.5 truncate">{customer?.email || ""}</p>
            </div>
            <div className="bg-[#0A0E1A] border border-[#232F49] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiClock className="w-3.5 h-3.5 text-[#5B8DEF]" />
                <span className="text-[10px] font-mono font-bold text-[#5C6270] uppercase tracking-widest">Ordered</span>
              </div>
              <p className="text-sm font-semibold text-[#EDF1F7]">{date}</p>
            </div>
          </div>

          <div className="bg-[#0A0E1A] border border-[#232F49] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FiMapPin className="w-3.5 h-3.5 text-[#5B8DEF]" />
              <span className="text-[10px] font-mono font-bold text-[#5C6270] uppercase tracking-widest">Shipping Address</span>
            </div>
            <p className="text-sm text-[#8592AC]">{order.shippingAddress}</p>
          </div>

          <div className="bg-[#0A0E1A] border border-[#232F49] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiPackage className="w-3.5 h-3.5 text-[#5B8DEF]" />
              <span className="text-[10px] font-mono font-bold text-[#5C6270] uppercase tracking-widest">Items ({order.items.length})</span>
            </div>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b border-[#232F49] last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#121A2E] border border-[#232F49] flex-shrink-0">
                    <img
                      src={typeof item.productId === "string" ? undefined : item.productId?.image}
                      alt={productName(item)}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = "https://placehold.co/40x40/121A2E/8592AC?text=?"; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#EDF1F7] truncate">{productName(item)}</p>
                    <p className="text-xs text-[#8592AC]">Qty: {item.quantity} × Rs. {item.price?.toLocaleString()}</p>
                  </div>
                  <p className="text-sm font-mono font-bold text-[#FFB238] flex-shrink-0">Rs. {item.subtotal?.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 mt-1 border-t border-[#232F49]">
              <span className="text-sm font-bold text-[#EDF1F7]">Total</span>
              <span className="text-base font-mono font-bold text-[#FFB238]">Rs. {order.totalPrice?.toLocaleString()}</span>
            </div>
          </div>

          <button onClick={onClose} className="w-full py-2.5 text-sm font-medium text-[#8592AC] hover:text-[#EDF1F7] bg-[#182238] hover:bg-[#1E2A42] rounded-xl transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, { withCredentials: true });
        setOrders(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
    setSelectedOrder((prev) => prev && prev._id === orderId ? { ...prev, orderStatus: newStatus } : prev);
  };

  const handlePaymentUpdate = (orderId: string, newPaymentStatus: PaymentStatus) => {
    setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o));
    setSelectedOrder((prev) => prev && prev._id === orderId ? { ...prev, paymentStatus: newPaymentStatus } : prev);
  };

  const filtered = filterStatus === "all" ? orders : orders.filter((o) => o.orderStatus === filterStatus);

  const counts = Object.keys(STATUS).reduce((acc, key) => {
    acc[key as OrderStatus] = orders.filter((o) => o.orderStatus === key).length;
    return acc;
  }, {} as Record<OrderStatus, number>);

  return (
    <div className="relative min-h-screen bg-[#0A0E1A] text-[#EDF1F7]">
      <div
        className="fixed inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#5B8DEF 1px, transparent 1px), linear-gradient(90deg, #5B8DEF 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-1.5">// Admin Panel</p>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-[#EDF1F7]">Manage Orders</h1>
          <p className="text-sm text-[#8592AC] font-body mt-1">View and update customer order statuses.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide border transition-all
              ${filterStatus === "all" ? "bg-[#5B8DEF] border-[#5B8DEF] text-[#0A0E1A]" : "bg-[#121A2E] border-[#232F49] text-[#8592AC] hover:text-[#EDF1F7]"}`}
          >
            All ({orders.length})
          </button>
          {Object.entries(STATUS).map(([val, { label, color }]) => (
            <button
              key={val}
              onClick={() => setFilterStatus(val as OrderStatus)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide border transition-all
                ${filterStatus === val ? `${color} bg-[#182238] border-[#5C6270]` : "bg-[#121A2E] border-[#232F49] text-[#8592AC] hover:text-[#EDF1F7]"}`}
            >
              {label} ({counts[val as OrderStatus] || 0})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#232F49] border-t-[#5B8DEF] animate-spin" />
            <p className="text-[#8592AC] text-sm font-mono">Loading orders...</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#232F49] overflow-hidden">
            <div className="bg-[#121A2E] px-5 py-3 border-b border-[#232F49]">
              <p className="text-xs font-mono text-[#8592AC]">
                Showing <span className="text-[#EDF1F7] font-semibold">{filtered.length}</span> of{" "}
                <span className="text-[#EDF1F7] font-semibold">{orders.length}</span> orders
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#121A2E]/70">
                  <tr>
                    {["Order ID", "Customer", "Items", "Total", "Payment", "Status", "Date", ""].map((col) => (
                      <th key={col} className="px-5 py-3.5 text-left text-[10px] font-mono font-bold text-[#5C6270] uppercase tracking-widest whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-[#0A0E1A] divide-y divide-[#232F49]">
                  {filtered.length > 0 ? (
                    filtered.map((order) => (
                      <tr key={order._id} className="hover:bg-[#121A2E]/50 transition-colors group">
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono text-[#8592AC]">#{order._id.slice(-8).toUpperCase()}</span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-[#EDF1F7] whitespace-nowrap">{typeof order.userId === "string" ? "Unknown" : (order.userId?.name || "Unknown")}</p>
                          <p className="text-xs text-[#8592AC] truncate max-w-[120px]">{typeof order.userId === "string" ? "" : (order.userId?.email || "")}</p>
                        </td>

                        <td className="px-5 py-4 max-w-[180px]">
                          <p className="text-sm text-[#8592AC] truncate">
                            {order.items.map(productName).join(", ")}
                          </p>
                          <p className="text-xs text-[#5C6270]">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm font-mono font-bold text-[#FFB238] whitespace-nowrap">Rs. {order.totalPrice?.toLocaleString()}</span>
                        </td>

                        <td className="px-5 py-4">
                          <PaymentStatusToggle orderId={order._id} paymentStatus={order.paymentStatus} onPaymentUpdate={handlePaymentUpdate} />
                        </td>

                        <td className="px-5 py-4">
                          <OrderStatusControl orderId={order._id} status={order.orderStatus} onStatusUpdate={handleStatusUpdate} />
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-xs text-[#5C6270] font-mono">
                            {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="opacity-0 group-hover:opacity-100 text-[10px] font-mono uppercase tracking-wide font-semibold text-[#5B8DEF] hover:text-[#0A0E1A] bg-[#5B8DEF]/0 hover:bg-[#5B8DEF] px-3 py-1.5 rounded-lg border border-[#5B8DEF]/30 hover:border-[#5B8DEF] transition-all duration-150 whitespace-nowrap"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-5 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-[#121A2E] border border-[#232F49] flex items-center justify-center">
                            <FiPackage className="w-6 h-6 text-[#5C6270]" />
                          </div>
                          <p className="text-[#8592AC] text-sm">No orders found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onPaymentUpdate={handlePaymentUpdate} />
      )}
    </div>
  );
};

export default ManageOrders;
