import React from 'react';
import { Navigate, Outlet, useOutletContext } from 'react-router-dom';

/**
 * PublicRoute Guard
 * 🛑 Logged-in users ko restrict karta hai (Jaise Landing Page, Login, Sign Up)
 * 🟢 Anonymous/Guest users ko allow karta hai
 */
const PublicRoute = ({ user, loading }) => {

    const context = useOutletContext();

  // ⏳ 1. Agar Supabase abhi session check kar raha hai, toh loader dikhao
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="relative w-12 h-12">
          {/* Glassy Spinner Loop */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  // 🛡️ 2. Agar user ALREADY logged in hai, toh use landing page par pair bhi mat rakhne do
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // 🔓 3. Agar user login nahi hai, toh use chain se landing/public page dekhne do
  return <Outlet context={context}/>;
};

export default PublicRoute;