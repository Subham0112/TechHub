import React, { useState } from 'react'
import { FiUser, FiMail, FiHome, FiLock, FiEye, FiEyeOff, FiPhone, FiUserPlus } from 'react-icons/fi'
import type { IconType } from 'react-icons'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getErrorMessage } from '../../utils/errorUtils'
import type { AlertData } from '../../types'

const Field = ({
  label, icon: Icon, ...inputProps
}: { label: string; icon: IconType } & React.InputHTMLAttributes<HTMLInputElement>) => (
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
        className="w-full pl-11 pr-4 py-3 bg-[#0A0E1A] border border-[#232F49] rounded-lg text-[#EDF1F7] placeholder-[#5C6270] focus:outline-none focus:border-[#5B8DEF] focus:ring-2 focus:ring-[#5B8DEF]/20 transition font-body text-sm"
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

const Signup = ({ handleAlert }: { handleAlert: (alert: AlertData) => void }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
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
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      handleAlert({
        type: 'danger',
        title: 'Error',
        description: 'Passwords do not match'
      })
      setLoading(false)
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
      await axios.post(`${import.meta.env.VITE_API_URL}/users/register`, userData)
      handleAlert({
        type: 'success',
        title: 'Success',
        description: 'You have successfully signed up!'
      })
      navigate('/login')
    } catch (error) {
      handleAlert({
        type: 'danger',
        title: 'Error',
        description: getErrorMessage(error, 'Signup failed!')
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-[#EDF1F7] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        <div className="bg-[#121A2E] border border-[#232F49] rounded-2xl p-8">

          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-semibold text-[#EDF1F7]">
              Create Account
            </h1>
            <p className="text-sm text-[#8592AC] font-body mt-1.5">
              Fill in your details to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <Field
              label="Full Name" icon={FiUser}
              type="text" id="name" name="name"
              value={formData.name} onChange={handleChange}
              placeholder="Your name" autoComplete="name" required
            />

            <Field
              label="Email Address" icon={FiMail}
              type="email" id="email" name="email"
              value={formData.email} onChange={handleChange}
              placeholder="you@example.com" autoComplete="email" required
            />

            <Field
              label="Phone Number" icon={FiPhone}
              type="tel" id="phone" name="phone"
              value={formData.phone} onChange={handleChange}
              placeholder="98XXXXXXXX" autoComplete="tel" required
            />

            <Field
              label="Address" icon={FiHome}
              type="text" id="address" name="address"
              value={formData.address} onChange={handleChange}
              placeholder="Your address" autoComplete="street-address" required
            />

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
                  className="w-full pl-11 pr-12 py-3 bg-[#0A0E1A] border border-[#232F49] rounded-lg text-[#EDF1F7] placeholder-[#5C6270] focus:outline-none focus:border-[#5B8DEF] focus:ring-2 focus:ring-[#5B8DEF]/20 transition font-body text-sm"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                >
                  {showPassword ? (
                    <FiEyeOff className="text-[#5C6270] hover:text-[#8592AC] w-4 h-4" />
                  ) : (
                    <FiEye className="text-[#5C6270] hover:text-[#8592AC] w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

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
                  className="w-full pl-11 pr-12 py-3 bg-[#0A0E1A] border border-[#232F49] rounded-lg text-[#EDF1F7] placeholder-[#5C6270] focus:outline-none focus:border-[#5B8DEF] focus:ring-2 focus:ring-[#5B8DEF]/20 transition font-body text-sm"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="text-[#5C6270] hover:text-[#8592AC] w-4 h-4" />
                  ) : (
                    <FiEye className="text-[#5C6270] hover:text-[#8592AC] w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#5B8DEF] hover:bg-[#4A7CE0] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0E1A] rounded-lg font-semibold text-sm transition-all active:scale-[0.99] inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#0A0E1A]/30 border-t-[#0A0E1A] rounded-full animate-spin" />
              ) : (
                <FiUserPlus className="w-4 h-4" />
              )}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#8592AC] font-body mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-[#5B8DEF] hover:text-[#7BA3F5] font-semibold">
            Sign In
          </a>
        </p>
      </div>
    </div>
  )
}

export default Signup