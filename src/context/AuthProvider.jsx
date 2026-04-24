import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient'; 
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // 2. Hook initialize karo

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    
      // 3. Yahan redirect ka logic lagao
      // Jab user email verify karke pehli baar 'SIGNED_IN' hoga
      if (event === 'SIGNED_IN' && session) {
        // Chota sa delay taaki Supabase session load ho jaye
        setTimeout(() => {
          navigate('/profilesetup');
        }, 500);
      }
    
    });

    return () => subscription.unsubscribe();
  }, [navigate]); // 1. Dependency array mein navigate add karo
  
  const signOut = async () => {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);