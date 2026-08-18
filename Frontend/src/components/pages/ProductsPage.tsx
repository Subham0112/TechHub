import React, { useState, useEffect, useContext } from 'react'
import axios from "axios"
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { UserContext } from '../context/UserContext'
import { getImageUrl } from '../../utils/imageUtils'
import CartToast from '../CartToast'
import { FiShoppingCart, FiX, FiPackage, FiChevronDown } from 'react-icons/fi'
import type { Product } from '../../types'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'mobile-accessories', label: 'Mobile Accessories' },
  { value: 'gadgets', label: 'Gadgets' },
]

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

/* ================= PRODUCT CARD ================= */
const ProductCard = ({ product, handleCartClick, isAdmin }: {
  product: Product;
  handleCartClick: (product: Product) => void;
  isAdmin: boolean;
}) => {
  const navigate = useNavigate()
  const productHref = `/products/${product.slug}-${product._id}`

  return (
    <div className="group relative bg-[#121A2E] rounded-xl overflow-hidden border border-[#232F49] hover:border-[#5B8DEF]/50 hover:shadow-[0_16px_40px_-16px_rgba(91,141,239,0.35)] transition-all duration-300 hover:-translate-y-1">

      <div className="relative h-[180px] overflow-hidden bg-[#0A0E1A]">
        <img
          src={getImageUrl(product.image) || "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80"}
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

        {!isAdmin && (
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
        )}
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

          {!isAdmin ? (
            <button
              onClick={() => handleCartClick(product)}
              disabled={product.stock === 0}
              aria-label={`Add ${product.name} to cart`}
              className="p-2 bg-[#182238] border border-[#232F49] hover:bg-[#5B8DEF] text-[#8592AC] hover:text-[#0A0E1A] rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiShoppingCart className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => window.location.href = `/admin/products`}
              className="px-2.5 py-1 cursor-pointer text-[10px] font-mono uppercase tracking-wide text-[#5B8DEF] bg-[#5B8DEF]/10 border border-[#5B8DEF]/30 rounded-lg"
            >
              Manage
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ================= SKELETON CARD ================= */
const SkeletonCard = ({ delay }: { delay: number }) => (
  <div
    className="bg-[#121A2E] rounded-xl overflow-hidden border border-[#232F49] animate-pulse"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="h-[180px] bg-[#182238]" />
    <div className="p-4 space-y-2">
      <div className="h-2 bg-[#182238] rounded w-1/3" />
      <div className="h-3 bg-[#182238] rounded w-3/4" />
      <div className="h-3 bg-[#182238] rounded w-1/2" />
      <div className="h-4 bg-[#182238] rounded w-1/3 mt-3" />
    </div>
  </div>
)

/* ================= SORT DROPDOWN ================= */
const SortDropdown = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [open, setOpen] = useState(false)
  const current = SORT_OPTIONS.find(o => o.value === value) || SORT_OPTIONS[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#121A2E] border border-[#232F49] rounded-lg text-xs font-mono uppercase tracking-wide text-[#8592AC] hover:text-[#EDF1F7] transition-colors cursor-pointer"
      >
        {current.label}
        <FiChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-52 bg-[#121A2E] border border-[#232F49] rounded-lg shadow-2xl overflow-hidden z-20">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`w-full text-left px-4 py-2.5 text-xs font-mono transition-colors ${
                  value === opt.value
                    ? 'bg-[#5B8DEF]/10 text-[#5B8DEF]'
                    : 'text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#182238]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ================= PRODUCTS PAGE ================= */
const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('default')
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  const cartContext = useContext(CartContext)
  const addToCart = cartContext?.addToCart ?? (async () => {})
  const { user } = useContext(UserContext)
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setFetchError(false)
      try {
        const res = await axios.get<Product[]>(`${import.meta.env.VITE_API_URL}/products`, {
          params: searchQuery.trim() ? { search: searchQuery.trim() } : {}
        })
        setProducts(res.data)
      } catch (err) {
        console.log(err)
        setProducts([])
        setFetchError(true)
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

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'price-asc') return (a.price || 0) - (b.price || 0)
    if (sort === 'price-desc') return (b.price || 0) - (a.price || 0)
    return 0
  })

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('search')
    setSearchParams(next)
  }

  return (
    <>
      <div className="min-h-screen bg-[#0A0E1A]">
        <div className="max-w-7xl mx-auto px-4 py-12">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
            <div>
              <p className="text-[11px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-2">
                Products
              </p>
              <h1 className="text-2xl md:text-3xl font-display font-semibold text-[#EDF1F7]">
                All Products
              </h1>
              {!loading && (
                <p className="text-xs font-body text-[#8592AC] mt-2">
                  {sortedProducts.length} item{sortedProducts.length !== 1 ? 's' : ''} found
                  {searchQuery && <span className="text-[#EDF1F7]"> for "{searchQuery}"</span>}
                </p>
              )}
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wide text-[#5B8DEF] hover:text-[#EDF1F7] transition-colors cursor-pointer"
                >
                  <FiX className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Category filter pills */}
              <div className="flex items-center gap-1 bg-[#121A2E] border border-[#232F49] rounded-lg p-1 w-fit">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`px-4 py-1.5 rounded-md text-xs font-mono uppercase tracking-wide transition-colors cursor-pointer ${
                      category === cat.value
                        ? 'bg-[#5B8DEF] text-[#0A0E1A] font-semibold'
                        : 'text-[#8592AC] hover:text-[#EDF1F7]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <SortDropdown value={sort} onChange={setSort} />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} delay={i * 60} />
              ))}
            </div>
          ) : fetchError ? (
            <div className="relative flex flex-col items-center justify-center py-24 gap-4 bg-[#121A2E] rounded-xl border border-dashed border-rose-400/30">
              <div className="w-14 h-14 rounded-xl bg-[#182238] border border-rose-400/30 flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-rose-400" />
              </div>
              <div className="text-center">
                <p className="text-[#EDF1F7] font-display font-medium mb-1">Something went wrong</p>
                <p className="text-[#8592AC] font-body text-xs">Couldn't load products. Please try again.</p>
              </div>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="relative flex flex-col items-center justify-center py-24 gap-4 bg-[#121A2E] rounded-xl border border-dashed border-[#232F49]">
              <div className="w-14 h-14 rounded-xl bg-[#182238] border border-[#232F49] flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-[#5C6270]" />
              </div>
              <div className="text-center">
                <p className="text-[#EDF1F7] font-display font-medium mb-1">No products found</p>
                <p className="text-[#8592AC] font-body text-xs">
                  {searchQuery ? `Nothing matches "${searchQuery}"` : 'Try a different category'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {sortedProducts.map((product) => (
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