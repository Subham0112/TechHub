import React, { useState, useContext } from 'react'
import Navbar from '../Navbar'
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiTag, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc'
import axios from 'axios'
import { FiGithub } from 'react-icons/fi'
import { UserContext } from '../context/UserContext' 

const Login = ({handleAlert}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const navigate = useNavigate();
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
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-4 py-12'>
        <div className='w-full max-w-6xl'>
          <div className='grid md:grid-cols-2 gap-8 items-center'>
            
            {/* Left Side - Branding/Info */}
            <div className='hidden md:block'>
              <div className='space-y-6'>
                <div>
                  <h1 className='text-4xl font-black mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
                    Welcome Back!
                  </h1>
                  <p className='text-xl text-slate-300'>
                    Sign in to access your account and continue shopping
                  </p>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-start gap-4 bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50'>
                    <div className='p-3 bg-blue-500/10 rounded-lg'>
                      <FiShield className='w-6 h-6 text-blue-400' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-white mb-1'>Secure Login</h3>
                      <p className='text-sm text-slate-400'>Your credentials are encrypted and protected</p>
                    </div>
                  </div>

                  <div className='flex items-start gap-4 bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50'>
                    <div className='p-3 bg-purple-500/10 rounded-lg'>
                      <FiTag className='w-6 h-6 text-purple-400' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-white mb-1'>Save Your Cart</h3>
                      <p className='text-sm text-slate-400'>Access your saved items from any device</p>
                    </div>
                  </div>

                  <div className='flex items-start gap-4 bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50'>
                    <div className='p-3 bg-green-500/10 rounded-lg'>
                      <FiZap className='w-6 h-6 text-green-400' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-white mb-1'>Quick Checkout</h3>
                      <p className='text-sm text-slate-400'>Faster checkout with saved payment methods</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className='w-full'>
              <div className='bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-8 md:p-10'>
                <div className='text-center mb-8'>
                  <h2 className='text-3xl font-bold mb-2'>Sign In</h2>
                  <p className='text-slate-400'>Enter your credentials to access your account</p>
                </div>

                <form onSubmit={handleSubmit} className='space-y-5'>
                  {/* Email Input */}
                  <div>
                    <label htmlFor='email' className='block text-sm font-medium mb-2'>
                      Email Address
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <FiMail className='text-slate-400 w-5 h-5' />
                      </div>
                      <input
                        type='email'
                        id='email'
                        name='email'
                        value={formData.email}
                        onChange={handleChange}
                        className='w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition'
                        placeholder='Email'
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label htmlFor='password' className='block text-sm font-medium mb-2'>
                      Password
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <FiLock className='text-slate-400 w-5 h-5' />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id='password'
                        name='password'
                        value={formData.password}
                        onChange={handleChange}
                        className='w-full pl-12 pr-12 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition'
                        placeholder='••••••••'
                        required
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute inset-y-0 right-0 pr-4 flex items-center'
                      >
                        {showPassword ? (
                          <FiEyeOff className='text-slate-400 hover:text-slate-300 w-5 h-5' />
                        ) : (
                          <FiEye className='text-slate-400 hover:text-slate-300 w-5 h-5' />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        id='rememberMe'
                        name='rememberMe'
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className='w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      />
                      <label htmlFor='rememberMe' className='ml-2 text-sm text-slate-400'>
                        Remember me
                      </label>
                    </div>
                    <a href='/forgot-password' className='text-sm text-blue-400 hover:text-blue-300'>
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit Button - FIXED */}
                  <button
                    type='submit'
                    disabled={loading}
                    className='w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-base transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>

                  {/* Divider */}
                  <div className='relative my-6'>
                    <div className='absolute inset-0 flex items-center'>
                      <div className='w-full border-t border-slate-700'></div>
                    </div>
                    <div className='relative flex justify-center text-sm'>
                    </div>
                  </div>

                  {/* Social Login Buttons */}
                  {/* <div className='grid grid-cols-2 gap-3'>
                    <button
                      type='button'
                      className='flex items-center justify-center gap-2 py-3 px-4 bg-slate-900/50 border border-slate-600 rounded-lg hover:bg-slate-900 hover:border-slate-500 transition text-sm font-medium'
                    >
                      <FcGoogle className='w-5 h-5' />
                      Google
                    </button>
                    <button
                      type='button'
                      className='flex items-center justify-center gap-2 py-3 px-4 bg-slate-900/50 border border-slate-600 rounded-lg hover:bg-slate-900 hover:border-slate-500 transition text-sm font-medium'
                    >
                      <FiGithub className='w-5 h-5' />
                      GitHub
                    </button>
                  </div> */}

                  {/* Sign Up Link */}
                  <p className='text-center text-sm text-slate-400 mt-6'>
                    Don't have an account?{' '}
                    <a href='/signup' className='text-blue-400 hover:text-blue-300 font-semibold'>
                      Create Account
                    </a>
                  </p>
                </form>
              </div>

              {/* Additional Info */}
              <div className='mt-6 text-center'>
                <p className='text-xs text-slate-500'>
                  Protected by industry-standard encryption • 
                  <a href='#' className='text-blue-400 hover:text-blue-300 ml-1'>Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login