import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import { getImageUrl } from '../../utils/imageUtils'
import {
  FiPackage, FiClock, FiCheckCircle, FiTruck, FiHome, FiX,
  FiSearch, FiMapPin, FiCreditCard, FiChevronRight, FiArrowLeft
} from 'react-icons/fi'

const PAYMENT_LABELS = {
  esewa: 'eSewa',
  khalti: 'Khalti',
  cod: 'Cash on Delivery',
}

// Ordered tracking steps — cancelled is handled separately, not part of the linear flow
const STEPS = [
  { key: 'pending',      label: 'Order Placed', icon: FiClock,        desc: 'Waiting for the store to accept your order' },
  { key: 'accepted',     label: 'Accepted',     icon: FiCheckCircle,  desc: 'Your order has been confirmed' },
  { key: 'preparing',    label: 'Preparing',    icon: FiPackage,      desc: 'Your items are being packed' },
  { key: 'on the way',   label: 'On the Way',   icon: FiTruck,        desc: 'Your order is out for delivery' },
  { key: 'delivered',    label: 'Delivered',    icon: FiHome,         desc: 'Your order has arrived' },
]

const STEP_INDEX = STEPS.reduce((acc, s, i) => { acc[s.key] = i; return acc }, {})

/* ── Corner brackets — signature motif ── */
const Corners = ({ color = "border-[#5B8DEF]" }) => (
  <>
    <span className={`absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 ${color} pointer-events-none`} />
    <span className={`absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 ${color} pointer-events-none`} />
    <span className={`absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 ${color} pointer-events-none`} />
    <span className={`absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 ${color} pointer-events-none`} />
  </>
)

