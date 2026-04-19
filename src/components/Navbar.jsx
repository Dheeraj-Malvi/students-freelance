import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; // Path check kar lena

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Initial Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. Listen for login/logout
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
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
        StudentFreelanceHub
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          // AGAR USER LOGIN HAI
          <>
            <span className="text-slate-400 text-sm hidden sm:block">{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all text-sm font-bold"
            >
              Logout
            </button>
          </>
        ) : (
          // AGAR USER LOGOUT HAI
          <>
            <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/signup">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-all shadow-lg shadow-blue-500/20">
                Join Now
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;