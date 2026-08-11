import React, { useContext, useState } from 'react'
import { UserContext } from '../context/UserContext'
import EditProfileModal from '../EditProfileModal'
import {
  FiEdit2, FiMail, FiPhone, FiMapPin, FiShield,
  FiCalendar, FiPackage, FiLock, FiCheckCircle, FiCopy
} from 'react-icons/fi'
import type { IconType } from 'react-icons'
import type { User } from '../../types'

const getInitials = (name?: string) => {
  if (!name) return ''
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

const formatMemberSince = (dateStr?: string): string | null => {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// ── Small reusable pieces ──────────────────────────────────────
const InfoRow: React.FC<{ icon: IconType; label: string; value?: string; copyable?: boolean }> = ({ label, value, copyable }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!value) return
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className='flex items-start gap-3 py-3.5 first:pt-0 last:pb-0 border-b border-slate-800 last:border-0'>
      <div className='w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5'>
        {/* <Icon className='w-4 h-4 text-indigo-400' /> */}
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5'>{label}</p>
        <p className='text-sm text-slate-200 break-words'>{value || <span className='text-slate-600'>Not set</span>}</p>
      </div>
      {copyable && value && (
        <button
          onClick={handleCopy}
          className='p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-slate-700 transition-all flex-shrink-0'
          title='Copy'
        >
          {copied ? <FiCheckCircle className='w-3.5 h-3.5 text-emerald-400' /> : <FiCopy className='w-3.5 h-3.5' />}
        </button>
      )}
    </div>
  )
}

const QuickLink: React.FC<{
  icon: IconType;
  label: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ icon: Icon, label, description, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left
      ${disabled
        ? 'border-slate-800 bg-slate-800/30 cursor-not-allowed opacity-60'
        : 'border-slate-700/60 bg-slate-800/60 hover:bg-slate-800 hover:border-indigo-500/40'}`}
  >
    <div className='w-9 h-9 rounded-lg bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0'>
      <Icon className='w-4 h-4 text-indigo-400' />
    </div>
    <div className='flex-1 min-w-0'>
      <p className='text-sm font-semibold text-white'>{label}</p>
      <p className='text-xs text-slate-500 truncate'>{description}</p>
    </div>
  </button>
)

// ── Main Page ────────────────────────────────────────────────────
const ProfilePage: React.FC = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user, saveUser } = useContext(UserContext)

  const handleProfileUpdate = (updatedData: Partial<User>) => {
    saveUser({ ...user, ...updatedData } as User)
  }

  const memberSince = formatMemberSince(user?.createdAt)
  const isAdmin = user?.role === 'admin'

  return (
    <div className='min-h-screen bg-[#0a0f1e] text-white pb-16'>
      {/* Top accent bar — consistent with the rest of the app */}
      <div className='h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500' />

      <div className='max-w-4xl mx-auto px-4 sm:px-6 py-10'>

        {/* ── Hero header ── */}
        <div className='relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-b from-slate-800/70 to-slate-900/70 backdrop-blur-sm p-6 sm:p-8 mb-6'>

          {/* Ambient glow — matches ProductCategoryPage's background treatment */}
          <div className='absolute inset-0 pointer-events-none overflow-hidden'>
            <div className='absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/15 rounded-full blur-[100px]' />
            <div className='absolute -bottom-24 -right-24 w-72 h-72 bg-violet-600/15 rounded-full blur-[100px]' />
          </div>

          <div className='relative z-10 flex flex-col sm:flex-row sm:items-center gap-6'>

            {/* Avatar */}
            <div className='relative flex-shrink-0 mx-auto sm:mx-0'>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name}
                  className='w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-slate-700 ring-4 ring-slate-800'
                />
              ) : (
                <div className='w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-indigo-600/30 to-violet-600/30 border-2 border-indigo-500/30 ring-4 ring-slate-800 flex items-center justify-center text-2xl font-bold text-indigo-300'>
                  {getInitials(user?.name) || '?'}
                </div>
              )}
            </div>

            {/* Identity */}
            <div className='flex-1 min-w-0 text-center sm:text-left'>
              <div className='flex flex-col sm:flex-row sm:items-center gap-2 mb-1'>
                <h1 className='text-2xl font-extrabold text-white truncate'>{user?.name || 'No name'}</h1>
                <span className={`inline-flex items-center gap-1 self-center sm:self-auto text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider w-fit mx-auto sm:mx-0
                  ${isAdmin
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                    : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'}`}>
                  <FiShield className='w-3 h-3' />
                  {user?.role || 'user'}
                </span>
              </div>
              <p className='text-sm text-slate-400 mb-1'>{user?.email || 'No email'}</p>
              {memberSince && (
                <p className='text-xs text-slate-500 flex items-center gap-1.5 justify-center sm:justify-start'>
                  <FiCalendar className='w-3 h-3' />
                  Member since {memberSince}
                </p>
              )}
            </div>

            {/* Edit action */}
            <div className='flex-shrink-0 mx-auto sm:mx-0'>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className='inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/40'
              >
                <FiEdit2 className='w-4 h-4' />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* ── Content grid ── */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

          {/* Left: Personal information */}
          <div className='lg:col-span-2'>
            <div className='bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6'>
              <div className='flex items-center justify-between mb-2'>
                <h2 className='text-base font-bold text-white'>Personal Information</h2>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className='text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors'
                >
                  Edit
                </button>
              </div>
              <div>
                <InfoRow icon={FiMail} label='Email' value={user?.email} copyable />
                <InfoRow icon={FiPhone} label='Phone' value={user?.phone} copyable />
                <InfoRow icon={FiMapPin} label='Address' value={user?.address} />
              </div>
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className='space-y-3'>
            <p className='text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1'>Account</p>
            <QuickLink
              icon={FiPackage}
              label='My Orders'
              description='Track and review past orders'
              onClick={() => { /* navigate to order history route */ }}
            />
            <QuickLink
              icon={FiLock}
              label='Password & Security'
              description='Coming soon'
              disabled
            />
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          loading={isLoading}
          setLoading={setIsLoading}
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleProfileUpdate}
        />
      )}
    </div>
  )
}

export default ProfilePage
