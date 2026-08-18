import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Homepage from './components/HomePage'
import SignupPage from './components/pages/Signup'
import LoginPage from './components/pages/Login'
import AdminLoginPage from './components/pages/AdminLogin'
import ScrollToTop from './components/ScrollToTop'
import Cart from './components/pages/Cart'
import Footer from './components/Footer'
import CheckoutPage from './components/pages/CheckoutPage'
import Orders from './components/pages/OrderHistory'
import ProductsPage from './components/pages/ProductsPage'
import ProductCategoryPage from './components/pages/ProductCategoryPage'
import Alert from './components/Alert'
import ProfilePage from './components/pages/ProfilePage'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import ProductManage from './components/pages/ProductManage'
import ManageOrders from './components/pages/ManageOrders'
import AdminRoute from './components/Auth/AdminRoute'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminCustomers from './components/admin/AdminCustomers'
import { Routes, Route, useLocation } from 'react-router-dom'
import TrackOrder from './components/pages/TrackOrder'
import ProductDetailPage from './components/pages/ProductDetail'
import type { Product, AlertData } from './types'

const App = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const [alert, setAlert] = useState<AlertData | null>(null);

  const handleAlert = (alertObj: AlertData) => setAlert(alertObj);
  const handleDismiss = () => setAlert(null);

  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminArea && <Navbar />}
      {alert && <Alert alert={alert} onDismiss={handleDismiss} />}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<SignupPage handleAlert={handleAlert} />} />
        <Route path="/login" element={<LoginPage handleAlert={handleAlert} />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/products/category/:category" element={<ProductCategoryPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slugId" element={<ProductDetailPage />} />
        <Route path="/cart" element={
          <ProtectedRoute>
            <Cart setProducts={setProducts} />
          </ProtectedRoute>}
        />
        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />

        <Route path="/checkout" element={
          <ProtectedRoute>
            <CheckoutPage products={products} />
          </ProtectedRoute>
        } />
        <Route path="/track-order" element={
          <ProtectedRoute>
            <TrackOrder />
          </ProtectedRoute>
        } />
        <Route path="/track-order/:orderId" element={
          <ProtectedRoute>
            <TrackOrder />
          </ProtectedRoute>
        } />

        <Route path="/admin/login" element={<AdminLoginPage handleAlert={handleAlert} />} />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductManage handleAlert={handleAlert} />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
        </Route>
      </Routes>
      {!isAdminArea && <Footer />}
    </>
  )
}

export default App
