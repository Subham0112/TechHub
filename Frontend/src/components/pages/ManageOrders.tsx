import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiX, FiPackage, FiMapPin, FiClock, FiUser, FiChevronRight, FiCreditCard,
} from "react-icons/fi";
import type { Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus } from "../../types";
import { getImageUrl, onImageError } from "../../utils/imageUtils";

const STATUS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:      { label: "Pending",     color: "text-[var(--st-amber)]",   bg: "bg-[var(--st-amber-soft)] border-[var(--st-amber-border)]" },
  accepted:     { label: "Accepted",    color: "text-[var(--adm-accent)]",   bg: "bg-[var(--adm-accent-soft)] border-[var(--adm-accent-border)]" },
  preparing:    { label: "Preparing",   color: "text-[var(--st-orange)]",  bg: "bg-[var(--st-orange-soft)] border-[var(--st-orange-border)]" },
  "on the way": { label: "On the Way",  color: "text-[var(--st-violet)]",  bg: "bg-[var(--st-violet-soft)] border-[var(--st-violet-border)]" },
  delivered:    { label: "Delivered",   color: "text-[var(--st-emerald)]", bg: "bg-[var(--st-emerald-soft)] border-[var(--st-emerald-border)]" },
  cancelled:    { label: "Cancelled",   color: "text-[var(--st-rose)]",    bg: "bg-[var(--st-rose-soft)] border-[var(--st-rose-border)]" },
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

export const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span className={`inline-flex items-center text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wide ${s.color} ${s.bg} whitespace-nowrap`}>
      {s.label}
    </span>
  );
};

