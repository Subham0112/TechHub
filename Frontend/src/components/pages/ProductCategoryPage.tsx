import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CartContext } from '../context/CartContext'
import { getImageUrl } from '../../utils/imageUtils'
import { getErrorMessage } from '../../utils/errorUtils'
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi'
import type { Product } from '../../types'

const ProductCard = ({ product, idx, handleCartClick }: {
  product: Product;
  idx: number;
  handleCartClick: (product: Product) => void;
}) => {
  const navigate = useNavigate()
  const productHref = `/products/${product.slug}-${product._id}`

  return (
    <div
      className="group relative bg-[#121A2E] rounded-xl overflow-hidden border border-[#232F49] hover:border-[#5B8DEF]/50 hover:shadow-[0_16px_40px_-16px_rgba(91,141,239,0.35)] transition-all duration-300 hover:-translate-y-1"
      style={{ animation: `fadeSlideUp 0.4s ease both`, animationDelay: `${idx * 40}ms` }}
    >
      <div className="relative h-[180px] overflow-hidden bg-[#0A0E1A]">
        <img
          src={getImageUrl(product.image) || 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80'}
          alt={product.name}
          onClick={() => navigate(productHref)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
        />

        {typeof product.stock === 'number' && (
          <span className={`absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#0A0E1A]/75 backdrop-blur-sm text-[10px] font-mono uppercase tracking-wide ${product.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            {product.stock > 0 ? 'In stock' : 'Sold out'}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={() => handleCartClick(product)}
            disabled={product.stock === 0}
            className="w-full py-2 bg-[#0A0E1A]/85 backdrop-blur-sm border border-[#5B8DEF]/40 text-[#EDF1F7] rounded-lg font-mono font-semibold cursor-pointer text-[11px] uppercase tracking-wide hover:bg-[#5B8DEF] hover:text-[#0A0E1A] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiShoppingCart className="w-3.5 h-3.5" />
            Quick Add
          </button>
        </div>
      </div>

      <div className="p-4">
        <span className="text-[10px] font-mono text-[#8592AC] uppercase tracking-widest">{product.type || product.category}</span>
        <h3
          onClick={() => navigate(productHref)}
          className="text-[#EDF1F7] font-display font-medium text-sm mt-1.5 mb-1.5 line-clamp-1 cursor-pointer hover:text-[#5B8DEF] transition-colors"
        >
          {product.name}
        </h3>
        <p className="text-[#8592AC] text-xs line-clamp-2 mb-3 font-body">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-[#232F49]">
          <span className="text-base font-mono font-semibold text-[#FFB238]">
            Rs. {product.price.toLocaleString()}
          </span>
          <button
            onClick={() => handleCartClick(product)}
            disabled={product.stock === 0}
            aria-label={`Add ${product.name} to cart`}
            className="p-2 bg-[#182238] border border-[#232F49] hover:bg-[#5B8DEF] text-[#8592AC] hover:text-[#0A0E1A] rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
}

const ProductCategoryPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { category } = useParams<{ category: string }>()
  const cartContext = useContext(CartContext)
  const addToCart = cartContext?.addToCart ?? (async () => {})
  const navigate = useNavigate()

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
    <div className="min-h-screen bg-[#0A0E1A]">
      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8592AC] hover:text-[#EDF1F7] uppercase tracking-wide transition-colors mb-4 cursor-pointer"
          >
            <FiArrowLeft className="w-3.5 h-3.5" /> All Products
          </button>
          <p className="text-[11px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-2">
            Category
          </p>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-[#EDF1F7]">
            {categoryLabel}
          </h1>
          {!loading && (
            <p className="text-xs font-body text-[#8592AC] mt-2">
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
                <div className="p-4 space-y-2">
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
              <p className="text-[#8592AC] font-body text-xs max-w-xs">
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