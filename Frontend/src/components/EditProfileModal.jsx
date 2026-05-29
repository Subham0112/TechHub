import React from 'react'
import { useState } from 'react'
import axios from 'axios'

const EditProfileModal = ({ user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  })
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const updateProfile=async()=>{
      try {
        const res=await axios.put(`${import.meta.env.VITE_API_URL}/users/profile`,formData)
        if(res.status===200){
          onSubmit(formData)
        }
      }catch(err){
        console.log(err)
      }
    }
    updateProfile()
    console.log(formData)
    onClose()

  }
  return (
    <div className='fixed inset-0 text-black bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white max-w-2xl w-full px-6 py-4 rounded-lg shadow-xl'>
        <h2 className='text-xl font-bold mb-4'>Edit Profile</h2>
        <form className='space-y-6' onSubmit={handleSubmit}>
          <div>
            <label htmlFor='name' className='block text-sm font-medium text-slate-700'>Name</label>
            <input type='text' value={formData.name} onChange={handleChange} name='name' id='name' className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2' />
          </div>

          <div>
            <label htmlFor='email' className='block text-sm font-medium text-slate-700'>Email</label>
            <input type='email' value={formData.email} onChange={handleChange} name='email' id='email' className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2' />
          </div>

          <div>
            <label htmlFor='phone' className='block text-sm font-medium text-slate-700'>Phone</label>
            <input type='tel' value={formData.phone} onChange={handleChange} name='phone' id='phone' className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2' />
          </div>

          <div>
            <label htmlFor='address' className='block text-sm font-medium text-slate-700'>Address</label>
            <input type='text' value={formData.address} onChange={handleChange }  name='address' id='address' className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2' />
          </div>

          <div className='flex items-center justify-end gap-3 pt-2 border-t border-slate-700'>
            <button
            onClick={onClose}
            type='button' className='px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200'>
              Cancel
            </button>
            <button type='submit' className='px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-all duration-200 flex items-center gap-2'>
              Save Changes
            </button>
          </div>
        </form>
      </div>
      
    </div>
  )
}

export default EditProfileModal
