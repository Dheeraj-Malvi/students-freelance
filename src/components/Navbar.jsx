import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav className="max-w-7xl mx-auto bg-white/[0.03] backdrop-blur-xl border border-white/10 px-6 py-3 flex items-center justify-between rounded-[2rem] shadow-2xl shadow-black/50 overflow-hidden relative">
        
        {/* Subtle background glow for navbar */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-emerald-500/5 pointer-events-none"></div>

        <Link to="/" className="relative z-10 text-xl md:text-2xl font-black bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent tracking-tighter">
          StudentFreelanceHub
        </Link>

        <div className="relative z-10 flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-xs font-bold hidden md:block bg-white/5 px-3 py-1 rounded-full border border-white/5">
                {user.email.split('@')[0]}
              </span>

              {/* --- LIQUID GLASS LOGOUT BUTTON --- */}
              <button
                onClick={handleLogout}
                className="relative group px-5 py-2.5 rounded-xl transition-all duration-300 active:scale-95"
              >
                {/* Specular Highlight (iPhone Style) */}
                <div className="absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-red-400/40 to-transparent z-20"></div>
                
                {/* Main Glass Body */}
                <div className="absolute inset-0 bg-red-500/5 backdrop-blur-md border border-red-500/20 group-hover:bg-red-500/10 group-hover:border-red-500/40 transition-all rounded-xl"></div>
                
                {/* Electric Red Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-red-500/10 blur-xl transition-opacity"></div>
                
                <span className="relative z-10 text-red-500/80 group-hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-colors">
                  Logout
                </span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-slate-300 hover:text-white px-4 py-2 transition-colors text-sm font-bold">
                Login
              </Link>
              
              {/* --- LIQUID GLASS JOIN BUTTON --- */}
              <Link to="/signup">
                <button className="relative group px-6 py-2.5 rounded-xl transition-all duration-300 active:scale-95">
                  {/* Top Specular Highlight */}
                  <div className="absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-20"></div>
                  
                  {/* Glass Body */}
                  <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-md border border-blue-400/20 group-hover:bg-blue-600/20 group-hover:border-blue-400/40 transition-all rounded-xl"></div>
                  
                  {/* Blue Glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-blue-500/20 blur-xl transition-opacity"></div>
                  
                  <span className="relative z-10 text-blue-400 group-hover:text-blue-300 text-sm font-black uppercase tracking-tight">
                    Join Now
                  </span>
                </button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;