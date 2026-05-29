// components/pages/CheckoutPage.jsx
import React, { useState, useContext } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { FiArrowLeft, FiMapPin, FiPackage, FiCheckCircle, FiShoppingBag } from 'react-icons/fi'

const Step = ({ number, label, active, done }) => (
  <div className='flex items-center gap-2'>
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
      ${done ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/25' : 'bg-slate-700 text-slate-400'}`}>
      {done ? <FiCheckCircle className='w-4 h-4' /> : number}
    </div>
    <span className={`text-sm font-medium hidden sm:block ${active ? 'text-white' : done ? 'text-emerald-400' : 'text-slate-500'}`}>
      {label}
    </span>
  </div>
)

const Divider = () => <div className='flex-1 h-px bg-slate-700 mx-2 hidden sm:block' />

// ── Input component ─────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div>
    <label className='block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5'>
      {label}
    </label>
    {children}
    {error && <p className='text-red-400 text-xs mt-1'>{error}</p>}
  </div>
)

const inputCls = (err) =>
  `w-full bg-slate-800 border ${err ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-indigo-500'}
   text-white text-sm rounded-xl px-4 py-3 placeholder-slate-600
   focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`


const SuccessScreen = ({ onContinue }) => (
  <div className='min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4'>
    <div className='text-center max-w-md'>
      <div className='relative mx-auto w-24 h-24 mb-6'>
        <div className='absolute inset-0 bg-emerald-500/20 rounded-full animate-ping' />
        <div className='relative w-24 h-24 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center'>
          <FiCheckCircle className='w-12 h-12 text-emerald-400' />
        </div>
      </div>
      <h2 className='text-3xl font-extrabold text-white mb-3'>Order Placed!</h2>
      <p className='text-slate-400 text-sm mb-8'>
        Your order has been confirmed. You'll receive a confirmation soon.
      </p>
      <button
        onClick={onContinue}
        className='inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/40'
      >
        <FiShoppingBag className='w-4 h-4' />
        Continue Shopping
      </button>
    </div>
  </div>
)

