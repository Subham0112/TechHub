import React from 'react'
import axios from "axios"
import {useState, useEffect} from "react"

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('all');

  // filter products based on category
 
  useEffect(() => {
      // Fetch all products or initial data for the products page
      const fetchProducts = async () => {
        try{
          const res= await axios.get(`${import.meta.env.VITE_API_URL}/products`);
          setProducts(res.data);
          console.log(res.data);
        }catch(err){
          console.log(err);
        }
      };
      fetchProducts();
  },[])
   const filteredProducts = products.filter((product) => {
    if (category === 'all') {
      return product;
    }
    return product.category === category;
  });

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8'>
      <div className='flex items-center justify-between mb-6'>
      <h1 className='text-3xl font-bold mb-6'>All Products</h1>
        <div className='mb-6'>
         
          <select value={category} onChange={(e) => setCategory(e.target.value)} className='bg-slate-700 text-white px-3 py-1 rounded-lg'>
            <option value='' disabled >Category</option>
            <option value='all'>All</option>
            <option value='mobile-accessories'>Mobile Accessories</option>
            <option value='gadgets'>Gadgets</option>
          </select>
        </div>
          
        </div>
      <div className="grid lg:grid-cols-5 md:grid-cols-3 xs:grid-cols-2  grid-cols-1 gap-4">
        {filteredProducts.map((product) => (
        <div key={product._id} className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <div >
            <img src={product.image||"https://images.unsplash.com/photo-1579586337278-3befd40fd17a?&q=80"} alt={product.name} className="w-full max-h-[150px] object-cover" />
          </div>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-2">{product.name}</h2>
            <p className="text-gray-400">{product.description}</p>
            <p className="text-gray-400">Price: ${product.price}</p>
          </div>
        </div>
      ))}
      </div>
      
    </div>
  )
}

export default ProductsPage
