import React, { useState, useContext } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  FiLayout, FiPackage, FiShoppingBag, FiUsers, FiLogOut,
  FiMenu, FiX, FiExternalLink
} from 'react-icons/fi'
import type { IconType } from 'react-icons'
import { UserContext } from '../context/UserContext'

const LogoMark: React.FC = () => (
  <div className="w-9 h-9 rounded-md bg-[#121A2E] border border-[#232F49] flex items-center justify-center flex-shrink-0">
    <span className="th-flicker font-mono font-bold text-[14px] text-[#5B8DEF] leading-none">
      TH
    </span>
  </div>
)

interface NavItem {
  to: string
  label: string
  icon: IconType
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: FiLayout, end: true },
  { to: '/admin/products', label: 'Products', icon: FiPackage },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: FiUsers },
]

const SidebarContent: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const navigate = useNavigate()
  const { user, logout } = useContext(UserContext)

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

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
        <p className="px-3 pb-2 text-[9px] font-mono text-[#5C6270] uppercase tracking-widest">
          // Management
        </p>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-medium
              ${isActive
                ? 'bg-[#5B8DEF]/10 text-[#5B8DEF] border border-[#5B8DEF]/30'
                : 'text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#121A2E] border border-transparent'}`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
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
          <div className="w-8 h-8 rounded-full bg-[#182238] border border-[#5B8DEF] flex items-center justify-center flex-shrink-0">
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

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useContext(UserContext)

  return (
    <div className="relative min-h-screen bg-[#0A0E1A] text-[#EDF1F7]">
      <div
        className="fixed inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#5B8DEF 1px, transparent 1px), linear-gradient(90deg, #5B8DEF 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

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
        <header className="sticky top-0 z-30 h-16 bg-[#0A0E1A]/95 backdrop-blur-md border-b border-[#232F49] flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-[#8592AC] hover:text-[#EDF1F7] rounded-md transition"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest">
                // TechHub Admin
              </p>
              <p className="text-xs text-[#5C6270] hidden sm:block">
                Signed in as {user?.email || ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-transparent rounded-md"
            aria-hidden="true"
          >
            <FiX className="w-5 h-5" />
          </button>
          <span className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Online
          </span>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
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
    </div>
  )
}

export default AdminLayout
