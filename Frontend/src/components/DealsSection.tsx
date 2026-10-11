import React, { useContext, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight, FiArrowRight, FiShoppingCart, FiTag } from 'react-icons/fi'
import { useOffers } from './context/OffersContext'
import { CartContext } from './context/CartContext'
import { getImageUrl } from '../utils/imageUtils'
import type { Offer, Product } from '../types'

const offerSavings = (offer: Offer): number => {
  if (offer.type === 'combo' && offer.comboPrice) {
    const regular = offer.products.reduce((sum, p) => sum + p.price, 0)
    return Math.max(regular - offer.comboPrice, 0)
  }
  if (offer.type === 'percentage') {
    const maxPrice = Math.max(...offer.products.map((p) => p.price), 0)
    return Math.round((maxPrice * offer.discountValue) / 100)
  }
  return offer.discountValue
}

const OffersCard = ({ offer, isAdmin }: { offer: Offer; isAdmin: boolean }) => {
  const navigate = useNavigate()
  const cartContext = useContext(CartContext)
  const addToCart = cartContext?.addToCart ?? (async () => {})
  const [adding, setAdding] = useState(false)

  const isCombo = offer.type === 'combo'
  const savings = offerSavings(offer)
  const regularTotal = offer.products.reduce((sum, p) => sum + p.price, 0)

  const handleAddBundle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (adding || isAdmin) return
    setAdding(true)
    try {
      for (const p of offer.products) {
        await addToCart(p as unknown as Product)
      }
      navigate('/cart')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div
      onClick={() => navigate('/offers')}
      className="group relative bg-[#121A2E] rounded-xl overflow-hidden border border-[#232F49] hover:border-[#FFB238]/50 hover:shadow-[0_16px_40px_-16px_rgba(255,178,56,0.3)] transition-all duration-300 hover:-translate-y-1 flex-shrink-0 w-[280px] cursor-pointer"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide ${isCombo
            ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
            : 'bg-[#FFB238]/15 text-[#FFB238] border border-[#FFB238]/30'
            }`}>
            {isCombo ? 'Combo Bundle' : (offer.discountValue >= 50 ? 'Hot Deal' : 'Offer')}
          </span>
          <span className="text-[10px] font-mono text-[#8592AC] uppercase tracking-widest">
            {isCombo ? `Rs. ${offer.comboPrice?.toLocaleString()}` : offer.discountValue + '% off'}
          </span>
        </div>

        <h3 className="text-[#EDF1F7] font-display font-semibold text-sm mb-1.5 line-clamp-2 min-h-[2.5rem]">
          {offer.title}
        </h3>
        {offer.description && (
          <p className="text-xs text-[#8592AC] line-clamp-2 mb-3 min-h-[2rem]">{offer.description}</p>
        )}

        {/* Product thumbnails */}
        <div className="flex items-center gap-2 mb-4">
          {offer.products.slice(0, 3).map((p) => (
            <img
              key={p._id}
              src={getImageUrl(p.image)}
              alt={p.name}
              className="w-12 h-12 rounded-lg object-cover border border-[#232F49] bg-[#0A0E1A]"
            />
          ))}
          {offer.products.length > 3 && (
            <span className="w-12 h-12 rounded-lg border border-dashed border-[#232F49] flex items-center justify-center text-[10px] font-mono text-[#8592AC]">
              +{offer.products.length - 3}
            </span>
          )}
          <div className="ml-auto text-right">
            <p className="text-[11px] font-mono text-emerald-400 font-bold">
              Save Rs. {savings.toLocaleString()}
            </p>
            {isCombo && (
              <p className="text-[10px] font-mono text-[#8592AC] line-through">
                Rs. {regularTotal.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {!isAdmin && (
          <button
            onClick={handleAddBundle}
            disabled={adding}
            className="w-full py-2.5 bg-[#0A0E1A]/60 border border-[#232F49] text-[#EDF1F7] rounded-lg font-mono font-semibold cursor-pointer text-[11px] uppercase tracking-wide hover:bg-[#FFB238] hover:text-[#0A0E1A] hover:border-[#FFB238] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FiShoppingCart className="w-3.5 h-3.5" />
            {adding ? 'Adding...' : isCombo ? 'Add Bundle' : 'Grab Deal'}
          </button>
        )}
      </div>
    </div>
  )
}

const DealsSection = ({ isAdmin }: { isAdmin: boolean }) => {
  const navigate = useNavigate()
  const { offers } = useOffers()
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    const checkScroll = () => {
      if (containerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
      }
    }
    checkScroll()
    const timer = setTimeout(checkScroll, 150)
    window.addEventListener('resize', checkScroll)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', checkScroll)
    }
  }, [offers.length])

  if (offers.length === 0) return null

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return
    containerRef.current.scrollTo({
      left: containerRef.current.scrollLeft + (direction === 'left' ? -300 : 300),
      behavior: 'smooth',
    })
  }

  return (
    <div className="mb-16">
      <div className="flex items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-[11px] font-mono text-[#FFB238] uppercase tracking-widest mb-2 flex items-center gap-2">
            <FiTag className="w-3.5 h-3.5" /> Live now
          </p>
          <h2 className="text-xl md:text-2xl font-display font-semibold text-[#EDF1F7]">Deals & Combos</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/offers')}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B8DEF] hover:gap-2.5 transition-all cursor-pointer"
          >
            View all <FiArrowRight className="w-3.5 h-3.5" />
          </button>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} disabled={!canScrollLeft}
              aria-label="Scroll offers left"
              className="p-2.5 rounded-lg text-[#8592AC] bg-[#121A2E] border border-[#232F49] hover:border-[#FFB238]/60 hover:text-[#EDF1F7] disabled:opacity-30 transition cursor-pointer">
              <FiChevronLeft />
            </button>
            <button onClick={() => scroll('right')} disabled={!canScrollRight}
              aria-label="Scroll offers right"
              className="p-2.5 rounded-lg text-[#8592AC] bg-[#121A2E] border border-[#232F49] hover:border-[#FFB238]/60 hover:text-[#EDF1F7] disabled:opacity-30 transition cursor-pointer">
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="flex gap-5 overflow-x-auto scrollbar-hide pb-4">
        {offers.map((offer) => (
          <OffersCard key={offer._id} offer={offer} isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  )
}

export default DealsSection
