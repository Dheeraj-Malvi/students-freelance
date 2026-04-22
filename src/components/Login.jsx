import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { EyeOff } from 'lucide-react';
import { Eye } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // Alert ki jagah ye use karenge
  const [showPassword, setShowPassword] = useState(false); // Eye toggle state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(''); // Purane errors saaf karo

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      // User friendly error handling
      setErrorMessage(
        error.message === "Invalid login credentials"
          ? "Email or Password is incorrect."
          : error.message
      );
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Back Button - Clean design */}
      <Link
        to="/"
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
        {/* Subtle Shimmer for the Back Button */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>

        {/* Arrow Icon with a little nudge animation */}
        <span className="relative z-10 flex items-center gap-2">
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Home
        </span>
      </Link>

      {/* --- 2. SIGN UP CARD WRAPPER --- */}
      <div className="relative group w-full max-w-md">

        {/* Outer Glow Effect (Chamakti hui border) */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

        {/* Main Card Content */}
        <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
          <h2 className="text-3xl font-bold text-white text-center mb-2">Welcome Back</h2>
          <p className="text-slate-500 text-center mb-8">Login to your Student Gig account</p>

          {/* <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden"> */}
          {/* Subtle Liquid Glow */}
          {/* <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[80px]"></div>

        <h2 className="text-3xl font-black text-white text-center mb-2 tracking-tight">Welcome Back</h2>
        <p className="text-slate-500 text-center mb-8 font-medium italic">Login to your Student Gig account</p> */}

          {/* ERROR MESSAGE (No more annoying alerts) */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-bold animate-pulse">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-slate-400 text-xs font-black uppercase tracking-widest block mb-2 ml-1">Email Address</label>
              <input
                type="email"
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white outline-none focus:border-blue-500/50 transition-all font-medium placeholder:text-slate-700"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <label className="text-slate-400 text-xs font-black uppercase tracking-widest block mb-2 ml-1">Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-slate-950 border border-slate-800 p-4 pr-12 rounded-xl text-white outline-none focus:border-blue-500/50 transition-all font-medium placeholder:text-slate-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {/* SMOOTH EYE BUTTON */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-500 hover:text-blue-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full relative group overflow-hidden font-black py-4 rounded-xl transition-all duration-300 active:scale-95 mt-4 uppercase tracking-widest text-xs
    /* Glass Effect Base */
    bg-blue-600/20 backdrop-blur-md 
    /* Borders */
    border border-blue-500/30 border-t-blue-400/50
    /* Text Color */
    text-blue-400 hover:text-white
    /* Shadow & Glow */
    shadow-[0_0_20px_rgba(37,99,235,0.1)]
    hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]
    hover:bg-blue-600/40"
            >
              {/* Glass Shine Animation Layer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

              <span className="relative z-10">
                {loading ? "Checking..." : "Login"}
              </span>
            </button>
          </form>
          <div className="flex justify-end my-4">
            <Link to="/forgot-password"
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <p className="text-center text-slate-500 mt-8 text-sm font-medium">
            New here?{' '}
            <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 hover:underline font-black transition-colors ml-1">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;