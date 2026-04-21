import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/update-password',
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("If an account exists for this email, a password reset link has been sent. Please check your inbox and spam folder.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center relative">

<button 
  onClick={() => navigate('/')} 
  className="absolute top-8 left-8 group overflow-hidden px-5 py-2.5 rounded-full transition-all duration-300 active:scale-95 z-20
    /* Glass Effect Base */
    bg-white/5 backdrop-blur-md 
    /* Borders: Liquid Shine */
    border border-white/10 border-t-white/20
    /* Text Styling */
    text-slate-400 hover:text-white font-black uppercase tracking-widest text-[10px]
    /* Shadow & Glow */
    hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]
    hover:bg-white/10"
>
  {/* Liquid Glass Shine Animation (The Shimmer) */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>

  <span className="relative z-10 flex items-center gap-2">
    {/* Arrow Icon with nudge animation */}
    <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
    Back to Home
  </span>
</button>

      {/* --- 1. BACK TO HOME BUTTON (Top Left) --- */}
   
      {/* <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center text-slate-400 hover:text-white transition-all group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Home</span>
      </button> */}

      {/* --- 2. FORGOT PASSWORD CARD --- */}
      <div className="relative group w-full max-w-md">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

        <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-10 rounded-[2rem] shadow-2xl">
          {message && (
            <p className="my-4 text-center text-xs font-medium text-emerald-400 bg-emerald-500/10 py-3 rounded-xl border border-emerald-500/20">
              {message}
            </p>
          )}

          <h2 className="text-3xl font-bold text-white mb-2">Reset Password 🧊</h2>
          <p className="text-slate-400 mb-8 text-sm">Enter your registered email address.</p>

          <form onSubmit={handleReset} className="space-y-6">


            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>


            <button
              disabled={loading}
              className="w-full relative group overflow-hidden font-black py-4 rounded-xl transition-all duration-300 active:scale-95 mt-4 uppercase tracking-widest text-xs
    /* Glass Effect Base: Violet/Indigo Theme */
    bg-indigo-600/20 backdrop-blur-md 
    /* Borders: High-shine edges */
    border border-indigo-500/30 border-t-indigo-400/50
    /* Text Color: Neon Indigo */
    text-indigo-400 hover:text-white
    /* Shadow & Glow */
    shadow-[0_0_20px_rgba(79,70,229,0.1)]
    hover:shadow-[0_0_30px_rgba(79,70,229,0.3)]
    hover:bg-indigo-600/40
    disabled:opacity-50"
            >
              {/* Glass Shine Animation Layer (The Shimmer) */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>

              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "Sending..." : "Send Reset Link"}
              </span>
            </button>

          </form>


        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;