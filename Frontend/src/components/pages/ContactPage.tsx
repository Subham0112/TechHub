import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiStar,
  FiMessageSquare, FiCheckCircle, FiAlertCircle,
} from 'react-icons/fi'
import StarRating from '../StarRating'
import ReviewModal from '../ReviewModal'
import { getErrorMessage } from '../../utils/errorUtils'
import type { Review, ReviewSummary } from '../../types'

const INFO_CARDS = [
  { icon: FiMail, label: 'Email', value: 'support@techhub.com', note: 'We reply within 24 hours' },
  { icon: FiPhone, label: 'Phone', value: '+977 1-4567890', note: 'Sun – Fri, 9:00 – 18:00' },
  { icon: FiMapPin, label: 'Address', value: 'New Baneshwor, Kathmandu', note: 'Nepal' },
  { icon: FiClock, label: 'Working Hours', value: 'Sun – Fri', note: '9:00 AM – 6:00 PM' },
]

interface FormState {
  name: string
  email: string
  subject: string
  message: string
}

const emptyForm: FormState = { name: '', email: '', subject: '', message: '' }

const inputCls =
  'w-full bg-[#0A0E1A] border border-[#232F49] focus:border-[#5B8DEF] rounded-xl px-4 py-3 text-sm text-[#EDF1F7] placeholder:text-[#5C6270] outline-none transition-colors font-body'

