import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // 2nd Input State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(true); // Direct access check
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      // Agar session nahi hai ya URL mein error hai
      const urlParams = new URLSearchParams(window.location.hash.replace('#', '?'));
      const error = urlParams.get('error');

      if (!data.session || error) {
        setIsAuthorized(false);
        setMessage("Access denied, request a reset link first.");
        setStatus('error');
        // 4 second baad wapas bhej do
        setTimeout(() => navigate('/forgot-password'), 4000);
      }
    };
    checkSession();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    // Check if passwords match
    if (password !== confirmPassword) {
      setMessage("Bhai, dono password match nahi ho rahe!");
      setStatus('error');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(`Galti: ${error.message}`);
      setStatus('error');
    } else {
      setMessage('Password updated successfully! Redirecting to login...');
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative">
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-8 left-8 flex items-center text-slate-400 hover:text-white transition-all group z-20"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium uppercase tracking-widest text-xs font-black">Back to Home</span>
      </button>

      <div className="relative group w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

        <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-10 rounded-[2rem] shadow-2xl text-center">
          <h2 className="text-3xl font-bold text-white mb-2">New Password 🔒</h2>
          <p className="text-slate-500 mb-8 text-sm text-center">Set your new strong Password.</p>

          {/* Alert ki jagah ye Glassy Box dikhega */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl border text-sm font-bold animate-pulse ${
              status === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {message}
            </div>
          )}

          {/* Form tabhi dikhao jab user authorized ho */}
          {isAuthorized && (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="relative text-left">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  placeholder="Enter New Password"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <ShieldCheck className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                  confirmPassword && password === confirmPassword ? 'text-emerald-400' : 'text-slate-500'
                }`} />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className={`w-full bg-slate-950/50 border rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none transition-all font-medium ${
                    confirmPassword && password !== confirmPassword 
                    ? 'border-red-500/50 focus:border-red-500' 
                    : 'border-white/10 focus:border-emerald-500/50'
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                disabled={loading}
                className="w-full relative group/btn overflow-hidden font-black py-4 rounded-xl transition-all duration-300 active:scale-95 mt-4 uppercase tracking-widest text-xs bg-emerald-600/20 backdrop-blur-md border border-emerald-500/30 border-t-emerald-400/50 text-emerald-400 hover:text-white shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:bg-emerald-600/40 disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
                <span className="relative z-10">{loading ? "Updating..." : "Update Password"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;