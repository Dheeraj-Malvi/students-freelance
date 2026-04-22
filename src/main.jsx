import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Login from './components/Login.jsx'
import './index.css'
import Signup from './components/Sign-up.jsx'
import ForgotPassword from './components/ForgotPassword.jsx'
import UpdatePassword from './components/UpdatePassword.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path='/update-password' element={<UpdatePassword />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)