import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home' // <--- Rumah lama lo yang udah dipindah
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import AdminDashboard from './pages/AdminDashboard'
import ScrollToHash from './components/ScrollToHash';
import Checkout from './pages/Checkout'
import SizeChart from './pages/SizeChart'
import Products from './pages/Products'
import TermsOfService from './pages/TermsOfService';

const App = () => {
  return (
    <Router>
      <ScrollToHash />
      <Navbar />
      <Routes>
        {/* Alamat "/" sekarang manggil komponen Home lo yang tadi dipindah */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/size-chart" element={<SizeChart />} />
        <Route path="/products" element={<Products />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>
    </Router>
  )
}
export default App