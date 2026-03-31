import React, { useContext } from 'react'
import { CartContext } from '../context/CartContext'
import { FiShoppingCart, FiTrash2, FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import CartToast from '../CartToast'

const Cart = () => {
  const { cartItems, cartLoading, updateQuantity, removeFromCart } = useContext(CartContext)
  const navigate = useNavigate()

  // Total price calculation
  const totalPrice = cartItems.reduce((sum, item) => {
    const price = item.productId?.price || 0
    return sum + price * item.quantity
  }, 0)

  /* ── Empty State ── */
  if (!cartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center text-white px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
            <FiShoppingCart className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-slate-400 mb-8">Start adding some awesome tech products!</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-semibold transition shadow-lg"
          >
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  /* ── Loading State ── */
  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-10">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/')}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-slate-700"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Your Cart</h1>
              <p className="text-slate-400 text-sm">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── Cart Items ── */}
            <div className="flex-1 space-y-4">
              {cartItems.map((item) => {
                const product = item.productId
                return (
                  <div
                    key={item._id}
                    className="flex gap-4 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition"
                  >
                    {/* Product Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
                      <img
                        src={product?.image || "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80"}
                        alt={product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm mb-1 truncate">
                        {product?.name}
                      </h3>
                      <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                        {product?.description}
                      </p>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-700">
                          <button
                            onClick={() => updateQuantity(product._id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded-md transition text-slate-300 hover:text-white"
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product._id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded-md transition text-slate-300 hover:text-white"
                          >
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price + Delete */}
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Rs. {(product?.price * item.quantity).toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeFromCart(product._id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
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
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 sticky top-24">
                <h2 className="text-lg font-bold mb-5">Order Summary</h2>

                <div className="space-y-3 mb-5">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span className="text-slate-400 truncate max-w-[160px]">
                        {item.productId?.name}
                        <span className="text-slate-500 ml-1">×{item.quantity}</span>
                      </span>
                      <span className="text-white flex-shrink-0">
                        Rs. {(item.productId?.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-700 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                      Rs. {totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition shadow-lg shadow-blue-500/20 mb-3">
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition text-sm"
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