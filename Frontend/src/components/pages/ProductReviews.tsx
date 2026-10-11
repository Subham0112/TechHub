import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FiMessageSquare } from 'react-icons/fi'
import { UserContext } from '../context/UserContext'
import StarRating from '../StarRating'
import type { Review, ReviewSummary } from '../../types'

interface ProductReviewsProps {
  productId: number
  isAdmin?: boolean
}

const ProductReviews = ({ productId, isAdmin }: ProductReviewsProps) => {
  const navigate = useNavigate()
  const { user } = useContext(UserContext)
  const [summary, setSummary] = useState<ReviewSummary>({ rating: 0, reviewCount: 0 })
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const myId = user ? String(user._id ?? user.id ?? '') : ''
  const myReview = reviews.find((r) => String(r.userId) === myId)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get<{
        summary: ReviewSummary
        reviews: Review[]
      }>(`${import.meta.env.VITE_API_URL}/reviews/product/${productId}`)
      setSummary(res.data.summary)
      setReviews(res.data.reviews)
      if (res.data.reviews.find((r) => String(r.userId) === myId)) {
        const mine = res.data.reviews.find((r) => String(r.userId) === myId)
        if (mine) {
          setRating(mine.rating)
          setComment(mine.comment)
        }
      }
    } catch (err) {
      console.error('Reviews fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [productId, myId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    if (rating < 1) {
      setFormError('Please select a star rating')
      return
    }
    if (comment.trim().length < 3) {
      setFormError('Please write at least 3 characters')
      return
    }
    setSubmitting(true)
    try {
      const res = await axios.post<Review>(`${import.meta.env.VITE_API_URL}/reviews`, {
        productId,
        rating,
        comment: comment.trim(),
      })
      const saved = res.data
      setReviews((prev) => {
        const exists = prev.find((r) => String(r.userId) === myId)
        if (exists) return prev.map((r) => (String(r.userId) === myId ? saved : r))
        return [saved, ...prev]
      })
      setFormSuccess(
        myReview
          ? 'Thanks! Your updated review is awaiting moderation.'
          : 'Thanks! Your review is awaiting moderation.'
      )
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to submit review'
        : 'Failed to submit review'
      setFormError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="reviews" className="mb-16">
      <div className="flex items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-[11px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-2">Customer feedback</p>
          <h2 className="text-xl md:text-2xl font-display font-semibold text-[#EDF1F7]">Ratings & Reviews</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary + form */}
        <div className="space-y-5">
          <div className="bg-[#121A2E] border border-[#232F49] rounded-2xl p-6 text-center">
            <p className="text-5xl font-display font-bold text-[#FFB238] mb-2">
              {summary.reviewCount > 0 ? summary.rating.toFixed(1) : '—'}
            </p>
            <div className="flex justify-center mb-2">
              <StarRating rating={summary.rating} size={16} />
            </div>
            <p className="text-xs font-mono text-[#8592AC] uppercase tracking-wide">
              {summary.reviewCount} review{summary.reviewCount !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Write review */}
          {!isAdmin && (
            <div className="bg-[#121A2E] border border-[#232F49] rounded-2xl p-6">
              <h3 className="text-sm font-display font-semibold text-[#EDF1F7] mb-4">
                {myReview ? 'Update your review' : 'Write a review'}
              </h3>

              {user ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <p className="text-[10px] font-mono text-[#8592AC] uppercase tracking-widest mb-2">Your rating</p>
                    <StarRating rating={rating} onChange={setRating} size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-[#8592AC] uppercase tracking-widest mb-2">Your review</p>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      maxLength={1000}
                      placeholder="Share your experience with this product..."
                      className="w-full bg-[#0A0E1A] border border-[#232F49] focus:border-[#5B8DEF] rounded-lg outline-none text-sm text-[#EDF1F7] placeholder:text-[#8592AC] p-3.5 font-body resize-none transition-colors"
                    />
                    <p className="text-[10px] font-mono text-[#5C6270] mt-1 text-right">{comment.length}/1000</p>
                  </div>

                  {formError && (
                    <p className="text-xs text-rose-400 bg-rose-400/10 border border-rose-400/30 rounded-lg px-3 py-2">
                      {formError}
                    </p>
                  )}
                  {formSuccess && (
                    <p className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 rounded-lg px-3 py-2">
                      {formSuccess}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#5B8DEF] hover:bg-[#4A7CE0] disabled:opacity-60 text-[#0A0E1A] rounded-lg font-mono font-semibold text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    {submitting ? 'Submitting...' : myReview ? 'Update Review' : 'Submit Review'}
                  </button>
                  <p className="text-[10px] text-[#5C6270] font-body text-center">
                    Reviews are approved by an admin before appearing publicly.
                  </p>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-sm text-[#8592AC] font-body">Login to share your experience.</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-3 bg-[#5B8DEF] hover:bg-[#4A7CE0] text-[#0A0E1A] rounded-lg font-mono font-semibold text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    Log In to Review
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Review list */}
        <div className="lg:col-span-2">
          <div className="bg-[#121A2E] border border-[#232F49] rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#232F49] border-t-[#5B8DEF] rounded-full animate-spin" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-20 flex flex-col items-center gap-3 px-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#0A0E1A] border border-[#232F49] flex items-center justify-center">
                  <FiMessageSquare className="w-5 h-5 text-[#8592AC]" />
                </div>
                <p className="text-sm text-[#8592AC] font-body">
                  No reviews yet. Be the first to review this product.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#232F49]">
                {reviews.map((review) => {
                  const isMine = String(review.userId) === myId
                  return (
                    <div key={review._id} className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#182238] border border-[#232F49] flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-mono font-bold text-[#5B8DEF]">
                              {(review.user?.name || '?').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#EDF1F7]">
                              {review.user?.name || 'Customer'}
                              {isMine && <span className="ml-2 text-[10px] font-mono text-[#5B8DEF] uppercase">(you)</span>}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <StarRating rating={review.rating} size={11} />
                              <span className="text-[10px] font-mono text-[#5C6270]">
                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.status !== 'approved' && (
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded border bg-amber-400/10 text-amber-300 border-amber-400/30 whitespace-nowrap">
                            {review.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#8592AC] font-body leading-relaxed pl-12">
                        {review.comment}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductReviews
