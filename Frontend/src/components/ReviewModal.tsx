import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { UserContext } from './context/UserContext'
import StarRating from './StarRating'
import { getErrorMessage } from '../utils/errorUtils'
import { FiX, FiStar, FiCheckCircle, FiLogIn } from 'react-icons/fi'

interface ReviewModalProps {
  open: boolean
  onClose: () => void
  onSubmitted?: () => void
}

const ReviewModal = ({ open, onClose, onSubmitted }: ReviewModalProps) => {
  const { user } = useContext(UserContext)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setRating(0)
      setComment('')
      setError('')
      setSuccess(false)
      setSubmitting(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = async () => {
    if (rating < 1) {
      setError('Please select a star rating')
      return
    }
    if (comment.trim().length < 3) {
      setError('Please write at least 3 characters')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/reviews/`,
        { rating, comment: comment.trim() },
        { withCredentials: true }
      )
      setSuccess(true)
      onSubmitted?.()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to submit your review. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#121A2E] border border-[#232F49] rounded-2xl shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#182238] rounded-lg transition z-10"
        >
          <FiX className="w-4 h-4" />
        </button>

        {!user ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#0A0E1A] border border-[#232F49] flex items-center justify-center">
              <FiLogIn className="w-6 h-6 text-[#5B8DEF]" />
            </div>
            <h3 className="font-display text-lg text-[#EDF1F7] mb-2">Sign in to review</h3>
            <p className="text-sm text-[#8592AC] font-body mb-6">
              You need an account so we know the review is genuine.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                to="/login"
                className="px-5 py-2.5 bg-[#5B8DEF] hover:bg-[#4A7CE0] text-[#0A0E1A] rounded-lg text-sm font-semibold transition"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 bg-[#182238] hover:bg-[#1E2A42] text-[#EDF1F7] border border-[#232F49] rounded-lg text-sm font-semibold transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <FiCheckCircle className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="font-display text-lg text-[#EDF1F7] mb-2">Thank you!</h3>
            <p className="text-sm text-[#8592AC] font-body mb-6">
              Your review has been submitted and is awaiting moderation. It will appear once
              approved.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#5B8DEF] hover:bg-[#4A7CE0] text-[#0A0E1A] rounded-lg text-sm font-semibold transition"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-7">
            <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-1">
              // Write a review
            </p>
            <h3 className="font-display text-xl text-[#EDF1F7] mb-1">Share your experience</h3>
            <p className="text-xs text-[#8592AC] font-body mb-5">
              Posting as <span className="text-[#EDF1F7]">{user.name || user.email}</span>
            </p>

            <div className="mb-5">
              <label className="block text-[11px] font-mono text-[#8592AC] uppercase tracking-wider mb-2">
                Your rating
              </label>
              <div className="flex items-center gap-3">
                <StarRating rating={rating} onChange={setRating} size={26} />
                <span className="text-sm text-[#EDF1F7] font-display">
                  {rating > 0 ? `${rating} / 5` : 'Select'}
                </span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[11px] font-mono text-[#8592AC] uppercase tracking-wider mb-2">
                Your review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="What did you like or dislike? How was your experience?"
                className="w-full bg-[#0A0E1A] border border-[#232F49] focus:border-[#5B8DEF] rounded-xl px-4 py-3 text-sm text-[#EDF1F7] placeholder:text-[#5C6270] outline-none resize-none transition-colors font-body"
              />
              <p className="text-[10px] font-mono text-[#5C6270] text-right mt-1">
                {comment.length}/1000
              </p>
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-body mb-4">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 bg-[#5B8DEF] hover:bg-[#4A7CE0] disabled:opacity-60 text-[#0A0E1A] rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              <FiStar className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewModal
