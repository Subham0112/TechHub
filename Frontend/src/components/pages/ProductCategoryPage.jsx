import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const ProductCategoryPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { category } = useParams()

useEffect(() => {
  const fetchProductsByCategory = async () => {
    try {
      setLoading(true)
      setProducts([]) 
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/products/category/${category}`
      )
      setProducts(response.data)
    } catch (error) {
      if (error.response?.status === 404) {
        setProducts([])
      } else {
        console.error('Error fetching products by category:', error)
      }
    } finally {
      setLoading(false)
    }
  }
  fetchProductsByCategory()
}, [category])

  const categoryLabel =
    category
      ? category.charAt(0).toUpperCase() + category.slice(1)
      : 'All'

  return (
    <div className="min-h-screen bg-[#0b0f1a]">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-cyan-500/8 rounded-full blur-[90px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {/* Header */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block w-6 h-[2px] bg-blue-400 rounded-full" />
            <span className="text-blue-400 text-xs font-semibold tracking-[0.18em] uppercase">
              Browse
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight tracking-tight">
            {categoryLabel} Products
      
          </h1>
          {!loading && (
            <p className="mt-3 text-slate-400 text-sm">
              {products.length} item{products.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/5 overflow-hidden animate-pulse"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="bg-white/5 h-44" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                  <div className="h-5 bg-white/5 rounded w-1/3 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
              </svg>
            </div>
            <p className="text-white font-semibold text-lg">No products found</p>
            <p className="text-slate-500 text-sm max-w-xs">
              No items in the <span className="text-blue-400">{categoryLabel}</span> category yet. Check back later.
            </p>
          </div>
        ) : (
          /* Product grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {products.map((product, idx) => (
              <ProductCard key={product._id} product={product} idx={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const ProductCard = ({ product, idx }) => {
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        animation: `fadeSlideUp 0.4s ease both`,
        animationDelay: `${idx * 40}ms`,
      }}
    >
      {/* Card glass background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-white/[0.03] rounded-2xl border border-white/10 group-hover:border-blue-500/40 transition-colors duration-300" />

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-blue-500/5 to-violet-500/5 rounded-2xl" />

      <div className="relative z-10">
        {/* Image */}
        <div className="relative overflow-hidden bg-slate-900/60 aspect-[4/3]">
          <img
            src={
              imgError || !product.image
                ? 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80'
                : product.image
            }
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Image overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-1 mb-1 group-hover:text-blue-300 transition-colors duration-200">
            {product.name}
          </h3>
          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-3">
            {product.description}
          </p>

          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Price</span>
              <p className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 leading-tight">
                Rs. {product.price}
              </p>
            </div>

            <button className="flex-shrink-0 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all duration-200 active:scale-95 group/btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-slate-400 group-hover/btn:text-blue-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </button>
          </div>
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

export default ProductCategoryPage