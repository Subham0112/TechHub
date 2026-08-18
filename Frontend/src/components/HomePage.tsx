import React, { useState, useEffect, useRef, useContext } from 'react'
import { CartContext } from './context/CartContext'
import { UserContext } from './context/UserContext'
import { getImageUrl } from '../utils/imageUtils'
import CartToast from './CartToast'
import { useNavigate } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight, FiShoppingCart, FiTruck, FiShield, FiCreditCard, FiHeadphones, FiArrowRight } from 'react-icons/fi'
import axios from 'axios'
import type { Product } from '../types'

interface HeroSlide {
  eyebrow: string
  title: string
  subtitle: string
  cta: string
  image: string
}

const heroSlides: HeroSlide[] = [
  {
    eyebrow: "Smart Wearables",
    title: "Track every step, style every wrist.",
    subtitle: "Smartwatches and fitness bands engineered to keep up with your day — from workouts to notifications.",
    cta: "Shop Wearables",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1400&q=80",
  },
  {
    eyebrow: "Premium Audio",
    title: "Sound that surrounds you.",
    subtitle: "Crystal-clear headphones and earbuds tuned for deep, immersive listening — wherever you go.",
    cta: "Shop Audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&q=80",
  },
  {
    eyebrow: "Latest Tech",
    title: "Power meets innovation, right in your pocket.",
    subtitle: "The newest smartphones and gadgets, curated and ready to ship. Upgrade your everyday carry.",
    cta: "Browse All Products",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1400&q=80",
  }
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
    <div className="group relative bg-[#121A2E] rounded-xl overflow-hidden border border-[#232F49] hover:border-[#5B8DEF]/50 hover:shadow-[0_16px_40px_-16px_rgba(91,141,239,0.35)] transition-all duration-300 hover:-translate-y-1 flex-shrink-0 w-[250px] flex flex-col">

      <div className="relative h-[180px] overflow-hidden bg-[#0A0E1A] flex-shrink-0">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          onClick={() => navigate(productHref)}
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

      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] font-mono text-[#8592AC] uppercase tracking-widest">{product.type || product.category}</span>
        <h3
          onClick={() => navigate(productHref)}
          className="text-[#EDF1F7] font-display font-medium text-sm mt-1.5 mb-3 line-clamp-2 min-h-[2.5rem] cursor-pointer hover:text-[#5B8DEF] transition-colors"
        >
          {product.name}
        </h3>

        <div className="flex items-center justify-between pt-3 border-t border-[#232F49] mt-auto">
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

/* ================= PRODUCT SECTION ================= */
const ProductSection = React.memo<{
  eyebrow: string;
  title: string;
  products: Product[];
  handleCartClick: (product: Product) => void;
  isAdmin: boolean;
}>(({ eyebrow, title, products, handleCartClick, isAdmin }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScroll()
    const timer = setTimeout(checkScroll, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 270
      containerRef.current.scrollTo({
        left: direction === 'left'
          ? containerRef.current.scrollLeft - scrollAmount
          : containerRef.current.scrollLeft + scrollAmount,
        behavior: 'smooth'
      })
      setTimeout(checkScroll, 400)
    }
  }

  return (
    <div className="mb-16">
      <div className="flex items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-[11px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-2">
            {eyebrow}
          </p>
          <h2 className="text-xl md:text-2xl font-display font-semibold text-[#EDF1F7]">{title}</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} disabled={!canScrollLeft}
            aria-label="Scroll products left"
            className="p-2.5 rounded-lg text-[#8592AC] bg-[#121A2E] border border-[#232F49] hover:border-[#5B8DEF]/60 hover:text-[#EDF1F7] disabled:opacity-30 disabled:hover:border-[#232F49] transition">
            <FiChevronLeft />
          </button>
          <button onClick={() => scroll('right')} disabled={!canScrollRight}
            aria-label="Scroll products right"
            className="p-2.5 rounded-lg text-[#8592AC] bg-[#121A2E] border border-[#232F49] hover:border-[#5B8DEF]/60 hover:text-[#EDF1F7] disabled:opacity-30 disabled:hover:border-[#232F49] transition">
            <FiChevronRight />
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex items-center justify-center h-40 bg-[#121A2E] rounded-xl border border-dashed border-[#232F49]">
          <p className="text-[#8592AC] font-body text-sm">No products available yet.</p>
        </div>
      ) : (
        <div ref={containerRef} className="flex gap-5 overflow-x-auto scrollbar-hide pb-4" onScroll={checkScroll}>
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              handleCartClick={handleCartClick}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  )
})

/* ================= TRUST BAR ================= */
const TrustBar = () => {
  const items = [
    { icon: FiTruck, title: "Free Delivery", subtitle: "On orders over Rs. 5,000" },
    { icon: FiShield, title: "Genuine Products", subtitle: "100% authentic, verified" },
    { icon: FiCreditCard, title: "Secure Payment", subtitle: "COD & online payment" },
    { icon: FiHeadphones, title: "24/7 Support", subtitle: "We're always here to help" },
  ]

  return (
    <section className="border-b border-[#232F49]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#232F49]">
          {items.map((item, idx) => (
            <div key={idx} className="bg-[#0A0E1A] px-5 py-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#121A2E] border border-[#232F49] flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-[#5B8DEF]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#EDF1F7]">{item.title}</p>
                <p className="text-xs text-[#8592AC] truncate">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================= CATEGORY TILES ================= */
const CategoryTiles = () => {
  const navigate = useNavigate()
  const tiles = [
    {
      eyebrow: "Collection / 01",
      label: "Mobile Accessories",
      description: "Cases, chargers, and more for your phone",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
      href: "/products/category/mobile-accessories",
    },
    {
      eyebrow: "Collection / 02",
      label: "Gadgets",
      description: "Smart devices and everyday tech",
      image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80",
      href: "/products/category/gadgets",
    },
    {
      eyebrow: "Collection / 03",
      label: "All Products",
      description: "Browse the complete collection",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
      href: "/products",
    },
  ]

  return (
    <section className="mb-16">
      <div className="flex items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-[11px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-2">Shop by category</p>
          <h2 className="text-xl md:text-2xl font-display font-semibold text-[#EDF1F7]">Explore Our Collections</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tiles.map((tile) => (
          <button
            key={tile.label}
            onClick={() => navigate(tile.href)}
            className="group relative h-56 rounded-xl overflow-hidden border border-[#232F49] hover:border-[#5B8DEF]/50 transition-colors duration-300 text-left cursor-pointer"
          >
            <img
              src={tile.image}
              alt={tile.label}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-[#0A0E1A]/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-[11px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-1.5">
                {tile.eyebrow}
              </p>
              <p className="text-lg font-display font-semibold text-[#EDF1F7] mb-1">{tile.label}</p>
              <p className="text-xs text-[#8592AC] mb-3">{tile.description}</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B8DEF] group-hover:gap-2.5 transition-all">
                Explore <FiArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

/* ================= PROMO BANNER ================= */
const PromoBanner = () => {
  const navigate = useNavigate()
  return (
    <section className="mb-16">
      <div className="relative rounded-2xl overflow-hidden border border-[#232F49]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0A0E1A]/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E1A] via-[#0A0E1A]/60 to-transparent" />
        </div>

        <div className="relative px-6 py-12 sm:px-12 sm:py-16 max-w-2xl">
          <p className="text-[11px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-3">New season, new tech</p>
          <h2 className="text-2xl md:text-3xl font-display font-semibold text-[#EDF1F7] mb-3 leading-tight">
            Fresh arrivals, hand-picked for you
          </h2>
          <p className="text-sm text-[#8592AC] mb-8 leading-relaxed">
            From premium audio to everyday smart gadgets — explore what's new and gear up for what's next.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#FFB238] hover:bg-[#ffc158] text-[#0A0E1A] rounded-lg font-mono font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Discover Products
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}

/* ================= NEWSLETTER ================= */
const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
  }

  return (
    <section className="relative rounded-2xl bg-[#121A2E] border border-[#232F49] px-6 py-12 sm:px-12 text-center overflow-hidden">
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[#5B8DEF]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative">
        <p className="text-[11px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-3">Stay in the loop</p>
        <h2 className="text-2xl font-display font-semibold text-[#EDF1F7] mb-3">
          Get the latest deals and drops
        </h2>
        <p className="text-sm text-[#8592AC] mb-8 max-w-md mx-auto">
          Join our newsletter for exclusive offers, restock alerts, and tech news. No spam, ever.
        </p>

        {subscribed ? (
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <FiShield className="w-4 h-4" /> Thanks for subscribing! You're on the list.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-[#0A0E1A] border border-[#232F49] focus:border-[#5B8DEF] rounded-lg outline-none text-sm text-[#EDF1F7] placeholder:text-[#8592AC] font-body"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#5B8DEF] hover:bg-[#4A7CE0] text-[#0A0E1A] rounded-lg font-mono font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

/* ================= HOMEPAGE ================= */
const Homepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const cartContext = useContext(CartContext)
  const addToCart = cartContext?.addToCart ?? (async () => {})
  const { user } = useContext(UserContext)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get<Product[]>(`${import.meta.env.VITE_API_URL}/products/`)
        setProducts(res.data)
      } catch (error) {
        console.log("Product fetch error:", error)
      }
    }
    fetchProducts()
  }, [])

  return (
    <>
      <div className="min-h-screen bg-[#0A0E1A]">

        {/* HERO */}
        <section className="relative h-[560px] md:h-[600px] overflow-hidden border-b border-[#232F49]">
          {heroSlides.map((slide, index) => (
            <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }} />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E1A] via-[#0A0E1A]/70 to-[#0A0E1A]/20" />
              <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
                <div className="relative max-w-2xl">
                  <p className="text-xs font-mono text-[#5B8DEF] uppercase tracking-widest mb-4">
                    {slide.eyebrow}
                  </p>
                  <h1 className="text-4xl md:text-5xl font-display font-semibold text-[#EDF1F7] mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-base md:text-lg text-[#8592AC] font-body mb-8 max-w-xl">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <a href="#products" className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#FFB238] hover:bg-[#ffc158] text-[#0A0E1A] rounded-lg font-mono font-semibold text-xs uppercase tracking-wider transition">
                      Shop Now
                    </a>
                    <a
                      href="#categories"
                      className="inline-flex items-center gap-2 px-7 py-3.5 border border-[#232F49] hover:border-[#5B8DEF]/60 text-[#EDF1F7] rounded-lg font-mono font-semibold text-xs uppercase tracking-wider transition bg-[#121A2E]/60 backdrop-blur-sm"
                    >
                      Explore Categories
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Slide indicators */}
          <div className="absolute bottom-8 left-4 sm:left-8 flex items-center gap-2 z-10">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === currentSlide ? 'w-8 bg-[#5B8DEF]' : 'w-4 bg-[#2A3752] hover:bg-[#5B8DEF]/50'}`}
              />
            ))}
          </div>
        </section>

        {/* TRUST BAR */}
        <TrustBar />

        {/* CATEGORIES */}
        <section id="categories" className="max-w-7xl mx-auto px-4 pt-16">
          <CategoryTiles />
        </section>

        {/* PRODUCTS */}
        <section id="products" className="relative max-w-7xl mx-auto px-4 pb-4">
          <ProductSection
            eyebrow="Featured"
            title="All Products"
            products={products}
            handleCartClick={addToCart}
            isAdmin={isAdmin}
          />
          <ProductSection
            eyebrow="Collection"
            title="Mobile Accessories"
            products={products.filter(p => p.category === "mobile-accessories")}
            handleCartClick={addToCart}
            isAdmin={isAdmin}
          />
          <ProductSection
            eyebrow="Collection"
            title="Gadgets"
            products={products.filter(p => p.category === "gadgets")}
            handleCartClick={addToCart}
            isAdmin={isAdmin}
          />
        </section>

        {/* PROMO */}
        <section className="max-w-7xl mx-auto px-4">
          <PromoBanner />
        </section>

        {/* NEWSLETTER */}
        <section className="max-w-7xl mx-auto px-4 pb-20">
          <Newsletter />
        </section>

        {!isAdmin && <CartToast />}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  )
}

export default Homepage