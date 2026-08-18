import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CartContext } from '../context/CartContext'
import { UserContext } from '../context/UserContext'
import { getImageUrl } from '../../utils/imageUtils'
import CartToast from '../CartToast'
import { FiArrowLeft, FiShoppingCart, FiMinus, FiPlus, FiPackage, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi'
import type { Product } from '../../types'

const ProductDetailPage = () => {
  const { slugId } = useParams<{ slugId: string }>()   // combined "slug-id" segment, e.g. "iphone-15-case-64f1a2b3c4d5e6f7g8h9i0j1"
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
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

        // Related products: same category, excluding the current product
        try {
          const all = await axios.get<Product[]>(`${import.meta.env.VITE_API_URL}/products/`)
          const sameCategory = all.data
            .filter(p => p.category === res.data.category && p._id !== res.data._id)
            .slice(0, 4)
          setRelated(sameCategory)
        } catch {
          setRelated([])
        }
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
          className="px-6 py-3 bg-[#5B8DEF] hover:bg-[#4A7CE0] text-[#0A0E1A] rounded-lg font-semibold text-sm transition-all cursor-pointer"
        >
          Browse Products
        </button>
      </div>
    )
  }

  const inStock = typeof product.stock !== 'number' || product.stock > 0

  return (
    <>
      <div className="min-h-screen bg-[#0A0E1A] text-[#EDF1F7]">
        <div className="max-w-6xl mx-auto px-4 py-10">

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8592AC] hover:text-[#EDF1F7] uppercase tracking-wide transition-colors mb-8 cursor-pointer"
          >
            <FiArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

            <div className="relative bg-[#121A2E] border border-[#232F49] rounded-2xl overflow-hidden aspect-square">
              <img
                src={getImageUrl(product.image) || 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-2">
                {product.type || product.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-display font-semibold text-[#EDF1F7] mb-3">
                {product.name}
              </h1>

              {typeof product.stock === 'number' && (
                <span className={`inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wide mb-5 ${inStock ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  {inStock ? `${product.stock} in stock` : 'Sold out'}
                </span>
              )}

              <p className="text-sm text-[#8592AC] font-body leading-relaxed mb-6">
                {product.description}
              </p>

              <div className="text-3xl font-mono font-bold text-[#FFB238] mb-8">
                Rs. {product.price.toLocaleString()}
              </div>

              {!isAdmin && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-[#8592AC] uppercase tracking-wide">Quantity</span>
                    <div className="flex items-center gap-2 bg-[#121A2E] border border-[#232F49] rounded-lg p-1">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={!inStock}
                        aria-label="Decrease quantity"
                        className="w-8 h-8 flex items-center justify-center hover:bg-[#182238] rounded-md transition-colors text-[#8592AC] hover:text-[#EDF1F7] disabled:opacity-40"
                      >
                        <FiMinus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-mono font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => q + 1)}
                        disabled={!inStock}
                        aria-label="Increase quantity"
                        className="w-8 h-8 flex items-center justify-center hover:bg-[#182238] rounded-md transition-colors text-[#8592AC] hover:text-[#EDF1F7] disabled:opacity-40"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#5B8DEF] hover:bg-[#4A7CE0] disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0E1A] rounded-lg font-semibold text-sm transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <FiShoppingCart className="w-4 h-4" />
                    {inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>

                  {/* Trust bullets */}
                  <div className="pt-6 border-t border-[#232F49] grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <FiTruck className="w-4 h-4 text-[#5B8DEF] flex-shrink-0" />
                      <p className="text-xs text-[#8592AC] font-body">Fast, tracked delivery</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiShield className="w-4 h-4 text-[#5B8DEF] flex-shrink-0" />
                      <p className="text-xs text-[#8592AC] font-body">Genuine, verified products</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiRefreshCw className="w-4 h-4 text-[#5B8DEF] flex-shrink-0" />
                      <p className="text-xs text-[#8592AC] font-body">Easy returns &amp; support</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related products */}
          {related.length > 0 && !isAdmin && (
            <div className="mb-8">
              <div className="flex items-end justify-between gap-4 mb-7">
                <div>
                  <p className="text-[11px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-2">You may also like</p>
                  <h2 className="text-xl md:text-2xl font-display font-semibold text-[#EDF1F7]">Related Products</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {related.map((rel) => (
                  <button
                    key={rel._id}
                    onClick={() => navigate(`/products/${rel.slug}-${rel._id}`)}
                    className="group text-left bg-[#121A2E] rounded-xl overflow-hidden border border-[#232F49] hover:border-[#5B8DEF]/50 hover:shadow-[0_16px_40px_-16px_rgba(91,141,239,0.35)] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="relative h-[140px] overflow-hidden bg-[#0A0E1A]">
                      <img
                        src={getImageUrl(rel.image) || 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80'}
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-3.5">
                      <h3 className="text-sm font-display font-medium text-[#EDF1F7] line-clamp-1 mb-1.5">
                        {rel.name}
                      </h3>
                      <span className="text-sm font-mono font-semibold text-[#FFB238]">
                        Rs. {rel.price.toLocaleString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!isAdmin && <CartToast />}
    </>
  )
}

export default ProductDetailPage