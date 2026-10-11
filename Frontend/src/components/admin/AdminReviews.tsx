import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { FiStar, FiCheck, FiX, FiTrash2, FiMessageSquare } from 'react-icons/fi'
import type { AlertData, Review, ReviewStats, ReviewStatus } from '../../types'
import StarRating from '../StarRating'

interface AdminReviewsProps {
  handleAlert?: (alert: AlertData) => void
}

const FILTERS: { key: ReviewStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

const STATUS_STYLES: Record<ReviewStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
}

const AUTH = { withCredentials: true }

const AdminReviews = ({ handleAlert }: AdminReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ReviewStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetchReviews = useCallback(async (targetPage: number, status: ReviewStatus | 'all') => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(targetPage) }
      if (status !== 'all') params.status = status
      const res = await axios.get<{
        reviews: Review[]
        stats: ReviewStats
        page: number
        hasMore: boolean
      }>(`${import.meta.env.VITE_API_URL}/reviews`, { ...AUTH, params })
      setReviews((prev) => (targetPage === 1 ? res.data.reviews : [...prev, ...res.data.reviews]))
      setStats(res.data.stats)
      setHasMore(res.data.hasMore)
      setPage(res.data.page)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReviews(1, filter)
  }, [filter, fetchReviews])

  const setStatus = async (review: Review, status: ReviewStatus) => {
    try {
      const res = await axios.patch<Review>(
        `${import.meta.env.VITE_API_URL}/reviews/${review.id}`,
        { status },
        AUTH
      )
      setReviews((prev) => prev.map((r) => (r.id === review.id ? res.data : r)))
      setStats((prev) => {
        if (!prev) return prev
        const oldStatus = review.status
        if (oldStatus === status) return prev
        return {
          ...prev,
          [oldStatus]: Math.max(prev[oldStatus] - 1, 0),
          [status]: prev[status] + 1,
        }
      })
      if (filter !== 'all' && status !== filter) {
        setReviews((prev) => prev.filter((r) => r.id !== review.id))
      }
      handleAlert?.({
        type: 'success',
        title: `Review ${status}`,
        description: review.product?.name ?? 'Site feedback',
      })
    } catch (err) {
      console.error(err)
      handleAlert?.({ type: 'danger', title: 'Failed to update review' })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/reviews/${deleteId}`, AUTH)
      const removed = reviews.find((r) => r.id === deleteId)
      setReviews((prev) => prev.filter((r) => r.id !== deleteId))
      if (removed) {
        setStats((prev) =>
          prev
            ? { ...prev, total: Math.max(prev.total - 1, 0), [removed.status]: Math.max(prev[removed.status] - 1, 0) }
            : prev
        )
      }
      handleAlert?.({ type: 'success', title: 'Review deleted' })
    } catch (err) {
      console.error(err)
      handleAlert?.({ type: 'danger', title: 'Failed to delete review' })
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total Reviews', value: stats?.total ?? 0, tone: 'text-[var(--adm-heading)]' },
          { label: 'Average Rating', value: stats ? `${stats.averageRating} ★` : '—', tone: 'text-amber-500' },
          { label: 'Pending', value: stats?.pending ?? 0, tone: 'text-amber-600 dark:text-amber-400' },
          { label: 'Approved', value: stats?.approved ?? 0, tone: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Rejected', value: stats?.rejected ?? 0, tone: 'text-rose-600 dark:text-rose-400' },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-xl px-5 py-4">
            <p className="text-[10px] font-mono text-[var(--adm-muted)] uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-display font-bold mt-1 ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap border transition cursor-pointer ${
              filter === key
                ? 'bg-[var(--adm-accent)] text-[var(--adm-accent-contrast)] border-[var(--adm-accent)]'
                : 'bg-[var(--adm-card)] text-[var(--adm-muted)] border-[var(--adm-border)] hover:text-[var(--adm-heading)] hover:bg-[var(--adm-chip)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[var(--adm-border)] border-t-[var(--adm-accent)] animate-spin" />
          <p className="text-[var(--adm-muted)] text-sm font-mono">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-[var(--adm-border)] bg-[var(--adm-card)] py-24 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[var(--adm-subtle)] border border-[var(--adm-border)] flex items-center justify-center">
            <FiMessageSquare className="w-6 h-6 text-[var(--adm-dim)]" />
          </div>
          <p className="text-sm text-[var(--adm-muted)]">No {filter !== 'all' ? filter : ''} reviews found.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--adm-border)] overflow-hidden">
          <div className="divide-y divide-[var(--adm-border)] bg-[var(--adm-card)]">
            {reviews.map((review) => (
              <div key={review.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Product + user */}
                <div className="flex items-center gap-3 sm:w-64 flex-shrink-0">
                  {review.product?.image ? (
                    <img
                      src={review.product.image}
                      alt={review.product.name}
                      className="w-11 h-11 rounded-lg object-cover border border-[var(--adm-border)] flex-shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-[var(--adm-chip)] border border-[var(--adm-border)] flex items-center justify-center flex-shrink-0">
                      <FiStar className="w-4 h-4 text-[var(--adm-dim)]" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--adm-heading)] truncate">
                      {review.product?.name ?? '★ Site feedback'}
                    </p>
                    <p className="text-[11px] text-[var(--adm-dim)] truncate">by {review.user?.name ?? 'Unknown'}</p>
                  </div>
                </div>

                {/* Rating + comment */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={review.rating} size={13} />
                    <span className="text-[11px] font-mono text-[var(--adm-dim)]">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--adm-muted)] leading-snug line-clamp-2">{review.comment}</p>
                </div>

                {/* Status + actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${STATUS_STYLES[review.status]}`}>
                    {review.status}
                  </span>
                  {review.status !== 'approved' && (
                    <button
                      onClick={() => setStatus(review, 'approved')}
                      title="Approve"
                      className="p-2 rounded-lg text-[var(--adm-muted)] hover:text-emerald-500 hover:bg-emerald-500/10 transition cursor-pointer"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button
                      onClick={() => setStatus(review, 'rejected')}
                      title="Reject"
                      className="p-2 rounded-lg text-[var(--adm-muted)] hover:text-amber-500 hover:bg-amber-500/10 transition cursor-pointer"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteId(review.id)}
                    title="Delete review"
                    className="p-2 rounded-lg text-[var(--adm-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="bg-[var(--adm-subtle)] border-t border-[var(--adm-border)] px-5 py-4 text-center">
              <button
                onClick={() => fetchReviews(page + 1, filter)}
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold text-[var(--adm-muted)] hover:text-[var(--adm-heading)] bg-[var(--adm-card)] border border-[var(--adm-border)] hover:bg-[var(--adm-chip)] rounded-lg transition disabled:opacity-60 cursor-pointer"
              >
                {loading ? 'Loading...' : 'Load more reviews'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div
            className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
              <FiTrash2 className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-[var(--adm-heading)]">Delete this review?</h3>
            <p className="text-sm text-[var(--adm-muted)] mt-1.5">
              The review will be permanently removed. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-[var(--adm-muted)] hover:text-[var(--adm-heading)] bg-[var(--adm-chip)] hover:bg-[var(--adm-chip-hover)] rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition cursor-pointer"
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReviews
