import React, { useState } from 'react'
import { FiUser, FiMail, FiHome, FiLock, FiEye, FiEyeOff, FiTag, FiZap, FiPhone, FiShoppingBag } from 'react-icons/fi'
import type { IconType } from 'react-icons'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
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

const Field: React.FC<
  { label: string; icon: IconType } & React.InputHTMLAttributes<HTMLInputElement>
> = ({ label, icon: Icon, ...inputProps }) => (
  <div>
    <label htmlFor={inputProps.id} className="block text-xs font-mono text-[#8592AC] uppercase tracking-wide mb-2">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="text-[#5C6270] w-4 h-4" />
      </div>
      <input
        {...inputProps}
        className="w-full pl-12 pr-4 py-3 bg-[#0A0E1A] border border-[#232F49] rounded-lg text-[#EDF1F7] placeholder-[#5C6270] focus:outline-none focus:border-[#5B8DEF] focus:ring-2 focus:ring-[#5B8DEF]/20 transition font-body text-sm"
      />
    </div>
  </div>
)

interface SignupFormData {
  name: string
  phone: string
  email: string
  password: string
  confirmPassword: string
  address: string
}

const Signup: React.FC<{ handleAlert: (alert: AlertData) => void }> = ({ handleAlert }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
  })
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      handleAlert({
        type: 'danger',
        title: 'Error',
        description: 'Passwords do not match'
      })
      return
    }

    try {
      const userData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        address: formData.address
      }
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/register`, userData)
      console.log('Signup successful:', response.data)
      handleAlert({
        type: 'success',
        title: 'Success',
        description: 'You have successfully signed up!'
      })
      navigate('/login')
    } catch (error) {
      console.error('Signup error:', error)
      handleAlert({
        type: 'danger',
        title: 'Error',
        description: getErrorMessage(error, 'Signup failed!')
      })
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
                  // Get Started
                </p>
                <h1 className="text-4xl font-display font-semibold text-[#EDF1F7] mb-4 leading-tight">
                  Create Account
                </h1>
                <p className="text-lg text-[#8592AC] font-body">
                  Start your journey with the best tech deals.
                </p>
              </div>

              <div className="space-y-3">
                <InfoRow icon={FiShoppingBag} title="Easy Shopping" desc="Browse and shop with ease" />
                <InfoRow icon={FiTag} title="Exclusive Deals" desc="Access member-only discounts" />
                <InfoRow icon={FiZap} title="Fast Delivery" desc="Get your orders delivered quickly" />
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="w-full">
            <div className="relative bg-[#121A2E] rounded-2xl border border-[#232F49] shadow-2xl p-8 md:p-10">
              <Corners />

              <div className="text-center mb-8">
                <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-2">
                  // Sign Up
                </p>
                <h2 className="text-2xl font-display font-semibold text-[#EDF1F7] mb-1">Create Account</h2>
                <p className="text-[#8592AC] text-sm font-body">Fill in your details to get started</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                <Field
                  label="Full Name" icon={FiUser}
                  type="text" id="name" name="name"
                  value={formData.name} onChange={handleChange}
                  placeholder="Your name" required
                />

                <Field
                  label="Address" icon={FiHome}
                  type="text" id="address" name="address"
                  value={formData.address} onChange={handleChange}
                  placeholder="Your address" required
                />

                <Field
                  label="Phone Number" icon={FiPhone}
                  type="text" id="phone" name="phone"
                  value={formData.phone} onChange={handleChange}
                  placeholder="98XXXXXXXX" required
                />

                <Field
                  label="Email Address" icon={FiMail}
                  type="email" id="email" name="email"
                  value={formData.email} onChange={handleChange}
                  placeholder="you@example.com" required
                />

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
                      className="w-full pl-12 pr-12 py-3 bg-[#0A0E1A] border border-[#232F49] rounded-lg text-[#EDF1F7] placeholder-[#5C6270] focus:outline-none focus:border-[#5B8DEF] focus:ring-2 focus:ring-[#5B8DEF]/20 transition font-body text-sm"
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

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-mono text-[#8592AC] uppercase tracking-wide mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="text-[#5C6270] w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3 bg-[#0A0E1A] border border-[#232F49] rounded-lg text-[#EDF1F7] placeholder-[#5C6270] focus:outline-none focus:border-[#5B8DEF] focus:ring-2 focus:ring-[#5B8DEF]/20 transition font-body text-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff className="text-[#5C6270] hover:text-[#8592AC] w-4 h-4" />
                      ) : (
                        <FiEye className="text-[#5C6270] hover:text-[#8592AC] w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-[#232F49] bg-[#0A0E1A] text-[#5B8DEF] focus:ring-2 focus:ring-[#5B8DEF]/20"
                    required
                  />
                  <label htmlFor="terms" className="ml-3 text-xs text-[#8592AC] font-body">
                    I agree to the{' '}
                    <a href="#" className="text-[#5B8DEF] hover:text-[#7BA3F5] underline">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="text-[#5B8DEF] hover:text-[#7BA3F5] underline">Privacy Policy</a>
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#5B8DEF] hover:bg-[#4A7CE0] text-[#0A0E1A] rounded-lg font-semibold text-sm transition-all active:scale-[0.99]"
                >
                  Create Account
                </button>

                {/* Sign In Link */}
                <p className="text-center text-sm text-[#8592AC] font-body mt-6">
                  Already have an account?{' '}
                  <a href="/login" className="text-[#5B8DEF] hover:text-[#7BA3F5] font-semibold">
                    Sign In
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
