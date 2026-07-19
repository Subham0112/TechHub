import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Homepage from './components/HomePage.jsx'
import SignupPage from './components/pages/Signup.jsx'
import LoginPage from './components/pages/Login.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Cart from './components/pages/Cart.jsx'
import Footer from './components/Footer'
import CheckoutPage from './components/pages/CheckoutPage.jsx'
import Orders from './components/pages/OrderHistory.jsx'
import ProductsPage from './components/pages/ProductsPage.jsx'
import ProductCategoryPage from './components/pages/ProductCategoryPage.jsx'
import Alert from './components/Alert.jsx'
import ProfilePage from './components/pages/ProfilePage.jsx'
import ProtectedRoute from './components/Auth/ProtectedRoute.jsx'
import ProductManage from './components/pages/ProductManage.jsx'
import ManageOrders from './components/pages/ManageOrders.jsx'
import AdminRoute from './components/Auth/AdminRoute.jsx'
import { Routes, Route } from 'react-router-dom'
import TrackOrder from './components/pages/TrackOrder.jsx'

const App = () => {

  const [products, setProducts] = useState([
 
  ]);
  
const [alert, setAlert] = useState(null);

const handleAlert = (alertObj) => setAlert(alertObj);
const handleDismiss = () => setAlert(null);
  return (
  <>
      <Navbar />
      {alert && <Alert alert={alert} onDismiss={handleDismiss} />}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<SignupPage handleAlert={handleAlert} />}/>
        <Route path="/login" element={<LoginPage handleAlert={handleAlert} />}/>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/products/category/:category" element={<ProductCategoryPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/cart" element={
          <ProtectedRoute>
            <Cart setProducts={setProducts} />
          </ProtectedRoute> }
          />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders/>
            </ProtectedRoute>
          }/>

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

           <Route path="/manage-products" element={
            <AdminRoute>
              <ProductManage handleAlert={handleAlert} />
            </AdminRoute>
          } />

          <Route path="/manage-orders" element={
            <AdminRoute>
              <ManageOrders  />
            </AdminRoute>
          } />
           
      </Routes>
      <Footer />
      </>
  )
}

export default App
