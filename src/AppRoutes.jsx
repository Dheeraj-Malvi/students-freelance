import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthProvider.jsx'

// Saare Components ke Imports
import App from './App.jsx'
import Home from './components/Home.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Sign-up.jsx'
import ForgotPassword from './components/ForgotPassword.jsx'
import UpdatePassword from './components/UpdatePassword.jsx'
import Dashboard from './components/Dashboard.jsx'
import StudentHome from './components/StudentHome.jsx'
import ClientHome from './components/ClientHome.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import MyGigs from './components/MyGigs.jsx'
import DashboardLayout from './layout/DashboardLayout.jsx'
import ProfileDetails from './components/ProfileDetails.jsx'
import MyApplications from './components/MyApplications.jsx'
import ManageGig from './components/ManageGig.jsx'
import PublicRoute from './components/PublicRoute.jsx'
import ProfileSetup from './components/ProfileSetup.jsx'

export default function AppRoutes() {
    const { user, loading } = useAuth();

    return (
        <Routes>
            <Route path="/" element={<App />}>

                {/* ❌ PUBLIC ROUTES GUARD */}
                <Route element={<PublicRoute user={user} loading={loading} />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="signup" element={<Signup />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="update-password" element={<UpdatePassword />} />
                </Route>

                {/* 🔓 Open Route */}
                <Route path="profile-setup" element={<ProfileSetup />} />

                {/* 🔐 PROTECTED DASHBOARD ROUTES */}
                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="my-applications" element={<MyApplications />} />
                    <Route path="profiledetails" element={<ProfileDetails />} />
                    <Route path="manage-gig" element={<ManageGig />} />
                    <Route path="my-gigs" element={<MyGigs />} />
                    <Route path="manage-gig/:jobId" element={<ManageGig />} />

                    <Route path="client-home" element={<ClientHome />} />
                    <Route path="student-home" element={<StudentHome jobs={[]} />} />
                </Route>

                {/* 404 page */}
                <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-2xl font-bold">
                        404 - Page Not Found
                    </div>
                } />

            </Route>
        </Routes>
    );
}