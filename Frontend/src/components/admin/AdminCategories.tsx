import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { FiFolder, FiPackage, FiPlus, FiTrash2 } from 'react-icons/fi'
import type { AlertData, Category } from '../../types'

interface AdminCategoriesProps {
  handleAlert?: (alert: AlertData) => void
}

const AUTH = { withCredentials: true }

const AdminCategories = ({ handleAlert }: AdminCategoriesProps) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get<Category[]>(`${import.meta.env.VITE_API_URL}/categories`)
      setCategories(res.data)
    } catch (err) {
      console.error(err)
      handleAlert?.({ type: 'danger', title: 'Failed to load categories' })
    } finally {
      setLoading(false)
    }
  }, [handleAlert])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed.length < 2) {
      handleAlert?.({ type: 'danger', title: 'Enter a category name (min 2 characters)' })
      return
    }
    setSaving(true)
    try {
      const res = await axios.post<Category>(
        `${import.meta.env.VITE_API_URL}/categories`,
        { name: trimmed },
        AUTH
      )
      setCategories((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)))
      setName('')
      handleAlert?.({ type: 'success', title: 'Category added', description: res.data.name })
    } catch (err) {
      console.error(err)
      handleAlert?.({
        type: 'danger',
        title: 'Failed to add category',
        description: axios.isAxiosError(err) ? (err.response?.data?.message as string | undefined) : undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/categories/${deleteId}`, AUTH)
      setCategories((prev) => prev.filter((c) => c.id !== deleteId))
      handleAlert?.({ type: 'success', title: 'Category deleted' })
    } catch (err) {
      console.error(err)
      handleAlert?.({
        type: 'danger',
        title: 'Failed to delete category',
        description: axios.isAxiosError(err) ? (err.response?.data?.message as string | undefined) : undefined,
      })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6 max-w-lg">
        {[
          { label: 'Total Categories', value: categories.length, icon: FiFolder, tone: 'text-[var(--adm-heading)]' },
          { label: 'Items Categorized', value: totalProducts, icon: FiPackage, tone: 'text-[var(--adm-heading)]' },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-xl px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono text-[var(--adm-muted)] uppercase tracking-widest">{s.label}</p>
              <s.icon className="w-4 h-4 text-[var(--adm-dim)]" />
            </div>
            <p className={`text-2xl font-display font-bold mt-1 ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Add form */}
        <div className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-xl p-6 h-fit lg:sticky lg:top-24">
          <h2 className="text-sm font-display font-semibold text-[var(--adm-heading)] mb-1">Add Category</h2>
          <p className="text-xs text-[var(--adm-muted)] mb-5">
            New categories appear in the product Add/Edit dropdowns.
          </p>
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Smart Watches"
              className="w-full rounded-lg border border-[var(--adm-border)] bg-[var(--adm-input)] px-3.5 py-2.5 text-sm text-[var(--adm-heading)] placeholder-[var(--adm-dim)] focus:outline-none focus:border-[var(--adm-accent)]"
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--adm-accent)] text-[var(--adm-accent-contrast)] px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
            >
              <FiPlus className="w-4 h-4" />
              {saving ? 'Adding...' : 'Add Category'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--adm-border)] flex items-center justify-between">
            <h2 className="text-sm font-display font-semibold text-[var(--adm-heading)]">Categories</h2>
            <span className="text-[10px] font-mono text-[var(--adm-muted)] uppercase tracking-widest">
              {categories.length} total
            </span>
          </div>

          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-[var(--adm-muted)]">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <FiFolder className="w-8 h-8 mx-auto text-[var(--adm-dim)] mb-3" />
              <p className="text-sm text-[var(--adm-muted)] mb-1">No categories yet</p>
              <p className="text-xs text-[var(--adm-dim)]">Add your first category using the form.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--adm-border)]">
              {categories.map((category) => (
                <li key={category.id} className="flex items-center gap-4 px-5 py-4">
                  <FiFolder className="w-5 h-5 text-[var(--adm-dim)] flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--adm-heading)] truncate">{category.name}</p>
                    <p className="text-[11px] font-mono text-[var(--adm-muted)]">/{category.slug}</p>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${
                      category.productCount > 0
                        ? 'text-[var(--adm-accent)] border-[var(--adm-accent)]/30 bg-[var(--adm-accent)]/10'
                        : 'text-[var(--adm-dim)] border-[var(--adm-border)]'
                    }`}
                  >
                    {category.productCount} item{category.productCount !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setDeleteId(category.id)}
                    className="p-2 rounded-md text-[var(--adm-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                    title={`Delete ${category.name}`}
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteId(null)} />
          <div className="relative bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-base font-display font-semibold text-[var(--adm-heading)] mb-2">Delete category?</h3>
            <p className="text-sm text-[var(--adm-muted)] leading-relaxed">
              This will permanently remove this category. Categories currently in use by any
              product cannot be deleted.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-[var(--adm-border)] text-[var(--adm-muted)] hover:text-[var(--adm-heading)] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-rose-500 text-white hover:bg-rose-600 transition disabled:opacity-50 cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCategories