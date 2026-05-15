import React from 'react'
import ReactDOM from 'react-dom/client'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import Home from './components/Home.jsx' // Home ko alag karo
import Login from './components/Login.jsx'
import Signup from './components/Sign-up.jsx'
import ForgotPassword from './components/ForgotPassword.jsx'
import UpdatePassword from './components/UpdatePassword.jsx'
import Dashboard from './components/Dashboard.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import './index.css'
import StudentHome from './components/StudentHome.jsx'
import ClientHome from './components/ClientHome.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ProfileDetails from './components/ProfileDetails.jsx'
import MyApplications from './components/MyApplications.jsx'
import DashboardLayout from './layout/DashboardLayout.jsx'
import ManageGig from './components/ManageGig.jsx'
import MyGigs from './components/MyGigs.jsx'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} /> {/* Base path par Home dikhega */}
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="update-password" element={<UpdatePassword />} />
            
            {/* --- Protected Dashboard Routes --- */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profiledetails" element={<ProfileDetails />} />
              <Route path="my-applications" element={<MyApplications />} />
              <Route path="manage-gig" element={<ManageGig />} />
              <Route path="my-gigs" element={<MyGigs />} />
              <Route path="/manage-gig/:jobId" element={<ManageGig />} />
              {/* Role specific homes can also go here if they need the sidebar */}
              <Route
                path="client-home"
                element={
                  <ProtectedRoute>
                    <ClientHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student-home"
                element={
                  <ProtectedRoute>
                    <StudentHome jobs={[]} /> {/* Jobs abhi empty bhej rahe hain */}
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 Page */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-2xl font-bold">
                404 - Page Not Found
              </div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)