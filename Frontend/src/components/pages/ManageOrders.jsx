import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FiX, FiPackage, FiMapPin, FiClock, FiUser, FiChevronDown } from 'react-icons/fi'

// ── Status config ────────────────────────────────────────────────
const STATUS = {
  pending:    { label: 'Pending',    color: 'text-amber-400',  bg: 'bg-amber-400/10  border-amber-400/30'  },
  accepted:   { label: 'Accepted',   color: 'text-blue-400',   bg: 'bg-blue-400/10   border-blue-400/30'   },
  'on the way':{ label: 'On the Way',color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/30' },
  delivered:  { label: 'Delivered',  color: 'text-emerald-400',bg: 'bg-emerald-400/10 border-emerald-400/30'},
  cancelled:  { label: 'Cancelled',  color: 'text-rose-400',   bg: 'bg-rose-400/10   border-rose-400/30'   },
}

const StatusBadge = ({ status }) => {
  const s = STATUS[status] || STATUS.pending
  return (
    <span className={`inline-flex items-center  text-[11px] font-semibold px-2 py-1 rounded-full border ${s.color} ${s.bg} whitespace-nowrap`}>
      <span className={` h-1.5 rounded-full ${s.color.replace('text', 'bg')}`} />
      {s.label}
    </span>
  )
}

// ── Order Detail Modal ───────────────────────────────────────────
const OrderModal = ({ order, onClose, onStatusUpdate }) => {
  const [status, setStatus] = useState(order.orderStatus)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  const handleUpdate = async () => {
    if (status === order.orderStatus) { onClose(); return }
    setSaving(true)
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/orders/${order._id}`,
        { orderStatus: status },
        { withCredentials: true }
      )
      onStatusUpdate(order._id, status)
      onClose()
    } catch (err) {
      console.error('Status update error:', err)
    } finally {
      setSaving(false)
    }
  }

  const customer = order.userId
  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4'
      onClick={onClose}>
      <div className='bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto'
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className='sticky top-0 z-10 bg-slate-800 border-b border-slate-700 px-6 py-4 rounded-t-2xl flex items-center justify-between'>
          <div>
            <p className='text-xs text-slate-500 font-mono'>
              #{order._id.slice(-8).toUpperCase()}
            </p>
            <h2 className='text-base font-bold text-white mt-0.5'>Order Details</h2>
          </div>
          <button onClick={onClose}
            className='text-slate-400 hover:text-white hover:bg-slate-700 p-2 rounded-lg transition-all'>
            <FiX className='w-5 h-5' />
          </button>
        </div>

        <div className='px-6 py-5 space-y-5'>

          {/* Customer + Date */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='bg-slate-800/60 border border-slate-700/50 rounded-xl p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <FiUser className='w-3.5 h-3.5 text-indigo-400' />
                <span className='text-[11px] font-bold text-slate-500 uppercase tracking-wider'>Customer</span>
              </div>
              <p className='text-sm font-semibold text-white'>{customer?.name || 'N/A'}</p>
              <p className='text-xs text-slate-500 mt-0.5 truncate'>{customer?.email || ''}</p>
            </div>
            <div className='bg-slate-800/60 border border-slate-700/50 rounded-xl p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <FiClock className='w-3.5 h-3.5 text-indigo-400' />
                <span className='text-[11px] font-bold text-slate-500 uppercase tracking-wider'>Ordered</span>
              </div>
              <p className='text-sm font-semibold text-white'>{date}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className='bg-slate-800/60 border border-slate-700/50 rounded-xl p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <FiMapPin className='w-3.5 h-3.5 text-indigo-400' />
              <span className='text-[11px] font-bold text-slate-500 uppercase tracking-wider'>Shipping Address</span>
            </div>
            <p className='text-sm text-slate-300'>{order.shippingAddress}</p>
          </div>

          {/* Items */}
          <div className='bg-slate-800/60 border border-slate-700/50 rounded-xl p-4'>
            <div className='flex items-center gap-2 mb-3'>
              <FiPackage className='w-3.5 h-3.5 text-indigo-400' />
              <span className='text-[11px] font-bold text-slate-500 uppercase tracking-wider'>
                Items ({order.items.length})
              </span>
            </div>
            <div className='space-y-3'>
              {order.items.map((item, i) => (
                <div key={i} className='flex items-center gap-3 pb-3 border-b border-slate-700/50 last:border-0 last:pb-0'>
                  <div className='w-10 h-10 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0'>
                    <img
                      src={item.productId?.image}
                      alt={item.productId?.name}
                      className='w-full h-full object-cover'
                      onError={e => { e.target.src = 'https://placehold.co/40x40/1e293b/94a3b8?text=?' }}
                    />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-white truncate'>
                      {item.productId?.name || 'Product'}
                    </p>
                    <p className='text-xs text-slate-500'>
                      Qty: {item.quantity} × Rs. {item.price?.toLocaleString()}
                    </p>
                  </div>
                  <p className='text-sm font-bold text-emerald-400 flex-shrink-0'>
                    Rs. {item.subtotal?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className='flex justify-between items-center pt-3 mt-1 border-t border-slate-700'>
              <span className='text-sm font-bold text-white'>Total</span>
              <span className='text-base font-bold text-emerald-400'>
                Rs. {order.totalPrice?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Status Update */}
          <div className='bg-slate-800/60 border border-slate-700/50 rounded-xl p-4'>
            <p className='text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3'>
              Update Order Status
            </p>
            <div className='relative'>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className='w-full bg-slate-900 border border-slate-600 text-white text-sm rounded-xl px-4 py-3 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all'
              >
                {Object.entries(STATUS).map(([val, { label }]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <FiChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4' />
            </div>
          </div>

          {/* Actions */}
          <div className='flex gap-3 pt-1'>
            <button onClick={onClose}
              className='flex-1 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition-all'>
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className='flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-xl transition-all flex items-center justify-center gap-2'
            >
              {saving && <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────
const ManageOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders`,
          { withCredentials: true })
        setOrders(res.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  // Update status locally after save — no refetch needed
  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders(prev => prev.map(o =>
      o._id === orderId ? { ...o, orderStatus: newStatus } : o
    ))
  }

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.orderStatus === filterStatus)

  const counts = Object.keys(STATUS).reduce((acc, key) => {
    acc[key] = orders.filter(o => o.orderStatus === key).length
    return acc
  }, {})

  return (
    <div className='min-h-screen bg-[#0a0f1e] text-white'>
      <div className='h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500' />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-10'>

        {/* Header */}
        <div className='mb-8'>
          <p className='text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1'>Admin Panel</p>
          <h1 className='text-3xl font-extrabold text-white tracking-tight'>Manage Orders</h1>
          <p className='text-sm text-slate-500 mt-1'>View and update customer order statuses.</p>
        </div>

        {/* Stat pills */}
        <div className='flex flex-wrap gap-2 mb-6'>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
              ${filterStatus === 'all'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
          >
            All ({orders.length})
          </button>
          {Object.entries(STATUS).map(([val, { label, color }]) => (
            <button key={val}
              onClick={() => setFilterStatus(val)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${filterStatus === val
                  ? `${color} bg-slate-700 border-slate-500`
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
            >
              {label} ({counts[val] || 0})
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className='flex flex-col items-center justify-center py-32 gap-4'>
            <div className='w-12 h-12 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin' />
            <p className='text-slate-500 text-sm'>Loading orders...</p>
          </div>
        ) : (
          <div className='rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl'>

            {/* Count bar */}
            <div className='bg-slate-800/80 px-5 py-3 border-b border-slate-700/60'>
              <p className='text-xs text-slate-400'>
                Showing <span className='text-white font-semibold'>{filtered.length}</span> of{' '}
                <span className='text-white font-semibold'>{orders.length}</span> orders
              </p>
            </div>

            <div className='overflow-x-auto'>
              <table className='min-w-full'>
                <thead className='bg-slate-800/50'>
                  <tr>
                    {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', ''].map(col => (
                      <th key={col} className='px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap'>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className='bg-[#0d1424] divide-y divide-slate-800'>
                  {filtered.length > 0 ? filtered.map(order => (
                    <tr key={order._id} className='hover:bg-slate-800/40 transition-colors group'>

                      {/* Order ID */}
                      <td className='px-5 py-4'>
                        <span className='text-xs font-mono text-slate-400'>
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className='px-5 py-4'>
                        <p className='text-sm font-semibold text-white whitespace-nowrap'>
                          {order.userId?.name || 'Unknown'}
                        </p>
                        <p className='text-xs text-slate-500 truncate max-w-[120px]'>
                          {order.userId?.email || ''}
                        </p>
                      </td>

                      {/* Items */}
                      <td className='px-5 py-4 max-w-[180px]'>
                        <p className='text-sm text-slate-300 truncate'>
                          {order.items.map(i => i.productId?.name || 'Product').join(', ')}
                        </p>
                        <p className='text-xs text-slate-500'>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      </td>

                      {/* Total */}
                      <td className='px-5 py-4'>
                        <span className='text-sm font-bold text-emerald-400 whitespace-nowrap'>
                          Rs. {order.totalPrice?.toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className='px-2 py-4'>
                        <StatusBadge status={order.orderStatus} />
                      </td>

                      {/* Date */}
                      <td className='px-5 py-4 whitespace-nowrap'>
                        <span className='text-xs text-slate-500'>
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                      </td>

                      {/* Action */}
                      <td className='px-5 py-4'>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className='opacity-0 group-hover:opacity-100 text-xs font-semibold text-indigo-400 hover:text-white bg-indigo-600/0 hover:bg-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-500/30 hover:border-indigo-500 transition-all duration-150 whitespace-nowrap'
                        >
                          View & Edit
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className='px-5 py-20 text-center'>
                        <div className='flex flex-col items-center gap-3'>
                          <div className='w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center'>
                            <FiPackage className='w-6 h-6 text-slate-600' />
                          </div>
                          <p className='text-slate-500 text-sm'>No orders found.</p>
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
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}

export default ManageOrders