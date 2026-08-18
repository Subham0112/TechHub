import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { FiUsers, FiSearch, FiMail, FiPhone } from 'react-icons/fi'
import type { AdminCustomer } from '../../types'

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<AdminCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, { withCredentials: true })
        setCustomers(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  const filtered = customers.filter(c =>
    !search.trim() ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const topCustomers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-1.5">// Customers</p>
        <h1 className="text-2xl md:text-3xl font-display font-semibold text-[#EDF1F7]">Customers</h1>
        <p className="text-sm text-[#8592AC] font-body mt-1">All registered users and their order history.</p>
      </div>

      <div className="relative mb-5">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C6270]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full sm:w-80 bg-[#121A2E] border border-[#232F49] text-[#EDF1F7] text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-[#5C6270] focus:outline-none focus:ring-2 focus:ring-[#5B8DEF] focus:border-transparent transition-all"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#232F49] border-t-[#5B8DEF] animate-spin" />
          <p className="text-[#8592AC] text-sm font-mono">Loading customers...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-[#232F49] overflow-hidden">
            <div className="bg-[#121A2E] px-5 py-3 border-b border-[#232F49]">
              <p className="text-xs font-mono text-[#8592AC]">
                Showing <span className="text-[#EDF1F7] font-semibold">{filtered.length}</span> of{" "}
                <span className="text-[#EDF1F7] font-semibold">{customers.length}</span> customers
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#121A2E]/70">
                  <tr>
                    {['Customer', 'Contact', 'Orders', 'Total Spent', 'Joined'].map((col) => (
                      <th key={col} className="px-5 py-3.5 text-left text-[10px] font-mono font-bold text-[#5C6270] uppercase tracking-widest whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-[#0A0E1A] divide-y divide-[#232F49]">
                  {filtered.length > 0 ? (
                    filtered.map((c) => (
                      <tr key={c._id} className="hover:bg-[#121A2E]/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#182238] border border-[#5B8DEF]/40 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-mono font-bold text-[#5B8DEF]">
                                {(c.name || '?').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#EDF1F7] whitespace-nowrap">{c.name}</p>
                              <p className="text-[11px] text-[#5C6270] font-mono truncate max-w-[160px]">{c.address || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs text-[#8592AC] flex items-center gap-1.5 whitespace-nowrap">
                            <FiMail className="w-3 h-3 text-[#5C6270]" /> {c.email}
                          </p>
                          <p className="text-xs text-[#8592AC] flex items-center gap-1.5 mt-1 whitespace-nowrap">
                            <FiPhone className="w-3 h-3 text-[#5C6270]" /> {c.phone || '—'}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-mono text-[#EDF1F7]">{c.orderCount}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-mono font-bold text-[#FFB238] whitespace-nowrap">
                            Rs. {c.totalSpent?.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-[#5C6270] font-mono whitespace-nowrap">
                            {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-[#121A2E] border border-[#232F49] flex items-center justify-center">
                            <FiUsers className="w-6 h-6 text-[#5C6270]" />
                          </div>
                          <p className="text-[#8592AC] text-sm">No customers found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#121A2E] border border-[#232F49] rounded-xl overflow-hidden h-fit">
            <div className="px-5 py-4 border-b border-[#232F49]">
              <p className="text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-1">// Top Spenders</p>
              <h3 className="text-base font-display font-semibold text-[#EDF1F7]">Best Customers</h3>
            </div>
            <div className="divide-y divide-[#232F49]">
              {topCustomers.length > 0 ? (
                topCustomers.map((c, i) => (
                  <div key={c._id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="text-[10px] font-mono font-bold text-[#5C6270] w-4">#{i + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-[#182238] border border-[#5B8DEF]/40 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-mono font-bold text-[#5B8DEF]">
                        {(c.name || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#EDF1F7] truncate">{c.name}</p>
                      <p className="text-[11px] text-[#5C6270] font-mono">{c.orderCount} order{c.orderCount !== 1 ? 's' : ''}</p>
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#FFB238] flex-shrink-0">
                      Rs. {c.totalSpent?.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="px-5 py-10 text-center text-sm text-[#5C6270] font-mono">No customers yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCustomers
