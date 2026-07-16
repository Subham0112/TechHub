import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiX,
  FiPackage,
  FiMapPin,
  FiClock,
  FiUser,
  FiChevronRight,
  FiCreditCard,
} from "react-icons/fi";

// ── Order status config ──────────────────────────────────────────
const STATUS = {
  pending: {
    label: "Pending",
    color: "text-amber-400",
    bg: "bg-amber-400/10  border-amber-400/30",
  },
  accepted: {
    label: "Accepted",
    color: "text-blue-400",
    bg: "bg-blue-400/10   border-blue-400/30",
  },
  preparing: {
    label: "Preparing",
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/30",
  },
  "on the way": {
    label: "On the Way",
    color: "text-violet-400",
    bg: "bg-violet-400/10 border-violet-400/30",
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/30",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-rose-400",
    bg: "bg-rose-400/10   border-rose-400/30",
  },
};

// What the NEXT step is for each current status, and what to label the button
const NEXT_ACTION = {
  pending: { next: "accepted", label: "Accept" },
  accepted: { next: "preparing", label: "Preparing Order" },
  preparing: { next: "on the way", label: "Out for Delivery" },
  "on the way": { next: "delivered", label: "Mark Delivered" },
  // delivered & cancelled: no next action, terminal states
};

// Statuses from which an order can still be cancelled
const CANCELLABLE_FROM = ["pending", "accepted", "preparing"];

// ── Payment method labels ────────────────────────────────────────
const PAYMENT_LABELS = {
  esewa: "eSewa",
  khalti: "Khalti",
  cod: "Cash on Delivery",
};

