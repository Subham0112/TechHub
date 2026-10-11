import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { getImageUrl, onImageError } from '../../utils/imageUtils'
import { getErrorMessage } from '../../utils/errorUtils'
import { StatusBadge } from '../pages/ManageOrders'
import RevenueChart from './RevenueChart'
import type { AdminStats, Order, OrderStatus, Product } from '../../types'
import {
  FiTrendingUp, FiShoppingBag, FiPackage, FiUsers, FiFileText,
  FiAlertTriangle, FiArrowUpRight, FiArrowDownRight
} from 'react-icons/fi'
import type { IconType } from 'react-icons'

const StatCard = ({ label, value, icon: Icon, accent, sub }: {
  label: string;
  value: string | number;
  icon: IconType;
  accent: string;
  sub?: string;
}) => (
  <div className="relative overflow-hidden bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-lg pl-4 pr-3 py-2.5">
    <div className={`absolute top-0 left-0 w-[3px] h-full ${accent}`} />
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[9px] font-mono text-[var(--adm-muted)] uppercase tracking-widest truncate">
          {label}
        </p>
        <p className="text-lg leading-tight font-display font-semibold text-[var(--adm-heading)] truncate">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
      <div className="w-8 h-8 rounded-md bg-[var(--adm-subtle)] flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-[var(--adm-dim)]" />
      </div>
    </div>
    {sub && (
      <p className="text-[10px] text-[var(--adm-dim)] font-mono mt-0.5 truncate">{sub}</p>
    )}
  </div>
)

