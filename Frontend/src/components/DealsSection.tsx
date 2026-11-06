import React, { useContext, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiShoppingCart,
  FiTag,
  FiSettings,
} from 'react-icons/fi'
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

const offerLabel = (offer: Offer): string => {
  if (offer.type === 'combo') return 'Combo bundle'
  if (offer.type === 'percentage') return `${offer.discountValue}% off`
  return `Rs. ${offer.discountValue.toLocaleString()} off`
}

const OffersCard = ({ offer, isAdmin }: { offer: Offer; isAdmin: boolean }) => {
  const navigate = useNavigate()
  const cartContext = useContext(CartContext)
  const addToCart = cartContext?.addToCart ?? (async () => {})
  const [adding, setAdding] = useState(false)

  const isCombo = offer.type === 'combo'
  const savings = offerSavings(offer)
  const regularTotal = offer.products.reduce((sum, p) => sum + p.price, 0)
  const coverImage = offer.products[0]?.image
  const manageHref = '/admin/offers'

  const productNames = offer.products.map((p) => p.name).join(' · ')

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

  const handleManage = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(manageHref)
  }

  return (
    <div
      onClick={() => navigate(isAdmin ? manageHref : '/offers')}
      className="group relative h-56 sm:h-60 flex-shrink-0 w-[270px] sm:w-[300px] rounded-xl overflow-hidden border border-[#232F49] hover:border-[#5B8DEF]/50 transition-colors duration-300 cursor-pointer snap-start bg-[#121A2E]"
    >
      <img
        src={getImageUrl(coverImage)}
        alt={offer.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-[#0A0E1A]/70 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p className="text-[10px] sm:text-[11px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-1 sm:mb-1.5">
          {offerLabel(offer)}
        </p>
        <p className="text-base sm:text-lg font-display font-semibold text-[#EDF1F7] mb-0.5 sm:mb-1 line-clamp-2">
          {offer.title}
        </p>
        <p className="text-[11px] sm:text-xs text-[#8592AC] mb-2 line-clamp-1">
          {offer.description || productNames}
        </p>

        <div className="flex items-center gap-2 mb-2.5">
          {isCombo ? (
            <>
              <span className="text-sm font-mono font-bold text-[#FFB238]">
                Rs. {offer.comboPrice?.toLocaleString()}
              </span>
              <span className="text-[11px] font-mono text-[#8592AC] line-through">
                Rs. {regularTotal.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-[11px] font-mono text-[#8592AC]">
              {offer.products.length} product{offer.products.length === 1 ? '' : 's'}
            </span>
          )}
          <span className="ml-auto text-[11px] font-mono font-bold text-emerald-400">
            Save Rs. {savings.toLocaleString()}
          </span>
        </div>

        {isAdmin ? (
          <button
            onClick={handleManage}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B8DEF] group-hover:gap-2.5 transition-all cursor-pointer"
          >
            <FiSettings className="w-3.5 h-3.5" /> Manage offer
          </button>
        ) : (
          <button
            onClick={handleAddBundle}
            disabled={adding}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B8DEF] group-hover:gap-2.5 transition-all cursor-pointer disabled:opacity-60"
          >
            <FiShoppingCart className="w-3.5 h-3.5" />
            {adding ? 'Adding...' : isCombo ? 'Add bundle' : 'Grab offer'}
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
    <section className="max-w-7xl mx-auto px-4 pt-10 sm:pt-16 mb-12 sm:mb-16">
      <div className="flex items-end justify-between gap-4 mb-5 sm:mb-7">
        <div>
          <p className="text-[10px] sm:text-[11px] font-mono text-[#FFB238] uppercase tracking-widest mb-1.5 sm:mb-2 flex items-center gap-2">
            <FiTag className="w-3.5 h-3.5" /> Live now
          </p>
          <h2 className="text-lg sm:text-xl md:text-2xl font-display font-semibold text-[#EDF1F7]">
            Offers
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/offers')}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B8DEF] hover:gap-2.5 transition-all cursor-pointer"
          >
            View all <FiArrowRight className="w-3.5 h-3.5" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll offers left"
              className="p-2.5 rounded-lg text-[#8592AC] bg-[#121A2E] border border-[#232F49] hover:border-[#FFB238]/60 hover:text-[#EDF1F7] disabled:opacity-30 transition cursor-pointer"
            >
              <FiChevronLeft />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll offers right"
              className="p-2.5 rounded-lg text-[#8592AC] bg-[#121A2E] border border-[#232F49] hover:border-[#FFB238]/60 hover:text-[#EDF1F7] disabled:opacity-30 transition cursor-pointer"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex gap-3 sm:gap-5 overflow-x-auto scrollbar-hide pb-3 sm:pb-4 snap-x snap-mandatory"
      >
        {offers.map((offer) => (
          <OffersCard key={offer._id} offer={offer} isAdmin={isAdmin} />
        ))}
      </div>
    </section>
  )
}

export default DealsSection
