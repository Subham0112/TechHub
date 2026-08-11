import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { CartContext } from '../context/CartContext'
import { getImageUrl } from '../../utils/imageUtils'
import { getErrorMessage } from '../../utils/errorUtils'
import { FiShoppingCart } from 'react-icons/fi'
import type { Product } from '../../types'

const Corners: React.FC<{ color?: string; visible?: string }> = ({ color = "border-[#5B8DEF]", visible = "opacity-100" }) => (
  <>
    <span className={`absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 ${color} ${visible} pointer-events-none transition-opacity duration-300`} />
    <span className={`absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 ${color} ${visible} pointer-events-none transition-opacity duration-300`} />
    <span className={`absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 ${color} ${visible} pointer-events-none transition-opacity duration-300`} />
    <span className={`absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 ${color} ${visible} pointer-events-none transition-opacity duration-300`} />
  </>
)

const ProductCard: React.FC<{
  product: Product;
  idx: number;
  handleCartClick: (product: Product) => void;
}> = ({ product, idx, handleCartClick }) => (
  <div
    className="group relative bg-[#121A2E] rounded-xl overflow-hidden border border-[#232F49] hover:border-[#5B8DEF]/60 transition-all duration-300 hover:-translate-y-1.5"
    style={{ animation: `fadeSlideUp 0.4s ease both`, animationDelay: `${idx * 40}ms` }}
  >
    <div className="relative h-[180px] overflow-hidden bg-[#0A0E1A]">
      <img
        src={getImageUrl(product.image) || 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80'}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <Corners visible="opacity-0 group-hover:opacity-100" />

      {typeof product.stock === 'number' && (
        <span className={`absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded bg-[#0A0E1A]/80 backdrop-blur-sm text-[10px] font-mono uppercase tracking-wide ${product.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}
        </span>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
        <button
          onClick={() => handleCartClick(product)}
          disabled={product.stock === 0}
          className="px-4 py-1.5 bg-[#FFB238] text-[#0A0E1A] rounded-full font-mono font-semibold cursor-pointer text-[11px] uppercase tracking-wide hover:bg-[#ffc158] transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FiShoppingCart className="w-3.5 h-3.5" />
          Quick Add
        </button>
      </div>
    </div>

    <div className="p-3.5">
      <span className="text-[9px] font-mono text-[#5B8DEF] uppercase tracking-widest">{product.type || product.category}</span>
      <h3 className="text-[#EDF1F7] font-display font-medium text-sm mt-1 mb-1.5 line-clamp-1">
        {product.name}
      </h3>
      <p className="text-[#8592AC] text-xs line-clamp-2 mb-3 font-body">
        {product.description}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-[#232F49]">
        <span className="text-base font-mono font-semibold text-[#FFB238]">
          Rs. {product.price}
        </span>
        <button
          onClick={() => handleCartClick(product)}
          disabled={product.stock === 0}
          className="p-1.5 bg-[#182238] hover:bg-[#5B8DEF] text-[#8592AC] hover:text-[#0A0E1A] rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FiShoppingCart className="w-4 h-4" />
        </button>
      </div>
    </div>

    <style>{`
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  </div>
)

const ProductCategoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { category } = useParams<{ category: string }>()
  const cartContext = useContext(CartContext)
  const addToCart = cartContext?.addToCart ?? (async () => {})

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        setLoading(true)
        setProducts([])
        const response = await axios.get<Product[]>(
          `${import.meta.env.VITE_API_URL}/products/category/${category}`
        )
        setProducts(response.data)
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setProducts([])
        } else {
          console.error('Error fetching products by category:', getErrorMessage(error, 'Unknown error'))
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProductsByCategory()
  }, [category])

  const categoryLabel = category
    ? category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'All'

  return (
    <div className="relative min-h-screen bg-[#0A0E1A]">
      {/* Global blueprint grid — same fixed overlay as Homepage/ProductsPage */}
      <div
        className="fixed inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#5B8DEF 1px, transparent 1px), linear-gradient(90deg, #5B8DEF 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-1.5">
            // Category
          </p>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-[#EDF1F7]">
            {categoryLabel}
          </h1>
          {!loading && (
            <p className="text-xs font-mono text-[#8592AC] mt-2">
              {products.length} item{products.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#121A2E] rounded-xl overflow-hidden border border-[#232F49] animate-pulse"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="h-[180px] bg-[#182238]" />
                <div className="p-3.5 space-y-2">
                  <div className="h-2 bg-[#182238] rounded w-1/3" />
                  <div className="h-3 bg-[#182238] rounded w-3/4" />
                  <div className="h-3 bg-[#182238] rounded w-1/2" />
                  <div className="h-4 bg-[#182238] rounded w-1/3 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Empty state */
          <div className="relative flex flex-col items-center justify-center py-24 gap-4 bg-[#121A2E] rounded-xl border border-dashed border-[#232F49]">
            <div className="w-14 h-14 rounded-xl bg-[#182238] border border-[#232F49] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#5C6270]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[#EDF1F7] font-display font-medium mb-1">No products found</p>
              <p className="text-[#8592AC] font-mono text-xs max-w-xs">
                No items in <span className="text-[#5B8DEF]">{categoryLabel}</span> yet. Check back later.
              </p>
            </div>
          </div>
        ) : (
          /* Product grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {products.map((product, idx) => (
              <ProductCard key={product._id} product={product} idx={idx} handleCartClick={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCategoryPage
