import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Lock, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const UpdatePassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [showPassword, setShowPassword] = useState(false); // Eye toggle state
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Eye toggle state for confirm password
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            const urlParams = new URLSearchParams(window.location.hash.replace('#', '?'));
            const error = urlParams.get('error');

            if (!data.session || error) {
                setIsAuthorized(false);
                setMessage("Access denied, request a reset link first.");
                setStatus('error');
                setTimeout(() => navigate('/forgot-password'), 4000);
            }
        };
        checkSession();
    }, [navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Bhai, dono password match nahi ho rahe!");
            setStatus('error');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setMessage(`${error.message}`);
            setStatus('error');
        } else {
            setMessage('Password updated successfully! Redirecting to login...');
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
            {/* Back to Home Link */}
            <Link
                to="/"
                className="absolute top-8 left-8 group overflow-hidden px-5 py-2.5 rounded-full transition-all duration-300 active:scale-95 z-20 bg-white/5 backdrop-blur-md border border-white/10 border-t-white/20 text-slate-400 hover:text-white font-black uppercase tracking-widest text-[10px] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:bg-white/10"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <span className="relative z-10 flex items-center gap-2">
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
                    Back to Home
                </span>
            </Link>

            <div className="relative group w-full max-w-md">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
                    <h2 className="text-3xl font-bold text-white mb-2 text-center">New Password 🔒</h2>
                    <p className="text-slate-500 mb-8 text-sm text-center">Set your new strong Password.</p>

                    {message && (
                        <div className={`mb-6 p-4 rounded-xl border text-sm font-bold text-center animate-pulse ${
                            status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                            {message}
                        </div>
                    )}

                    {isAuthorized && (
                        <form onSubmit={handleUpdate} className="space-y-6 text-left">
                            {/* NEW PASSWORD FIELD */}
                            <div className="space-y-2">
                                <label className="text-slate-400 text-sm block ml-1">New Password</label>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-4 w-5 h-5 text-slate-500" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min 7 characters"
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 text-slate-500 hover:text-emerald-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* CONFIRM PASSWORD FIELD */}
                            <div className="space-y-2">
                                <label className="text-slate-400 text-sm block ml-1">Confirm Password</label>
                                <div className="relative flex items-center">
                                    <ShieldCheck className={`absolute left-4 w-5 h-5 transition-colors ${confirmPassword && password === confirmPassword ? 'text-emerald-400' : 'text-slate-500'}`} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Repeat your password"
                                        className={`w-full bg-slate-950/50 border rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none transition-all font-medium ${
                                            confirmPassword && password !== confirmPassword ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-emerald-500/50'
                                        }`}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 text-slate-500 hover:text-emerald-400 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>

                                </div>
                            </div>

                            <button
                                disabled={loading || (confirmPassword && password !== confirmPassword)}
                                className="w-full relative group/btn overflow-hidden font-black py-4 rounded-xl transition-all duration-300 active:scale-95 mt-4 uppercase tracking-widest text-xs bg-emerald-600/20 backdrop-blur-md border border-emerald-500/30 border-t-emerald-400/50 text-emerald-400 hover:text-white shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:bg-emerald-600/40 disabled:opacity-30 disabled:cursor-not-allowed"
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