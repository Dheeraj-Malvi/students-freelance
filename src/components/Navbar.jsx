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
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[94%] max-w-7xl z-50 mx-auto bg-slate-900/40 backdrop-blur-[20px] border border-white/[0.08] px-3 md:px-6 py-2.5 flex items-center justify-between rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group">
        
        {/* Logo Section */}
        <Link to="/" className="relative z-10 flex items-center gap-3 group/logo">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-full group-hover/logo:scale-110 transition-all duration-300"></div>
            <div className="relative z-10 w-6 h-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full">
                <defs>
                  <linearGradient id="planeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#34d399', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <path fill="url(#planeGradient)" d="M13.8 2.6c.4-.6 1.1-.9 1.9-.8.7.1 1.4.6 1.7 1.3l6.4 16.5c.3.8-.1 1.8-.9 2.1s-1.8.1-2.1-.7L12 11 3.2 21c-.6.7-1.7.8-2.4.2-.7-.6-.8-1.7-.2-2.4L11.8 3c.3-.6 1.1-.9 2-.4z" />
              </svg>
            </div>
          </div>
          <span className="text-sm sm:text-xl md:text-2xl font-black tracking-tighter italic whitespace-nowrap">
            <span className="text-white">Students</span>
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent ml-1.5">Gig</span>
          </span>
        </Link>

        {/* Right Side Logic */}
        <div className="relative z-10 flex items-center gap-4">
          {user ? (
            // Jab Login Ho (Sirf tabhi ye dikhega)
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest hidden md:block bg-white/5 px-4 py-2 rounded-full border border-white/5">
                {user.email.split('@')[0]}
              </span>
              <button onClick={handleLogout} className="relative px-5 py-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">
                Logout
              </button>
            </div>
          ) : (
            // Jab Login NA HO (Landing Page par ye dikhega)
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/login" className="text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest px-4 py-2">
                Login
              </Link>
              <Link to="/signup" className="relative px-6 py-2.5 rounded-full bg-blue-600/20 border border-blue-400/30 text-blue-400 hover:text-white hover:bg-blue-600/30 transition-all text-[10px] font-black uppercase tracking-widest">
                Join Now
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;