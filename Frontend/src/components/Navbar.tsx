import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiSearch,
  FiHeart,
  FiShoppingCart,
  FiMenu,
  FiX,
  FiChevronDown,
  FiUser,
  FiTruck,
  FiLogOut,
  FiShield,
} from "react-icons/fi";
import gsap from "gsap";

import { UserContext } from "./context/UserContext";
import { CartContext } from "./context/CartContext";

/* Viewfinder corner brackets — the recurring signature motif */
const Corners = ({ color = "border-[#5B8DEF]" }: { color?: string }) => (
  <>
    <span
      className={`absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 ${color} pointer-events-none`}
    />
    <span
      className={`absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 ${color} pointer-events-none`}
    />
    <span
      className={`absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 ${color} pointer-events-none`}
    />
    <span
      className={`absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 ${color} pointer-events-none`}
    />
  </>
);

/* Logo mark — "TH" with an irregular neon-style flicker on its glow */
const LogoMark = ({
  size = "w-9 h-9",
  textSize = "text-[14px]",
}: { size?: string; textSize?: string }) => (
  <div
    className={`${size} rounded-md bg-[#121A2E] border border-[#232F49] flex items-center justify-center flex-shrink-0`}
  >
    <span
      className={`th-flicker font-mono font-bold ${textSize} text-[#5B8DEF] leading-none`}
    >
      TH
    </span>
  </div>
);

interface CategoryData {
  icon: string;
  subcategories: string[];
}

