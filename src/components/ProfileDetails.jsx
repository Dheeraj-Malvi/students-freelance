import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Briefcase, FileText, Camera, CheckCircle, ChevronDown } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { AtSign } from 'lucide-react';
import { useRef } from 'react';
import { Sliders } from 'lucide-react';
import { X } from 'lucide-react';

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

    // --- ✂️ NEW CROPPER MODAL STATES ---
    const [isCropModalVisible, setIsCropModalVisible] = useState(false); // ✨ Ye animation logic ke liye
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [rawImageSrc, setRawImageSrc] = useState(null);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const imageRef = useRef(null);

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
    }, [user, isEditing]);

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

    // 📸 1. Image Select handler (Popup Trigger)
    const handleImageChange = (e) => {
        if (!isEditing) return;
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setMessage("Error: Image size should be less than 2MB");
                return;
            }

            // ✨ FIX: Sahi image select hote hi purana error message saaf karo!
            setMessage('');

            const reader = new FileReader();
            reader.onload = () => {
                setRawImageSrc(reader.result);
                setScale(1);
                setOffset({ x: 0, y: 0 });
                setIsCropModalOpen(true); // Open Popup Modal
                setTimeout(() => setIsCropModalVisible(true), 10); // Delay for animation trigger
            };
            reader.readAsDataURL(file);
            e.target.value = null; // Clear input field so same file can be re-selected
        }
    };

    const smoothCloseModal = () => {
        setIsCropModalVisible(false); // Anime close karo
        setTimeout(() => {
            setIsCropModalOpen(false); // DOM se hatao transition khatam hone ke baad
        }, 300); // Transitions duration ke matching delay (300ms)
    };

    // 🖱️ 2. Drag & Position Event Handlers for Cropper
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    // ✂️ 3. Process Canvas Cropping
const handleCropSave = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = rawImageSrc;

    img.onload = () => {
        ctx.clearRect(0, 0, 300, 300);
        ctx.save();
        
        // ✨ FIX: Purana arc (circle) hata kar humne yahan Square-Rounded (Path) banaya hai
        const radius = 40; // Aap is radius ko badha-ghata sakte hain corner roundness adjust karne ke liye
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(300 - radius, 0);
        ctx.quadraticCurveTo(300, 0, 300, radius);
        ctx.lineTo(300, 300 - radius);
        ctx.quadraticCurveTo(300, 300, 300 - radius, 300);
        ctx.lineTo(radius, 300);
        ctx.quadraticCurveTo(0, 300, 0, 300 - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.clip(); // Ab canvas square-rounded clip karega, corners par black spaces nahi aayenge!

        // Image aspect ratio math
        const imgRatio = img.width / img.height;
        let drawWidth = 300;
        let drawHeight = 300;

        if (imgRatio > 1) {
            drawWidth = 300 * imgRatio;
        } else {
            drawHeight = 300 / imgRatio;
        }

        ctx.translate(150 + offset.x, 150 + offset.y);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        ctx.restore();

        // Convert canvas data to Blob for Supabase upload
        canvas.toBlob((blob) => {
            if (blob) {
                const croppedFile = new File([blob], "avatar.jpg", { type: "image/jpeg" });
                setAvatarFile(croppedFile);
                setPreviewUrl(URL.createObjectURL(croppedFile));
                smoothCloseModal();
            }
        }, 'image/jpeg', 0.9);
    };
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
                                        onClick={() => {
                                            setIsEditing(false)
                                            setMessage('');}}
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

            {/* CROPPER MODAL */}
            {isCropModalOpen && (
<div 
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out backdrop-blur-md ${isCropModalVisible ? 'opacity-100 bg-slate-950/80' : 'opacity-0 bg-slate-950/0'}`}
        onTransitionEnd={() => { if(!isCropModalVisible) smoothCloseModal(); }} // Animation sync
    >
        <div className={`relative w-full max-w-md bg-slate-900/90 border border-white/10 rounded-[2rem] p-6 shadow-2xl overflow-hidden group/modal transition-all duration-300 ease-out transform ${isCropModalVisible ? 'scale-100' : 'scale-95'}`}>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-[2rem] blur opacity-10 group-hover/modal:opacity-20 transition"></div>

            {/* Modal Header */}
            <div className="relative z-10 flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sliders size={18} className="text-blue-400" />
                    Adjust Avatar Photo
                </h3>
                <button onClick={smoothCloseModal} className="text-slate-400 hover:text-white p-1 rounded-full bg-white/5 border border-white/10 transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Cropping Drag Frame Container */}
            <div 
                className="relative w-full aspect-square bg-slate-950 border border-white/5 rounded-[2.5rem] overflow-hidden cursor-move select-none shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* 🛡️ Inner Visual SQUARE ROUNDED Crop Guideline (Not Circle) */}
                <div className="absolute inset-0 z-20 pointer-events-none border-[6px] border-slate-950/60 rounded-[2.5rem] shadow-[0_0_0_999px_rgba(2,6,23,0.7)] flex items-center justify-center">
                    {/* Ye frame profile picture ke 'rounded-xl' se match karne ke liye design hai */}
                    <div className="w-[280px] h-[280px] rounded-[2.5rem] border-2 border-dashed border-emerald-400/60 shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-transparent"></div>
                </div>

                {/* Dynamic Scalable Image Layer */}
                <div 
                    className="absolute w-full h-full flex items-center justify-center transition-transform duration-75 ease-out pointer-events-none"
                    style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`
                    }}
                >
                    <img 
                        ref={imageRef}
                        src={rawImageSrc} 
                        alt="Crop Workspace" 
                        className="max-w-full max-h-full object-contain"
                        draggable={false}
                    />
                </div>
            </div>

            {/* ... Rest of the modal: Scale Slider, Action Footer (Ye same rahega par smoothCloseModal call karna) ... */}
            <div className="relative z-10 mt-5 space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Zoom Adjustment</span>
                    <span className="text-blue-400">{Math.round(scale * 100)}%</span>
                </div>
                <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="0.05" 
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
            </div>

            {/* Modal Action Footer */}
            <div className="relative z-10 flex gap-3 mt-6">
                <button 
                    onClick={smoothCloseModal} // ✨ Smooth close
                    className="flex-1 font-black py-3 rounded-xl uppercase tracking-widest text-[10px] bg-slate-800 border border-white/5 text-slate-400 hover:bg-slate-700 transition"
                >
                    Cancel
                </button>
                <button 
                    onClick={() => { handleCropSave(); smoothCloseModal(); }} // ✨ Crop & Apply and Smooth Close
                    className="flex-[2] font-black py-3 rounded-xl uppercase tracking-widest text-[10px] bg-emerald-600/20 border border-emerald-500/30 border-t-emerald-400/50 text-emerald-400 hover:text-white hover:bg-emerald-600/40 transition"
                >
                    Crop & Apply
                </button>
            </div>
        </div>
    </div>            )}
        </div>
    );
};

export default ProfileDetails;