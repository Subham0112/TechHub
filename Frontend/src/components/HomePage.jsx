import React, { useState, useEffect, useRef } from 'react'
import Navbar from './Navbar.jsx'
import { useContext } from 'react';
import { CartContext } from './context/CartContext.jsx';
import CartToast from './CartToast.jsx';
import { FiChevronLeft, FiChevronRight, FiShoppingCart, FiHeart } from 'react-icons/fi'
import axios from 'axios'


/* ================= HERO DATA ================= */
const heroSlides = [
  {
    title: "Smart Wearables 2025",
    subtitle: "Track your fitness, style your wrist",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1200&q=80",
    gradient: "from-slate-900/70 via-slate-800/60 to-transparent"
  },
  {
    title: "Premium Audio Experience",
    subtitle: "Immerse yourself in crystal clear sound",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
    gradient: "from-slate-900/70 via-slate-800/60 to-transparent"
  },
  {
    title: "Latest Smartphones",
    subtitle: "Power meets innovation in your pocket",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80",
    gradient: "from-slate-900/70 via-slate-800/60 to-transparent"
  }
]

/* ================= PRODUCT CARD ================= */
const ProductCard = ({ product, handleCartClick }) => (
  <div className="group bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-2 border border-slate-700/50 flex-shrink-0 w-[240px]">

    <div className="relative h-[180px] overflow-hidden bg-slate-900">
      <img
        src={product.image || "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1200&q=80"}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />

      <button className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors">
        <FiHeart className="w-4 h-4 text-slate-900" />
      </button>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
        <button
        onClick={() => handleCartClick(product)}
        className="px-4 py-1.5 bg-white text-slate-900 rounded-full font-semibold cursor-pointer text-sm hover:bg-slate-100 transition-all flex items-center gap-1.5">
          <FiShoppingCart className="w-3.5 h-3.5" />
          Quick Add
        </button>
      </div>
    </div>

    <div className="p-3">
      <h3 className="text-white font-semibold text-sm mb-1.5 line-clamp-1">
        {product.name}
      </h3>

      <p className="text-slate-400 text-xs line-clamp-2 mb-2">
        {product.description}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          Rs. {product.price}
        </span>

        <button
        onClick={() => handleCartClick(product)}
        className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors cursor-pointer">
          <FiShoppingCart className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>

  </div>
)

/* ================= PRODUCT SECTION ================= */
const ProductSection = React.memo(({ title, products, handleCartClick }) => {
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

      const newScrollLeft =
        direction === 'left'
          ? containerRef.current.scrollLeft - scrollAmount
          : containerRef.current.scrollLeft + scrollAmount

      containerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })

      setTimeout(checkScroll, 400)
    }
  }

  return (
    <div className="mb-10">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>

        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="p-2 rounded-full text-white bg-slate-800 hover:bg-slate-700"
          >
            <FiChevronLeft />
          </button>

          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="p-2 rounded-full text-white bg-slate-800 hover:bg-slate-700"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide pb-4"
        onScroll={checkScroll}
      >
        {products.map((product) => (
          <ProductCard key={product._id} product={product} handleCartClick={handleCartClick}  />
        ))}
      </div>
    </div>
  )
})

/* ================= HOMEPAGE ================= */
const Homepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [products, setProducts] = useState([])
const { addToCart } = useContext(CartContext);
    
  /* Hero Auto Slide */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  /* Fetch Products */
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
      {/* <Navbar /> */}

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

        {/* HERO */}
        <section className="relative h-[600px] overflow-hidden bg-slate-900">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />

              <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
                <div className="max-w-2xl">
                  <h1 className="text-5xl font-black text-white mb-4">
                    {slide.title}
                  </h1>

                  <p className="text-xl text-white/90 mb-8">
                    {slide.subtitle}
                  </p>
                    <a href="#products" className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold cursor-pointer">
                    View Products
                  </a>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* PRODUCTS */}
        <section id="products" className="max-w-7xl mx-auto px-4 py-12">

          <ProductSection
          handleCartClick={addToCart}
            title="All Products"
            products={products}
          />

          <ProductSection
          handleCartClick={addToCart}
            title="Mobile Accessories"
            products={products.filter(p => p.category === "mobile-accessories")}
          />

          <ProductSection
         handleCartClick={addToCart}
            title="Gadgets"
            products={products.filter(p => p.category === "gadgets")}
          />

        </section>
          <CartToast />
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  )
}

export default Homepage
