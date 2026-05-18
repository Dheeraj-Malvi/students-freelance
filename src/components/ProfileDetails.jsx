import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Briefcase, FileText, Camera, CheckCircle, ChevronDown } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { AtSign } from 'lucide-react';

const ProfileDetails = () => {
    const { user } = useOutletContext();
    const navigate = useNavigate();

    // --- STATES ---
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [skills, setSkills] = useState('');
    const [bio, setBio] = useState('');
    const [role, setRole] = useState('student'); // Default from your table
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [isExistingUser, setIsExistingUser] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id || isEditing) return;

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setFullName(data.full_name || '');
                setUsername(data.username || '');
                setRole(data.role || 'student');
                setBio(data.bio || '');
                setSkills(Array.isArray(data.skills) ? data.skills.join(', ') : '');
                setPreviewUrl(data.avatar_url);
                setIsExistingUser(true);
                setIsEditing(false); // if profile exists, start in view mode
            } else {
                setIsEditing(true); // otherwise, start in edit mode for new users
            }
        };
        fetchProfile();
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
        if (!isEditing) return; // Prevent image change in view mode
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
            setLoading(false);
            return;
        }
        try {
            let avatarUrl = user.user_metadata?.avatar_url || "";
            // 1. Upload to Supabase Storage (if file selected)
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('avatars') // Make sure this bucket is PUBLIC in Supabase
                    .upload(fileName, avatarFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);
                avatarUrl = publicUrl;
            }
            // 2. Database 'profiles' table update
            const updates = {
                id: user.id,
                full_name: fullName,
                bio: bio,
                role: role,
                updated_at: new Date(),
                avatar_url: avatarUrl,
                username: username,
                skills: skills.split(',').map(s => s.trim()) // Convert comma-separated skills to array
            };

            const { error: upsertError } = await supabase.from('profiles').upsert(updates);
            if (upsertError) throw upsertError;

            // 3. Auth Metadata update (Dashboard pe naam dikhane ke liye)
            await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    avatar_url: avatarUrl,
                    role: role,
                    setup_complete: true
                }
            });
            setMessage('Profile updated successfully! Redirecting to dashboard...');
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
            setIsEditing(false);
            setIsExistingUser(true);

            if (!isExistingUser) {
                setTimeout(() => navigate('/dashboard'), 2000);
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 -my-2 px-4 py-0 relative overflow-hidden">
            <div className="relative group w-full max-w-lg">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-7 rounded-[2rem] shadow-2xl">
                    {/* Avatar Selection */}
                    <div className="relative w-20 h-20 mx-auto mb-4 group/avatar">
                        <label className={`${isEditing ? 'cursor-pointer' : 'cursor-default'} block w-full h-full`}>
                            <div className={`w-full h-full bg-slate-800 rounded-3xl flex items-center justify-center border-2 border-dashed transition-all overflow-hidden ${isEditing ? 'border-emerald-500/50' : 'border-white/10'}`}>
                                {previewUrl ? (
                                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                ) : (
                                    <User className="text-slate-500" size={32} />
                                )}
                                {isEditing && (
                                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                )}
                            </div>
                            {isEditing && <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />}
                        </label>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-0 text-center">
                        {isExistingUser ? (isEditing ? "Edit Your Profile" : "Your Profile") : "Let's Set Up Your Profile"}
                    </h2>
                    <p className="text-slate-500 italic mb-6 text-center">
                        {isExistingUser ? (isEditing ? "Make changes to your profile and save." : "Review your profile details.") : "Tell us about yourself to get started!"}
                    </p>

                    {message && (
                        <div className={`mb-6 p-4 rounded-xl border text-xs font-bold text-center transition-all ${message.includes('Error')
                            ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' // Red for Error
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' // Green for Success
                            }`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleProfileUpdate} className="space-y-4 text-left">
                        {/* ROLE - Hamesha disabled agar setup ho chuka hai */}
                        <div className="space-y-1.5">
                            <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Account Role</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['student', 'client'].map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        disabled={true} // Locked as per your condition
                                        className={`py-2.5 rounded-xl border capitalize font-bold text-[11px] tracking-widest transition-all ${role === r ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-950/50 border-white/5 text-slate-600 cursor-not-allowed opacity-50'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* USERNAME - Disabled for existing users */}
                        <div className="space-y-1.5">
                            <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Username</label>
                            <div className="relative flex items-center">
                                <AtSign className="absolute left-4 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    disabled={true} // Locked as per your condition
                                    className="w-full bg-slate-950/30 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-slate-500 text-sm cursor-not-allowed"
                                    value={username}
                                />
                            </div>
                        </div>
                        {/* EDITABLE FIELDS - Depend on isEditing */}
                        <div className="space-y-1.5">
                            <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative flex items-center">
                                <User className="absolute left-4 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    className={`w-full uppercase bg-slate-950/50 border rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none transition-all ${isEditing ? 'border-emerald-500/50' : 'border-white/10 text-slate-400'}`}
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Skills</label>
                            <div className="relative flex items-center">
                                <Briefcase className="absolute left-4 w-4 h-4 text-slate-500" />
                                <input 
                                    type="text" 
                                    disabled={!isEditing}
                                    className={`w-full uppercase bg-slate-950/50 border rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none transition-all ${isEditing ? 'border-emerald-500/50' : 'border-white/10 text-slate-400'}`}
                                    value={skills} 
                                    onChange={(e) => setSkills(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Bio</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-3 w-4 h-4 text-slate-500" />
                                <textarea
                                    disabled={!isEditing}
                                    rows="2"
                                    className={`w-full uppercase bg-slate-950/50 border rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none transition-all resize-none ${isEditing ? 'border-emerald-500/50' : 'border-white/10 text-slate-400'}`}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        {/* ACTION BUTTONS */}
                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="w-full font-black py-4 rounded-2xl transition-all duration-300 mt-4 uppercase tracking-widest text-xs bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/40"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-3 mt-4">
                                {isExistingUser && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 font-black py-4 rounded-2xl uppercase tracking-widest text-xs bg-slate-800 border border-white/5 text-slate-400"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] relative group/btn overflow-hidden font-black py-4 rounded-2xl transition-all duration-300 bg-emerald-600/20 border border-emerald-500/30 border-t-emerald-400/50 text-emerald-400 hover:text-white flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                                >
                                    <span>{loading ? "SAVING..." : "SAVE CHANGES"}</span>
                                    {!loading && <ArrowRight size={16} />}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileDetails;