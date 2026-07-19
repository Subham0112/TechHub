import React, { useState, useEffect, useRef, useContext } from 'react'
import { CartContext } from './context/CartContext.jsx';
import { UserContext } from './context/UserContext.jsx';
import { getImageUrl } from '../utils/imageUtils.js';
import CartToast from './CartToast.jsx';
import { FiChevronLeft, FiChevronRight, FiShoppingCart } from 'react-icons/fi'
import axios from 'axios'

const heroSlides = [
  {
    eyebrow: "Featured Category",
    title: "Smart Wearables",
    subtitle: "Track every step, style every wrist.",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1400&q=80",
  },
  {
    eyebrow: "Featured Category",
    title: "Premium Audio",
    subtitle: "Crystal-clear sound, engineered for immersion.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&q=80",
  },
  {
    eyebrow: "Featured Category",
    title: "Latest Smartphones",
    subtitle: "Power meets innovation, right in your pocket.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1400&q=80",
  }
]

/* Viewfinder corner brackets — recurring signature motif */
const Corners = ({ color = "border-[#5B8DEF]", visible = "opacity-100" }) => (
  <>
    <span className={`absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 ${color} ${visible} pointer-events-none transition-opacity duration-300`} />
    <span className={`absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 ${color} ${visible} pointer-events-none transition-opacity duration-300`} />
    <span className={`absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 ${color} ${visible} pointer-events-none transition-opacity duration-300`} />
    <span className={`absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 ${color} ${visible} pointer-events-none transition-opacity duration-300`} />
  </>
);

/* ================= PRODUCT CARD ================= */
const ProductCard = ({ product, handleCartClick, isAdmin }) => (
  <div className="group relative bg-[#121A2E] rounded-xl overflow-hidden border border-[#232F49] hover:border-[#5B8DEF]/60 transition-all duration-300 hover:-translate-y-1.5 flex-shrink-0 w-[240px]">

    <div className="relative h-[180px] overflow-hidden bg-[#0A0E1A]">
      <img
        src={getImageUrl(product.image)}
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

/* ================= PRODUCT SECTION ================= */
const ProductSection = React.memo(({ eyebrow, title, products, handleCartClick, isAdmin }) => {
  const containerRef = useRef(null)
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

  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 260
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
    <div className="mb-14">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-1.5">
            // {eyebrow}
          </p>
          <h2 className="text-xl md:text-2xl font-display font-semibold text-[#EDF1F7]">{title}</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} disabled={!canScrollLeft}
            className="p-2 rounded-md text-[#8592AC] bg-[#121A2E] border border-[#232F49] hover:border-[#5B8DEF] hover:text-[#EDF1F7] disabled:opacity-30 disabled:hover:border-[#232F49] transition">
            <FiChevronLeft />
          </button>
          <button onClick={() => scroll('right')} disabled={!canScrollRight}
            className="p-2 rounded-md text-[#8592AC] bg-[#121A2E] border border-[#232F49] hover:border-[#5B8DEF] hover:text-[#EDF1F7] disabled:opacity-30 disabled:hover:border-[#232F49] transition">
            <FiChevronRight />
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex items-center justify-center h-40 bg-[#121A2E] rounded-xl border border-dashed border-[#232F49]">
          <p className="text-[#8592AC] font-mono text-sm">// No products available</p>
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

/* ================= HOMEPAGE ================= */
const Homepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [products, setProducts] = useState([])
  const { addToCart } = useContext(CartContext)
  const { user } = useContext(UserContext)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/products/`)
        setProducts(res.data)
      } catch (error) {
        console.log("Product fetch error:", error)
      }
    }
    fetchProducts()
  }, [])

  return (
    <>
      <div className="relative min-h-screen bg-[#0A0E1A]">

        {/* Global blueprint grid — same fixed overlay treatment as ProductsPage, so the
            background is continuous when scrolling from the hero into the sections below
            and when navigating between pages. Sits behind everything; the hero's own
            image + gradient naturally cover it within the hero area. */}
        <div
          className="fixed inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#5B8DEF 1px, transparent 1px), linear-gradient(90deg, #5B8DEF 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* HERO */}
        <section className="relative h-[600px] overflow-hidden border-b border-[#232F49]">
          {heroSlides.map((slide, index) => (
            <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }} />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E1A] via-[#0A0E1A]/75 to-transparent" />
              <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
                <div className="relative max-w-xl p-8">
                  <Corners />
                  <p className="text-xs font-mono text-[#5B8DEF] uppercase tracking-widest mb-4">
                    // {slide.eyebrow} — {String(index + 1).padStart(2, '0')}/{String(heroSlides.length).padStart(2, '0')}
                  </p>
                  <h1 className="text-4xl md:text-5xl font-display font-semibold text-[#EDF1F7] mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-base md:text-lg text-[#8592AC] font-body mb-8">
                    {slide.subtitle}
                  </p>
                  <a href="#products" className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#FFB238] hover:bg-[#ffc158] text-[#0A0E1A] rounded-md font-mono font-semibold text-xs uppercase tracking-wider transition">
                    View Products
                  </a>
                </div>
              </div>
            </div>
          ))}

          {/* Segmented progress indicator, replaces plain dots */}
          <div className="absolute bottom-8 left-4 sm:left-8 flex items-center gap-2 z-10">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className="group/seg relative h-1 rounded-full overflow-hidden bg-[#232F49]"
                style={{ width: i === currentSlide ? '36px' : '18px', transition: 'width 0.4s ease' }}
              >
                {i === currentSlide && (
                  <span className="absolute inset-0 bg-[#5B8DEF]" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* PRODUCTS */}
        <section id="products" className="relative max-w-7xl mx-auto px-4 py-16">
          <ProductSection
            eyebrow="Inventory"
            title="All Products"
            products={products}
            handleCartClick={addToCart}
            isAdmin={isAdmin}
          />
          <ProductSection
            eyebrow="Category / 01"
            title="Mobile Accessories"
            products={products.filter(p => p.category === "mobile-accessories")}
            handleCartClick={addToCart}
            isAdmin={isAdmin}
          />
          <ProductSection
            eyebrow="Category / 02"
            title="Gadgets"
            products={products.filter(p => p.category === "gadgets")}
            handleCartClick={addToCart}
            isAdmin={isAdmin}
          />
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