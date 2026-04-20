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
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-6">
      {/* Container with extra backdrop-blur and thin gloss border */}
      <nav className="max-w-7xl mx-auto bg-slate-900/40 backdrop-blur-[20px] border border-white/[0.08] px-6 py-3 flex items-center justify-between rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative group">
        
        {/* Subtle animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-emerald-500/10 pointer-events-none group-hover:opacity-100 transition-opacity opacity-50"></div>

        {/* LOGO: Added tracking-tighter and better gradient */}
        <Link to="/" className="relative z-10 text-xl md:text-2xl font-black bg-gradient-to-br from-white via-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tighter italic">
          StudentFreelanceHub
        </Link>

        <div className="relative z-10 flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              {/* User Email Badge */}
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest hidden md:block bg-white/5 px-4 py-2 rounded-full border border-white/5">
                {user.email.split('@')[0]}
              </span>

              {/* LOGOUT: Premium Liquid Glass Red */}
              <button
                onClick={handleLogout}
                className="relative group/btn px-5 py-2.5 rounded-full transition-all duration-300 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-red-500/10 backdrop-blur-md border border-red-500/20 group-hover/btn:bg-red-500/20 transition-all"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
                <span className="relative z-10 text-red-400 group-hover/btn:text-red-300 text-[10px] font-black uppercase tracking-[0.2em]">
                  Logout
                </span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest px-2">
                Login
              </Link>
              
              {/* JOIN NOW: Ultra Liquid Glass Blue */}
              <Link to="/signup" className="relative group/btn px-6 py-2.5 rounded-full transition-all duration-300 active:scale-95 overflow-hidden flex items-center justify-center">
                {/* Main Body */}
                <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-md border border-blue-400/30 group-hover/btn:bg-blue-600/30 group-hover/btn:border-blue-400/50 transition-all"></div>
                
                {/* Shimmer Wave */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
                
                {/* Outer Glow */}
                <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 bg-blue-400/10 blur-xl transition-opacity"></div>
                
                <span className="relative z-10 text-blue-400 group-hover/btn:text-white text-[10px] font-black uppercase tracking-[0.2em]">
                  Join Hub
                </span>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;