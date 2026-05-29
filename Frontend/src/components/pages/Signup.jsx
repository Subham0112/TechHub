import React, { useState } from 'react'
import Navbar from '../Navbar'
import { FiUser, FiMail, FiHome, FiLock, FiEye, FiEyeOff, FiShield, FiTag, FiZap, FiGithub,FiPhone, FiShoppingBag } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FcGoogle } from 'react-icons/fc'

const Signup = ({handleAlert}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
  })
  const navigate = useNavigate()
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if(formData.password !== formData.confirmPassword){
      alert("Passwords do not match")
      return
    }
    try{
      // Make API call to backend for signup
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
      });
      navigate('/login')
    }catch(error){
      console.error('Signup error:', error)
      handleAlert({
        type: 'danger',
        title: 'Error',
        description: error.response?.data?.message || 'Signup failed!'
      });
    }
    
    console.log('Form submitted:', formData)
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
                  <h1 className='text-5xl font-black mb-4 text-slate-400'>
                    Signup 
                  </h1>
                  <p className='text-xl text-slate-300'>
                    Start your journey with the best tech deals
                  </p>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-start gap-4 bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50'>
                    <div className='p-3 bg-blue-500/10 rounded-lg'>
                      <FiShoppingBag className='w-6 h-6 text-blue-400' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-white mb-1'>Easy Shopping</h3>
                      <p className='text-sm text-slate-400'>Browse and shop with ease</p>
                    </div>
                  </div>

                  <div className='flex items-start gap-4 bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50'>
                    <div className='p-3 bg-purple-500/10 rounded-lg'>
                      <FiTag className='w-6 h-6 text-purple-400' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-white mb-1'>Exclusive Deals</h3>
                      <p className='text-sm text-slate-400'>Access member-only discounts</p>
                    </div>
                  </div>

                  <div className='flex items-start gap-4 bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50'>
                    <div className='p-3 bg-green-500/10 rounded-lg'>
                      <FiZap className='w-6 h-6 text-green-400' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-white mb-1'>Fast Delivery</h3>
                      <p className='text-sm text-slate-400'>Get your orders delivered quickly</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className='w-full'>
              <div className='bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-8 md:p-10'>
                <div className='text-center mb-8'>
                  <h2 className='text-3xl font-bold mb-2'>Create Account</h2>
                  <p className='text-slate-400'>Fill in your details to get started</p>
                </div>

                <form onSubmit={handleSubmit} className='space-y-5'>
                  {/* Name Input */}
                  <div>
                    <label htmlFor='name' className='block text-sm font-medium mb-2'>
                      Full Name
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <FiUser className='text-slate-400 w-5 h-5' />
                      </div>
                      <input
                        type='text'
                        id='name'
                        name='name'
                        value={formData.name}
                        onChange={handleChange}
                        className='w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition'
                        placeholder='Name'
                        required
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor='address' className='block text-sm font-medium mb-2'>
                       Address
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <FiHome className='text-slate-400 w-5 h-5' />
                      </div>
                      <input
                        type='text'
                        id='address'
                        name='address'
                        value={formData.address}
                        onChange={handleChange}
                        className='w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition'
                        placeholder='Address'
                        required
                      />
                    </div>
                  </div>
                  {/* phone */}
                  <div>
                    <label htmlFor='phone' className='block text-sm font-medium mb-2'>
                      Phone Number
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <FiPhone className='text-slate-400 w-5 h-5' />
                      </div>
                      <input
                        type='text'
                        id='phone'
                        name='phone'
                        value={formData.phone}
                        onChange={handleChange}
                        className='w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition'
                        placeholder='Phone Number'
                        required
                      />
                    </div>
                  </div>
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

                  {/* Confirm Password Input */}
                  <div>
                    <label htmlFor='confirmPassword' className='block text-sm font-medium mb-2'>
                      Confirm Password
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <FiLock className='text-slate-400 w-5 h-5' />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id='confirmPassword'
                        name='confirmPassword'
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className='w-full pl-12 pr-12 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition'
                        placeholder='••••••••'
                        required
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className='absolute inset-y-0 right-0 pr-4 flex items-center'
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff className='text-slate-400 hover:text-slate-300 w-5 h-5' />
                        ) : (
                          <FiEye className='text-slate-400 hover:text-slate-300 w-5 h-5' />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className='flex items-start'>
                    <input
                      type='checkbox'
                      id='terms'
                      className='mt-1 w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      required
                    />
                    <label htmlFor='terms' className='ml-3 text-sm text-slate-400'>
                      I agree to the{' '}
                      <a href='#' className='text-blue-400 hover:text-blue-300 underline'>
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href='#' className='text-blue-400 hover:text-blue-300 underline'>
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type='submit'
                    className='w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold text-base transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
                  >
                    Create Account
                  </button>

                  {/* Divider */}
                  <div className='relative my-6'>
                    <div className='absolute inset-0 flex items-center'>
                      <div className='w-full border-t border-slate-700'></div>
                    </div>
                    <div className='relative flex justify-center text-sm'>
                      <span className='px-4 bg-slate-800/50 text-slate-400'>Or sign up with</span>
                    </div>
                  </div>

                  {/* Social Login Buttons */}
                  <div className='grid grid-cols-2 gap-3'>
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
                  </div>

                  {/* Sign In Link */}
                  <p className='text-center text-sm text-slate-400 mt-6'>
                    Already have an account?{' '}
                    <a href='/login' className='text-blue-400 hover:text-blue-300 font-semibold'>
                      Sign In
                    </a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Signup