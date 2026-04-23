import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Login from './components/Login.jsx'
import './index.css'
import Signup from './components/Sign-up.jsx'
import ForgotPassword from './components/ForgotPassword.jsx'
import UpdatePassword from './components/UpdatePassword.jsx'
import ProfileSetup from './components/ProfileSetup.jsx'
import Dashboard from './components/Dashboard.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path='/update-password' element={<UpdatePassword />} />
          <Route path="/profilesetup" element={<ProfileSetup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-2xl font-bold">
              404 - Page Not Found
            </div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)