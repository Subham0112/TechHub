import React, { useState, useEffect, useContext } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  FiLayout, FiPackage, FiShoppingBag, FiUsers, FiLogOut,
  FiMenu, FiX, FiExternalLink, FiSun, FiMoon, FiTag, FiStar, FiMail,
  FiChevronDown, FiPlus, FiFolder
} from 'react-icons/fi'
import type { IconType } from 'react-icons'
import { UserContext } from '../context/UserContext'

const LogoMark = () => (
  <div className="w-9 h-9 rounded-md bg-[#121A2E] border border-[#232F49] flex items-center justify-center flex-shrink-0">
    <span className="font-mono font-bold text-[14px] text-[#5B8DEF] leading-none">
      TH
    </span>
  </div>
)

interface NavChild {
  to: string
  label: string
  icon: IconType
  end?: boolean
}

interface NavItem {
  to: string
  label: string
  icon: IconType
  end?: boolean
  children?: NavChild[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: FiLayout, end: true },
  {
    to: '/admin/products',
    label: 'Products',
    icon: FiPackage,
    children: [
      { to: '/admin/products', label: 'Add Item', icon: FiPlus, end: true },
      { to: '/admin/categories', label: 'Categories', icon: FiFolder },
    ],
  },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: FiUsers },
  { to: '/admin/offers', label: 'Offers & Combos', icon: FiTag },
  { to: '/admin/reviews', label: 'Reviews', icon: FiStar },
  { to: '/admin/messages', label: 'Messages', icon: FiMail },
]

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useContext(UserContext)

  const [openGroup, setOpenGroup] = useState<string | null>(() => {
    const parent = NAV_ITEMS.find((item) =>
      item.children?.some((child) => (child.end ? pathname === child.to : pathname.startsWith(child.to)))
    )
    return parent ? parent.to : null
  })

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-medium
    ${isActive
      ? 'bg-[#5B8DEF]/10 text-[#5B8DEF] border border-[#5B8DEF]/30'
      : 'text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#121A2E] border border-transparent'}`

  const isChildActive = (item: NavItem) =>
    item.children?.some((child) => (child.end ? pathname === child.to : pathname.startsWith(child.to))) || false

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#232F49]">
        <LogoMark />
        <div>
          <h1 className="text-base font-display font-semibold text-[#EDF1F7] leading-none tracking-tight">
            TechHub
          </h1>
          <p className="text-[9px] font-mono text-[#5B8DEF] mt-1 tracking-widest uppercase">
            Admin Panel
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[9px] font-mono text-[#8592AC] uppercase tracking-widest">
          Management
        </p>
        {NAV_ITEMS.map((item) => (
          <div key={item.to}>
            {item.children ? (
              <>
                <button
                  onClick={() => setOpenGroup((prev) => (prev === item.to ? null : item.to))}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-medium cursor-pointer
                    ${isChildActive(item)
                      ? 'bg-[#5B8DEF]/10 text-[#5B8DEF] border border-[#5B8DEF]/30'
                      : 'text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#121A2E] border border-transparent'}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  <FiChevronDown
                    className={`w-4 h-4 ml-auto transition-transform ${openGroup === item.to ? 'rotate-180' : ''}`}
                  />
                </button>
                {openGroup === item.to && (
                  <div className="mt-1 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={`${item.to}-${child.to}`}
                        to={child.to}
                        end={child.end}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 pl-11 rounded-lg text-[13px] transition-all font-medium
                          ${isActive
                            ? 'bg-[#5B8DEF]/10 text-[#5B8DEF] border border-[#5B8DEF]/30'
                            : 'text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#121A2E] border border-transparent'}`
                        }
                      >
                        <child.icon className="w-3.5 h-3.5" />
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={navLinkClass}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      <div className="px-3 pb-5 space-y-2 border-t border-[#232F49] pt-4">
        <a
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#121A2E] transition-all font-medium"
        >
          <FiExternalLink className="w-4 h-4" />
          View Store
        </a>
        <div className="px-3 py-2.5 flex items-center gap-3 rounded-lg bg-[#121A2E] border border-[#232F49]">
          <div className="w-8 h-8 rounded-full bg-[#182238] border border-[#5B8DEF]/40 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-mono font-bold text-[#5B8DEF]">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#EDF1F7] truncate">{user?.name || 'Admin'}</p>
            <p className="text-[10px] font-mono text-[#5C6270] uppercase tracking-wider">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-400/5 transition-all font-medium"
        >
          <FiLogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  )
}

const PAGE_TITLES: { match: string; title: string; subtitle: string }[] = [
  {
    match: '/admin/products',
    title: 'Product Management',
    subtitle: 'Manage your inventory, add new products, and track stock.',
  },
  {
    match: '/admin/categories',
    title: 'Categories',
    subtitle: 'Create and manage product categories for the store.',
  },
  {
    match: '/admin/orders',
    title: 'Manage Orders',
    subtitle: 'View and update customer order statuses.',
  },
  {
    match: '/admin/customers',
    title: 'Customers',
    subtitle: 'All registered users and their order history.',
  },
  {
    match: '/admin/offers',
    title: 'Offers & Combos',
    subtitle: 'Create discounts, seasonal sales, and combo bundles.',
  },
  {
    match: '/admin/reviews',
    title: 'Review Moderation',
    subtitle: 'Approve, reject, or remove customer product reviews.',
  },
  {
    match: '/admin/messages',
    title: 'Contact Messages',
    subtitle: 'Messages sent by customers through the contact page.',
  },
  {
    match: '/admin',
    title: 'Dashboard',
    subtitle: 'Sales analytics and store performance at a glance.',
  },
]

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState<boolean>(
    () => localStorage.getItem('admin-theme') === 'dark'
  )
  const { pathname } = useLocation()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('admin-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const current = PAGE_TITLES.find(({ match }) =>
    match === '/admin' ? pathname === '/admin' : pathname.startsWith(match)
  )
  const pageTitle = current?.title || 'Admin Panel'
  const pageSubtitle = current?.subtitle || ''

  return (
    <div className="min-h-screen bg-[var(--adm-bg)] text-[var(--adm-heading)]">

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-[#0D1322] border-r border-[#232F49] z-40">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-[#0D1322] border-r border-[#232F49] shadow-2xl overflow-y-auto">
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="relative lg:pl-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-[var(--adm-header)] backdrop-blur-md border-b border-[var(--adm-border)] flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-[var(--adm-muted)] hover:text-[var(--adm-heading)] rounded-md transition cursor-pointer"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base md:text-lg font-display font-semibold text-[var(--adm-heading)] leading-tight tracking-tight truncate">
                {pageTitle}
              </h1>
              <p className="text-[11px] text-[var(--adm-dim)] leading-tight mt-0.5 hidden sm:block truncate">
                {pageSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-md text-[var(--adm-muted)] hover:text-[var(--adm-heading)] hover:bg-[var(--adm-chip)] transition cursor-pointer"
            >
              {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-transparent rounded-md"
              aria-hidden="true"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout