import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {

    // Check current session

    supabase.auth.getSession().then(({ data: { session } }) => {

      setUser(session?.user ?? null);

      setLoading(false);

    });

    // Listen for login/logout

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

      setUser(session?.user ?? null);

      setLoading(false);

      console.log("Supabase Auth Event Triggered:", event); // Debugging ke liye track karo bhai

      // 🌟 FIX 1: Agar PASSWORD_RECOVERY event mila, toh turant update-password bhejo aur yahin rok do

      if (event === 'PASSWORD_RECOVERY') {

        console.log("Password recovery mode active! Sending to update-password...");

        navigate('/update-password', { replace: true });

        return;

      }

      // 🌟 FIX 2: Normal Signed In login/signup check

// 🌟 FIX 2: Normal Signed In login/signup check
      if (event === 'SIGNED_IN' && session) {
        
        // 1. Agar user already update-password page par hai, toh block karo
        if (window.location.pathname === '/update-password') {
          return;
        }

        const currentPath = window.location.pathname;

        if (currentPath === '/' || currentPath === '/dashboard' || currentPath === '/profiledetails') {
          console.log(`User is already on ${currentPath}. Blocking auto-redirect.`);
          return; 
        }

        // 3. ✨ METADATA CHECK: Check karo profile complete hai ya nahi
        const isSetupComplete = session.user?.user_metadata?.setup_complete;

        setTimeout(() => {
          if (isSetupComplete) {
            console.log("Profile already setup! Sending to Dashboard...");
            navigate('/dashboard', { replace: true });
          } else {
            console.log("Profile setup pending! Sending to profile-setup...");
            navigate('/profile-setup', { replace: true });
          }
        }, 200);
      }
    });

    return () => subscription.unsubscribe();

  }, [navigate]);

  const signOut = async () => {

    await supabase.auth.signOut();

    navigate('/', { replace: true });

  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => useContext(AuthContext);