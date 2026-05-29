import React from 'react'
import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';

const OrderHistory = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const { user } = useContext(UserContext)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, { withCredentials: true })
        const data = res.data || []
        const userOrders = data.filter(o => {
          const oid = o.userId && (o.userId._id || o.userId)
          const uid = user && (user._id || user.id)
          return uid && oid && String(oid) === String(uid)
        })
        setOrders(userOrders)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchOrders()
  }, [user])

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12'>
      <div className='max-w-4xl mx-auto px-6'>
        <h1 className='text-3xl font-extrabold mb-6'>Order History</h1>
        <div className='bg-slate-800/60 border border-slate-700 rounded-2xl p-6'>
        {loading ? (
          <div className='flex flex-col items-center justify-center py-32 gap-4'>
            <div className='w-12 h-12 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin' />
            <p className='text-slate-500 text-sm tracking-wide'>Fetching orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <p className='text-slate-500 text-sm tracking-wide'>No orders found.</p>
        ) : (
          <ul className='space-y-4'>
            {orders.map((order) => (
              <li key={order._id} className='bg-slate-700/50 border border-slate-600 rounded-xl p-4'>
                <div className='flex items-center justify-between'>
                  <p className='font-bold'>Order #{order._id}</p>
                  <p className='text-slate-500 text-sm'>Status: {order.orderStatus || order.status}</p>
                </div>
                <div className='mt-2 text-slate-300 text-sm'>
                  <p>Total: ${order.totalPrice?.toFixed?.(2) ?? order.totalPrice}</p>
                  <p className='text-slate-400 text-xs'>Placed: {new Date(order.createdAt).toLocaleString()}</p>
                  <div className='mt-2'>
                    {order.items?.map((item, idx) => (
                      <div key={idx} className='flex items-center gap-3 text-slate-300 text-sm'>
                        <span className='font-medium'>{item.productId?.name || item.name || 'Product'}</span>
                        <span className='text-slate-500'>x{item.quantity}</span>
                        <span className='text-slate-400'>${item.subtotal?.toFixed?.(2) ?? item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        </div>
        </div>
      
    </div>
  )
}

export default OrderHistory