const StatusBadge = ({ status }) => {
  const s = STATUS[status] || STATUS.pending
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border ${s.color} ${s.bg} whitespace-nowrap`}>
      {s.label}
    </span>
  )
}

// ── Order Status Control: badge + "advance" button + cancel ──────
const OrderStatusControl = ({ orderId, status, onStatusUpdate }) => {
  const [saving, setSaving] = useState(false);
  const action = NEXT_ACTION[status];
  const canCancel = CANCELLABLE_FROM.includes(status);

  const updateStatus = async (newStatus) => {
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
          className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-slate-700 hover:bg-indigo-600 px-3 py-1.5 rounded-full transition-all disabled:opacity-50 whitespace-nowrap"
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
          className="p-1.5 rounded-full text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all disabled:opacity-50"
        >
          <FiX className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

// ── Paid/Unpaid toggle — click to flip ────────────────────────────
const PaymentStatusToggle = ({ orderId, paymentStatus, onPaymentUpdate }) => {
  const [saving, setSaving] = useState(false)
  const isPaid = paymentStatus === 'paid'

  const toggle = async () => {
    setSaving(true)
    const next = isPaid ? 'unpaid' : 'paid'
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}`,
        { paymentStatus: next },
        { withCredentials: true }
      )
      onPaymentUpdate(orderId, next)
    } catch (err) {
      console.error('Payment status update error:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all disabled:opacity-50
        ${isPaid
          ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30 hover:bg-emerald-400/20'
          : 'text-rose-400 bg-rose-400/10 border-rose-400/30 hover:bg-rose-400/20'}`}
    >
      {saving ? '...' : (isPaid ? 'Paid' : 'Unpaid')}
    </button>
  )
}

// ── Order Detail Modal (view-only — changes happen from the table) ──
const OrderModal = ({ order, onClose, onPaymentUpdate }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const customer = order.userId;
  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-800 border-b border-slate-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-mono">
              #{order._id.slice(-8).toUpperCase()}
            </p>
            <h2 className="text-base font-bold text-white mt-0.5">
              Order Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-700 p-2 rounded-lg transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Status + Payment */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Order Status
              </span>
              <StatusBadge status={order.orderStatus} />
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <FiCreditCard className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Payment
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                </span>
                <PaymentStatusToggle
                  orderId={order._id}
                  paymentStatus={order.paymentStatus}
                  onPaymentUpdate={onPaymentUpdate}
                />
              </div>
            </div>
          </div>

          {/* Customer + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiUser className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Customer
                </span>
              </div>
              <p className="text-sm font-semibold text-white">
                {customer?.name || "N/A"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {customer?.email || ""}
              </p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiClock className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Ordered
                </span>
              </div>
              <p className="text-sm font-semibold text-white">{date}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FiMapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Shipping Address
              </span>
            </div>
            <p className="text-sm text-slate-300">{order.shippingAddress}</p>
          </div>

          {/* Items */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiPackage className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Items ({order.items.length})
              </span>
            </div>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 pb-3 border-b border-slate-700/50 last:border-0 last:pb-0"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0">
                    <img
                      src={item.productId?.image}
                      alt={item.productId?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/40x40/1e293b/94a3b8?text=?";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {item.productId?.name || "Product"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Qty: {item.quantity} × Rs. {item.price?.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-emerald-400 flex-shrink-0">
                    Rs. {item.subtotal?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-3 mt-1 border-t border-slate-700">
              <span className="text-sm font-bold text-white">Total</span>
              <span className="text-base font-bold text-emerald-400">
                Rs. {order.totalPrice?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────
const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, {
          withCredentials: true,
        });
        setOrders(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, orderStatus: newStatus } : o,
      ),
    );
    setSelectedOrder((prev) =>
      prev && prev._id === orderId ? { ...prev, orderStatus: newStatus } : prev,
    );
  };

  const handlePaymentUpdate = (orderId, newPaymentStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o,
      ),
    );
    setSelectedOrder((prev) =>
      prev && prev._id === orderId
        ? { ...prev, paymentStatus: newPaymentStatus }
        : prev,
    );
  };

  const filtered =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.orderStatus === filterStatus);

  const counts = Object.keys(STATUS).reduce((acc, key) => {
    acc[key] = orders.filter((o) => o.orderStatus === key).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1">
            Admin Panel
          </p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Manage Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View and update customer order statuses.
          </p>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
              ${
                filterStatus === "all"
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
              }`}
          >
            All ({orders.length})
          </button>
          {Object.entries(STATUS).map(([val, { label, color }]) => (
            <button
              key={val}
              onClick={() => setFilterStatus(val)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${
                  filterStatus === val
                    ? `${color} bg-slate-700 border-slate-500`
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                }`}
            >
              {label} ({counts[val] || 0})
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin" />
            <p className="text-slate-500 text-sm">Loading orders...</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl">
            {/* Count bar */}
            <div className="bg-slate-800/80 px-5 py-3 border-b border-slate-700/60">
              <p className="text-xs text-slate-400">
                Showing{" "}
                <span className="text-white font-semibold">
                  {filtered.length}
                </span>{" "}
                of{" "}
                <span className="text-white font-semibold">
                  {orders.length}
                </span>{" "}
                orders
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    {[
                      "Order ID",
                      "Customer",
                      "Items",
                      "Total",
                      "Payment",
                      "Status",
                      "Date",
                      "",
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-[#0d1424] divide-y divide-slate-800">
                  {filtered.length > 0 ? (
                    filtered.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Order ID */}
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono text-slate-400">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-white whitespace-nowrap">
                            {order.userId?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-slate-500 truncate max-w-[120px]">
                            {order.userId?.email || ""}
                          </p>
                        </td>

                        {/* Items */}
                        <td className="px-5 py-4 max-w-[180px]">
                          <p className="text-sm text-slate-300 truncate">
                            {order.items
                              .map((i) => i.productId?.name || "Product")
                              .join(", ")}
                          </p>
                          <p className="text-xs text-slate-500">
                            {order.items.length} item
                            {order.items.length !== 1 ? "s" : ""}
                          </p>
                        </td>

                        {/* Total */}
                        <td className="px-5 py-4">
                          <span className="text-sm font-bold text-emerald-400 whitespace-nowrap">
                            Rs. {order.totalPrice?.toLocaleString()}
                          </span>
                        </td>

                        {/* Payment */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                           
                            <PaymentStatusToggle
                              orderId={order._id}
                              paymentStatus={order.paymentStatus}
                              onPaymentUpdate={handlePaymentUpdate}
                            />
                          </div>
                        </td>

                        {/* Status + advance button */}
                        <td className="px-5 py-4">
                          <OrderStatusControl
                            orderId={order._id}
                            status={order.orderStatus}
                            onStatusUpdate={handleStatusUpdate}
                          />
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-xs text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="opacity-0 group-hover:opacity-100 text-xs font-semibold text-indigo-400 hover:text-white bg-indigo-600/0 hover:bg-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-500/30 hover:border-indigo-500 transition-all duration-150 whitespace-nowrap"
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
                          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
                            <FiPackage className="w-6 h-6 text-slate-600" />
                          </div>
                          <p className="text-slate-500 text-sm">
                            No orders found.
                          </p>
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

      {/* Modal */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onPaymentUpdate={handlePaymentUpdate}
        />
      )}
    </div>
  );
};

export default ManageOrders;
