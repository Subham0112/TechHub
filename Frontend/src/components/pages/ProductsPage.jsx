import React, { useState, useEffect, useContext } from 'react'
import axios from "axios"
import { useSearchParams } from 'react-router-dom'
import { CartContext } from '../context/CartContext.jsx'
import { UserContext } from '../context/UserContext.jsx'
import { getImageUrl } from '../../utils/imageUtils.js'
import CartToast from '../CartToast.jsx'
import { FiShoppingCart, FiX, FiPackage } from 'react-icons/fi'

/* Viewfinder corner brackets — same signature motif as Homepage/Navbar */
const Corners = ({ color = "border-[#5B8DEF]", visible = "opacity-100" }) => (
  <>
    <span className={`absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 ${color} ${visible} pointer-events-none transition-opacity duration-300`} />
    <span className={`absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 ${color} ${visible} pointer-events-none transition-opacity duration-300`} />
    <span className={`absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 ${color} ${visible} pointer-events-none transition-opacity duration-300`} />
    <span className={`absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 ${color} ${visible} pointer-events-none transition-opacity duration-300`} />
  </>
)

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'mobile-accessories', label: 'Mobile Accessories' },
  { value: 'gadgets', label: 'Gadgets' },
]

/* ================= PRODUCT CARD — same as Homepage's, in grid form ================= */
const ProductCard = ({ product, handleCartClick, isAdmin }) => (
  <div className="group relative bg-[#121A2E] rounded-xl overflow-hidden border border-[#232F49] hover:border-[#5B8DEF]/60 transition-all duration-300 hover:-translate-y-1.5">

    <div className="relative h-[180px] overflow-hidden bg-[#0A0E1A]">
      <img
        src={getImageUrl(product.image) || "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80"}
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

      {!isAdmin && (
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
          <button
            onClick={() => handleCartClick(product)}
            className="px-4 py-1.5 bg-[#FFB238] text-[#0A0E1A] rounded-full font-mono font-semibold cursor-pointer text-[11px] uppercase tracking-wide hover:bg-[#ffc158] transition-all flex items-center gap-1.5"
          >
            <FiShoppingCart className="w-3.5 h-3.5" />
            Quick Add
          </button>
        </div>
      )}
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

        {!isAdmin ? (
          <button
            onClick={() => handleCartClick(product)}
            className="p-1.5 bg-[#182238] hover:bg-[#5B8DEF] text-[#8592AC] hover:text-[#0A0E1A] rounded-lg transition-colors cursor-pointer"
          >
            <FiShoppingCart className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => window.location.href = `/manage-products?`}
            className="px-2.5 py-1 cursor-pointer text-[10px] font-mono uppercase tracking-wide text-[#5B8DEF] bg-[#5B8DEF]/10 border border-[#5B8DEF]/30 rounded-lg"
          >
            Manage
          </button>
        )}
      </div>
    </div>
  </div>
)

/* ================= SKELETON CARD ================= */
const SkeletonCard = ({ delay }) => (
  <div
    className="bg-[#121A2E] rounded-xl overflow-hidden border border-[#232F49] animate-pulse"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="h-[180px] bg-[#182238]" />
    <div className="p-3.5 space-y-2">
      <div className="h-2 bg-[#182238] rounded w-1/3" />
      <div className="h-3 bg-[#182238] rounded w-3/4" />
      <div className="h-3 bg-[#182238] rounded w-1/2" />
      <div className="h-4 bg-[#182238] rounded w-1/3 mt-3" />
    </div>
  </div>
)

/* ================= PRODUCTS PAGE ================= */
const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  const { addToCart } = useContext(CartContext)
  const { user } = useContext(UserContext)
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
          params: searchQuery ? { search: searchQuery } : {}
        })
        setProducts(res.data)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [searchQuery])

  const filteredProducts = products.filter((product) => {
    if (category === 'all') return true
    return product.category === category
  })

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('search')
    setSearchParams(next)
  }

  return (
    <>
      <div className="min-h-screen bg-[#0A0E1A]">

        {/* faint blueprint grid — same background treatment as Homepage hero */}
        <div
          className="fixed inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#5B8DEF 1px, transparent 1px), linear-gradient(90deg, #5B8DEF 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 py-12">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
            <div className="relative">
              <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-1.5">
                // Inventory
              </p>
              <h1 className="text-2xl md:text-3xl font-display font-semibold text-[#EDF1F7]">
                All Products
              </h1>
              {!loading && (
                <p className="text-xs font-mono text-[#8592AC] mt-2">
                  {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''} found
                  {searchQuery && <span className="text-[#EDF1F7]"> for "{searchQuery}"</span>}
                </p>
              )}
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wide text-[#5B8DEF] hover:text-[#EDF1F7] transition-colors"
                >
                  <FiX className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>

            {/* Category filter pills */}
            <div className="flex items-center gap-1.5 bg-[#121A2E] border border-[#232F49] rounded-lg p-1 w-fit">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-mono uppercase tracking-wide transition-colors ${
                    category === cat.value
                      ? 'bg-[#5B8DEF] text-[#0A0E1A]'
                      : 'text-[#8592AC] hover:text-[#EDF1F7]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} delay={i * 60} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="relative flex flex-col items-center justify-center py-24 gap-4 bg-[#121A2E] rounded-xl border border-dashed border-[#232F49]">
              <div className="w-14 h-14 rounded-xl bg-[#182238] border border-[#232F49] flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-[#5C6270]" />
              </div>
              <div className="text-center">
                <p className="text-[#EDF1F7] font-display font-medium mb-1">No products found</p>
                <p className="text-[#8592AC] font-mono text-xs">
                  {searchQuery ? `Nothing matches "${searchQuery}"` : 'Try a different category'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  handleCartClick={addToCart}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {!isAdmin && <CartToast />}
    </>
  )
}

export default ProductsPage