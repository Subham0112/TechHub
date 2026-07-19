import React, { useState, useContext } from 'react'
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiTag, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserContext } from '../context/UserContext'

const Corners = ({ color = "border-[#5B8DEF]" }) => (
  <>
    <span className={`absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 ${color} pointer-events-none`} />
    <span className={`absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 ${color} pointer-events-none`} />
    <span className={`absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 ${color} pointer-events-none`} />
    <span className={`absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 ${color} pointer-events-none`} />
  </>
)

const InfoRow = ({ icon: Icon, title, desc }) => (
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

const Login = ({ handleAlert }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const navigate = useNavigate()
  const { saveUser } = useContext(UserContext)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const userData = {
      email: formData.email,
      password: formData.password
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/login`,
        userData,
        { withCredentials: true }
      )

      console.log("Login Successful", response.data)
      saveUser(response.data.user)
      navigate("/")
    } catch (error) {
      console.log("Login Failed", error)
      handleAlert({
        type: 'danger',
        title: 'Error',
        description: error.response?.data?.message || 'Login failed!'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0A0E1A] text-[#EDF1F7] flex items-center justify-center px-4 py-12">

      {/* Global blueprint grid */}
      <div
        className="fixed inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#5B8DEF 1px, transparent 1px), linear-gradient(90deg, #5B8DEF 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative w-full max-w-6xl">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* Left Side - Branding/Info */}
          <div className="hidden md:block">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-2">
                  // Access
                </p>
                <h1 className="text-4xl font-display font-semibold text-[#EDF1F7] mb-4 leading-tight">
                  Welcome Back
                </h1>
                <p className="text-lg text-[#8592AC] font-body">
                  Sign in to access your account and continue shopping.
                </p>
              </div>

              <div className="space-y-3">
                <InfoRow icon={FiShield} title="Secure Login" desc="Your credentials are encrypted and protected" />
                <InfoRow icon={FiTag} title="Save Your Cart" desc="Access your saved items from any device" />
                <InfoRow icon={FiZap} title="Quick Checkout" desc="Faster checkout with saved payment methods" />
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full">
            <div className="relative bg-[#121A2E] rounded-2xl border border-[#232F49] shadow-2xl p-8 md:p-10">
              <Corners />

              <div className="text-center mb-8">
                <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-2">
                  // Sign In
                </p>
                <h2 className="text-2xl font-display font-semibold text-[#EDF1F7] mb-1">Sign In</h2>
                <p className="text-[#8592AC] text-sm font-body">Enter your credentials to access your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-mono text-[#8592AC] uppercase tracking-wide mb-2">
                    Email Address
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
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-[#232F49] bg-[#0A0E1A] text-[#5B8DEF] focus:ring-2 focus:ring-[#5B8DEF]/20"
                    />
                    <label htmlFor="rememberMe" className="ml-2 text-xs text-[#8592AC] font-body">
                      Remember me
                    </label>
                  </div>
                  <a href="/forgot-password" className="text-xs text-[#5B8DEF] hover:text-[#7BA3F5] font-medium">
                    Forgot password?
                  </a>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#5B8DEF] hover:bg-[#4A7CE0] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0E1A] rounded-lg font-semibold text-sm transition-all active:scale-[0.99]"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-[#8592AC] font-body mt-6">
                  Don't have an account?{' '}
                  <a href="/signup" className="text-[#5B8DEF] hover:text-[#7BA3F5] font-semibold">
                    Create Account
                  </a>
                </p>
              </form>
            </div>

            <div className="mt-6 text-center">
              <p className="text-[10px] font-mono text-[#5C6270]">
                Protected by industry-standard encryption ·
                <a href="#" className="text-[#5B8DEF] hover:text-[#7BA3F5] ml-1">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login