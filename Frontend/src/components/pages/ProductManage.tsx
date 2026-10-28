import React, { useEffect, useState } from 'react'
import axios from 'axios'
import AddProductModal from '../AddProductModal'
import EditProductModal from '../EditProductModal'
import { getImageUrl } from '../../utils/imageUtils'
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiPackage } from 'react-icons/fi'
import type { AlertData, Product } from '../../types'

const StatCard = ({ label, value, accent }: { label: string; value: number; accent: string }) => (
  <div className='relative overflow-hidden bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-lg pl-4 pr-3 py-2.5'>
    <div className={`absolute top-0 left-0 w-[3px] h-full ${accent}`} />
    <p className='text-[9px] font-mono text-[var(--adm-muted)] uppercase tracking-widest truncate'>{label}</p>
    <p className='text-lg leading-tight font-display font-semibold text-[var(--adm-heading)]'>{value}</p>
  </div>
)

const ManageProducts = ({ handleAlert }: { handleAlert: (alert: AlertData) => void }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedProduct(null)
  }

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = async (product: Product) => {
    try {
      const id = product._id || product.id
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, { withCredentials: true })
      setProducts(prev => prev.filter(p => (p._id || p.id) !== id))
      handleAlert({ type: 'success', title: 'Product deleted', description: 'Your product has been deleted successfully' })
    } catch (error: any) {
      console.log('Product delete error:', error)
      handleAlert({ type : 'danger', title: 'Delete failed', description: error.response?.data?.message || 'Failed to delete product' })
    }
  }

  const handleUpdateProduct = async (updatedFormData: FormData) => {
    if (!selectedProduct) return
    const id = selectedProduct._id || selectedProduct.id
    try {
      const res = await axios.put<Product>(
        `${import.meta.env.VITE_API_URL}/products/${id}`,
        updatedFormData,
        { withCredentials: true }
      )
      const updatedProduct = res.data && res.data._id ? res.data : { ...selectedProduct }
      setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? updatedProduct : p))
      closeEditModal()
      handleAlert({ type: 'success', title: 'Product updated', description: 'Your changes have been saved successfully' })
    } catch (error) {
      console.log('Product update error:', error)
    }
  }

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(handler)
  }, [search])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const q = debouncedSearch || ""
        const res = await axios.get<Product[]>(`${import.meta.env.VITE_API_URL}/products?search=${encodeURIComponent(q)}`)
        setProducts(res.data)
      } catch (error) {
        console.log("Product fetch error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [debouncedSearch])

  const handleAddProduct = async (productFormData: FormData) => {
    const res = await axios.post<Product>(
      `${import.meta.env.VITE_API_URL}/products/`,
      productFormData,
      { withCredentials: true }
    )
    setProducts(prev => [...prev, res.data])
    handleAlert({ type: 'success', title: 'Product added', description: 'Your product has been added successfully' })
  }

  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)
  const inStock = products.filter(p => p.stock > 0).length
  const outOfStock = products.filter(p => p.stock === 0).length

  return (
    <>
      <div className='min-h-screen bg-[var(--adm-bg)] text-[var(--adm-heading)] pb-10'>

        <div className='max-w-7xl mx-auto pt-6 pb-4 px-4 sm:px-6'>

          {/* Stat Cards */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5'>
            <StatCard label='Total Products' value={products.length} accent='bg-[var(--adm-accent)]' />
            <StatCard label='Total Stock' value={totalStock} accent='bg-[var(--adm-accent-70)]' />
            <StatCard label='In Stock' value={inStock} accent='bg-emerald-500' />
            <StatCard label='Out of Stock' value={outOfStock} accent='bg-rose-500' />
          </div>

          {/* Toolbar: search + add button */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4'>
            <div className='relative w-full sm:w-80'>
              <FiSearch className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--adm-dim)]' />
              <input
                type='text'
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder='Search by name, category or type...'
                className='w-full bg-[var(--adm-card)] border border-[var(--adm-border)] text-[var(--adm-heading)] text-sm rounded-lg pl-10 pr-4 py-2 placeholder-[var(--adm-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)] focus:border-transparent transition-all'
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className='inline-flex items-center justify-center gap-2 bg-[var(--adm-accent)] hover:bg-[var(--adm-accent-hover)] active:scale-95 text-[var(--adm-accent-contrast)] text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer'
            >
              <FiPlus className='w-4 h-4' />
              Add Product
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className='flex flex-col items-center justify-center py-32 gap-4'>
              <div className='w-12 h-12 rounded-full border-4 border-[var(--adm-border)] border-t-[var(--adm-accent)] animate-spin' />
              <p className='text-[var(--adm-muted)] text-sm font-mono tracking-wide'>Fetching products...</p>
            </div>
          ) : (
            <div className='rounded-2xl border border-[var(--adm-border)] overflow-hidden'>

              <div className='bg-[var(--adm-card)] px-5 py-3 flex items-center justify-between border-b border-[var(--adm-border)]'>
                <p className='text-xs font-mono text-[var(--adm-muted)]'>
                  Showing <span className='text-[var(--adm-heading)] font-semibold'>{products.length}</span> products
                </p>
              </div>

              <div className='overflow-x-auto'>
                <table className='min-w-full'>
                  <thead className='bg-[var(--adm-subtle)]'>
                    <tr>
                      {['Product', 'Price', 'Description', 'Category', 'Type', 'Stock', 'Actions'].map(col => (
                        <th key={col} className='px-4 py-3.5 text-left text-[10px] font-mono font-bold text-[var(--adm-muted)] uppercase tracking-widest'>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className='bg-[var(--adm-card)] divide-y divide-[var(--adm-border)]'>
                    {products.length > 0 ? (
                      products.map((product, index) => (
                        <tr key={index} className='hover:bg-[var(--adm-subtle)] transition-colors duration-150 group'>

                          <td className='px-4 py-4'>
                            <div className='flex items-center gap-3'>
                              <div className='flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden border border-[var(--adm-border)] bg-[var(--adm-card)]'>
                                <img
                                  src={getImageUrl(product.image)}
                                  alt={product.name}
                                  className='h-full w-full object-cover'
                                  onError={e => { e.currentTarget.src = 'https://placehold.co/40x40/E2E8F0/64748B?text=?' }}
                                />
                              </div>
                              <span className='text-sm font-semibold text-[var(--adm-heading)] whitespace-nowrap'>
                                {product.name}
                              </span>
                            </div>
                          </td>

                          <td className='px-4 py-4'>
                            <span className='text-sm font-mono font-bold text-[var(--adm-money)] whitespace-nowrap'>
                              Rs. {product.price}
                            </span>
                          </td>

                          <td className='px-4 py-4 max-w-[160px]'>
                            <p className='text-sm text-[var(--adm-muted)] truncate'>
                              {product.description}
                            </p>
                          </td>

                        <td className='px-4 py-4'>
                            <span className='inline-flex items-center gap-2 text-sm text-[var(--adm-muted)] whitespace-nowrap capitalize'>
                            <span className='w-1.5 h-1.5 rounded-full bg-[var(--adm-accent)] flex-shrink-0' />
                               {product.category?.replace(/-/g, ' ')}
                            </span>
                        </td>

                          <td className='px-4 py-4'>
                            <span className='text-sm text-[var(--adm-muted)] whitespace-nowrap'>
                              {product.type || <span className='text-[var(--adm-dim)]'>—</span>}
                            </span>
                          </td>

                          <td className='px-4 py-4'>
                            {product.stock > 0 ? (
                              <div className='flex items-center gap-2'>
                                <span className='w-1.5 h-1.5 rounded-full bg-[var(--st-emerald)] flex-shrink-0' />
                                <span className='text-sm font-medium text-[var(--st-emerald)] whitespace-nowrap'>
                                  {product.stock} units
                                </span>
                              </div>
                            ) : (
                              <div className='flex items-center gap-2'>
                                <span className='w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0' />
                                <span className='text-sm font-medium text-[var(--st-rose)] whitespace-nowrap'>Out of stock</span>
                              </div>
                            )}
                          </td>

                          <td className='px-4 py-4'>
                            <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150'>
                              <button
                                onClick={() => handleEditClick(product)}
                                className='p-1.5 rounded-lg bg-[var(--adm-chip)] hover:bg-[var(--adm-accent)] text-[var(--adm-muted)] hover:text-[var(--adm-accent-contrast)] transition-all duration-150 cursor-pointer'
                                title='Edit'
                              >
                                <FiEdit2 className='w-3.5 h-3.5' />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(product)}
                                className='p-1.5 rounded-lg bg-[var(--adm-chip)] hover:bg-[var(--st-rose)] text-[var(--adm-muted)] hover:text-[var(--adm-accent-contrast)] transition-all duration-150 cursor-pointer'
                                title='Delete'
                              >
                                <FiTrash2 className='w-3.5 h-3.5' />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className='px-5 py-20 text-center'>
                          <div className='flex flex-col items-center gap-3'>
                            <div className='w-14 h-14 rounded-xl bg-[var(--adm-card)] border border-[var(--adm-border)] flex items-center justify-center'>
                              <FiPackage className='w-6 h-6 text-[var(--adm-dim)]' />
                            </div>
                            <p className='text-[var(--adm-muted)] text-sm'>
                              {search ? `No results for "${search}"` : 'No products yet'}
                            </p>
                            {!search && (
                              <button
                                onClick={() => setIsModalOpen(true)}
                                className='text-[var(--adm-accent)] text-sm hover:text-[var(--adm-accent-hover)] font-medium transition-colors cursor-pointer'
                              >
                                + Add your first product
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProduct}
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSubmit={handleUpdateProduct}
        product={selectedProduct}
      />
    </>
  )
}

export default ManageProducts