import React from 'react'
import { useContext } from 'react'
import { UserContext } from '../context/UserContext'
import { useState } from 'react'
import EditProfileModal from '../EditProfileModal'

const getInitials = (name) => {
  if (!name) return ''
  return name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()
}




const ProfilePage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user, saveUser} = useContext(UserContext)

  const handleEditClick = () => {
    setIsEditModalOpen(true)
  }

  const handleProfileUpdate = (updatedData) => {
    if (saveUser) {
      saveUser({ ...user, ...updatedData })
    }
  }
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12'>
      <div className='max-w-4xl mx-auto px-6'>
        <h1 className='text-3xl font-extrabold mb-6'>Profile</h1>

        <div className='bg-slate-800/60 border border-slate-700 rounded-2xl p-6 flex gap-6 items-center'>
          <div className='flex-shrink-0'>
            {user?.avatar ? (
              <img src={user.avatar} alt={user?.name} className='w-28 h-28 rounded-full object-cover border border-slate-700' />
            ) : (
              <div className='w-28 h-28 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl font-bold text-indigo-300'>
                {getInitials(user?.name)}
              </div>
            )}
          </div>

          <div className='flex-1'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 className='text-2xl font-bold'>{user?.name || 'No name'}</h2>
                <p className='text-md text-slate-400 mt-1'>{user?.email || 'No email'}</p>
              </div>

              <div className='text-right'>
                <span className='inline-block px-3 py-1 rounded-full bg-slate-700 text-xs font-semibold text-slate-200'>{user?.role || 'user'}</span>
                <div className='mt-3'>
                  <button
                  onClick={handleEditClick}

                  className='px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-md font-semibold'>Edit Profile</button>
                </div>
              </div>
            </div>
            
            <div className='mt-6 grid grid-cols-2 gap-4 text-sm'>
              <div className="border border-slate-700 rounded-lg p-4 ">
                <p className='text-slate-400 text-lg'>Email</p>
                <p className='text-md '>{user?.email || '—'}</p>
              </div>
              <div className="border border-slate-700 rounded-lg p-4 ">
                <p className='text-slate-400 text-lg'>Phone</p>
                <p className='text-md'>{user?.phone || '—'}</p>
              </div>
              <div className="border border-slate-700 rounded-lg p-4 ">
                <p className='text-slate-400 text-lg'>Address</p>
                <p className='text-md'>{user?.address || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isEditModalOpen && <EditProfileModal loading={isLoading} setLoading={setIsLoading} user={user} onClose={() => setIsEditModalOpen(false)} onSubmit={handleProfileUpdate} />}
    </div>
  )
}

export default ProfilePage