// ── Main Checkout ───────────────────────────────────────────────
const CheckoutPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1 = address, 2 = review, 3 = success
  const [placing, setPlacing] = useState(false)
  const [errors, setErrors] = useState({})
  const { cartItems } = useContext(CartContext)

  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: '',
    notes: '',
  })

  // products here are actually cartItems: { productId: {...}, quantity, _id }
  const items = cartItems.map(item => ({
    id: item.productId?._id,
    name: item.productId?.name,
    image: item.productId?.image,
    price: item.productId?.price || 0,
    quantity: item.quantity,
    subtotal: (item.productId?.price || 0) * item.quantity,
  }))

  const totalPrice = items.reduce((sum, i) => sum + i.subtotal, 0)

  // ── Validation ──
  const validate = () => {
    const e = {}
    if (!address.fullName.trim()) e.fullName = 'Full name is required'
    if (!address.phone.trim())    e.phone    = 'Phone number is required'
    if (!address.street.trim())   e.street   = 'Street address is required'
    if (!address.city.trim())     e.city     = 'City is required'
    if (!address.state.trim())    e.state    = 'State / Province is required'
    
    if (!address.country.trim())  e.country  = 'Country is required'
    return e
  }

  const handleAddressNext = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setStep(2)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setAddress(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  // Build the full shipping address string for the backend
  const buildShippingAddress = () =>
    `${address.fullName}, ${address.street}, ${address.city}, ${address.state} , ${address.country}${address.notes ? ` (${address.notes})` : ''}`

  // ── Place Order — one POST per cart item ──
  const handlePlaceOrder = async () => {
  setPlacing(true)
  try {
    const shippingAddress = buildShippingAddress()

    // ✅ One single request with all items
    await axios.post(
      `${import.meta.env.VITE_API_URL}/orders/`,
      {
        items: items.map(item => ({
          productId: item.id,
          quantity:  item.quantity,
          price:     item.price,
          subtotal:  item.subtotal,
        })),
        totalPrice,
        shippingAddress,
      },
      { withCredentials: true }
    )

    setStep(3)
  } catch (err) {
    console.error('Order error:', err)
    alert('Something went wrong placing your order. Please try again.')
  } finally {
    setPlacing(false)
  }
}

  if (step === 3) return <SuccessScreen onContinue={() => navigate('/')} />

  return (
    <div className='min-h-screen bg-[#0a0f1e] text-white'>
      <div className='h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500' />

      <div className='max-w-6xl mx-auto px-4 sm:px-6 py-10'>

        {/* ── Top bar ── */}
        <div className='flex items-center gap-4 mb-10'>
          <button
            onClick={() => step === 1 ? navigate('/cart') : setStep(1)}
            className='p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition'
          >
            <FiArrowLeft className='w-5 h-5' />
          </button>
          <div className='flex-1 flex items-center gap-2'>
            <Step number={1} label='Shipping' active={step === 1} done={step > 1} />
            <Divider />
            <Step number={2} label='Review & Pay' active={step === 2} done={step > 2} />
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-5 gap-8'>

          {/* ── LEFT: Form / Review ── */}
          <div className='lg:col-span-3 space-y-6'>

            {/* STEP 1 — Shipping Address */}
            {step === 1 && (
              <div className='bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 space-y-5'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='w-9 h-9 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center'>
                    <FiMapPin className='w-4 h-4 text-indigo-400' />
                  </div>
                  <div>
                    <h2 className='text-base font-bold text-white'>Shipping Address</h2>
                    <p className='text-xs text-slate-500'>Where should we deliver your order?</p>
                  </div>
                </div>

                {/* Full Name + Phone */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <Field label='Full Name' error={errors.fullName}>
                    <input name='fullName' value={address.fullName} onChange={handleChange}
                      placeholder='John Doe' className={inputCls(errors.fullName)} />
                  </Field>
                  <Field label='Phone Number' error={errors.phone}>
                    <input name='phone' value={address.phone} onChange={handleChange}
                      placeholder='+977 98XXXXXXXX' className={inputCls(errors.phone)} />
                  </Field>
                </div>

                {/* Street */}
                <Field label='Street Address' error={errors.street}>
                  <input name='street' value={address.street} onChange={handleChange}
                    placeholder='House no., Street, Area' className={inputCls(errors.street)} />
                </Field>

                {/* City + State */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <Field label='City' error={errors.city}>
                    <input name='city' value={address.city} onChange={handleChange}
                      placeholder='Kathmandu' className={inputCls(errors.city)} />
                  </Field>
                  <Field label='State / Province' error={errors.state}>
                    <input name='state' value={address.state} onChange={handleChange}
                      placeholder='Bagmati' className={inputCls(errors.state)} />
                  </Field>
                </div>

                {/* ZIP + Country */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <Field label='Country' error={errors.country}>
                    <input name='country' value={address.country} onChange={handleChange}
                      placeholder='Nepal' className={inputCls(errors.country)} />
                  </Field>
                </div>

                {/* Delivery Notes */}
                <Field label='Delivery Notes (optional)'>
                  <textarea name='notes' value={address.notes} onChange={handleChange}
                    rows={2} placeholder='e.g. Ring bell twice, leave at door...'
                    className={`${inputCls(false)} resize-none`} />
                </Field>

                <button
                  onClick={handleAddressNext}
                  className='w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/30'
                >
                  Continue to Review →
                </button>
              </div>
            )}

            {/* STEP 2 — Review */}
            {step === 2 && (
              <div className='space-y-4'>

                {/* Address review card */}
                <div className='bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-2'>
                      <FiMapPin className='w-4 h-4 text-indigo-400' />
                      <span className='text-sm font-semibold text-white'>Delivery Address</span>
                    </div>
                    <button onClick={() => setStep(1)}
                      className='text-xs text-indigo-400 hover:text-indigo-300 font-medium transition'>
                      Edit
                    </button>
                  </div>
                  <p className='text-sm text-slate-300 font-medium'>{address.fullName}</p>
                  <p className='text-sm text-slate-400'>{address.phone}</p>
                  <p className='text-sm text-slate-400 mt-1'>
                    {address.street}, {address.city}, {address.state}, {address.country}
                  </p>
                  {address.notes && (
                    <p className='text-xs text-slate-500 mt-1 italic'>"{address.notes}"</p>
                  )}
                </div>

                {/* Items review */}
                <div className='bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5'>
                  <div className='flex items-center gap-2 mb-4'>
                    <FiPackage className='w-4 h-4 text-indigo-400' />
                    <span className='text-sm font-semibold text-white'>
                      Order Items ({items.length})
                    </span>
                  </div>
                  <div className='space-y-3'>
                    {items.map((item, i) => (
                      <div key={i} className='flex items-center gap-3 py-3 border-b border-slate-700/50 last:border-0'>
                        <div className='w-14 h-14 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-700'>
                          <img
                            src={item.image}
                            alt={item.name}
                            className='w-full h-full object-cover'
                            onError={e => { e.target.src = 'https://placehold.co/56x56/1e293b/94a3b8?text=?' }}
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-semibold text-white truncate'>{item.name}</p>
                          <p className='text-xs text-slate-500'>Qty: {item.quantity} × Rs. {item.price.toLocaleString()}</p>
                        </div>
                        <p className='text-sm font-bold text-emerald-400 flex-shrink-0'>
                          Rs. {item.subtotal.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Place Order */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className='w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] text-white font-bold rounded-xl transition-all duration-200 shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-2 text-base'
                >
                  {placing ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className='w-5 h-5' />
                      Place Order · Rs. {totalPrice.toLocaleString()}
                    </>
                  )}
                </button>
                <p className='text-center text-xs text-slate-600'>
                  By placing your order you agree to our terms & conditions
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT: Order Summary (sticky) ── */}
          <div className='lg:col-span-2'>
            <div className='bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 '>
              <h3 className='text-sm font-bold text-white mb-4 uppercase tracking-widest'>
                Order Summary
              </h3>

              <div className='space-y-3 mb-4 max-h-64 overflow-y-auto pr-1'>
                {items.map((item, i) => (
                  <div key={i} className='flex items-center gap-3'>
                    <div className='relative flex-shrink-0'>
                      <div className='w-10 h-10 rounded-lg overflow-hidden bg-slate-900 border border-slate-700'>
                        <img src={item.image} alt={item.name} className='w-full h-full object-cover'
                          onError={e => { e.target.src = 'https://placehold.co/40x40/1e293b/94a3b8?text=?' }} />
                      </div>
                      <span className='absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center'>
                        {item.quantity}
                      </span>
                    </div>
                    <p className='flex-1 text-xs text-slate-300 truncate'>{item.name}</p>
                    <p className='text-xs font-semibold text-white flex-shrink-0'>
                      Rs. {item.subtotal.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className='border-t border-slate-700 pt-4 space-y-2'>
                <div className='flex justify-between text-sm text-slate-400'>
                  <span>Subtotal</span>
                  <span>Rs. {totalPrice.toLocaleString()}</span>
                </div>
                <div className='flex justify-between text-sm text-slate-400'>
                  <span>Shipping</span>
                  <span className='text-emerald-400 font-medium'>Free</span>
                </div>
                <div className='flex justify-between text-base font-bold text-white pt-2 border-t border-slate-700'>
                  <span>Total</span>
                  <span>Rs. {totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CheckoutPage