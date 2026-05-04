// components/modals/AddProductModal.jsx
import React, { useState, useEffect } from 'react'

const AddProductModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: 'mobile-accessories',
    type: '',
    stock: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  const validate = () => {
    const e = {}
    if (!formData.name.trim())        e.name        = 'Product name is required'
    if (!formData.price || formData.price < 0) e.price = 'Valid price is required'
    if (!formData.description.trim()) e.description = 'Description is required'
    if (!formData.type.trim())        e.type        = 'Type is required'
    if (formData.stock === '' || formData.stock < 0) e.stock = 'Valid stock quantity is required'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setLoading(true)
    try {
      await onSubmit({ ...formData, price: Number(formData.price), stock: Number(formData.stock) })
      onClose()
      setFormData({ name: '', price: '', description: '', image: '', category: 'mobile-accessories', type: '', stock: '' })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const inputClass = (field) =>
    `w-full bg-slate-800/80 border ${errors[field] ? 'border-red-500' : 'border-slate-600'} 
     text-white text-sm rounded-lg px-4 py-2.5 placeholder-slate-500
     focus:outline-none focus:ring-2 ${errors[field] ? 'focus:ring-red-500' : 'focus:ring-indigo-500'}
     focus:border-transparent transition-all duration-200`

  return (
    <div
      className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4'
      onClick={onClose}
    >
      <div
        className='relative bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='sticky top-0 z-10 bg-slate-800 border-b border-slate-700 px-6 py-4 rounded-t-2xl flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-bold text-white'>New Product</h2>
            <p className='text-xs text-slate-400 mt-0.5'>Fill in the details to add a new product</p>
          </div>
          <button
            onClick={onClose}
            className='text-slate-400 hover:text-white hover:bg-slate-700 p-2 rounded-lg transition-all duration-200'
          >
            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='px-6 py-5 space-y-5'>

          {/* Name */}
          <div>
            <label className='block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider'>
              Product Name <span className='text-red-400'>*</span>
            </label>
            <input
              name='name'
              value={formData.name}
              onChange={handleChange}
              placeholder='e.g. iPhone 15 Case'
              className={inputClass('name')}
            />
            {errors.name && <p className='text-red-400 text-xs mt-1'>{errors.name}</p>}
          </div>

          {/* Price + Stock */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider'>
                Price ($) <span className='text-red-400'>*</span>
              </label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm'>$</span>
                <input
                  name='price'
                  type='number'
                  min='0'
                  value={formData.price}
                  onChange={handleChange}
                  placeholder='0.00'
                  className={`${inputClass('price')} pl-7`}
                />
              </div>
              {errors.price && <p className='text-red-400 text-xs mt-1'>{errors.price}</p>}
            </div>
            <div>
              <label className='block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider'>
                Stock <span className='text-red-400'>*</span>
              </label>
              <input
                name='stock'
                type='number'
                min='0'
                value={formData.stock}
                onChange={handleChange}
                placeholder='0'
                className={inputClass('stock')}
              />
              {errors.stock && <p className='text-red-400 text-xs mt-1'>{errors.stock}</p>}
            </div>
          </div>

          {/* Category + Type */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider'>
                Category <span className='text-red-400'>*</span>
              </label>
              <select
                name='category'
                value={formData.category}
                onChange={handleChange}
                className={`${inputClass('category')} cursor-pointer`}
              >
                <option value='mobile-accessories'>Mobile Accessories</option>
                <option value='gadgets'>Gadgets</option>
              </select>
            </div>
            <div>
              <label className='block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider'>
                Type <span className='text-red-400'>*</span>
              </label>
              <input
                name='type'
                value={formData.type}
                onChange={handleChange}
                placeholder='e.g. Case, Charger, Earbuds'
                className={inputClass('type')}
              />
              {errors.type && <p className='text-red-400 text-xs mt-1'>{errors.type}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className='block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider'>
              Description <span className='text-red-400'>*</span>
            </label>
            <textarea
              name='description'
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder='Write a short product description...'
              className={`${inputClass('description')} resize-none`}
            />
            {errors.description && <p className='text-red-400 text-xs mt-1'>{errors.description}</p>}
          </div>

          {/* Image URL */}
          <div>
            <label className='block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider'>
              Image URL <span className='text-slate-500 normal-case font-normal'>(optional)</span>
            </label>
            <div className='flex gap-3 items-center'>
              <input
                name='image'
                value={formData.image}
                onChange={handleChange}
                placeholder='https://example.com/image.jpg'
                className={`${inputClass('image')} flex-1`}
              />
              {formData.image && (
                <img
                  src={formData.image}
                  alt='preview'
                  className='h-10 w-10 rounded-lg object-cover border border-slate-600 flex-shrink-0'
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className='flex items-center justify-end gap-3 pt-2 border-t border-slate-700'>
            <button
              type='button'
              onClick={onClose}
              className='px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-all duration-200 flex items-center gap-2'
            >
              {loading && (
                <svg className='w-4 h-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
                </svg>
              )}
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddProductModal