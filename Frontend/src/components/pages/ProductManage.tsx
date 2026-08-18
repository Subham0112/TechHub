import React, { useEffect, useState } from 'react'
import axios from 'axios'
import AddProductModal from '../AddProductModal'
import EditProductModal from '../EditProductModal'
import { getImageUrl } from '../../utils/imageUtils'
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiPackage } from 'react-icons/fi'
import type { AlertData, Product } from '../../types'

const StatCard = ({ label, value, accent }: { label: string; value: number; accent: string }) => (
  <div className='relative overflow-hidden bg-[#121A2E] border border-[#232F49] rounded-xl px-5 py-4'>
    <div className={`absolute top-0 left-0 w-1 h-full ${accent}`} />
    <p className='text-[10px] font-mono text-[#8592AC] uppercase tracking-widest mb-1'>{label}</p>
    <p className='text-2xl font-display font-semibold text-[#EDF1F7]'>{value}</p>
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
      const res = await axios.delete(`${import.meta.env.VITE_API_URL}/products/${product._id}`, { withCredentials: true })
      const updatedProducts = res.data ? res.data as Product[] : products.filter(p => p._id !== product._id && p.id !== product.id)
      setProducts(updatedProducts)
      handleAlert({ type: 'success', title: 'Product deleted', description: 'Your product has been deleted successfully' })
    } catch (error) {
      console.log('Product delete error:', error)
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
      <div className='relative min-h-screen bg-[#0A0E1A] text-[#EDF1F7] pb-10'>

        {/* Global blueprint grid */}
        <div
          className="fixed inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#5B8DEF 1px, transparent 1px), linear-gradient(90deg, #5B8DEF 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className='relative max-w-7xl mx-auto py-10 px-4 sm:px-6'>

          {/* Header */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10'>
            <div>
              <p className='text-[10px] font-mono text-[#5B8DEF] uppercase tracking-widest mb-1.5'>
                // Admin Panel
              </p>
              <h1 className='text-2xl md:text-3xl font-display font-semibold text-[#EDF1F7]'>
                Product Management
              </h1>
              <p className='text-sm text-[#8592AC] font-body mt-1'>
                Manage your inventory, add new products, and track stock.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className='inline-flex items-center gap-2 bg-[#5B8DEF] hover:bg-[#4A7CE0] active:scale-95 text-[#0A0E1A] text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-200 self-start sm:self-auto whitespace-nowrap'
            >
              <FiPlus className='w-4 h-4' />
              Add Product
            </button>
          </div>

          {/* Stat Cards */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
            <StatCard label='Total Products' value={products.length} accent='bg-[#5B8DEF]' />
            <StatCard label='Total Stock' value={totalStock} accent='bg-violet-500' />
            <StatCard label='In Stock' value={inStock} accent='bg-emerald-500' />
            <StatCard label='Out of Stock' value={outOfStock} accent='bg-rose-500' />
          </div>

          {/* Search */}
          <div className='relative mb-5'>
            <FiSearch className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C6270]' />
            <input
              type='text'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search by name, category or type...'
              className='w-full sm:w-80 bg-[#121A2E] border border-[#232F49] text-[#EDF1F7] text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-[#5C6270] focus:outline-none focus:ring-2 focus:ring-[#5B8DEF] focus:border-transparent transition-all'
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className='flex flex-col items-center justify-center py-32 gap-4'>
              <div className='w-12 h-12 rounded-full border-4 border-[#232F49] border-t-[#5B8DEF] animate-spin' />
              <p className='text-[#8592AC] text-sm font-mono tracking-wide'>Fetching products...</p>
            </div>
          ) : (
            <div className='rounded-2xl border border-[#232F49] overflow-hidden'>

              <div className='bg-[#121A2E] px-5 py-3 flex items-center justify-between border-b border-[#232F49]'>
                <p className='text-xs font-mono text-[#8592AC]'>
                  Showing <span className='text-[#EDF1F7] font-semibold'>{products.length}</span> products
                </p>
              </div>

              <div className='overflow-x-auto'>
                <table className='min-w-full'>
                  <thead className='bg-[#121A2E]/70'>
                    <tr>
                      {['Product', 'Price', 'Description', 'Category', 'Type', 'Stock', 'Actions'].map(col => (
                        <th key={col} className='px-5 py-3.5 text-left text-[10px] font-mono font-bold text-[#5C6270] uppercase tracking-widest'>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className='bg-[#0A0E1A] divide-y divide-[#232F49]'>
                    {products.length > 0 ? (
                      products.map((product, index) => (
                        <tr key={index} className='hover:bg-[#121A2E]/50 transition-colors duration-150 group'>

                          <td className='px-5 py-4'>
                            <div className='flex items-center gap-3'>
                              <div className='flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden border border-[#232F49] bg-[#121A2E]'>
                                <img
                                  src={getImageUrl(product.image)}
                                  alt={product.name}
                                  className='h-full w-full object-cover'
                                  onError={e => { e.currentTarget.src = 'https://placehold.co/40x40/121A2E/8592AC?text=?' }}
                                />
                              </div>
                              <span className='text-sm font-semibold text-[#EDF1F7] whitespace-nowrap'>
                                {product.name}
                              </span>
                            </div>
                          </td>

                          <td className='px-5 py-4'>
                            <span className='text-sm font-mono font-bold text-[#FFB238]'>
                              Rs. {product.price}
                            </span>
                          </td>

                          <td className='px-5 py-4 max-w-[220px]'>
                            <p className='text-sm text-[#8592AC] truncate'>
                              {product.description}
                            </p>
                          </td>

                          <td className='px-5 py-4'>
                            <span className={`inline-flex items-center text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full whitespace-nowrap uppercase tracking-wide
                              ${product.category === 'gadgets'
                                ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                                : 'bg-[#5B8DEF]/15 text-[#5B8DEF] border border-[#5B8DEF]/30'}`}>
                              {product.category}
                            </span>
                          </td>

                          <td className='px-5 py-4'>
                            <span className='text-sm text-[#8592AC] whitespace-nowrap'>
                              {product.type || <span className='text-[#5C6270]'>—</span>}
                            </span>
                          </td>

                          <td className='px-5 py-4'>
                            {product.stock > 0 ? (
                              <div className='flex items-center gap-2'>
                                <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0' />
                                <span className='text-sm font-medium text-emerald-400 whitespace-nowrap'>
                                  {product.stock} units
                                </span>
                              </div>
                            ) : (
                              <div className='flex items-center gap-2'>
                                <span className='w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0' />
                                <span className='text-sm font-medium text-rose-400'>Out of stock</span>
                              </div>
                            )}
                          </td>

                          <td className='px-5 py-4'>
                            <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150'>
                              <button
                                onClick={() => handleEditClick(product)}
                                className='p-1.5 rounded-lg bg-[#182238] hover:bg-[#5B8DEF] text-[#8592AC] hover:text-[#0A0E1A] transition-all duration-150'
                                title='Edit'
                              >
                                <FiEdit2 className='w-3.5 h-3.5' />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(product)}
                                className='p-1.5 rounded-lg bg-[#182238] hover:bg-rose-600 text-[#8592AC] hover:text-white transition-all duration-150'
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
                            <div className='w-14 h-14 rounded-xl bg-[#121A2E] border border-[#232F49] flex items-center justify-center'>
                              <FiPackage className='w-6 h-6 text-[#5C6270]' />
                            </div>
                            <p className='text-[#8592AC] text-sm'>
                              {search ? `No results for "${search}"` : 'No products yet'}
                            </p>
                            {!search && (
                              <button
                                onClick={() => setIsModalOpen(true)}
                                className='text-[#5B8DEF] text-sm hover:text-[#7BA3F5] font-medium transition-colors'
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
