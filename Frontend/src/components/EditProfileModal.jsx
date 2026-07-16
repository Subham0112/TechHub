import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FiX, FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

const Field = ({ label, error, children }) => (
  <div>
    <label className='flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5'>
      <Icon className='w-3.5 h-3.5' />
      {label}
    </label>
    {children}
    {error && <p className='text-red-400 text-xs mt-1'>{error}</p>}
  </div>
)

const inputCls = (err) =>
  `w-full bg-slate-800 border ${err ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-indigo-500'}
   text-white text-sm rounded-xl px-4 py-2.5 placeholder-slate-600
   focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`

const EditProfileModal = ({ user, loading, setLoading, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!formData.name.trim()) e.name = 'Name is required'
    if (!formData.email.trim()) e.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) e.email = 'Enter a valid email'
    if (!formData.phone.trim()) e.phone = 'Phone number is required'
    if (!formData.address.trim()) e.address = 'Address is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setServerError('')
    setLoading(true)
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        formData,
        { withCredentials: true }
      )
      if (res.status === 200) {
        onSubmit(formData)
        onClose()
      }
    } catch (err) {
      console.error('Profile update error:', err)
      setServerError(
        err.response?.data?.message || 'Failed to update profile. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'
      onClick={onClose}
    >
      <div
        className='bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='sticky top-0 z-10 bg-slate-800 border-b border-slate-700 px-6 py-4 rounded-t-2xl flex items-center justify-between'>
          <h2 className='text-base font-bold text-white'>Edit Profile</h2>
          <button
            onClick={onClose}
            className='text-slate-400 hover:text-white hover:bg-slate-700 p-2 rounded-lg transition-all'
          >
            <FiX className='w-5 h-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='px-6 py-5 space-y-5'>

          {serverError && (
            <div className='bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded-xl px-4 py-3'>
              {serverError}
            </div>
          )}

          <Field label='Name' icon={FiUser} error={errors.name}>
            <input
              type='text' name='name' id='name'
              value={formData.name} onChange={handleChange}
              placeholder='John Doe'
              className={inputCls(errors.name)}
            />
          </Field>

          <Field label='Email' icon={FiMail} error={errors.email}>
            <input
              type='email' name='email' id='email'
              value={formData.email} onChange={handleChange}
              placeholder='john@example.com'
              className={inputCls(errors.email)}
            />
          </Field>

          <Field label='Phone' icon={FiPhone} error={errors.phone}>
            <input
              type='tel' name='phone' id='phone'
              value={formData.phone} onChange={handleChange}
              placeholder='+977 98XXXXXXXX'
              className={inputCls(errors.phone)}
            />
          </Field>

          <Field label='Address' icon={FiMapPin} error={errors.address}>
            <input
              type='text' name='address' id='address'
              value={formData.address} onChange={handleChange}
              placeholder='House no., Street, City'
              className={inputCls(errors.address)}
            />
          </Field>

          <div className='flex items-center justify-end gap-3 pt-3 border-t border-slate-700'>
            <button
              onClick={onClose}
              type='button'
              disabled={loading}
              className='px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-xl transition-all duration-200'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-all duration-200 flex items-center gap-2'
            >
              {loading && <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfileModal