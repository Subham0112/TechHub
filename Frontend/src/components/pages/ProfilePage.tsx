import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
const InfoRow = ({ icon: Icon, label, value, copyable }: { icon: IconType; label: string; value?: string; copyable?: boolean }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!value) return
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className='flex items-start gap-3 py-3.5 first:pt-0 last:pb-0 border-b border-[#232F49] last:border-0'>
      <div className='w-9 h-9 rounded-lg bg-[#182238] border border-[#232F49] flex items-center justify-center flex-shrink-0 mt-0.5'>
        <Icon className='w-4 h-4 text-[#5B8DEF]' />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-[11px] font-mono font-semibold text-[#8592AC] uppercase tracking-wider mb-0.5'>{label}</p>
        <p className='text-sm text-[#EDF1F7] break-words'>{value || <span className='text-[#5C6270]'>Not set</span>}</p>
      </div>
      {copyable && value && (
        <button
          onClick={handleCopy}
          className='p-1.5 rounded-md text-[#8592AC] hover:text-[#EDF1F7] hover:bg-[#182238] transition-all flex-shrink-0 cursor-pointer'
          title='Copy'
        >
          {copied ? <FiCheckCircle className='w-3.5 h-3.5 text-emerald-400' /> : <FiCopy className='w-3.5 h-3.5' />}
        </button>
      )}
    </div>
  )
}

const QuickLink = ({ icon: Icon, label, description, onClick, disabled }: {
  icon: IconType;
  label: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left cursor-pointer
      ${disabled
        ? 'border-[#232F49] bg-[#121A2E]/30 cursor-not-allowed opacity-60'
        : 'border-[#232F49] bg-[#121A2E] hover:bg-[#182238] hover:border-[#5B8DEF]/40'}`}
  >
    <div className='w-9 h-9 rounded-lg bg-[#5B8DEF]/10 border border-[#5B8DEF]/25 flex items-center justify-center flex-shrink-0'>
      <Icon className='w-4 h-4 text-[#5B8DEF]' />
    </div>
    <div className='flex-1 min-w-0'>
      <p className='text-sm font-semibold text-[#EDF1F7]'>{label}</p>
      <p className='text-xs text-[#8592AC] truncate'>{description}</p>
    </div>
  </button>
)

// ── Main Page ────────────────────────────────────────────────────
const ProfilePage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user, saveUser } = useContext(UserContext)
  const navigate = useNavigate()

  const handleProfileUpdate = (updatedData: Partial<User>) => {
    saveUser({ ...user, ...updatedData } as User)
  }

  const memberSince = formatMemberSince(user?.createdAt)
  const isAdmin = user?.role === 'admin'

  return (
    <div className='min-h-screen bg-[#0A0E1A] text-[#EDF1F7] pb-16'>

      <div className='max-w-4xl mx-auto px-4 sm:px-6 py-10'>

        {/* ── Profile header ── */}
        <div className='relative bg-[#121A2E] border border-[#232F49] rounded-2xl p-6 sm:p-8 mb-6'>

          <div className='flex flex-col sm:flex-row sm:items-center gap-6'>

            {/* Avatar */}
            <div className='relative flex-shrink-0 mx-auto sm:mx-0'>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name}
                  className='w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-[#232F49] ring-4 ring-[#182238]'
                />
              ) : (
                <div className='w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#182238] border-2 border-[#5B8DEF]/40 ring-4 ring-[#0A0E1A] flex items-center justify-center text-2xl font-bold text-[#5B8DEF]'>
                  {getInitials(user?.name) || '?'}
                </div>
              )}
            </div>

            {/* Identity */}
            <div className='flex-1 min-w-0 text-center sm:text-left'>
              <div className='flex flex-col sm:flex-row sm:items-center gap-2 mb-1'>
                <h1 className='text-2xl font-display font-semibold text-[#EDF1F7] truncate'>{user?.name || 'No name'}</h1>
                <span className={`inline-flex items-center gap-1 self-center sm:self-auto text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider w-fit mx-auto sm:mx-0
                  ${isAdmin
                    ? 'bg-[#FFB238]/10 text-[#FFB238] border border-[#FFB238]/30'
                    : 'bg-[#5B8DEF]/10 text-[#5B8DEF] border border-[#5B8DEF]/30'}`}>
                  <FiShield className='w-3 h-3' />
                  {user?.role || 'user'}
                </span>
              </div>
              <p className='text-sm text-[#8592AC] font-body mb-1'>{user?.email || 'No email'}</p>
              {memberSince && (
                <p className='text-xs text-[#5C6270] flex items-center gap-1.5 justify-center sm:justify-start'>
                  <FiCalendar className='w-3 h-3' />
                  Member since {memberSince}
                </p>
              )}
            </div>

            {/* Edit action */}
            <div className='flex-shrink-0 mx-auto sm:mx-0'>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className='inline-flex items-center gap-2 bg-[#5B8DEF] hover:bg-[#4A7CE0] text-[#0A0E1A] text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 cursor-pointer'
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
            <div className='bg-[#121A2E] border border-[#232F49] rounded-2xl p-6'>
              <div className='flex items-center justify-between mb-2'>
                <h2 className='text-base font-display font-semibold text-[#EDF1F7]'>Personal Information</h2>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className='text-xs font-semibold text-[#5B8DEF] hover:text-[#EDF1F7] transition-colors cursor-pointer'
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
            <p className='text-[11px] font-mono font-semibold text-[#8592AC] uppercase tracking-widest px-1'>Account</p>
            <QuickLink
              icon={FiPackage}
              label='My Orders'
              description='Track and review past orders'
              onClick={() => navigate('/orders')}
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