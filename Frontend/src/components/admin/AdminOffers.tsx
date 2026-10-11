import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { FiTag, FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi'
import type { AlertData, Offer, OfferAppliesTo, OfferType, Product } from '../../types'

const AUTH = { withCredentials: true }

interface AdminOffersProps {
  handleAlert?: (alert: AlertData) => void
}

interface OfferForm {
  title: string
  description: string
  type: OfferType
  discountValue: string
  comboPrice: string
  appliesTo: OfferAppliesTo
  category: string
  productIds: number[]
  startsAt: string
  endsAt: string
  isActive: boolean
}

const emptyForm: OfferForm = {
  title: '',
  description: '',
  type: 'percentage',
  discountValue: '',
  comboPrice: '',
  appliesTo: 'products',
  category: '',
  productIds: [],
  startsAt: '',
  endsAt: '',
  isActive: true,
}

const toInputValue = (iso?: string | null) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const getOfferStatus = (offer: Offer): 'live' | 'scheduled' | 'expired' | 'inactive' => {
  if (!offer.isActive) return 'inactive'
  const now = Date.now()
  if (offer.startsAt && new Date(offer.startsAt).getTime() > now) return 'scheduled'
  if (offer.endsAt && new Date(offer.endsAt).getTime() < now) return 'expired'
  return 'live'
}

const STATUS_STYLES: Record<string, string> = {
  live: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  scheduled: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
  expired: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  inactive: 'bg-[var(--adm-chip)] text-[var(--adm-muted)] border-[var(--adm-border)]',
}

const formatWindow = (offer: Offer) => {
  if (!offer.startsAt && !offer.endsAt) return 'Always on'
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  if (offer.startsAt && offer.endsAt) return `${fmt(offer.startsAt)} – ${fmt(offer.endsAt)}`
  if (offer.startsAt) return `From ${fmt(offer.startsAt)}`
  return `Until ${fmt(offer.endsAt as string)}`
}

const AdminOffers = ({ handleAlert }: AdminOffersProps) => {
  const [offers, setOffers] = useState<Offer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<OfferForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetchOffers = useCallback(async () => {
    try {
      const res = await axios.get<Offer[]>(`${import.meta.env.VITE_API_URL}/offers`, AUTH)
      setOffers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOffers()
    axios
      .get<Product[]>(`${import.meta.env.VITE_API_URL}/products/`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err))
  }, [fetchOffers])

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean))
    return [...set].sort()
  }, [products])

  const stats = useMemo(() => {
    const counts = { live: 0, scheduled: 0, expired: 0, inactive: 0 }
    offers.forEach((o) => { counts[getOfferStatus(o)] += 1 })
    return counts
  }, [offers])

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    )
  }, [products, productSearch])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setProductSearch('')
    setModalOpen(true)
  }

  const openEdit = (offer: Offer) => {
    setEditingId(offer.id)
    setForm({
      title: offer.title,
      description: offer.description ?? '',
      type: offer.type,
      discountValue: offer.type === 'combo' ? '' : String(offer.discountValue),
      comboPrice: offer.comboPrice != null ? String(offer.comboPrice) : '',
      appliesTo: offer.appliesTo,
      category: offer.category ?? '',
      productIds: offer.products.map((p) => p.id),
      startsAt: toInputValue(offer.startsAt),
      endsAt: toInputValue(offer.endsAt),
      isActive: offer.isActive,
    })
    setFormError('')
    setProductSearch('')
    setModalOpen(true)
  }

  const close = () => {
    if (saving) return
    setModalOpen(false)
  }

  const toggleProduct = (id: number) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(id)
        ? prev.productIds.filter((p) => p !== id)
        : [...prev.productIds, id],
    }))
  }

  const validate = (): string => {
    if (form.title.trim().length < 3) return 'Title must be at least 3 characters'
    if (form.type === 'percentage') {
      const v = Number(form.discountValue)
      if (!Number.isFinite(v) || v <= 0 || v > 100) return 'Percentage must be between 1 and 100'
    }
    if (form.type === 'fixed') {
      const v = Number(form.discountValue)
      if (!Number.isFinite(v) || v <= 0) return 'Discount amount must be greater than 0'
    }
    if (form.type === 'combo') {
      const v = Number(form.comboPrice)
      if (!Number.isFinite(v) || v <= 0) return 'Combo price must be greater than 0'
      if (form.productIds.length < 2) return 'Combo offers need at least 2 products'
    }
    if (form.appliesTo === 'products' && form.type !== 'combo' && form.productIds.length < 1) {
      return 'Select at least one product'
    }
    if (form.appliesTo === 'category' && !form.category) return 'Select a category'
    if (form.startsAt && form.endsAt && new Date(form.startsAt) >= new Date(form.endsAt)) {
      return 'Start date must be before end date'
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const error = validate()
    if (error) {
      setFormError(error)
      return
    }

    setSaving(true)
    setFormError('')
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      type: form.type,
      discountValue: form.type === 'combo' ? 0 : Number(form.discountValue),
      comboPrice: form.type === 'combo' ? Number(form.comboPrice) : null,
      appliesTo: form.type === 'combo' ? 'products' : form.appliesTo,
      category: form.appliesTo === 'category' ? form.category : null,
      productIds: form.appliesTo === 'products' || form.type === 'combo' ? form.productIds : [],
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      isActive: form.isActive,
    }

    try {
      if (editingId) {
        const res = await axios.put<Offer>(
          `${import.meta.env.VITE_API_URL}/offers/${editingId}`,
          payload,
          AUTH
        )
        setOffers((prev) => prev.map((o) => (o.id === editingId ? res.data : o)))
        handleAlert?.({ type: 'success', title: 'Offer updated', description: payload.title })
      } else {
        const res = await axios.post<Offer>(`${import.meta.env.VITE_API_URL}/offers`, payload, AUTH)
        setOffers((prev) => [res.data, ...prev])
        handleAlert?.({ type: 'success', title: 'Offer created', description: payload.title })
      }
      setModalOpen(false)
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to save offer'
        : 'Failed to save offer'
      setFormError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (offer: Offer) => {
    try {
      const res = await axios.patch<Offer>(
        `${import.meta.env.VITE_API_URL}/offers/${offer.id}/toggle`,
        {},
        AUTH
      )
      setOffers((prev) => prev.map((o) => (o.id === offer.id ? res.data : o)))
    } catch (err) {
      console.error(err)
      handleAlert?.({ type: 'danger', title: 'Failed to update offer status' })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/offers/${deleteId}`, AUTH)
      setOffers((prev) => prev.filter((o) => o.id !== deleteId))
      handleAlert?.({ type: 'success', title: 'Offer deleted' })
    } catch (err) {
      console.error(err)
      handleAlert?.({ type: 'danger', title: 'Failed to delete offer' })
    } finally {
      setDeleteId(null)
    }
  }

  const describeOffer = (offer: Offer) => {
    if (offer.type === 'combo') return `Rs. ${offer.comboPrice?.toLocaleString()} bundle`
    if (offer.type === 'percentage') return `${offer.discountValue}% off`
    return `Rs. ${offer.discountValue.toLocaleString()} off`
  }

  const describeApplies = (offer: Offer) => {
    if (offer.appliesTo === 'all') return 'All products'
    if (offer.appliesTo === 'category') return `Category: ${offer.category}`
    const count = offer.products.length
    return `${count} product${count !== 1 ? 's' : ''}`
  }

  const inputClass = (field?: string) =>
    `w-full bg-[var(--adm-card)] border ${field && formError ? 'border-red-500' : 'border-[var(--adm-border)]'}
     text-[var(--adm-heading)] text-sm rounded-lg px-4 py-2.5 placeholder-[var(--adm-placeholder)]
     focus:outline-none focus:ring-2 ${field && formError ? 'focus:ring-red-500' : 'focus:ring-[var(--adm-accent)]'}
     focus:border-transparent transition-all duration-200`

  const labelClass = 'block text-xs font-semibold text-[var(--adm-label)] mb-1.5 uppercase tracking-wider'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Offers', value: offers.length, tone: 'text-[var(--adm-heading)]' },
          { label: 'Live', value: stats.live, tone: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Scheduled', value: stats.scheduled, tone: 'text-sky-600 dark:text-sky-400' },
          { label: 'Inactive', value: stats.inactive, tone: 'text-[var(--adm-muted)]' },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-xl px-5 py-4">
            <p className="text-[10px] font-mono text-[var(--adm-muted)] uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-display font-bold mt-1 ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <p className="text-xs font-mono text-[var(--adm-muted)]">
          <span className="text-[var(--adm-heading)] font-semibold">{offers.length}</span> offer{offers.length !== 1 ? 's' : ''} configured
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[var(--adm-accent-contrast)] bg-[var(--adm-accent)] hover:bg-[var(--adm-accent-hover)] rounded-lg transition-all duration-200 cursor-pointer"
        >
          <FiPlus className="w-4 h-4" /> New Offer
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[var(--adm-border)] border-t-[var(--adm-accent)] animate-spin" />
          <p className="text-[var(--adm-muted)] text-sm font-mono">Loading offers...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="rounded-2xl border border-[var(--adm-border)] bg-[var(--adm-card)] py-24 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[var(--adm-subtle)] border border-[var(--adm-border)] flex items-center justify-center">
            <FiTag className="w-6 h-6 text-[var(--adm-dim)]" />
          </div>
          <p className="text-sm text-[var(--adm-muted)]">No offers yet. Create your first discount or combo bundle.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--adm-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[var(--adm-subtle)]">
                <tr>
                  {['Offer', 'Discount', 'Applies To', 'Validity', 'Status', 'Actions'].map((col) => (
                    <th key={col} className="px-5 py-3.5 text-left text-[10px] font-mono font-bold text-[var(--adm-muted)] uppercase tracking-widest whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[var(--adm-subtle)] divide-y divide-[var(--adm-border)]">
                {offers.map((offer) => {
                  const status = getOfferStatus(offer)
                  return (
                    <tr key={offer.id} className="hover:bg-[var(--adm-card)] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[var(--adm-chip)] border border-[var(--adm-accent-border)] flex items-center justify-center flex-shrink-0">
                            <FiTag className="w-4 h-4 text-[var(--adm-accent)]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--adm-heading)] whitespace-nowrap">{offer.title}</p>
                            {offer.description && (
                              <p className="text-[11px] text-[var(--adm-dim)] truncate max-w-[220px]">{offer.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border whitespace-nowrap ${offer.type === 'combo'
                          ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30'
                          : 'bg-[var(--adm-accent-soft)] text-[var(--adm-accent)] border-[var(--adm-accent-border)]'
                          }`}>
                          {describeOffer(offer)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-[var(--adm-muted)] whitespace-nowrap">{describeApplies(offer)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-[var(--adm-dim)] font-mono whitespace-nowrap">{formatWindow(offer)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${STATUS_STYLES[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(offer)}
                            title="Edit offer"
                            className="p-2 rounded-lg text-[var(--adm-muted)] hover:text-[var(--adm-accent)] hover:bg-[var(--adm-chip)] transition cursor-pointer"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggle(offer)}
                            title={offer.isActive ? 'Deactivate' : 'Activate'}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border transition cursor-pointer ${offer.isActive
                              ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                              : 'text-[var(--adm-muted)] border-[var(--adm-border)] bg-[var(--adm-chip)] hover:bg-[var(--adm-chip-hover)]'
                              }`}
                          >
                            {offer.isActive ? 'Active' : 'Off'}
                          </button>
                          <button
                            onClick={() => setDeleteId(offer.id)}
                            title="Delete offer"
                            className="p-2 rounded-lg text-[var(--adm-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={close}>
          <div
            className="relative bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-[var(--adm-card)] border-b border-[var(--adm-border)] px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--adm-heading)]">
                  {editingId ? 'Edit Offer' : 'New Offer'}
                </h2>
                <p className="text-xs text-[var(--adm-muted)] mt-0.5">
                  Percentage/fixed discounts apply per product. Combos bundle products at one price.
                </p>
              </div>
              <button
                onClick={close}
                className="text-[var(--adm-muted)] hover:text-[var(--adm-heading)] hover:bg-[var(--adm-chip)] p-2 rounded-lg transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              <div>
                <label className={labelClass}>Title <span className="text-red-500">*</span></label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Dashain Sale, Earbuds + Charger Combo"
                  className={inputClass()}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Offer Type <span className="text-red-500">*</span></label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as OfferType })}
                    className={`${inputClass()} cursor-pointer`}
                  >
                    <option value="percentage">Percentage off</option>
                    <option value="fixed">Fixed amount off</option>
                    <option value="combo">Combo bundle</option>
                  </select>
                </div>

                {form.type === 'combo' ? (
                  <div>
                    <label className={labelClass}>Bundle Price (Rs.) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="1"
                      value={form.comboPrice}
                      onChange={(e) => setForm({ ...form, comboPrice: e.target.value })}
                      placeholder="e.g. 3299"
                      className={inputClass()}
                    />
                  </div>
                ) : (
                  <div>
                    <label className={labelClass}>
                      {form.type === 'percentage' ? 'Discount (%)' : 'Discount (Rs.)'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.discountValue}
                      onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                      placeholder={form.type === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
                      className={inputClass()}
                    />
                  </div>
                )}

                <div>
                  <label className={labelClass}>Apply To</label>
                  <select
                    value={form.type === 'combo' ? 'products' : form.appliesTo}
                    disabled={form.type === 'combo'}
                    onChange={(e) => setForm({ ...form, appliesTo: e.target.value as OfferAppliesTo, category: '' })}
                    className={`${inputClass()} cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <option value="products">Selected products</option>
                    <option value="category">A category</option>
                    <option value="all">All products</option>
                  </select>
                </div>
              </div>

              {form.appliesTo === 'category' && form.type !== 'combo' && (
                <div>
                  <label className={labelClass}>Category <span className="text-red-500">*</span></label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={`${inputClass()} cursor-pointer`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {(form.appliesTo === 'products' || form.type === 'combo') && (
                <div>
                  <label className={labelClass}>
                    Products {form.type === 'combo' && <span className="text-red-500">*</span>}
                    {form.productIds.length > 0 && (
                      <span className="text-[var(--adm-accent)] normal-case font-mono ml-1">({form.productIds.length} selected)</span>
                    )}
                  </label>
                  <div className="relative mb-2">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--adm-dim)]" />
                    <input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products..."
                      className={`${inputClass()} pl-9`}
                    />
                  </div>
                  <div className="max-h-52 overflow-y-auto border border-[var(--adm-border)] rounded-lg divide-y divide-[var(--adm-border)] bg-[var(--adm-subtle)]">
                    {filteredProducts.length === 0 && (
                      <p className="px-4 py-6 text-center text-xs text-[var(--adm-muted)]">No products match your search.</p>
                    )}
                    {filteredProducts.map((p) => (
                      <label
                        key={p._id}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[var(--adm-card)] transition"
                      >
                        <input
                          type="checkbox"
                          checked={form.productIds.includes(Number(p._id))}
                          onChange={() => toggleProduct(Number(p._id))}
                          className="accent-[var(--adm-accent)] cursor-pointer"
                        />
                        <span className="flex-1 text-sm text-[var(--adm-heading)] truncate">{p.name}</span>
                        <span className="text-xs font-mono text-[var(--adm-muted)]">Rs. {p.price.toLocaleString()}</span>
                      </label>
                    ))}
                  </div>
                  {form.type === 'combo' && form.productIds.length < 2 && (
                    <p className="text-[11px] text-[var(--adm-muted)] mt-1">Select at least 2 products for a combo.</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Starts At <span className="text-[var(--adm-placeholder)] normal-case font-normal">(optional)</span></label>
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    className={inputClass()}
                  />
                </div>
                <div>
                  <label className={labelClass}>Ends At <span className="text-[var(--adm-placeholder)] normal-case font-normal">(optional)</span></label>
                  <input
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                    className={inputClass()}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="accent-[var(--adm-accent)] cursor-pointer"
                />
                <span className="text-sm text-[var(--adm-heading)]">Active (visible on store immediately)</span>
              </label>

              {formError && (
                <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--adm-border)]">
                <button
                  type="button"
                  onClick={close}
                  className="px-5 py-2.5 text-sm font-medium text-[var(--adm-muted)] hover:text-[var(--adm-heading)] bg-[var(--adm-chip)] hover:bg-[var(--adm-chip-hover)] rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 text-sm font-semibold text-[var(--adm-accent-contrast)] bg-[var(--adm-accent)] hover:bg-[var(--adm-accent-hover)] disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition flex items-center gap-2 cursor-pointer"
                >
                  {saving && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  )}
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div
            className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
              <FiTrash2 className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-[var(--adm-heading)]">Delete this offer?</h3>
            <p className="text-sm text-[var(--adm-muted)] mt-1.5">
              The discount or combo will stop applying immediately. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-[var(--adm-muted)] hover:text-[var(--adm-heading)] bg-[var(--adm-chip)] hover:bg-[var(--adm-chip-hover)] rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition cursor-pointer"
              >
                Delete Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOffers
