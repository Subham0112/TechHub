import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CartContext } from '../context/CartContext'
import { UserContext } from '../context/UserContext'
import { getImageUrl } from '../../utils/imageUtils'
import CartToast from '../CartToast'
import { FiArrowLeft, FiShoppingCart, FiMinus, FiPlus, FiPackage } from 'react-icons/fi'
import type { Product } from '../../types'

const Corners: React.FC<{ color?: string }> = ({ color = "border-[#5B8DEF]" }) => (
  <>
    <span className={`absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 ${color} pointer-events-none`} />
    <span className={`absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 ${color} pointer-events-none`} />
    <span className={`absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 ${color} pointer-events-none`} />
    <span className={`absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 ${color} pointer-events-none`} />
  </>
)

const ProductDetailPage: React.FC = () => {
  const { slugId } = useParams<{ slugId: string }>()   // combined "slug-id" segment, e.g. "iphone-15-case-64f1a2b3c4d5e6f7g8h9i0j1"
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const cartContext = useContext(CartContext)
  const addToCart = cartContext?.addToCart ?? (async () => {})
  const { user } = useContext(UserContext)
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        // Forward the combined slug-id segment as-is; the backend route
        // /:slug-:id splits it into req.params.slug and req.params.id itself.
        const res = await axios.get<Product>(`${import.meta.env.VITE_API_URL}/products/${slugId}`)
        setProduct(res.data)
        setQuantity(1)
      } catch (err) {
        console.error('Product fetch error:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slugId])

  const handleAddToCart = () => {
    if (!product) return
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#232F49] border-t-[#5B8DEF] rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center text-[#EDF1F7] px-4">
        <div className="w-16 h-16 rounded-xl bg-[#121A2E] border border-[#232F49] flex items-center justify-center mb-6">
          <FiPackage className="w-7 h-7 text-[#5C6270]" />
        </div>
        <h2 className="text-xl font-display font-semibold mb-2">Product not found</h2>
        <p className="text-[#8592AC] text-sm font-body mb-8">This product may have been removed or doesn't exist.</p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-3 bg-[#5B8DEF] hover:bg-[#4A7CE0] text-[#0A0E1A] rounded-lg font-semibold text-sm transition-all"
        >
          Browse Products
        </button>
      </div>
    )
  }

  const inStock = typeof product.stock !== 'number' || product.stock > 0

  return (
    <>
      <div className="relative min-h-screen bg-[#0A0E1A] text-[#EDF1F7]">

        <div
          className="fixed inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#5B8DEF 1px, transparent 1px), linear-gradient(90deg, #5B8DEF 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 py-10">

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8592AC] hover:text-[#EDF1F7] uppercase tracking-wide transition-colors mb-8"
          >
            <FiArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            <div className="relative bg-[#121A2E] border border-[#232F49] rounded-2xl overflow-hidden aspect-square">
              <Corners />
              <img
                src={getImageUrl(product.image) || 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-2">
                {product.type || product.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-display font-semibold text-[#EDF1F7] mb-3">
                {product.name}
              </h1>

              {typeof product.stock === 'number' && (
                <span className={`inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wide mb-4 ${inStock ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  {inStock ? `${product.stock} in stock` : 'Sold out'}
                </span>
              )}

              <p className="text-sm text-[#8592AC] font-body leading-relaxed mb-6">
                {product.description}
              </p>

              <div className="text-3xl font-mono font-bold text-[#FFB238] mb-8">
                Rs. {product.price}
              </div>

              {!isAdmin && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-[#8592AC] uppercase tracking-wide">Quantity</span>
                    <div className="flex items-center gap-2 bg-[#121A2E] border border-[#232F49] rounded-lg p-1">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={!inStock}
                        className="w-8 h-8 flex items-center justify-center hover:bg-[#182238] rounded-md transition-colors text-[#8592AC] hover:text-[#EDF1F7] disabled:opacity-40"
                      >
                        <FiMinus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-mono font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => q + 1)}
                        disabled={!inStock}
                        className="w-8 h-8 flex items-center justify-center hover:bg-[#182238] rounded-md transition-colors text-[#8592AC] hover:text-[#EDF1F7] disabled:opacity-40"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#5B8DEF] hover:bg-[#4A7CE0] disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0E1A] rounded-xl font-semibold text-sm transition-all active:scale-[0.99]"
                  >
                    <FiShoppingCart className="w-4 h-4" />
                    {inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isAdmin && <CartToast />}
    </>
  )
}

export default ProductDetailPage
