import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Briefcase, FileText, Camera, CheckCircle, ChevronDown, ArrowRight, AtSign } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEffect } from 'react';

const ProfileSetup = () => {
    const { user } = useOutletContext();
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState(''); 
    const [skills, setSkills] = useState('');
    const [bio, setBio] = useState('');
    const [role, setRole] = useState('student'); // Default fallback
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        // User metadata se role uthana aur lock kar dena
        if (user?.user_metadata?.role) {
            setRole(user.user_metadata.role);
        }
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">Verifying Session...</p>
                </div>
            </div>
        );
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        // 🌟 1. Nayi image aate hi sabse pehle error message saaf karo
        setMessage('');

        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB check
                setMessage("Error: Image size should be less than 2MB");
                setAvatarFile(null);
                setPreviewUrl(null);
                return;
            }

            // 🌟 2. Agar size 2MB se kam hai, toh bina kisi error ke normal set ho jayega
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (fullName.trim().length < 3) {
            setMessage("Name should be at least 3 characters long.");
            setLoading(false);
            return;
        }
        try {
            let avatarUrl = user.user_metadata?.avatar_url || "";
            
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars') 
                    .upload(filePath, avatarFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                avatarUrl = publicUrl;
            }

            const updates = {
                id: user.id,
                full_name: fullName,
                bio: bio,
                role: role, // Lock kiya hua role hi save hoga
                updated_at: new Date(),
                avatar_url: avatarUrl,
                username: username,
                skills: skills.split(',').map(s => s.trim()) 
            };

            const { error: upsertError } = await supabase.from('profiles').upsert(updates);
            if (upsertError) throw upsertError;

            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    avatar_url: avatarUrl,
                    role: role,
                    setup_complete: true
                }
            });
            if (authError) throw authError;

            setMessage('Profile setup complete! Taking you to the Dashboard.');
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
            <div className="relative group w-full max-w-lg">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-7 rounded-[2rem] shadow-2xl">
                    
                    {/* Avatar Selection */}
                    <div className="relative w-24 h-24 mx-auto mb-6 group/avatar">
                        <label className="cursor-pointer block w-full h-full">
                            <div className="w-full h-full bg-slate-800 rounded-3xl flex items-center justify-center border-2 border-dashed border-white/10 group-hover/avatar:border-emerald-500/50 transition-all overflow-hidden">
                                {previewUrl ? (
                                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                ) : (
                                    <User className="text-slate-500 group-hover/avatar:text-emerald-500 transition-colors" size={32} />
                                )}
                                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={24} />
                                </div>
                            </div>
                            <input 
                                onClick={(e) => { setMessage(''); e.target.value = null; }} 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleImageChange} />
                        </label>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-1 text-center">Complete Your Profile ✨</h2>
                    <p className="text-slate-500 mb-6 text-center">Tell us more about yourself!</p>

                    {message && (
                        <div className={`mb-6 p-4 rounded-xl border text-xs font-bold text-center transition-all ${message.includes('Error')
                            ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                            }`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleProfileUpdate} className="space-y-4 text-left">

                        {/* 🔒 LOCKED ROLE TOGGLE */}
                        <div className="space-y-1.5">
                            <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">
                                Your Registered Role
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {['student', 'client'].map((r) => {
                                    const isSelected = role === r;
                                    return (
                                        <button
                                            key={r}
                                            type="button"
                                            // 🌟 onClick hata diya taaki unclickable ho jaye, aur semantic standard bna rhe
                                            className={`py-2.5 rounded-xl border capitalize font-bold text-[11px] tracking-widest transition-all cursor-not-allowed ${isSelected
                                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] opacity-100'
                                                : 'bg-slate-950/20 border-white/5 text-slate-600 opacity-40' // Non-selected toggle ko aur zyada fade kar diya
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Username */}
                        <div className="space-y-1.5">
                            <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Username</label>
                            <div className="relative flex items-center">
                                <AtSign className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                                <input type="text" placeholder="USERNAME" className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all lowercase" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="space-y-1.5">
                            <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Skills</label>
                            <div className="relative flex items-center">
                                <Briefcase className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                                <input type="text" placeholder="SKILLS (comma-separated)" className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all uppercase" value={skills} onChange={(e) => setSkills(e.target.value)} required />
                            </div>
                        </div>

                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative flex items-center">
                                <User className="absolute left-4 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    minLength={3}
                                    className="w-full uppercase bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="space-y-1.5">
                            <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Bio / Headline</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-3 w-4 h-4 text-slate-500" />
                                <textarea
                                    placeholder="Tell us about yourself..."
                                    rows="2"
                                    className="w-full uppercase bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            disabled={loading}
                            className="w-full relative group/btn overflow-hidden font-black py-4 rounded-2xl transition-all duration-300 active:scale-95 mt-4 uppercase tracking-widest text-xs bg-emerald-600/20 backdrop-blur-md border border-emerald-500/30 border-t-emerald-400/50 text-emerald-400 hover:text-white shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:bg-emerald-600/40 flex items-center justify-center gap-2"
                        >
                            <span className="relative z-10 font-bold">{loading ? "SAVING..." : "START JOURNEY"}</span>
                            {!loading && <ArrowRight size={16} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;