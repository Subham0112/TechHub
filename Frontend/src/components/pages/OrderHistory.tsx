import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { UserContext } from '../context/UserContext'
import { StatusBadge } from './ManageOrders'
import { getImageUrl } from '../../utils/imageUtils'
import { FiPackage, FiMapPin, FiClock, FiCreditCard, FiChevronDown } from 'react-icons/fi'
import type { Order, OrderItem, OrderStatus, PaymentMethod } from '../../types'


const STATUS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:      { label: "Pending",     color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/30" },
  accepted:     { label: "Accepted",    color: "text-[#5B8DEF]",   bg: "bg-[#5B8DEF]/10 border-[#5B8DEF]/30" },
  preparing:    { label: "Preparing",   color: "text-orange-400",  bg: "bg-orange-400/10 border-orange-400/30" },
  "on the way": { label: "On the Way",  color: "text-violet-400",  bg: "bg-violet-400/10 border-violet-400/30" },
  delivered:    { label: "Delivered",   color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" },
  cancelled:    { label: "Cancelled",   color: "text-rose-400",    bg: "bg-rose-400/10 border-rose-400/30" },
};
const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  esewa: "eSewa",
  khalti: "Khalti",
  cod: "Cash on Delivery",
};

const productName = (item: OrderItem): string =>
  typeof item.productId === "string" ? "Product" : item.productId?.name || "Product";

const productImage = (item: OrderItem): string | undefined =>
  typeof item.productId === "string" ? undefined : item.productId?.image;

const OrderCard = ({ order }: { order: Order }) => {
  const [expanded, setExpanded] = useState(false)
  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="bg-[#121A2E] border border-[#232F49] rounded-xl overflow-hidden">

      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[#182238]/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0A0E1A] border border-[#232F49] flex items-center justify-center flex-shrink-0">
            <FiPackage className="w-4 h-4 text-[#5B8DEF]" />
          </div>
          <div>
            <p className="text-sm font-mono text-[#EDF1F7]">#{order._id.slice(-8).toUpperCase()}</p>
            <p className="text-xs text-[#5C6270] flex items-center gap-1 mt-0.5">
              <FiClock className="w-3 h-3" /> {date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={order.orderStatus} />
          <span className="text-sm font-mono font-bold text-[#FFB238]">
            Rs. {order.totalPrice?.toLocaleString()}
          </span>
          <FiChevronDown className={`w-4 h-4 text-[#5C6270] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-[#232F49] space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <div className="bg-[#0A0E1A] border border-[#232F49] rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <FiMapPin className="w-3.5 h-3.5 text-[#5B8DEF]" />
                <span className="text-[10px] font-mono font-bold text-[#5C6270] uppercase tracking-widest">Shipping</span>
              </div>
              <p className="text-xs text-[#8592AC]">{order.shippingAddress}</p>
            </div>

            <div className="bg-[#0A0E1A] border border-[#232F49] rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <FiCreditCard className="w-3.5 h-3.5 text-[#5B8DEF]" />
                <span className="text-[10px] font-mono font-bold text-[#5C6270] uppercase tracking-widest">Payment</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8592AC]">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</span>
                <span className={`text-[10px] font-mono font-semibold uppercase tracking-wide ${order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#0A0E1A] border border-[#232F49] rounded-xl p-3.5">
            <p className="text-[10px] font-mono font-bold text-[#5C6270] uppercase tracking-widest mb-3">
              Items ({order.items?.length || 0})
            </p>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 pb-3 border-b border-[#232F49] last:border-0 last:pb-0">
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#121A2E] border border-[#232F49] flex-shrink-0">
                    <img
                      src={getImageUrl(productImage(item))}
                      alt={productName(item)}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = 'https://placehold.co/36x36/121A2E/8592AC?text=?' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#EDF1F7] truncate">{productName(item)}</p>
                    <p className="text-xs text-[#5C6270]">Qty {item.quantity}</p>
                  </div>
                  <span className="text-sm font-mono font-semibold text-[#FFB238] flex-shrink-0">
                    Rs. {(item.subtotal ?? item.price).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const { user } = useContext(UserContext)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get<Order[]>(`${import.meta.env.VITE_API_URL}/orders`, { withCredentials: true })
        const data = res.data || []
        const userOrders = data.filter(o => {
          const oid = o.userId && typeof o.userId === "object"
            ? (o.userId as { _id?: string })._id ?? String(o.userId)
            : o.userId
          const uid = user && (user._id || user.id)
          return uid && oid && String(oid) === String(uid)
        })
        setOrders(userOrders)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchOrders()
  }, [user])

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.orderStatus === filterStatus)

  const counts = Object.keys(STATUS).reduce((acc, key) => {
    acc[key as OrderStatus] = orders.filter(o => o.orderStatus === key).length
    return acc
  }, {} as Record<OrderStatus, number>)

  return (
    <div className="relative min-h-screen bg-[#0A0E1A] text-[#EDF1F7]">
      <div
        className="fixed inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#5B8DEF 1px, transparent 1px), linear-gradient(90deg, #5B8DEF 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12">

        <div className="mb-8">
          <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-1.5">// Account</p>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-[#EDF1F7]">Order History</h1>
          {!loading && (
            <p className="text-xs font-mono text-[#8592AC] mt-2">
              {orders.length} order{orders.length !== 1 ? 's' : ''} placed
            </p>
          )}
        </div>

        {!loading && orders.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide border transition-all
                ${filterStatus === 'all' ? 'bg-[#5B8DEF] border-[#5B8DEF] text-[#0A0E1A]' : 'bg-[#121A2E] border-[#232F49] text-[#8592AC] hover:text-[#EDF1F7]'}`}
            >
              All ({orders.length})
            </button>
            {Object.entries(STATUS).map(([val, { label, color }]) => (
              counts[val as OrderStatus] > 0 && (
                <button
                  key={val}
                  onClick={() => setFilterStatus(val as OrderStatus)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide border transition-all
                    ${filterStatus === val ? `${color} bg-[#182238] border-[#5C6270]` : 'bg-[#121A2E] border-[#232F49] text-[#8592AC] hover:text-[#EDF1F7]'}`}
                >
                  {label} ({counts[val as OrderStatus]})
                </button>
              )
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#232F49] border-t-[#5B8DEF] animate-spin" />
            <p className="text-[#8592AC] text-sm font-mono">Fetching orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-[#121A2E] rounded-xl border border-dashed border-[#232F49]">
            <div className="w-14 h-14 rounded-xl bg-[#0A0E1A] border border-[#232F49] flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-[#5C6270]" />
            </div>
            <p className="text-[#8592AC] text-sm font-mono">
              {orders.length === 0 ? 'No orders yet.' : 'No orders match this filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderHistory
