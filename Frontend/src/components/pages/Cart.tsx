import React, { useContext } from 'react'
import { CartContext } from '../context/CartContext'
import { getImageUrl } from '../../utils/imageUtils'
import { FiShoppingCart, FiTrash2, FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import CartToast from '../CartToast'
import type { Product } from '../../types'

const Corners: React.FC<{ color?: string; visible?: string }> = ({ color = "border-[#5B8DEF]", visible = "opacity-100" }) => (
  <>
    <span className={`absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 ${color} ${visible} pointer-events-none`} />
    <span className={`absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 ${color} ${visible} pointer-events-none`} />
    <span className={`absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 ${color} ${visible} pointer-events-none`} />
    <span className={`absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 ${color} ${visible} pointer-events-none`} />
  </>
)

const Cart: React.FC<{ setProducts: React.Dispatch<React.SetStateAction<Product[]>> }> = ({ setProducts }) => {
  const cartContext = useContext(CartContext)
  const cartItems = cartContext?.cartItems ?? []
  const cartLoading = cartContext?.cartLoading ?? true
  const updateQuantity = cartContext?.updateQuantity ?? (async () => {})
  const removeFromCart = cartContext?.removeFromCart ?? (async () => {})
  const navigate = useNavigate()

  const totalPrice = cartItems.reduce((sum, item) => {
    const price = typeof item.productId === 'string' ? 0 : (item.productId?.price || 0)
    return sum + price * item.quantity
  }, 0)

  const handleCheckoutClick = () => {
    setProducts(cartItems.map((item) => typeof item.productId === 'string' ? null : item.productId).filter((p): p is Product => p !== null))
    navigate('/checkout')
  }

  /* ── Loading State ── */
  if (cartLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#232F49] border-t-[#5B8DEF] rounded-full animate-spin" />
      </div>
    )
  }

  /* ── Empty State ── */
  if (cartItems.length === 0) {
    return (
      <div className="relative min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center text-[#EDF1F7] px-4">
        <div
          className="fixed inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#5B8DEF 1px, transparent 1px), linear-gradient(90deg, #5B8DEF 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="relative text-center">
          <div className="w-24 h-24 bg-[#121A2E] border border-[#232F49] rounded-full flex items-center justify-center mx-auto mb-6">
            <FiShoppingCart className="w-10 h-10 text-[#5C6270]" />
          </div>
          <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-2">// Cart</p>
          <h2 className="text-2xl font-display font-semibold text-[#EDF1F7] mb-2">Your cart is empty</h2>
          <p className="text-[#8592AC] text-sm font-body mb-8">Start adding some awesome tech products!</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#5B8DEF] hover:bg-[#4A7CE0] text-[#0A0E1A] rounded-full font-semibold text-sm transition-all active:scale-95"
          >
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative min-h-screen bg-[#0A0E1A] text-[#EDF1F7] px-4 py-10">

        {/* Global blueprint grid */}
        <div
          className="fixed inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#5B8DEF 1px, transparent 1px), linear-gradient(90deg, #5B8DEF 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/')}
              className="p-2 bg-[#121A2E] hover:bg-[#182238] rounded-lg border border-[#232F49] transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-[#8592AC]" />
            </button>
            <div>
              <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-0.5">// Cart</p>
              <h1 className="text-xl font-display font-semibold text-[#EDF1F7]">Your Cart</h1>
              <p className="text-[#8592AC] text-xs font-mono mt-0.5">
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── Cart Items ── */}
            <div className="flex-1 space-y-4">
              {cartItems.map((item) => {
                const product = typeof item.productId === 'string' ? null : item.productId
                if (!product) return null
                return (
                  <div
                    key={item._id}
                    className="group relative flex gap-4 bg-[#121A2E] border border-[#232F49] hover:border-[#5B8DEF]/40 rounded-xl p-4 transition-colors duration-200"
                  >
                    {/* Product Image */}
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-[#0A0E1A] flex-shrink-0 border border-[#232F49]">
                      <img
                        src={getImageUrl(product.image) || "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <Corners visible="opacity-0 group-hover:opacity-100" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-medium text-[#EDF1F7] text-sm mb-1 truncate">
                        {product.name}
                      </h3>
                      <p className="text-[#8592AC] text-xs mb-3 line-clamp-2 font-body">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-[#0A0E1A] rounded-lg p-1 border border-[#232F49]">
                          <button
                            onClick={() => updateQuantity(product._id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-[#182238] rounded-md transition-colors text-[#8592AC] hover:text-[#EDF1F7]"
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-mono font-semibold text-[#EDF1F7]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product._id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-[#182238] rounded-md transition-colors text-[#8592AC] hover:text-[#EDF1F7]"
                          >
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price + Delete */}
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[#FFB238]">
                            Rs. {(product.price * item.quantity).toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeFromCart(product._id)}
                            className="p-1.5 text-[#5C6270] hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Order Summary ── */}
            <div className="lg:w-80">
              <div className="relative bg-[#121A2E] border border-[#232F49] rounded-xl p-6 sticky top-24">
                <Corners />
                <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-1">// Summary</p>
                <h2 className="text-lg font-display font-semibold text-[#EDF1F7] mb-5">Order Summary</h2>

                <div className="space-y-3 mb-5">
                  {cartItems.map((item) => {
                    const name = typeof item.productId === 'string' ? 'Product' : item.productId?.name
                    const price = typeof item.productId === 'string' ? 0 : (item.productId?.price || 0)
                    return (
                      <div key={item._id} className="flex justify-between text-sm">
                        <span className="text-[#8592AC] truncate max-w-[160px] font-body">
                          {name}
                          <span className="text-[#5C6270] ml-1">×{item.quantity}</span>
                        </span>
                        <span className="text-[#EDF1F7] flex-shrink-0 font-mono">
                          Rs. {(price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-[#232F49] pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#EDF1F7] text-sm">Total</span>
                    <span className="font-mono font-bold text-lg text-[#FFB238]">
                      Rs. {totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3.5 bg-[#5B8DEF] hover:bg-[#4A7CE0] text-[#0A0E1A] rounded-xl font-semibold text-sm transition-all active:scale-[0.99] mb-3"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 bg-[#182238] hover:bg-[#1E2A42] text-[#EDF1F7] rounded-xl font-medium text-sm transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
      <CartToast />
    </>
  )
}

export default Cart
