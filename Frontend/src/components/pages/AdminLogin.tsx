import React, { useState, useContext } from 'react'
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiBarChart2, FiUsers, FiZap } from 'react-icons/fi'
import type { IconType } from 'react-icons'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserContext } from '../context/UserContext'
import { getErrorMessage } from '../../utils/errorUtils'
import type { AlertData } from '../../types'

const Corners: React.FC<{ color?: string }> = ({ color = "border-[#5B8DEF]" }) => (
  <>
    <span className={`absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 ${color} pointer-events-none`} />
    <span className={`absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 ${color} pointer-events-none`} />
    <span className={`absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 ${color} pointer-events-none`} />
    <span className={`absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 ${color} pointer-events-none`} />
  </>
)

const InfoRow: React.FC<{ icon: IconType; title: string; desc: string }> = ({ icon: Icon, title, desc }) => (
  <div className="flex items-start gap-4 bg-[#121A2E] border border-[#232F49] p-4 rounded-xl">
    <div className="p-2.5 bg-[#5B8DEF]/10 border border-[#5B8DEF]/20 rounded-lg flex-shrink-0">
      <Icon className="w-5 h-5 text-[#5B8DEF]" />
    </div>
    <div>
      <h3 className="font-display font-semibold text-[#EDF1F7] text-sm mb-0.5">{title}</h3>
      <p className="text-xs text-[#8592AC] font-body">{desc}</p>
    </div>
  </div>
)

const inputCls = "w-full pl-12 pr-4 py-3 bg-[#0A0E1A] border border-[#232F49] rounded-lg text-[#EDF1F7] placeholder-[#5C6270] focus:outline-none focus:border-[#5B8DEF] focus:ring-2 focus:ring-[#5B8DEF]/20 transition font-body text-sm"

const AdminLogin: React.FC<{ handleAlert: (alert: AlertData) => void }> = ({ handleAlert }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const navigate = useNavigate()
  const { saveUser } = useContext(UserContext)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/admin-login`,
        { email: formData.email, password: formData.password },
        { withCredentials: true }
      )
      saveUser(response.data.user)
      navigate("/admin")
    } catch (error) {
      handleAlert({
        type: 'danger',
        title: 'Admin Login Failed',
        description: getErrorMessage(error, 'Unable to sign in to the admin panel.')
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0A0E1A] text-[#EDF1F7] flex items-center justify-center px-4 py-12">

      <div
        className="fixed inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#5B8DEF 1px, transparent 1px), linear-gradient(90deg, #5B8DEF 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative w-full max-w-6xl">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          <div className="hidden md:block">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-2">
                  // Admin Access
                </p>
                <h1 className="text-4xl font-display font-semibold text-[#EDF1F7] mb-4 leading-tight">
                  Admin Control
                </h1>
                <p className="text-lg text-[#8592AC] font-body">
                  Authorized personnel only. Manage products, orders and store analytics.
                </p>
              </div>

              <div className="space-y-3">
                <InfoRow icon={FiShield} title="Restricted Access" desc="Only admin accounts can enter this panel" />
                <InfoRow icon={FiBarChart2} title="Sales Analytics" desc="Track revenue, orders and store performance" />
                <InfoRow icon={FiUsers} title="Full Management" desc="Products, orders and customers in one place" />
                <InfoRow icon={FiZap} title="Real-time Stats" desc="Live inventory and order status updates" />
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="relative bg-[#121A2E] rounded-2xl border border-[#232F49] shadow-2xl p-8 md:p-10">
              <Corners />

              <div className="text-center mb-8">
                <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-2">
                  // Admin Sign In
                </p>
                <h2 className="text-2xl font-display font-semibold text-[#EDF1F7] mb-1">Admin Login</h2>
                <p className="text-[#8592AC] text-sm font-body">Enter your admin credentials to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label htmlFor="email" className="block text-xs font-mono text-[#8592AC] uppercase tracking-wide mb-2">
                    Admin Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMail className="text-[#5C6270] w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="admin@techhub.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-mono text-[#8592AC] uppercase tracking-wide mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="text-[#5C6270] w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`${inputCls} pr-12`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <FiEyeOff className="text-[#5C6270] hover:text-[#8592AC] w-4 h-4" />
                      ) : (
                        <FiEye className="text-[#5C6270] hover:text-[#8592AC] w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#5B8DEF] hover:bg-[#4A7CE0] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0E1A] rounded-lg font-semibold text-sm transition-all active:scale-[0.99]"
                >
                  {loading ? 'Authenticating...' : 'Enter Admin Panel'}
                </button>

                <p className="text-center text-sm text-[#8592AC] font-body mt-6">
                  Not an admin?{' '}
                  <a href="/login" className="text-[#5B8DEF] hover:text-[#7BA3F5] font-semibold">
                    Customer Login
                  </a>
                </p>
              </form>
            </div>

            <div className="mt-6 text-center">
              <p className="text-[10px] font-mono text-[#5C6270]">
                <a href="/" className="text-[#5B8DEF] hover:text-[#7BA3F5]">← Back to store</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
