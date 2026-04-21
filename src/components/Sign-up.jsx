import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setErrorMessage("This email is already registered, you can login directly!");
      } else {
        setSuccessMessage("Signup Successful! Check your email for verification link.");
        setTimeout(() => navigate('/login'), 5000);
        // navigate('/login');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      
      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-8 left-8 group flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] overflow-hidden z-20"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="relative z-10">Back to Home</span>
      </Link>

      {/* --- 2. SIGN UP CARD WRAPPER --- */}
      <div className="relative group w-full max-w-md">
        
        {/* Outer Glow Effect (Chamakti hui border) */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

        {/* Main Card Content */}
        <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
          <h2 className="text-3xl font-bold text-white text-center mb-2">Create Account</h2>
          <p className="text-slate-500 text-center mb-8">Join the Student Freelance Hub</p>
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm text-center font-bold animate-bounce">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-bold animate-pulse">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Email Address</label>
              <input
                type="email"
                className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-all"
                placeholder="example@student.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm block mb-2">Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-slate-950/50 border border-white/10 p-4 pr-12 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-all font-medium"
                  placeholder="Min 7 characters, A-Z, a-z, 0-9, and !@#$%^&*()"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 p-1 flex items-center justify-center group/eye"
                >
                  <div className="relative w-5 h-5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 absolute transition-all duration-300 ease-in-out ${showPassword ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-12'} text-emerald-400`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 absolute transition-all duration-300 ease-in-out ${!showPassword ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-12'} text-slate-500 group-hover/eye:text-slate-300`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full relative group overflow-hidden font-black py-4 rounded-xl transition-all duration-300 active:scale-95 mt-4 uppercase tracking-widest text-xs bg-emerald-600/20 backdrop-blur-md border border-emerald-500/30 border-t-emerald-400/50 text-emerald-400 hover:text-white shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:bg-emerald-600/40 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              <span className="relative z-10">{loading ? "Creating account..." : "Sign Up"}</span>
            </button>
          </form>

          <p className="text-center text-slate-500 mt-6 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-300 hover:underline font-medium">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;