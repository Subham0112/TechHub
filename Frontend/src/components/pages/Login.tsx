import React, { useState, useContext } from 'react'
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserContext } from '../context/UserContext'
import { getErrorMessage } from '../../utils/errorUtils'
import type { AlertData } from '../../types'

const inputCls = "w-full pl-11 pr-4 py-3 bg-[#0A0E1A] border border-[#232F49] rounded-lg text-[#EDF1F7] placeholder-[#5C6270] focus:outline-none focus:border-[#5B8DEF] focus:ring-2 focus:ring-[#5B8DEF]/20 transition font-body text-sm"

interface LoginFormData {
  email: string
  password: string
}

const Login = ({ handleAlert }: { handleAlert: (alert: AlertData) => void }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<LoginFormData>({
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

      saveUser(response.data.user)
      if (response.data.user.role === 'admin') {
        navigate("/admin")
      } else {
        navigate("/")
      }
    } catch (error) {
      handleAlert({
        type: 'danger',
        title: 'Error',
        description: getErrorMessage(error, 'Login failed!')
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
              Welcome Back
            </h1>
            <p className="text-sm text-[#8592AC] font-body mt-1.5">
              Sign in to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

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
                  autoComplete="email"
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
                  placeholder="Your password"
                  autoComplete="current-password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#5B8DEF] hover:bg-[#4A7CE0] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0E1A] rounded-lg font-semibold text-sm transition-all active:scale-[0.99] inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#0A0E1A]/30 border-t-[#0A0E1A] rounded-full animate-spin" />
              ) : (
                <FiLogIn className="w-4 h-4" />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#8592AC] font-body mt-6">
          Don't have an account?{' '}
          <a href="/signup" className="text-[#5B8DEF] hover:text-[#7BA3F5] font-semibold">
            Create Account
          </a>
        </p>
      </div>
    </div>
  )
}

export default Login