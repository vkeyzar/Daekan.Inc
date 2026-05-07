import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home' // <--- Rumah lama lo yang udah dipindah
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import AdminDashboard from './pages/AdminDashboard'
import ScrollToHash from './components/ScrollToHash';

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
      </Routes>
    </Router>
  )
}
export default App