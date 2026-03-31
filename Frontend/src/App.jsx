import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Homepage from './components/Homepage.jsx'
import SignupPage from './components/pages/Signup.jsx'
import LoginPage from './components/pages/Login.jsx'
import Cart from './components/pages/Cart.jsx'
import Footer from './components/Footer'
import Alert from './components/Alert.jsx'
import ProtectedRoute from './components/Auth/ProtectedRoute.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

const App = () => {
  
const [alert, setAlert] = useState(null);

const handleAlert = (alertObj) => setAlert(alertObj);
const handleDismiss = () => setAlert(null);
  return (
    
    <Router>
      <Navbar />
      {alert && <Alert alert={alert} onDismiss={handleDismiss} />}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<SignupPage handleAlert={handleAlert} />}/>
        <Route path="/login" element={<LoginPage handleAlert={handleAlert} />}/>
        <Route path="/cart" element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
          
          }/>
      </Routes>
      <Footer />
    </Router>
  )
}

export default App
