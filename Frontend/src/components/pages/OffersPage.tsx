import React, { useContext, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiTag, FiShoppingCart, FiCheck, FiArrowRight } from 'react-icons/fi'
import { useOffers } from '../context/OffersContext'
import { CartContext } from '../context/CartContext'
import CartToast from '../CartToast'
import { getImageUrl } from '../../utils/imageUtils'
import type { Offer, Product } from '../../types'

type Filter = 'all' | 'discounts' | 'combos'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All Offers' },
  { key: 'discounts', label: 'Discounts' },
  { key: 'combos', label: 'Combos' },
]

const OfferCard = ({ offer }: { offer: Offer }) => {
  const cartContext = useContext(CartContext)
  const addToCart = cartContext?.addToCart ?? (async () => {})
  const [addedId, setAddedId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const isCombo = offer.type === 'combo'
  const regularTotal = offer.products.reduce((sum, p) => sum + p.price, 0)

  const handleAdd = async (productId: string) => {
    if (adding) return
    setAdding(true)
    try {
      const product = offer.products.find((p) => p._id === productId) as unknown as Product
      await addToCart(product)
      setAddedId(productId)
      setTimeout(() => setAddedId(null), 2000)
    } finally {
      setAdding(false)
    }
  }

  const handleAddBundle = async () => {
    if (adding) return
    setAdding(true)
    try {
      for (const p of offer.products) {
        await addToCart(p as unknown as Product)
      }
      setAddedId('bundle')
      setTimeout(() => setAddedId(null), 2500)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="bg-[#121A2E] rounded-2xl border border-[#232F49] overflow-hidden hover:border-[#5B8DEF]/40 transition-colors">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#232F49] flex items-start justify-between gap-4 bg-gradient-to-r from-[#121A2E] to-[#182238]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide ${isCombo
              ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
              : 'bg-[#FFB238]/15 text-[#FFB238] border border-[#FFB238]/30'
              }`}>
              {isCombo ? 'Combo Bundle' : offer.type === 'percentage' ? `${offer.discountValue}% OFF` : `Rs. ${offer.discountValue} OFF`}
            </span>
            {offer.endsAt && (
              <span className="text-[10px] font-mono text-[#8592AC] uppercase">
                Ends {new Date(offer.endsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          <h2 className="text-lg font-display font-semibold text-[#EDF1F7]">{offer.title}</h2>
          {offer.description && (
            <p className="text-xs text-[#8592AC] mt-1 line-clamp-2">{offer.description}</p>
          )}
        </div>

        {isCombo && (
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-mono font-bold text-[#FFB238]">Rs. {offer.comboPrice?.toLocaleString()}</p>
            <p className="text-[11px] font-mono text-[#8592AC] line-through">Rs. {regularTotal.toLocaleString()}</p>
            <p className="text-[11px] font-mono text-emerald-400 font-bold">
              Save Rs. {(regularTotal - (offer.comboPrice ?? 0)).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Products */}
      <div className="divide-y divide-[#232F49]">
        {offer.products.map((p) => {
          const onOffer = offer.type !== 'combo' && p.offerPrice < p.price
          return (
            <div key={p._id} className="px-5 py-4 flex items-center gap-4">
              <Link to={`/products/${p.slug}-${p._id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <img
                  src={getImageUrl(p.image)}
                  alt={p.name}
                  className="w-14 h-14 rounded-lg object-cover border border-[#232F49] bg-[#0A0E1A] flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#EDF1F7] truncate hover:text-[#5B8DEF] transition-colors">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-mono font-semibold text-[#FFB238]">
                      Rs. {(onOffer ? p.offerPrice : p.price).toLocaleString()}
                    </span>
                    {onOffer && (
                      <span className="text-[11px] font-mono text-[#8592AC] line-through">Rs. {p.price.toLocaleString()}</span>
                    )}
                    {isCombo && (
                      <span className="text-[10px] font-mono text-[#8592AC] uppercase">part of bundle</span>
                    )}
                  </div>
                </div>
              </Link>

              {!isCombo ? (
                <button
                  onClick={() => handleAdd(p._id)}
                  disabled={adding}
                  aria-label={`Add ${p.name} to cart`}
                  className="p-2.5 rounded-lg border transition-all cursor-pointer disabled:opacity-50 flex-shrink-0 bg-[#182238] border-[#232F49] text-[#8592AC] hover:bg-[#5B8DEF] hover:text-[#0A0E1A] hover:border-[#5B8DEF]"
                >
                  {addedId === p._id ? <FiCheck className="w-4 h-4 text-emerald-400" /> : <FiShoppingCart className="w-4 h-4" />}
                </button>
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#232F49] bg-[#0A0E1A]/40 flex items-center justify-between gap-3">
        <p className="text-[11px] text-[#8592AC] font-mono uppercase tracking-wide">
          {isCombo ? 'All products added together' : 'Discount applies automatically'}
        </p>
        {isCombo && (
          <button
            onClick={handleAddBundle}
            disabled={adding}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFB238] hover:bg-[#ffc158] text-[#0A0E1A] rounded-lg font-mono font-semibold text-[11px] uppercase tracking-wider transition cursor-pointer disabled:opacity-60"
          >
            {addedId === 'bundle' ? <FiCheck className="w-3.5 h-3.5" /> : <FiShoppingCart className="w-3.5 h-3.5" />}
            {addedId === 'bundle' ? 'Added!' : adding ? 'Adding...' : 'Add Bundle'}
          </button>
        )}
      </div>
    </div>
  )
}

const OffersPage = () => {
  const { offers, offersLoading } = useOffers()
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(() => {
    if (filter === 'combos') return offers.filter((o) => o.type === 'combo')
    if (filter === 'discounts') return offers.filter((o) => o.type !== 'combo')
    return offers
  }, [offers, filter])

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-20">
      {/* Page header */}
      <section className="border-b border-[#232F49] bg-[#121A2E]">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <p className="text-[11px] font-mono text-[#FFB238] uppercase tracking-widest mb-3 flex items-center gap-2">
            <FiTag className="w-3.5 h-3.5" /> Savings hub
          </p>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-[#EDF1F7] mb-3">
            Offers & Combos
          </h1>
          <p className="text-sm md:text-base text-[#8592AC] max-w-2xl">
            Limited-time discounts and bundle deals. Combo savings apply automatically when you buy every product in the bundle.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pt-8">
        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition cursor-pointer ${
                filter === key
                  ? 'bg-[#5B8DEF] text-[#0A0E1A] border-[#5B8DEF]'
                  : 'bg-[#121A2E] text-[#8592AC] border-[#232F49] hover:text-[#EDF1F7] hover:border-[#5B8DEF]/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {offersLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#232F49] border-t-[#5B8DEF] animate-spin" />
            <p className="text-[#8592AC] text-sm font-mono">Loading offers...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#232F49] bg-[#121A2E] py-24 flex flex-col items-center gap-4 text-center px-6">
            <div className="w-14 h-14 rounded-xl bg-[#0A0E1A] border border-[#232F49] flex items-center justify-center">
              <FiTag className="w-6 h-6 text-[#8592AC]" />
            </div>
            <div>
              <p className="text-[#EDF1F7] font-display font-semibold mb-1">No active offers right now</p>
              <p className="text-sm text-[#8592AC]">Check back soon — new deals drop regularly.</p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#5B8DEF] hover:bg-[#4A7CE0] text-[#0A0E1A] rounded-lg font-mono font-semibold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Browse Products <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((offer) => (
              <OfferCard key={offer._id} offer={offer} />
            ))}
          </div>
        )}
      </div>

      <CartToast />
    </div>
  )
}

export default OffersPage
