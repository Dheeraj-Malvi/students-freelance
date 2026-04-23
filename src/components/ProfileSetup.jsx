import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Briefcase, FileText, Camera, CheckCircle, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

const ProfileSetup = () => {
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [role, setRole] = useState('student'); // Default from your table
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);


    useEffect(() => {
        const fetchUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata?.role) {
                setRole(user.user_metadata.role); // set role from metadata if available
            }
        };
        fetchUserRole();
    }, []);

    // 🔥 Handle Image Selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setMessage("Error: Image size should be less than 2MB");
                return;
            }
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
        return;
    }
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found!");

            let avatarUrl = user.user_metadata?.avatar_url || "";
            // 1. Upload to Supabase Storage (if file selected)
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars') // Make sure this bucket is PUBLIC in Supabase
                    .upload(filePath, avatarFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);
                
                avatarUrl = publicUrl;
            }
            // 2. Database 'profiles' table update
            const updates = {
                id: user.id,
                full_name: fullName,
                bio: bio,
                role: role,
                updated_at: new Date(),
            };

            const { error: upsertError } = await supabase.from('profiles').upsert(updates);
            if (upsertError) throw upsertError;

            // 3. Auth Metadata update (Dashboard pe naam dikhane ke liye)
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    avatar_url: avatarUrl,
                    setup_complete: true
                }
            });
            if (authError) throw authError;

            setMessage('Profile setup complete! Welcome to Dashboard.');
            setTimeout(() => navigate('/dashboard'), 2000);

        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    //     const { data: { user } } = await supabase.auth.getUser();

    //     const updates = {
    //         id: user.id,
    //         full_name: fullName,
    //         bio: bio,
    //         role: role, // 'student' or 'client'
    //         updated_at: new Date(),
    //     };

    //     const { error } = await supabase.from('profiles').upsert(updates);

    //     if (error) {
    //         setMessage(`Galti: ${error.message}`);
    //     } else {
    //         setMessage('Profile setup complete! Welcome aboard.');
    //         setTimeout(() => navigate('/dashboard'), 2000);
    //     }
    //     setLoading(false);
    // };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
            <div className="relative group w-full max-w-lg">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-7 rounded-[2rem] shadow-2xl">
                    {/* Camera/Avatar Placeholder */}
{/* 🔥 Updated Avatar Selection UI */}
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
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleImageChange} 
                            />
                        </label>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-1 text-center">Complete Your Profile ✨</h2>
                    <p className="text-slate-500 mb-6 text-center">Tell us more about yourself!</p>

                    {message && (
                        <div className={`mb-6 p-4 rounded-xl border text-xs font-bold text-center transition-all ${message.includes('Error')
                                ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' // Red for Error
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' // Green for Success
                            }`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleProfileUpdate} className="space-y-4 text-left">

                        {/* ROLE TOGGLE - Small & Sleek */}
                        {/* <div className="space-y-1.5">
                            <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">I am a...</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['student', 'client'].map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`py-2.5 rounded-xl border transition-all capitalize font-bold text-[11px] tracking-widest ${role === r
                                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                                : 'bg-slate-950/50 border-white/5 text-slate-500 hover:border-white/10'
                                            }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div> */}

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

                        {/* BIO */}
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

                        <button
                            disabled={loading}
                            className="w-full relative group/btn overflow-hidden font-black py-4 rounded-2xl transition-all duration-300 active:scale-95 mt-4 uppercase tracking-widest text-xs bg-emerald-600/20 backdrop-blur-md border border-emerald-500/30 border-t-emerald-400/50 text-emerald-400 hover:text-white shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:bg-emerald-600/40 flex items-center justify-center gap-2"
                        >
                            <span className="relative z-10 font-bold">{loading ? "SAVING..." : "START JOURNEY"}</span>
                            {!loading && <ArrowRight size={16} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />}
                        </button>
                        {/*                         
                        <button
                            disabled={loading}
                            className="w-full relative group/btn overflow-hidden font-black py-4 rounded-xl transition-all duration-300 active:scale-95 mt-4 uppercase tracking-widest text-xs bg-emerald-600/20 backdrop-blur-md border border-emerald-500/30 border-t-emerald-400/50 text-emerald-400 hover:text-white shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:bg-emerald-600/40"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
                            <span className="relative z-10 font-bold">{loading ? "Saving..." : "Start Journey"}</span>
                        </button> */}
                    </form>
                </div>

            </div>
        </div>
    );
};

export default ProfileSetup;