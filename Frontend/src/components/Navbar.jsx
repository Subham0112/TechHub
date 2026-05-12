import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiHeart, FiShoppingCart, FiMenu, FiX, FiChevronDown, FiUser, FiLogOut } from "react-icons/fi";
import { UserContext } from "./context/UserContext"; // Adjust path
import { CartContext } from "./context/CartContext";

const Navbar = () => {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const profileRef = useRef(null); // Add this for profile dropdown
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext); // Get user and logout from context
const { cartCount } = useContext(CartContext); 

const handleProductCategoryClick = (category) => {
  const productCategory = category.toLowerCase();
  console.log("Clicked category:", productCategory);
  navigate(`/products/category/${productCategory}`);
};

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCategoriesOpen(false);
      }
      // Also close profile dropdown
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
  if (mobileMenuOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }

  // Cleanup on unmount
  return () => {
    document.body.style.overflow = '';
  };
}, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
  };

  const categoryData = {
    "Mobile-Accessories": {
      icon: "📱",
      subcategories: ["Smartphones", "Feature Phones"]
    },
    "Gadgets": {
      icon: "🎮",
      subcategories: ["Gaming", "Drones"]
    },
  };

  return (
    <>
      <nav className="bg-linear-to-r from-[#362F4F] to-[#1A3263] shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-5">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 flex-shrink-0">
              {!mobileMenuOpen && <div>
                <h1 className="text-lg font-bold text-[#E8E2DB]">
                  TechHub
                </h1>
                <p className="text-xs text-purple-700 -mt-0.5">Gadgets & More</p>
              </div>}
            </a>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              <a href="/" className="px-3 py-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-md text-sm font-medium transition">
                Home
              </a>
              <a href="#" className="px-3 py-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-md text-sm font-medium transition">
                Products
              </a>
              
              {/* Desktop Mega Menu Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="px-3 cursor-pointer py-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-md text-sm font-medium flex items-center gap-1 transition"
                >
                  Categories
                  <FiChevronDown className={`w-4 h-4 transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
                </button>

                {categoriesOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[400px] bg-linear-to-r from-[#362F4F] to-[#1A3263]  rounded-lg shadow-2xl border border-slate-700">
                    <div className="p-6">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        CATEGORIES
                      </p>
                      <div className="grid grid-rows-2 gap-6">
                        {Object.entries(categoryData).map(([category, data], idx) => (
                          <div
                         onClick={() => handleProductCategoryClick(category)}
                         key={idx} className="hover:bg-slate-700 cursor-pointer p-3 rounded-lg transition">
                            <div className="flex items-center gap-3 text-white font-medium mb-2">
                              <span className="text-2xl">{data.icon}</span>
                              <span className="text-sm">{category}</span>
                            </div>
                            <div className="ml-9 space-y-1">
                              {data.subcategories.map((sub, subIdx) => (
                                <span
                                  key={subIdx}
                                  className="block px-3 py-1.5 text-sm text-gray-400 "
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <a href="#" className="px-3 py-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-md text-sm font-medium transition">
                Deals
              </a>
              <a href="#" className="px-3 py-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-md text-sm font-medium transition">
                Contact
              </a>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-300 cursor-pointer hover:text-white hover:bg-slate-800 rounded-md transition">
                <FiSearch className="w-5 h-5" />
              </button>
              
              { user?.role === "user" && <button className="p-2 text-gray-300  hover:text-white hover:bg-slate-800 rounded-md transition">
                <FiHeart title="Favourites" className="w-5 h-5" />
              </button>}

              {user?.role==="user" && <button onClick={() => navigate("/cart")} className="p-2 text-gray-300 cursor-pointer hover:text-white hover:bg-slate-800 rounded-md transition relative">
             <FiShoppingCart className="w-5 h-5" />
             {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white              text-[10px] font-bold w-4 h-4 rounded-full flex items-center              justify-center leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
                </button>}

              {/* Profile Dropdown or Login Button */}
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="hidden cursor-pointer md:flex flex-row px-2 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-md md:ml-3 text-sm font-semibold transition shadow-lg"
                    style={{borderRadius: "50%"}}
                  >
                    <FiUser className="w-5 h-5" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 overflow-hidden">
                      <div className="p-4 border-b border-slate-700">
                        <p className="text-white font-semibold text-sm">{user?.role==="admin"?"Admin":user?.name || user?.email}</p>
                        <p className="text-gray-400 text-xs">{user?.email}</p>
                      </div>
                      
                      <div className="py-2">
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 transition text-sm"
                        >
                          <FiUser className="w-4 h-4" />
                          My Profile
                        </button>

                        <button
                          onClick={() => {
                            navigate("/orders");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 transition text-sm"
                        >
                          <FiShoppingCart className="w-5 h-5" />
                          My Orders
                        </button>
                        
                          {user?.role === "admin" && (
                        <button
                          onClick={() => {
                            navigate("/manage-products");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 transition text-sm"
                        >
                          Manage Products
                        </button>
                        )}
                          {user?.role === "admin" && (
                        <button
                          onClick={() => {
                            navigate("/manage-orders");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 transition text-sm"
                        >
                          Manage Orders
                        </button>
                        )}
                        
                      </div>

                      <div className="border-t border-slate-700 py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-slate-700 transition text-sm"
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
                  onClick={() => navigate('/login')}
                  className="hidden cursor-pointer md:block px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-md md:ml-3 text-sm font-semibold transition shadow-lg"
                >
                  LogIn
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-md cursor-pointer"
              >
                <FiMenu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Side Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-linear-to-r from-[#362F4F] to-[#1A3263] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between py-2 px-3  border-b border-slate-700">
            <div>
              <h1 className="text-lg font-bold text-white">
                TechHub
              </h1>
              <p className="text-xs text-cyan-400 -mt-0.5">Gadgets & More</p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-md transition"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          <div className="flex-1 py-4 px-3 overflow-y-auto">
            <nav className="space-y-1">
              <a
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-2 py-2 text-gray-200  hover:text-white hover:bg-slate-800 rounded-lg transition text-sm"
              >
                Home
              </a>

              <a
                href="#"
                className="flex items-center gap-3 px-2 py-2 text-gray-200 hover:text-white hover:bg-slate-800 rounded-lg transition text-sm"
              >
                Products
              </a>

              {/* Mobile Categories Dropdown */}
              <div>
                <button
                  onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                  className="w-full flex items-center justify-between px-2 py-2 text-gray-200 hover:text-white hover:bg-slate-800 rounded-lg transition text-sm"
                >
                  <span>Categories</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform ${mobileCategoriesOpen ? "rotate-180" : ""}`} />
                </button>

                {mobileCategoriesOpen && (
                  <div className="mt-2 space-y-1 pl-3">
                    {Object.entries(categoryData).map(([category, data], idx) => (
                      <div onClick={() => handleProductCategoryClick(category)}
                        
                        key={idx} 
                        className="space-y-1">
                        <div className="flex items-center gap-2 px-3 py-2 text-white font-medium ">
                          <span className="text-sm">{data.icon}</span>
                          <span className="text-xs">{category}</span>
                        </div>
                        <div className="ml-8 space-y-1">
                          {data.subcategories.map((sub, subIdx) => (
                            <a
                              key={subIdx}
                              href="#"
                              className="block px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-slate-800 rounded transition"
                            >
                              {sub}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <a
                href="#"
                className="flex items-center gap-3 px-2 py-2 text-gray-200 hover:text-white hover:bg-slate-800 rounded-lg transition text-sm"
              >
                Deals
              </a>

              <a
                href="#"
                className="flex items-center gap-3 px-2 py-2 text-gray-200 hover:text-white hover:bg-slate-800 rounded-lg transition text-sm"
              >
                Contact
              </a>
             
              <a
                href="/manage-products"
                className="flex items-center gap-3 px-2 py-2 text-gray-200 hover:text-white hover:bg-slate-800 rounded-lg transition text-sm"
              >
                Manage Products
              </a>
            </nav>
          </div>

          {/* Mobile Menu Footer */}
          <div className="pb-4  px-3 border-t border-slate-700">
            {user ? (
              <div className="space-y-2">
                <div className="px-4 py-2 text-white border-b border-slate-700 mb-2">
                  <p className="font-semibold text-sm">{user?.role==="admin"?"Admin":user?.name || user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition text-sm mb-2"
                >
                  My Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-semibold transition shadow-lg"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;