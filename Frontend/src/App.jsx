import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Homepage from './components/Homepage.jsx'
import SignupPage from './components/pages/Signup.jsx'
import LoginPage from './components/pages/Login.jsx'
import Cart from './components/pages/Cart.jsx'
import Footer from './components/Footer'
import Alert from './components/Alert.jsx'
import ProtectedRoute from './components/Auth/ProtectedRoute.jsx'
import ProductManage from './components/pages/ProductManage.jsx'
import AddProduct from './components/pages/AddProduct.jsx'
import AdminRoute from './components/Auth/AdminRoute.jsx'
import { Routes, Route } from 'react-router-dom'

const App = () => {
  
const [alert, setAlert] = useState(null);

const handleAlert = (alertObj) => setAlert(alertObj);
const handleDismiss = () => setAlert(null);
  return (
  <>
      <Navbar />
      {alert && <Alert alert={alert} onDismiss={handleDismiss} />}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<SignupPage handleAlert={handleAlert} />}/>
        <Route path="/login" element={<LoginPage handleAlert={handleAlert} />}/>
        <Route path="/cart" element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute> }
          />
           <Route path="/manage-products" element={
            <AdminRoute>
              <ProductManage />
            </AdminRoute>
          } />
           <Route path="/add-products" element={
            <AdminRoute>
              <AddProduct />
            </AdminRoute>
          } />
      </Routes>
      <Footer />
      </>
  )
}

export default App