/* ── Vertical step tracker ── */
const OrderTracker = ({ order }) => {
  const isCancelled = order.orderStatus === 'cancelled'
  const currentIndex = STEP_INDEX[order.orderStatus] ?? 0

  if (isCancelled) {
    return (
      <div className="bg-rose-400/5 border border-rose-400/30 rounded-xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-rose-400/10 border border-rose-400/30 flex items-center justify-center flex-shrink-0">
          <FiX className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <p className="text-sm font-display font-semibold text-rose-400 mb-1">Order Cancelled</p>
          <p className="text-xs text-[#8592AC]">
            This order was cancelled and will not be processed further. If this was unexpected, reach out to support.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex
        const isCurrent = i === currentIndex
        const isUpcoming = i > currentIndex
        const Icon = step.icon
        const isLast = i === STEPS.length - 1

        return (
          <div key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Connector line */}
            {!isLast && (
              <div
                className={`absolute left-[19px] top-10 w-[2px] h-[calc(100%-2rem)] ${
                  isDone ? 'bg-[#5B8DEF]' : 'bg-[#232F49]'
                }`}
              />
            )}

            {/* Icon node */}
            <div
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300
                ${isDone
                  ? 'bg-[#5B8DEF] border-[#5B8DEF] text-[#0A0E1A]'
                  : isCurrent
                  ? 'bg-[#121A2E] border-[#5B8DEF] text-[#5B8DEF] ring-4 ring-[#5B8DEF]/15'
                  : 'bg-[#121A2E] border-[#232F49] text-[#5C6270]'}`}
            >
              <Icon className="w-4.5 h-4.5" />
            </div>

            {/* Label */}
            <div className={`pt-1.5 ${isUpcoming ? 'opacity-50' : ''}`}>
              <p className={`text-sm font-display font-semibold ${isCurrent ? 'text-[#5B8DEF]' : 'text-[#EDF1F7]'}`}>
                {step.label}
                {isCurrent && (
                  <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-[#5B8DEF] animate-pulse align-middle" />
                )}
              </p>
              <p className="text-xs text-[#8592AC] mt-0.5">{step.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Full order detail + tracker ── */
const OrderTrackingDetail = ({ order, onBack }) => {
  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8592AC] hover:text-[#EDF1F7] uppercase tracking-wide transition-colors"
      >
        <FiArrowLeft className="w-3.5 h-3.5" /> Back to orders
      </button>

      {/* Order summary card */}
      <div className="relative bg-[#121A2E] border border-[#232F49] rounded-2xl p-6">
        <Corners />
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <p className="text-sm font-mono text-[#EDF1F7]">#{order._id.slice(-8).toUpperCase()}</p>
          <span className="text-sm font-mono font-bold text-[#FFB238]">
            Rs. {order.totalPrice?.toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-[#5C6270] flex items-center gap-1.5">
          <FiClock className="w-3 h-3" /> Placed {date}
        </p>
      </div>

      {/* Tracker */}
      <div className="bg-[#121A2E] border border-[#232F49] rounded-2xl p-6">
        <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-5">// Tracking Progress</p>
        <OrderTracker order={order} />
      </div>

      {/* Shipping + Payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#121A2E] border border-[#232F49] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiMapPin className="w-3.5 h-3.5 text-[#5B8DEF]" />
            <span className="text-[10px] font-mono font-bold text-[#5C6270] uppercase tracking-widest">Delivery Address</span>
          </div>
          <p className="text-xs text-[#8592AC]">{order.shippingAddress}</p>
        </div>
        <div className="bg-[#121A2E] border border-[#232F49] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
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

      {/* Items */}
      <div className="bg-[#121A2E] border border-[#232F49] rounded-xl p-4">
        <p className="text-[10px] font-mono font-bold text-[#5C6270] uppercase tracking-widest mb-3">
          Items ({order.items?.length || 0})
        </p>
        <div className="space-y-3">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 pb-3 border-b border-[#232F49] last:border-0 last:pb-0">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#0A0E1A] border border-[#232F49] flex-shrink-0">
                <img
                  src={getImageUrl(item.productId?.image)}
                  alt={item.productId?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://placehold.co/40x40/121A2E/8592AC?text=?' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#EDF1F7] truncate">{item.productId?.name || item.name || 'Product'}</p>
                <p className="text-xs text-[#5C6270]">Qty {item.quantity}</p>
              </div>
              <span className="text-sm font-mono font-semibold text-[#FFB238] flex-shrink-0">
                Rs. {(item.subtotal ?? item.price)?.toLocaleString?.() ?? item.subtotal ?? item.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Order picker card (for the list view) ── */
const OrderListItem = ({ order, onSelect }) => {
  const isCancelled = order.orderStatus === 'cancelled'
  const currentIndex = STEP_INDEX[order.orderStatus] ?? 0
  const currentStep = STEPS[currentIndex]
  const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <button
      onClick={() => onSelect(order)}
      className="w-full text-left bg-[#121A2E] border border-[#232F49] hover:border-[#5B8DEF]/40 rounded-xl p-4 flex items-center justify-between gap-4 transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-[#0A0E1A] border border-[#232F49] flex items-center justify-center flex-shrink-0">
          <FiPackage className="w-4 h-4 text-[#5B8DEF]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-mono text-[#EDF1F7]">#{order._id.slice(-8).toUpperCase()}</p>
          <p className="text-xs text-[#5C6270] mt-0.5">{date}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`text-[10px] font-mono font-semibold uppercase tracking-wide ${isCancelled ? 'text-rose-400' : 'text-[#5B8DEF]'}`}>
          {isCancelled ? 'Cancelled' : currentStep.label}
        </span>
        <FiChevronRight className="w-4 h-4 text-[#5C6270] group-hover:text-[#5B8DEF] transition-colors" />
      </div>
    </button>
  )
}

/* ── Main Page ── */
const TrackOrder = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const { user } = useContext(UserContext)
  const { orderId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, { withCredentials: true })
        const data = res.data || []
        const userOrders = data.filter(o => {
          const oid = o.userId && (o.userId._id || o.userId)
          const uid = user && (user._id || user.id)
          return uid && oid && String(oid) === String(uid)
        })
        setOrders(userOrders)

        // Deep link support: /track-order/:orderId opens straight to that order
        if (orderId) {
          const match = userOrders.find(o => o._id === orderId || o._id.endsWith(orderId.toUpperCase()) || o._id.slice(-8).toUpperCase() === orderId.toUpperCase())
          if (match) setSelectedOrder(match)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchOrders()
  }, [user, orderId])

  const filteredOrders = orders.filter(o =>
    !search.trim() || o._id.toLowerCase().includes(search.trim().toLowerCase())
  )

  const handleSelect = (order) => {
    setSelectedOrder(order)
    navigate(`/track-order/${order._id.slice(-8).toUpperCase()}`, { replace: true })
  }

  const handleBack = () => {
    setSelectedOrder(null)
    navigate('/track-order', { replace: true })
  }

  return (
    <div className="relative min-h-screen bg-[#0A0E1A] text-[#EDF1F7]">
      <div
        className="fixed inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#5B8DEF 1px, transparent 1px), linear-gradient(90deg, #5B8DEF 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-12">

        <div className="mb-8">
          <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-1.5">// Track Order</p>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-[#EDF1F7]">
            {selectedOrder ? 'Order Tracking' : 'Track Your Order'}
          </h1>
          {!selectedOrder && (
            <p className="text-sm text-[#8592AC] font-body mt-1">
              Select an order below to see its live delivery status.
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#232F49] border-t-[#5B8DEF] animate-spin" />
            <p className="text-[#8592AC] text-sm font-mono">Fetching your orders...</p>
          </div>
        ) : selectedOrder ? (
          <OrderTrackingDetail order={selectedOrder} onBack={handleBack} />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-[#121A2E] rounded-xl border border-dashed border-[#232F49]">
            <div className="w-14 h-14 rounded-xl bg-[#0A0E1A] border border-[#232F49] flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-[#5C6270]" />
            </div>
            <p className="text-[#8592AC] text-sm font-mono">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search by order ID */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C6270]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order ID..."
                className="w-full bg-[#121A2E] border border-[#232F49] text-[#EDF1F7] text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-[#5C6270] focus:outline-none focus:ring-2 focus:ring-[#5B8DEF] focus:border-transparent transition-all"
              />
            </div>

            {filteredOrders.length === 0 ? (
              <p className="text-center text-sm text-[#5C6270] py-8">No orders match "{search}"</p>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map(order => (
                  <OrderListItem key={order._id} order={order} onSelect={handleSelect} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackOrder