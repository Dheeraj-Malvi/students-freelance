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

      if (event === 'SIGNED_IN' && session) {

       

        // Ek aur backup check: Agar user already update-password page par khada hai, toh use mat cheedo

        if (window.location.pathname === '/update-password') {

          return;

        }



        const currentPath = window.location.pathname;

        if (currentPath !== '/' && currentPath !== '/login' && currentPath !== '/signup' && currentPath !== '') {

          console.log(`User is already on ${currentPath}. Blocking auto-redirect to setup page.`);

          return; // Yahin se code rok diya, redirection cancel!

        }



        // Chota sa delay taaki Supabase session background me stable ho jaye

        setTimeout(() => {

          // Agar normal login hai aur recovery nahi chal rahi, tabhi setup par bhejo

          console.log("Normal Login/Signup! Sending to profile-setup...");

          navigate('/profile-setup', { replace: true });

        }, 500);

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