const OrderStatusControl = ({ orderId, status, onStatusUpdate }: {
  orderId: string;
  status: OrderStatus;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
}) => {
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
          className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-[var(--adm-accent-contrast)] bg-[var(--adm-accent)] hover:bg-[var(--adm-accent-hover)] px-3 py-1.5 rounded-full transition-all disabled:opacity-50 whitespace-nowrap uppercase tracking-wide"
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
          className="p-1.5 rounded-full text-[var(--adm-dim)] hover:text-[var(--st-rose)] hover:bg-[var(--st-rose-soft)] transition-all disabled:opacity-50"
        >
          <FiX className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export const PaymentStatusToggle = ({ orderId, paymentStatus, onPaymentUpdate }: {
  orderId: string;
  paymentStatus: PaymentStatus;
  onPaymentUpdate: (orderId: string, newStatus: PaymentStatus) => void;
}) => {
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
          ? "text-[var(--st-emerald)] bg-[var(--st-emerald-soft)] border-[var(--st-emerald-border)] hover:bg-[var(--st-emerald-soft)]"
          : "text-[var(--st-rose)] bg-[var(--st-rose-soft)] border-[var(--st-rose-border)] hover:bg-[var(--st-rose-soft)]"}`}
    >
      {saving ? "..." : (isPaid ? "Paid" : "Unpaid")}
    </button>
  );
};

const productName = (item: OrderItem): string =>
  typeof item.productId === "string" ? "Product" : item.productId?.name || "Product";

const OrderModal = ({ order, onClose, onPaymentUpdate }: {
  order: Order;
  onClose: () => void;
  onPaymentUpdate: (orderId: string, newStatus: PaymentStatus) => void;
}) => {
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
      <div className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        <div className="sticky top-0 z-10 bg-[var(--adm-card)] border-b border-[var(--adm-border)] px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--adm-dim)] font-mono">#{order._id.slice(-8).toUpperCase()}</p>
            <h2 className="text-base font-display font-semibold text-[var(--adm-heading)] mt-0.5">Order Details</h2>
          </div>
          <button onClick={onClose} className="text-[var(--adm-muted)] hover:text-[var(--adm-heading)] hover:bg-[var(--adm-chip)] p-2 rounded-lg transition-all">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--adm-subtle)] border border-[var(--adm-border)] rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-mono font-bold text-[var(--adm-muted)] uppercase tracking-widest mb-2">Order Status</span>
              <StatusBadge status={order.orderStatus} />
            </div>
            <div className="bg-[var(--adm-subtle)] border border-[var(--adm-border)] rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <FiCreditCard className="w-3.5 h-3.5 text-[var(--adm-accent)]" />
                <span className="text-[10px] font-mono font-bold text-[var(--adm-muted)] uppercase tracking-widest">Payment</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--adm-muted)]">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</span>
                <PaymentStatusToggle orderId={order._id} paymentStatus={order.paymentStatus} onPaymentUpdate={onPaymentUpdate} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--adm-subtle)] border border-[var(--adm-border)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiUser className="w-3.5 h-3.5 text-[var(--adm-accent)]" />
                <span className="text-[10px] font-mono font-bold text-[var(--adm-muted)] uppercase tracking-widest">Customer</span>
              </div>
              <p className="text-sm font-semibold text-[var(--adm-heading)]">{customer?.name || "N/A"}</p>
              <p className="text-xs text-[var(--adm-muted)] mt-0.5 truncate">{customer?.email || ""}</p>
            </div>
            <div className="bg-[var(--adm-subtle)] border border-[var(--adm-border)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiClock className="w-3.5 h-3.5 text-[var(--adm-accent)]" />
                <span className="text-[10px] font-mono font-bold text-[var(--adm-muted)] uppercase tracking-widest">Ordered</span>
              </div>
              <p className="text-sm font-semibold text-[var(--adm-heading)]">{date}</p>
            </div>
          </div>

          <div className="bg-[var(--adm-subtle)] border border-[var(--adm-border)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FiMapPin className="w-3.5 h-3.5 text-[var(--adm-accent)]" />
              <span className="text-[10px] font-mono font-bold text-[var(--adm-muted)] uppercase tracking-widest">Shipping Address</span>
            </div>
            <p className="text-sm text-[var(--adm-muted)]">{order.shippingAddress}</p>
          </div>

          <div className="bg-[var(--adm-subtle)] border border-[var(--adm-border)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiPackage className="w-3.5 h-3.5 text-[var(--adm-accent)]" />
              <span className="text-[10px] font-mono font-bold text-[var(--adm-muted)] uppercase tracking-widest">Items ({order.items.length})</span>
            </div>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b border-[var(--adm-border)] last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--adm-card)] border border-[var(--adm-border)] flex-shrink-0">
                    <img
                      src={getImageUrl(typeof item.productId === "string" ? undefined : item.productId?.image)}
                      alt={productName(item)}
                      className="w-full h-full object-cover"
                      onError={onImageError}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--adm-heading)] truncate">{productName(item)}</p>
                    <p className="text-xs text-[var(--adm-muted)]">Qty: {item.quantity} × Rs. {item.price?.toLocaleString()}</p>
                  </div>
                  <p className="text-sm font-mono font-bold text-[var(--adm-money)] flex-shrink-0">Rs. {item.subtotal?.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {(order.discount ?? 0) > 0 && (
              <div className="flex justify-between items-center pt-3">
                <span className="text-sm text-[var(--adm-muted)]">Combo savings</span>
                <span className="text-sm font-mono text-emerald-500">− Rs. {order.discount!.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 mt-1 border-t border-[var(--adm-border)]">
              <span className="text-sm font-bold text-[var(--adm-heading)]">Total</span>
              <span className="text-base font-mono font-bold text-[var(--adm-money)]">Rs. {order.totalPrice?.toLocaleString()}</span>
            </div>
          </div>

          <button onClick={onClose} className="w-full py-2.5 text-sm font-medium text-[var(--adm-muted)] hover:text-[var(--adm-heading)] bg-[var(--adm-chip)] hover:bg-[var(--adm-chip-hover)] rounded-xl transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageOrders = () => {
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
    <div className="min-h-screen bg-[var(--adm-bg)] text-[var(--adm-heading)]">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide border transition-all
              ${filterStatus === "all" ? "bg-[var(--adm-accent)] border-[var(--adm-accent)] text-[var(--adm-accent-contrast)]" : "bg-[var(--adm-card)] border-[var(--adm-border)] text-[var(--adm-muted)] hover:text-[var(--adm-heading)]"}`}
          >
            All ({orders.length})
          </button>
          {Object.entries(STATUS).map(([val, { label, color }]) => (
            <button
              key={val}
              onClick={() => setFilterStatus(val as OrderStatus)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide border transition-all
                ${filterStatus === val ? `${color} bg-[var(--adm-card)] border-current` : "bg-[var(--adm-card)] border-[var(--adm-border)] text-[var(--adm-muted)] hover:text-[var(--adm-heading)]"}`}
            >
              {label} ({counts[val as OrderStatus] || 0})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-[var(--adm-border)] border-t-[var(--adm-accent)] animate-spin" />
            <p className="text-[var(--adm-muted)] text-sm font-mono">Loading orders...</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--adm-border)] overflow-hidden">
            <div className="bg-[var(--adm-card)] px-5 py-3 border-b border-[var(--adm-border)]">
              <p className="text-xs font-mono text-[var(--adm-muted)]">
                Showing <span className="text-[var(--adm-heading)] font-semibold">{filtered.length}</span> of{" "}
                <span className="text-[var(--adm-heading)] font-semibold">{orders.length}</span> orders
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[var(--adm-subtle)]">
                  <tr>
                    {["Order ID", "Customer", "Items", "Total", "Payment", "Status", "Date", ""].map((col) => (
                      <th key={col} className="px-5 py-3.5 text-left text-[10px] font-mono font-bold text-[var(--adm-muted)] uppercase tracking-widest whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-[var(--adm-card)] divide-y divide-[var(--adm-border)]">
                  {filtered.length > 0 ? (
                    filtered.map((order) => (
                      <tr key={order._id} className="hover:bg-[var(--adm-subtle)] transition-colors group">
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono text-[var(--adm-muted)]">#{order._id.slice(-8).toUpperCase()}</span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-[var(--adm-heading)] whitespace-nowrap">{typeof order.userId === "string" ? "Unknown" : (order.userId?.name || "Unknown")}</p>
                          <p className="text-xs text-[var(--adm-muted)] truncate max-w-[120px]">{typeof order.userId === "string" ? "" : (order.userId?.email || "")}</p>
                        </td>

                        <td className="px-5 py-4 max-w-[180px]">
                          <p className="text-sm text-[var(--adm-muted)] truncate">
                            {order.items.map(productName).join(", ")}
                          </p>
                          <p className="text-xs text-[var(--adm-dim)]">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm font-mono font-bold text-[var(--adm-money)] whitespace-nowrap">Rs. {order.totalPrice?.toLocaleString()}</span>
                          {(order.discount ?? 0) > 0 && (
                            <p className="text-[11px] font-mono text-emerald-500 whitespace-nowrap">− Rs. {order.discount!.toLocaleString()} off</p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <PaymentStatusToggle orderId={order._id} paymentStatus={order.paymentStatus} onPaymentUpdate={handlePaymentUpdate} />
                        </td>

                        <td className="px-5 py-4">
                          <OrderStatusControl orderId={order._id} status={order.orderStatus} onStatusUpdate={handleStatusUpdate} />
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-xs text-[var(--adm-dim)] font-mono">
                            {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="opacity-0 group-hover:opacity-100 text-[10px] font-mono uppercase tracking-wide font-semibold text-[var(--adm-accent)] hover:text-[var(--adm-accent-contrast)] bg-transparent hover:bg-[var(--adm-accent)] px-3 py-1.5 rounded-lg border border-[var(--adm-accent-border)] hover:border-[var(--adm-accent)] transition-all duration-150 whitespace-nowrap"
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
                          <div className="w-14 h-14 rounded-xl bg-[var(--adm-card)] border border-[var(--adm-border)] flex items-center justify-center">
                            <FiPackage className="w-6 h-6 text-[var(--adm-dim)]" />
                          </div>
                          <p className="text-[var(--adm-muted)] text-sm">No orders found.</p>
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
