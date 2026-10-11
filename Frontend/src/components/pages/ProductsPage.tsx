import React, { useState, useEffect, useContext } from 'react'
import axios from "axios"
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { UserContext } from '../context/UserContext'
import { getImageUrl } from '../../utils/imageUtils'
import CartToast from '../CartToast'
import { FiShoppingCart, FiX, FiPackage, FiSliders } from 'react-icons/fi'
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

const PRICE_PRESETS = [
  { label: 'Under Rs. 500', min: '', max: '500' },
  { label: 'Rs. 500 – 2,000', min: '500', max: '2000' },
  { label: 'Rs. 2,000 – 5,000', min: '2000', max: '5000' },
  { label: 'Above Rs. 5,000', min: '5000', max: '' },
]

type Filters = {
  category: string
  sort: string
  min: string
  max: string
}

const DEFAULT_FILTERS: Filters = { category: 'all', sort: 'default', min: '', max: '' }

const getEffectivePrice = (p: Product) => p.offerPrice ?? p.price ?? 0

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
          src={getImageUrl(product.image)}
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

        {product.offerPrice != null && product.offerPrice < product.price && (
          <span className="absolute top-2.5 right-2.5 px-2 py-1 rounded-full bg-[#FFB238] text-[#0A0E1A] text-[10px] font-mono font-bold uppercase tracking-wide">
            {product.offerLabel ?? 'Offer'}
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
          <div className="flex flex-col">
            <span className="text-base font-mono font-semibold text-[#FFB238]">
              Rs. {(product.offerPrice ?? product.price).toLocaleString()}
            </span>
            {product.offerPrice != null && product.offerPrice < product.price && (
              <span className="text-[11px] font-mono text-[#8592AC] line-through">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
          </div>

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

/* ================= FILTER MODAL ================= */
const FilterModal = ({ open, onClose, applied, onApply }: {
  open: boolean;
  onClose: () => void;
  applied: Filters;
  onApply: (filters: Filters) => void;
}) => {
  const [draft, setDraft] = useState<Filters>(applied)

  // Sync draft with applied filters each time the modal opens
  useEffect(() => {
    if (open) setDraft(applied)
  }, [open, applied])

  // Close on Escape + lock background scroll while open
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const update = (patch: Partial<Filters>) => setDraft(prev => ({ ...prev, ...patch }))

  const handleApply = () => {
    let { min, max } = draft
    // Swap if the user typed min greater than max
    if (min !== '' && max !== '' && Number(min) > Number(max)) {
      ;[min, max] = [max, min]
    }
    onApply({ ...draft, min, max })
    onClose()
  }

  const sectionLabel = 'text-[10px] font-mono text-[#8592AC] uppercase tracking-widest mb-3'
  const inputClass =
    'w-full bg-[#0A0E1A] border border-[#232F49] rounded-lg pl-10 pr-3 py-2 text-sm font-mono text-[#EDF1F7] placeholder-[#5C6270] focus:outline-none focus:border-[#5B8DEF] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
        className="relative w-full sm:max-w-md bg-[#121A2E] border border-[#232F49] rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#232F49]">
          <h2 className="text-base font-display font-semibold text-[#EDF1F7]">Filters</h2>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="p-1.5 rounded-lg text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#182238] transition-colors cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-6 overflow-y-auto">

          {/* Category */}
          <div>
            <p className={sectionLabel}>Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => update({ category: cat.value })}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono border transition-colors cursor-pointer ${
                    draft.category === cat.value
                      ? 'bg-[#5B8DEF] border-[#5B8DEF] text-[#0A0E1A] font-semibold'
                      : 'bg-transparent border-[#232F49] text-[#8592AC] hover:text-[#EDF1F7] hover:border-[#5B8DEF]/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <p className={sectionLabel}>Price</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#8592AC]">Rs.</span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={draft.min}
                  onChange={e => update({ min: e.target.value })}
                  placeholder="Min"
                  className={inputClass}
                />
              </div>
              <span className="text-[#5C6270]">–</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#8592AC]">Rs.</span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={draft.max}
                  onChange={e => update({ max: e.target.value })}
                  placeholder="Max"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRICE_PRESETS.map(preset => {
                const active = draft.min === preset.min && draft.max === preset.max
                return (
                  <button
                    key={preset.label}
                    onClick={() => update(active ? { min: '', max: '' } : { min: preset.min, max: preset.max })}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-mono border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#5B8DEF]/15 border-[#5B8DEF] text-[#5B8DEF]'
                        : 'bg-transparent border-[#232F49] text-[#8592AC] hover:text-[#EDF1F7] hover:border-[#5B8DEF]/50'
                    }`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sort */}
          <div>
            <p className={sectionLabel}>Sort by</p>
            <div className="space-y-1">
              {SORT_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-[#182238] transition-colors"
                >
                  <input
                    type="radio"
                    name="sort"
                    value={opt.value}
                    checked={draft.sort === opt.value}
                    onChange={() => update({ sort: opt.value })}
                    className="accent-[#5B8DEF] cursor-pointer"
                  />
                  <span className={`text-sm font-body ${draft.sort === opt.value ? 'text-[#EDF1F7]' : 'text-[#8592AC]'}`}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-[#232F49]">
          <button
            onClick={() => setDraft(DEFAULT_FILTERS)}
            className="px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wide text-[#8592AC] hover:text-[#EDF1F7] transition-colors cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-lg bg-[#5B8DEF] hover:bg-[#6E9CF2] text-[#0A0E1A] text-xs font-mono font-semibold uppercase tracking-wide transition-colors cursor-pointer"
          >
            Apply filters
          </button>
        </div>
      </div>
    </div>
  )
}

/* ================= PRODUCTS PAGE ================= */
const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
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

  const minPrice = filters.min !== '' ? Number(filters.min) : null
  const maxPrice = filters.max !== '' ? Number(filters.max) : null

  const filteredProducts = products.filter((product) => {
    if (filters.category !== 'all' && product.category !== filters.category) return false
    const price = getEffectivePrice(product)
    if (minPrice !== null && price < minPrice) return false
    if (maxPrice !== null && price > maxPrice) return false
    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (filters.sort === 'price-asc') return getEffectivePrice(a) - getEffectivePrice(b)
    if (filters.sort === 'price-desc') return getEffectivePrice(b) - getEffectivePrice(a)
    return 0
  })

  const hasPriceFilter = minPrice !== null || maxPrice !== null
  const hasCategoryFilter = filters.category !== 'all'
  const activeCount =
    (hasCategoryFilter ? 1 : 0) + (hasPriceFilter ? 1 : 0) + (filters.sort !== 'default' ? 1 : 0)

  const priceChipLabel = () => {
    if (minPrice !== null && maxPrice !== null) return `Rs. ${minPrice.toLocaleString()} – ${maxPrice.toLocaleString()}`
    if (minPrice !== null) return `Above Rs. ${minPrice.toLocaleString()}`
    return `Under Rs. ${(maxPrice ?? 0).toLocaleString()}`
  }

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('search')
    setSearchParams(next)
  }

  const chipClass =
    'inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-[#5B8DEF]/10 border border-[#5B8DEF]/30 text-[11px] font-mono text-[#5B8DEF]'

  return (
    <>
      <div className="min-h-screen bg-[#0A0E1A]">
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-10">

          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-display font-semibold text-[#EDF1F7]">
                All Products
              </h1>
              {!loading && (
                <p className="text-xs font-body text-[#8592AC] mt-1">
                  {sortedProducts.length} item{sortedProducts.length !== 1 ? 's' : ''} found
                  {searchQuery && <span className="text-[#EDF1F7]"> for "{searchQuery}"</span>}
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="ml-2 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wide text-[#5B8DEF] hover:text-[#EDF1F7] transition-colors cursor-pointer"
                    >
                      <FiX className="w-3 h-3" /> Clear
                    </button>
                  )}
                </p>
              )}
            </div>

            <button
              onClick={() => setFilterOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#121A2E] border border-[#232F49] hover:border-[#5B8DEF]/50 rounded-lg text-xs font-mono uppercase tracking-wide text-[#EDF1F7] transition-colors cursor-pointer"
            >
              <FiSliders className="w-3.5 h-3.5" />
              Filter
              {activeCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#5B8DEF] text-[#0A0E1A] text-[10px] font-bold flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* Active filter chips */}
          {(hasCategoryFilter || hasPriceFilter) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {hasCategoryFilter && (
                <span className={chipClass}>
                  {CATEGORIES.find(c => c.value === filters.category)?.label}
                  <button
                    onClick={() => setFilters(f => ({ ...f, category: 'all' }))}
                    aria-label="Remove category filter"
                    className="p-0.5 rounded-full hover:bg-[#5B8DEF]/20 cursor-pointer"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
              {hasPriceFilter && (
                <span className={chipClass}>
                  {priceChipLabel()}
                  <button
                    onClick={() => setFilters(f => ({ ...f, min: '', max: '' }))}
                    aria-label="Remove price filter"
                    className="p-0.5 rounded-full hover:bg-[#5B8DEF]/20 cursor-pointer"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="text-[10px] font-mono uppercase tracking-wide text-[#8592AC] hover:text-[#EDF1F7] transition-colors cursor-pointer ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} delay={i * 60} />
              ))}
            </div>
          ) : fetchError ? (
            <div className="relative flex flex-col items-center justify-center py-20 gap-4 bg-[#121A2E] rounded-xl border border-dashed border-rose-400/30">
              <div className="w-14 h-14 rounded-xl bg-[#182238] border border-rose-400/30 flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-rose-400" />
              </div>
              <div className="text-center">
                <p className="text-[#EDF1F7] font-display font-medium mb-1">Something went wrong</p>
                <p className="text-[#8592AC] font-body text-xs">Couldn't load products. Please try again.</p>
              </div>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="relative flex flex-col items-center justify-center py-20 gap-4 bg-[#121A2E] rounded-xl border border-dashed border-[#232F49]">
              <div className="w-14 h-14 rounded-xl bg-[#182238] border border-[#232F49] flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-[#5C6270]" />
              </div>
              <div className="text-center">
                <p className="text-[#EDF1F7] font-display font-medium mb-1">No products found</p>
                <p className="text-[#8592AC] font-body text-xs">
                  {searchQuery ? `Nothing matches "${searchQuery}"` : 'Try changing your filters'}
                </p>
              </div>
              {activeCount > 0 && (
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="text-xs font-mono uppercase tracking-wide text-[#5B8DEF] hover:text-[#EDF1F7] transition-colors cursor-pointer"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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

      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        applied={filters}
        onApply={setFilters}
      />

      {!isAdmin && <CartToast />}
    </>
  )
}

export default ProductsPage