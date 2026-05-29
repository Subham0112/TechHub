import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import AddProductModal from '../AddProductModal.jsx'
import EditProductModal from '../EditProductModal.jsx'

const StatCard = ({ label, value, accent }) => (
  <div className='relative overflow-hidden bg-slate-800/60 border border-slate-700/50 rounded-2xl px-6 py-5 backdrop-blur-sm'>
    <div className={`absolute top-0 left-0 w-1 h-full ${accent}`} />
    <p className='text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1'>{label}</p>
    <p className='text-2xl font-bold text-white'>{value}</p>
  </div>
)

const ManageProducts = ({ handleAlert }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedProduct(null)
  }

  const handleEditClick = (product) => {
    setSelectedProduct(product)
    setIsEditModalOpen(true)
  }
  const handleDeleteClick = async (product) => {
    try {
      const res = await axios.delete(`${import.meta.env.VITE_API_URL}/products/${product._id}`)
      const updatedProducts = res.data ? res.data : products.filter(p => p._id !== product._id && p.id !== product.id)
      setProducts(updatedProducts)
      handleAlert({ type: 'success', title: 'Product deleted', description: 'Your product has been deleted successfully' })
    } catch (error) {
      console.log('Product delete error:', error)
    }
  }

  const handleUpdateProduct = async (updatedData) => {
    if (!selectedProduct) return

    const id = selectedProduct._id || selectedProduct.id
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/products/${id}`, updatedData)
      const updatedProduct = res.data && res.data._id ? res.data : { ...selectedProduct, ...updatedData }
      setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? updatedProduct : p))
      closeEditModal()
      handleAlert({ type: 'success', title: 'Product updated', description: 'Your changes have been saved successfully' })
    } catch (error) {
      console.log('Product update error:', error)
    }
  }

  // Debounce the search input to avoid firing a request on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(handler)
  }, [search])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const q = debouncedSearch || ""
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/products?search=${encodeURIComponent(q)}`)
        setProducts(res.data)
      } catch (error) {
        console.log("Product fetch error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [debouncedSearch])
  const handleAddProduct = async (productData) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/products/`, productData)
    setProducts(prev => [...prev, res.data])
    handleAlert({ type: 'success', title: 'Product added', description: 'Your product has been added successfully' })
  }

  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)
  const inStock = products.filter(p => p.stock > 0).length
  const outOfStock = products.filter(p => p.stock === 0).length

  return (
    <>
      <div className='min-h-screen bg-[#0a0f1e] text-white pb-10'>

        {/* Top gradient bar */}
        <div className='h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500' />

        <div className='max-w-7xl mx-auto py-10 px-4 sm:px-6'>

          {/* ── Header ── */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10'>
            <div>
              <p className='text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1'>
                Admin Panel
              </p>
              <h1 className='text-3xl font-extrabold text-white tracking-tight'>
                Product Management
              </h1>
              <p className='text-sm text-slate-500 mt-1'>
                Manage your inventory, add new products, and track stock.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className='inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/40 self-start sm:self-auto whitespace-nowrap'
            >
              <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
              </svg>
              Add Product
            </button>
          </div>

          {/* ── Stat Cards ── */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
            <StatCard label='Total Products' value={products.length} accent='bg-indigo-500' />
            <StatCard label='Total Stock' value={totalStock} accent='bg-violet-500' />
            <StatCard label='In Stock' value={inStock} accent='bg-emerald-500' />
            <StatCard label='Out of Stock' value={outOfStock} accent='bg-rose-500' />
          </div>

          {/* ── Search Bar ── */}
          <div className='relative mb-5'>
            <svg className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z' />
            </svg>
            <input
              type='text'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search by name, category or type...'
              className='w-full sm:w-80 bg-slate-800/80 border border-slate-700 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
            />
          </div>

          {/* ── Loading ── */}
          {loading ? (
            <div className='flex flex-col items-center justify-center py-32 gap-4'>
              <div className='w-12 h-12 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin' />
              <p className='text-slate-500 text-sm tracking-wide'>Fetching products...</p>
            </div>
          ) : (
            <div className='rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl'>

              {/* Table header row */}
              <div className='bg-slate-800/80 px-5 py-3 flex items-center justify-between border-b border-slate-700/60'>
                <p className='text-xs text-slate-400'>
                  Showing <span className='text-white font-semibold'>{products.length}</span> products
                </p>
              </div>

              <div className='overflow-x-auto'>
                <table className='min-w-full'>
                  <thead className='bg-slate-800/50'>
                    <tr>
                      {['Product', 'Price', 'Description', 'Category', 'Type', 'Stock', 'Actions'].map(col => (
                        <th key={col} className='px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest'>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className='bg-[#0d1424] divide-y divide-slate-800'>
                    {products.length > 0 ? (
                      products.map((product, index) => (
                        <tr
                          key={index}
                          className='hover:bg-slate-800/40 transition-colors duration-150 group'
                        >
                          {/* Product */}
                          <td className='px-5 py-4'>
                            <div className='flex items-center gap-3'>
                              <div className='flex-shrink-0 h-10 w-10 rounded-xl overflow-hidden border border-slate-700 bg-slate-800'>
                                <img
                                  src={product.image || "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?&q=80"}
                                  alt={product.name}
                                  className='h-full w-full object-cover'
                                  onError={e => { e.target.src = 'https://placehold.co/40x40/1e293b/94a3b8?text=?' }}
                                />
                              </div>
                              <span className='text-sm font-semibold text-white whitespace-nowrap'>
                                {product.name}
                              </span>
                            </div>
                          </td>

                          {/* Price */}
                          <td className='px-5 py-4'>
                            <span className='text-sm font-bold text-emerald-400'>
                              ${product.price}
                            </span>
                          </td>

                          {/* Description */}
                          <td className='px-5 py-4 max-w-[220px]'>
                            <p className='text-sm text-slate-400 truncate'>
                              {product.description}
                            </p>
                          </td>

                          {/* Category */}
                          <td className='px-5 py-4'>
                            <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap
                              ${product.category === 'gadgets'
                                ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                                : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'}`}>
                              {product.category}
                            </span>
                          </td>

                          {/* Type */}
                          <td className='px-5 py-4'>
                            <span className='text-sm text-slate-300 whitespace-nowrap'>
                              {product.type || <span className='text-slate-600'>—</span>}
                            </span>
                          </td>

                          {/* Stock */}
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

                          {/* Actions */}
                          <td className='px-5 py-4'>
                            <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150'>
                              <button
                                onClick={() => handleEditClick(product)}
                                className='p-1.5 rounded-lg bg-slate-700 hover:bg-indigo-600 text-slate-400 hover:text-white transition-all duration-150'
                                title='Edit'
                              >
                                <svg className='w-3.5 h-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z' />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteClick(product)}
                                className='p-1.5 rounded-lg bg-slate-700 hover:bg-rose-600 text-slate-400 hover:text-white transition-all duration-150' title='Delete'>
                                <svg className='w-3.5 h-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1H9a1 1 0 00-1 1m10 0H5' />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className='px-5 py-20 text-center'>
                          <div className='flex flex-col items-center gap-3'>
                            <div className='w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center'>
                              <svg className='w-6 h-6 text-slate-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
                              </svg>
                            </div>
                            <p className='text-slate-500 text-sm'>
                              {search ? `No results for "${search}"` : 'No products yet'}
                            </p>
                            {!search && (
                              <button
                                onClick={() => setIsModalOpen(true)}
                                className='text-indigo-400 text-sm hover:text-indigo-300 font-medium transition-colors'
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