const ContactPage = () => {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState('')

  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<ReviewSummary>({ rating: 0, reviewCount: 0 })
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchReviews = async () => {
    try {
      const res = await axios.get<{ summary: ReviewSummary; reviews: Review[] }>(
        `${import.meta.env.VITE_API_URL}/reviews/site`
      )
      setReviews(res.data.reviews)
      setSummary(res.data.summary)
    } catch (err) {
      console.error('Site reviews fetch error:', err)
    } finally {
      setReviewsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const validate = (): Partial<Record<keyof FormState, string>> => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (form.name.trim().length < 2) e.name = 'Please enter your name'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Please enter a valid email'
    if (form.subject.trim().length < 2) e.subject = 'Please enter a subject'
    if (form.message.trim().length < 5) e.message = 'Message must be at least 5 characters'
    return e
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validate()
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }
    setSendError('')
    setSending(true)
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/contact/`, {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      })
      setForm(emptyForm)
      setSent(true)
    } catch (err) {
      setSendError(getErrorMessage(err, 'Failed to send your message. Please try again.'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0A0E1A] text-[#EDF1F7] px-4 py-10">
      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-2">
            // Contact
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-semibold text-[#EDF1F7] mb-3">
            Get in Touch
          </h1>
          <p className="text-[#8592AC] text-sm font-body max-w-xl mx-auto">
            Questions about an order, a product, or anything else? Drop us a message and our
            team will get back to you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 mb-16">
          {/* Contact info — plain rows with hairline dividers */}
          <div className="lg:col-span-2">
            <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-4">
              // Reach us
            </p>
            <div className="border-t border-[#232F49] divide-y divide-[#232F49]">
              {INFO_CARDS.map(({ icon: Icon, label, value, note }) => (
                <div key={label} className="flex items-start gap-4 py-5">
                  <div className="w-9 h-9 rounded-lg bg-[#121A2E] border border-[#232F49] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#5B8DEF]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest">
                      {label}
                    </p>
                    <p className="text-sm text-[#EDF1F7] font-display mt-1 truncate">{value}</p>
                    <p className="text-xs text-[#8592AC] font-body mt-0.5">{note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact form — plain, no card */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="py-12 text-center border-t border-[#232F49]">
                <FiCheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
                <h2 className="text-xl font-display text-[#EDF1F7] mb-2">Message sent!</h2>
                <p className="text-sm text-[#8592AC] font-body mb-6">
                  Thanks for reaching out. We'll get back to you soon.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="px-5 py-2.5 border border-[#232F49] hover:border-[#5B8DEF]/60 text-[#EDF1F7] rounded-lg text-sm font-semibold transition"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="border-t border-[#232F49] pt-6">
                <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-1">
                  // Send a message
                </p>
                <h2 className="text-xl font-display text-[#EDF1F7] mb-6">Contact form</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[11px] font-mono text-[#8592AC] uppercase tracking-wider mb-2">
                      Your name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={inputCls}
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-400 mt-1 font-body">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-[#8592AC] uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-400 mt-1 font-body">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-[11px] font-mono text-[#8592AC] uppercase tracking-wider mb-2">
                    Subject
                  </label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className={inputCls}
                  />
                  {errors.subject && (
                    <p className="text-xs text-rose-400 mt-1 font-body">{errors.subject}</p>
                  )}
                </div>

                <div className="mb-5">
                  <label className="block text-[11px] font-mono text-[#8592AC] uppercase tracking-wider mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    maxLength={2000}
                    placeholder="Tell us a little more..."
                    className={`${inputCls} resize-none`}
                  />
                  {errors.message && (
                    <p className="text-xs text-rose-400 mt-1 font-body">{errors.message}</p>
                  )}
                </div>

                {sendError && (
                  <div className="flex items-center gap-2 text-xs text-rose-400 font-body mb-4">
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                    {sendError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3.5 bg-[#5B8DEF] hover:bg-[#4A7CE0] disabled:opacity-60 text-[#0A0E1A] rounded-xl font-semibold text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <FiSend className="w-4 h-4" />
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Reviews section — plain, no cards ── */}
        <div id="reviews" className="border-t border-[#232F49] pt-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-2">
                // Reviews
              </p>
              <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[#EDF1F7]">
                What our customers say
              </h2>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="self-start sm:self-auto px-5 py-3 bg-[#FFB238] hover:bg-[#ffc158] text-[#0A0E1A] rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <FiStar className="w-4 h-4" />
              Write a Review
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Summary — plain typography */}
            <div className="lg:col-span-1">
              <p className="text-5xl font-display font-semibold text-[#EDF1F7] mb-1">
                {summary.reviewCount > 0 ? summary.rating.toFixed(1) : '—'}
              </p>
              <StarRating rating={summary.rating} size={16} className="mb-2" />
              <p className="text-xs text-[#8592AC] font-mono uppercase tracking-wider">
                {summary.reviewCount} review{summary.reviewCount !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-[#8592AC] font-body leading-relaxed mt-4 pt-4 border-t border-[#232F49]">
                Reviews from real customers, moderated by our team before publishing.
              </p>
            </div>

            {/* Review list — plain rows divided by hairlines */}
            <div className="lg:col-span-3">
              {reviewsLoading ? (
                <div className="flex justify-center py-16">
                  <div className="w-9 h-9 border-4 border-[#232F49] border-t-[#5B8DEF] rounded-full animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="border border-dashed border-[#232F49] rounded-xl py-14 flex flex-col items-center text-center px-6">
                  <FiMessageSquare className="w-6 h-6 text-[#5C6270] mb-4" />
                  <p className="text-sm text-[#EDF1F7] font-display mb-1">No reviews yet</p>
                  <p className="text-xs text-[#8592AC] font-body mb-5">
                    Be the first to share your experience with TechHub.
                  </p>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-5 py-2.5 bg-[#5B8DEF] hover:bg-[#4A7CE0] text-[#0A0E1A] rounded-lg text-sm font-semibold transition"
                  >
                    Write the first review
                  </button>
                </div>
              ) : (
                <div className="border-t border-[#232F49] divide-y divide-[#232F49]">
                  {reviews.map((review) => (
                    <div key={review.id} className="py-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} size={13} />
                          {review.status !== 'approved' && (
                            <span
                              className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                review.status === 'pending'
                                  ? 'text-amber-400 border-amber-400/30 bg-amber-400/10'
                                  : 'text-rose-400 border-rose-400/30 bg-rose-400/10'
                              }`}
                            >
                              {review.status}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-[#5C6270]">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-[#8592AC] font-body leading-relaxed mb-3">
                        {review.comment}
                      </p>
                      <p className="text-xs text-[#EDF1F7] font-display">
                        {review.user?.name || 'Verified customer'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitted={fetchReviews}
      />
    </div>
  )
}

export default ContactPage