const Navbar = () => {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);
  const cartContext = useContext(CartContext);
  const cartCount = cartContext?.cartCount ?? 0;

  const handleProductCategoryClick = (category: string) => {
    const productCategory = category.toLowerCase();
    navigate(`/products/category/${productCategory}`);
  };

  const openSearchBox = () => {
    gsap.to(searchRef.current, {
      width: "220px",
      padding: "0.5rem 0.75rem",
      duration: 0.5,
      ease: "power3.inOut",
    });
    setSearchOpen(true);
  };

  const collapseSearchBox = () => {
    gsap.to(searchRef.current, {
      width: "0px",
      padding: "0",
      duration: 0.5,
      ease: "power3.inOut",
    });
    setSearchOpen(false);
    setSuggestionsOpen(false);
  };

  const handleSearchToggle = () => {
    if (searchOpen) {
      collapseSearchBox();
    } else {
      openSearchBox();
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }

    const handler = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await axios.get<string[]>(
          `${import.meta.env.VITE_API_URL}/products/suggestions`,
          {
            params: { q: searchQuery },
          }
        );
        setSuggestions(res.data);
        setSuggestionsOpen(true);
      } catch (err) {
        console.error("Search suggestions error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Always searches the TYPED query, not the clicked suggestion's exact label.
  const goToSearchResults = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    setSuggestionsOpen(false);
    setSuggestions([]);
    setSearchQuery("");
    collapseSearchBox();
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
  };

  const categoryData: Record<string, CategoryData> = {
    "Mobile-Accessories": {
      icon: "📱",
      subcategories: ["Smartphones", "Feature Phones"],
    },
    Gadgets: {
      icon: "🎮",
      subcategories: ["Gaming", "Drones"],
    },
  };

  return (
    <>
      <nav className="bg-[#0A0E1A]/95 backdrop-blur-md border-b border-[#232F49] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-5">
          <div className="flex items-center justify-between h-16 relative">
            {/* Logo */}
            <a
              href="/"
              className="flex items-center gap-2.5 flex-shrink-0 z-10"
            >
              {!mobileMenuOpen && (
                <>
                  <LogoMark />
                  <div>
                    <h1 className="text-lg font-display font-semibold text-[#EDF1F7] leading-none tracking-tight">
                      TechHub
                    </h1>
                    <p className="text-[10px] font-mono text-[#5B8DEF] mt-0.5 tracking-widest uppercase">
                      Gadgets & More
                    </p>
                  </div>
                </>
              )}
            </a>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              <a
                href="/"
                className="px-4 py-2 text-[#8592AC] hover:text-[#EDF1F7] rounded-md text-xs font-mono uppercase tracking-wider transition"
              >
                Home
              </a>
              <a
                href="/products"
                className="px-4 py-2 text-[#8592AC] hover:text-[#EDF1F7] rounded-md text-xs font-mono uppercase tracking-wider transition"
              >
                Products
              </a>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="px-4 cursor-pointer py-2 text-[#8592AC] hover:text-[#EDF1F7] rounded-md text-xs font-mono uppercase tracking-wider flex items-center gap-1 transition"
                >
                  Categories
                  <FiChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${categoriesOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {categoriesOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[400px] bg-[#121A2E] rounded-lg shadow-2xl border border-[#232F49]">
                    <div className="p-6 relative">
                      <Corners />
                      <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-4">
                        // Categories
                      </p>
                      <div className="grid grid-rows-2 gap-6">
                        {Object.entries(categoryData).map(
                          ([category, data], idx) => (
                            <div
                              onClick={() =>
                                handleProductCategoryClick(category)
                              }
                              key={idx}
                              className="hover:bg-[#182238] cursor-pointer p-3 rounded-lg transition"
                            >
                              <div className="flex items-center gap-3 text-[#EDF1F7] font-display font-medium mb-2">
                                <span className="text-2xl">{data.icon}</span>
                                <span className="text-sm">{category}</span>
                              </div>
                              <div className="ml-9 space-y-1">
                                {data.subcategories.map((sub, subIdx) => (
                                  <span
                                    key={subIdx}
                                    className="block px-3 py-1.5 text-xs font-mono text-[#8592AC]"
                                  >
                                    {sub}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <a
                href="#"
                className="px-4 py-2 text-[#8592AC] hover:text-[#EDF1F7] rounded-md text-xs font-mono uppercase tracking-wider transition"
              >
                Contact
              </a>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-1.5 z-10">
              {/* Search */}
              <div className="relative" ref={searchWrapRef}>
                <div className="flex items-center">
                  <div style={{ width: 0, overflow: "hidden" }} ref={searchRef}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") goToSearchResults();
                      }}
                      placeholder="Search products..."
                      className="text-[#EDF1F7] bg-[#121A2E] border border-[#232F49] focus:border-[#5B8DEF] rounded-md outline-none text-sm p-2 w-full font-body placeholder:text-[#8592AC]"
                    />
                  </div>
                  <button
                    onClick={handleSearchToggle}
                    className="p-2 text-[#8592AC] cursor-pointer hover:text-[#EDF1F7] rounded-md transition"
                  >
                    <FiSearch className="w-5 h-5" />
                  </button>
                </div>

                {searchOpen && suggestionsOpen && searchQuery.trim() && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-[#121A2E] border border-[#232F49] rounded-lg shadow-2xl overflow-hidden z-50">
                    {searchLoading ? (
                      <div className="px-4 py-3 text-sm font-mono text-[#8592AC]">
                        Searching...
                      </div>
                    ) : suggestions.length > 0 ? (
                      <ul className="py-1 max-h-72 overflow-y-auto">
                        {suggestions.map((s, i) => (
                          <li key={i}>
                            <button
                              onClick={() => goToSearchResults()}
                              className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#182238] transition"
                            >
                              <FiSearch className="w-3.5 h-3.5 text-[#5B8DEF] flex-shrink-0" />
                              <span className="truncate">{s}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-3 text-sm font-mono text-[#8592AC]">
                        No matches found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {user?.role === "user" && (
                <button className="p-2 text-[#8592AC] hover:text-[#EDF1F7] rounded-md transition">
                  <FiHeart title="Favourites" className="w-5 h-5" />
                </button>
              )}

              {user?.role === "user" && (
                <button
                  onClick={() => navigate("/cart")}
                  className="p-2 text-[#8592AC] cursor-pointer hover:text-[#EDF1F7] rounded-md transition relative"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FFB238] text-[#0A0E1A] text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* Profile Dropdown or Login Button */}
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="hidden cursor-pointer md:flex items-center justify-center w-9 h-9 bg-[#182238] border border-[#5B8DEF] hover:bg-[#5B8DEF]/10 text-[#5B8DEF] rounded-full md:ml-2 transition"
                  >
                    <FiUser className="w-4 h-4" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute top-full right-0 mt-3 w-52 bg-[#121A2E] rounded-lg shadow-2xl border border-[#232F49] overflow-hidden">
                      <div className="p-4 border-b border-[#232F49]">
                        <p className="text-[#EDF1F7] font-display font-semibold text-sm">
                          {user?.role === "admin" ? "Admin" : user?.name || user?.email}
                        </p>
                        <p className="text-[#8592AC] font-mono text-[11px] mt-0.5 truncate">
                          {user?.email}
                        </p>
                      </div>

                      <div className="py-2">
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#182238] transition text-sm"
                        >
                          <FiUser className="w-4 h-4" />
                          My Profile
                        </button>

                        <button
                          onClick={() => {
                            navigate("/orders");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#182238] transition text-sm"
                        >
                          <FiShoppingCart className="w-4 h-4" />
                          My Orders
                        </button>

                        {user?.role !== "admin" && (
                          <button
                            onClick={() => {
                              navigate("/track-order");
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#182238] transition text-sm"
                          >
                            <FiTruck className="w-4 h-4" />
                            Track Order
                          </button>
                        )}

                        {user?.role === "admin" && (
                          <button
                            onClick={() => {
                              navigate("/admin");
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#182238] transition text-sm"
                          >
                            <FiShield className="w-4 h-4" />
                            Admin Dashboard
                          </button>
                        )}
                      </div>

                      <div className="border-t border-[#232F49] py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-[#182238] transition text-sm"
                        >
                          <FiLogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="hidden cursor-pointer lg:block px-4 py-2 bg-[#5B8DEF] hover:bg-[#4A7CE0] text-[#0A0E1A] rounded-md md:ml-2 text-xs font-mono font-semibold uppercase tracking-wider transition"
                >
                  Log In
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-[#8592AC] hover:text-[#EDF1F7] rounded-md cursor-pointer"
              >
                <FiMenu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[#0A0E1A] border-l border-[#232F49] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between py-3 px-4 border-b border-[#232F49]">
            <div className="flex items-center gap-2.5">
              <LogoMark size="w-6 h-6" textSize="text-[9px]" />
              <div>
                <h1 className="text-base font-display font-semibold text-[#EDF1F7] leading-none">
                  TechHub
                </h1>
                <p className="text-[9px] font-mono text-[#5B8DEF] mt-0.5 tracking-widest uppercase">
                  Gadgets & More
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-[#8592AC] hover:text-[#EDF1F7] rounded-md transition"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 py-4 px-3 overflow-y-auto">
            <nav className="space-y-1">
              <a
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#121A2E] rounded-lg transition text-sm font-mono uppercase tracking-wide"
              >
                Home
              </a>

              <div>
                <button
                  onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#121A2E] rounded-lg transition text-sm font-mono uppercase tracking-wide"
                >
                  <span>Categories</span>
                  <FiChevronDown
                    className={`w-4 h-4 transition-transform ${mobileCategoriesOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {mobileCategoriesOpen && (
                  <div className="mt-2 space-y-1 pl-3">
                    {Object.entries(categoryData).map(
                      ([category, data], idx) => (
                        <div
                          onClick={() => handleProductCategoryClick(category)}
                          key={idx}
                          className="space-y-1"
                        >
                          <div className="flex items-center gap-2 px-3 py-2 text-[#EDF1F7] font-display font-medium">
                            <span className="text-sm">{data.icon}</span>
                            <span className="text-xs">{category}</span>
                          </div>
                          <div className="ml-8 space-y-1">
                            {data.subcategories.map((sub, subIdx) => (
                              <a
                                key={subIdx}
                                href="#"
                                className="block px-3 py-1.5 text-xs font-mono text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#121A2E] rounded transition"
                              >
                                {sub}
                              </a>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#121A2E] rounded-lg transition text-sm font-mono uppercase tracking-wide"
              >
                Contact
              </a>

              {user?.role === "admin" && (
                <button
                  onClick={() => {
                    navigate("/admin");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#121A2E] rounded-lg transition text-sm font-mono uppercase tracking-wide"
                >
                  <FiShield className="w-4 h-4" />
                  Admin Dashboard
                </button>
              )}
            </nav>
          </div>

          <div className="pb-4 px-3 border-t border-[#232F49] pt-4">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 text-[#EDF1F7] border-b border-[#232F49] mb-2">
                  <p className="font-display font-semibold text-sm">
                    {user?.role === "admin" ? "Admin" : user?.name || user?.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-[#121A2E] hover:bg-[#182238] text-[#EDF1F7] rounded-lg font-mono text-xs uppercase tracking-wide transition mb-2"
                >
                  My Profile
                </button>
                {user?.role !== "admin" && (
                  <button
                    onClick={() => {
                      navigate("/track-order");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-[#121A2E] hover:bg-[#182238] text-[#EDF1F7] rounded-lg font-mono text-xs uppercase tracking-wide transition mb-2"
                  >
                    Track Order
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg font-mono text-xs uppercase tracking-wide transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 bg-[#5B8DEF] hover:bg-[#4A7CE0] text-[#0A0E1A] rounded-lg font-mono text-xs font-semibold uppercase tracking-wide transition"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes thFlicker {
          0%, 19%, 21%, 23%, 46%, 48%, 100% {
            opacity: 1;
            text-shadow: 0 0 4px rgba(91,141,239,0.9), 0 0 10px rgba(91,141,239,0.5), 0 0 18px rgba(91,141,239,0.25);
          }
          20%, 22% {
            opacity: 0.35;
            text-shadow: 0 0 2px rgba(91,141,239,0.3);
          }
          47% {
            opacity: 0.6;
            text-shadow: 0 0 2px rgba(91,141,239,0.4);
          }
        }
        .th-flicker {
          animation: thFlicker 7s infinite ease-in-out;
        }
      `}</style>
    </>
  );
};

export default Navbar;