const StatusBreakdown = ({ counts, total }: {
  counts: Partial<Record<OrderStatus, number>>;
  total: number;
}) => {
  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-[var(--st-amber)]',
    accepted: 'bg-[var(--adm-accent)]',
    preparing: 'bg-[var(--st-orange)]',
    'on the way': 'bg-[var(--adm-accent-70)]',
    delivered: 'bg-[var(--st-emerald)]',
    cancelled: 'bg-[var(--st-rose)]',
  }
  const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending',
    accepted: 'Accepted',
    preparing: 'Preparing',
    'on the way': 'On the Way',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }

  return (
    <div className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-xl p-5">
      <p className="text-[10px] font-mono text-[var(--adm-muted)] uppercase tracking-widest mb-4">Order Status</p>
      {total === 0 ? (
        <p className="text-sm text-[var(--adm-dim)] font-mono py-6 text-center">No orders yet</p>
      ) : (
        <div className="space-y-3">
          {Object.entries(STATUS_LABELS).map(([key, label]) => {
            const count = counts[key as OrderStatus] || 0
            const pct = Math.round((count / total) * 100)
            return (
              <div key={key}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[var(--adm-muted)] font-mono">{label}</span>
                  <span className="text-[var(--adm-heading)] font-mono font-semibold">{count}</span>
                </div>
                <div className="h-1.5 bg-[var(--adm-subtle)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${STATUS_COLORS[key]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const RANGES = [
  { value: '7', label: '7D' },
  { value: '30', label: '30D' },
  { value: '90', label: '90D' },
] as const

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<string>('30')

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/stats?days=${range}`,
          { withCredentials: true }
        )
        setStats(res.data)
      } catch (err) {
        console.error(err)
        setError(getErrorMessage(err, 'Failed to load analytics'))
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [range])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--adm-border)] border-t-[var(--adm-accent)] animate-spin" />
        <p className="text-[var(--adm-muted)] text-sm font-mono">Loading analytics...</p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-[var(--adm-card)] border border-[var(--st-rose-border)] rounded-xl px-6 py-8 text-center">
          <p className="text-[var(--st-rose)] font-mono text-sm">{error || 'Failed to load analytics'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-[var(--adm-accent)] text-sm hover:text-[var(--adm-accent-hover)] font-medium cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const periodRevenue = stats.salesByDay.reduce((sum, d) => sum + d.revenue, 0)
  const prevRevenue = stats.previousPeriodRevenue || 0
  const deltaPct =
    prevRevenue > 0 ? ((periodRevenue - prevRevenue) / prevRevenue) * 100 : null
  const deltaLabel = stats.salesByDay.length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Revenue"
          value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
          icon={FiTrendingUp}
          accent="bg-emerald-500"
          sub={`Rs. ${stats.deliveredRevenue.toLocaleString()} from delivered`}
        />
        <StatCard label="Total Orders" value={stats.totalOrders} icon={FiShoppingBag} accent="bg-[var(--adm-accent)]" sub="All time" />
        <StatCard label="Products" value={stats.totalProducts} icon={FiPackage} accent="bg-[var(--adm-accent-70)]" sub="In catalog" />
        <StatCard label="Customers" value={stats.totalCustomers} icon={FiUsers} accent="bg-amber-500" sub={`Avg. order Rs. ${stats.averageOrderValue.toLocaleString()}`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <p className="text-[10px] font-mono text-[var(--adm-muted)] uppercase tracking-widest mb-1">Revenue Analytics</p>
              <div className="flex items-center gap-3">
                <h3 className="text-base font-display font-semibold text-[var(--adm-heading)]">
                  Rs. {periodRevenue.toLocaleString()}
                </h3>
                {deltaPct !== null && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                      deltaPct >= 0
                        ? 'text-[var(--st-emerald)] bg-[var(--st-emerald-soft)] border-[var(--st-emerald-border)]'
                        : 'text-[var(--st-rose)] bg-[var(--st-rose-soft)] border-[var(--st-rose-border)]'
                    }`}
                  >
                    {deltaPct >= 0
                      ? <FiArrowUpRight className="w-3 h-3" />
                      : <FiArrowDownRight className="w-3 h-3" />}
                    {Math.abs(deltaPct).toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[var(--adm-dim)] font-mono mt-0.5">
                Last {deltaLabel} days{deltaPct !== null ? ` · vs previous ${deltaLabel} days` : ''}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-[var(--adm-subtle)] border border-[var(--adm-border)] rounded-lg p-1">
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={`px-3 py-1.5 text-[11px] font-mono font-semibold rounded-md transition-colors cursor-pointer ${
                    range === r.value
                      ? 'bg-[var(--adm-accent)] text-[var(--adm-accent-contrast)]'
                      : 'text-[var(--adm-dim)] hover:text-[var(--adm-heading)]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <RevenueChart data={stats.salesByDay} />
        </div>
        <StatusBreakdown counts={stats.statusCounts} total={stats.totalOrders} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--adm-border)]">
            <div>
              <p className="text-[10px] font-mono text-[var(--adm-muted)] uppercase tracking-widest mb-1">Recent Orders</p>
              <h3 className="text-base font-display font-semibold text-[var(--adm-heading)]">Latest Transactions</h3>
            </div>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-mono text-[var(--adm-accent)] hover:text-[var(--adm-accent-hover)] uppercase tracking-wide font-semibold"
            >
              View all <FiArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[var(--adm-subtle)]">
                <tr>
                  {['Order', 'Customer', 'Total', 'Status', 'Date'].map((col) => (
                    <th key={col} className="px-5 py-3 text-left text-[10px] font-mono font-bold text-[var(--adm-muted)] uppercase tracking-widest whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--adm-border)]">
                {stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order: Order) => (
                    <tr key={order._id} className="hover:bg-[var(--adm-subtle)] transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-[var(--adm-muted)] whitespace-nowrap">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[var(--adm-heading)] whitespace-nowrap">
                        {typeof order.userId === 'string' ? 'Unknown' : (order.userId?.name || 'Unknown')}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-[var(--adm-money)] whitespace-nowrap">
                        Rs. {order.totalPrice?.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={order.orderStatus} /></td>
                      <td className="px-5 py-3.5 text-xs text-[var(--adm-dim)] font-mono whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-[var(--adm-dim)] font-mono">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--adm-border)] flex items-center gap-2">
            <FiTrendingUp className="w-4 h-4 text-[var(--adm-accent)]" />
            <h3 className="text-base font-display font-semibold text-[var(--adm-heading)]">Top Products</h3>
          </div>
          <div className="divide-y divide-[var(--adm-border)]">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="text-[10px] font-mono font-bold text-[var(--adm-dim)] w-4">#{i + 1}</span>
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-[var(--adm-subtle)] border border-[var(--adm-border)] flex-shrink-0">
                    <img
                      src={getImageUrl(p.image)}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={onImageError}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--adm-heading)] truncate">{p.name}</p>
                    <p className="text-[11px] text-[var(--adm-dim)] font-mono">{p.unitsSold} sold</p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[var(--adm-money)] flex-shrink-0">
                    Rs. {p.revenue?.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="px-5 py-10 text-center text-sm text-[var(--adm-dim)] font-mono">No sales yet</p>
            )}
          </div>
        </div>
      </div>

      {stats.lowStockProducts.length > 0 && (
        <div className="bg-[var(--adm-card)] border border-[var(--st-amber-border)] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--adm-border)] flex items-center gap-2">
            <FiAlertTriangle className="w-4 h-4 text-[var(--st-amber)]" />
            <h3 className="text-base font-display font-semibold text-[var(--adm-heading)]">Low Stock Alert</h3>
            <span className="text-xs text-[var(--adm-dim)] font-mono ml-auto">
              {stats.lowStockProducts.length} product{stats.lowStockProducts.length > 1 ? 's' : ''} running low
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
            {stats.lowStockProducts.map((p: Product) => (
              <div key={p._id} className="bg-[var(--adm-subtle)] border border-[var(--adm-border)] rounded-lg px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-[var(--adm-heading)] truncate">{p.name}</p>
                  <p className="text-[11px] font-mono text-[var(--adm-dim)] mt-0.5">
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </p>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full border flex-shrink-0 ${
                  p.stock === 0
                    ? 'text-[var(--st-rose)] bg-[var(--st-rose-soft)] border-[var(--st-rose-border)]'
                    : 'text-[var(--st-amber)] bg-[var(--st-amber-soft)] border-[var(--st-amber-border)]'
                }`}>
                  {p.stock === 0 ? 'OUT' : 'LOW'}
                </span>
              </div>
            ))}
          </div>
          <div className="px-4 pb-4">
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-1 text-xs font-mono text-[var(--st-amber)] hover:text-[var(--st-amber-strong)] uppercase tracking-wide font-semibold"
            >
              Restock now <FiArrowDownRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center gap-2 text-[10px] font-mono text-[var(--adm-dim)]">
        <FiFileText className="w-3.5 h-3.5" />
        Revenue reflects paid, non-cancelled orders
      </div>
    </div>
  )
}

export default AdminDashboard