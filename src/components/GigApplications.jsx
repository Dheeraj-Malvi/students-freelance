import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, User, Mail, Check, X, Loader, Code } from 'lucide-react';

const GigApplications = () => {
    const params = useParams();
    const jobId = params.id || params.jobId;

    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jobTitle, setJobTitle] = useState("");
    
    // ✨ Dynamic feedback message state
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isVisible, setIsVisible] = useState(false);

    const showNotification = useCallback((text, type) => {
    setMessage({ text, type });
    setIsVisible(true);
    const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
        setIsVisible(false);
    }, 5000);
    return () => clearTimeout(timer);
}, []);

const fetchApplicants = useCallback(async () => {
    if (!jobId) {
        console.log("❌ DEBUG: could not fetch jobid from URL !");
        return;
    }

    setLoading(true);
    try {
        console.log("🚀 DEBUG 1: Fetching process started for Job ID:", jobId);

        // 1. Job Title check karo
        const { data: jobData, error: jobError } = await supabase.from('jobs').select('title').eq('id', jobId).single();
        console.log("📊 DEBUG 2: found from jobs table ->", { jobData, jobError });
        if (jobData) setJobTitle(jobData.title);

        // 2. Applications table check karo
        console.log("📡 DEBUG 3: hitting query to applications table...");
        const { data: appsData, error: appsError } = await supabase
            .from('applications')
            .select('*')
            .eq('job_id', jobId);

        console.log("📊 DEBUG 4: Applications table raw data ->", appsData);
        if (appsError) {
            console.error("🚨 DEBUG ERROR (Applications Fetch):", appsError.message);
            throw appsError;
        }

        if (appsData && appsData.length > 0) {
            const applicantIds = appsData.map(app => app.applicant_id);
            console.log("🆔 DEBUG 5: Mapped Applicant IDs:", applicantIds);

            // 3. Profiles table check karo (Yahan humne 'resume_url' explicitly add kiya hai)
            console.log("📡 DEBUG 6: hitting query to profiles table...");
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, skills, email, avatar_url, resume_url') // 👈 humne resume_url yahan manga hai
                .in('id', applicantIds);

            console.log("📊 DEBUG 7: Profiles table's raw data directly from Supabase ->", profilesData);
            if (profilesError) {
                console.error("🚨 DEBUG ERROR (Profiles Fetch):", profilesError.message);
            }

            // 4. Combine process check karo
            const combinedData = appsData.map(app => {
                const studentProfile = profilesData?.find(p => p.id === app.applicant_id);
                
                // 🔥 Individual logic log taaki pata chale kis user ka resume pass ho raha hai aur kiska nahi
                console.log(`🔍 DEBUG PROFILE CHECK for ${studentProfile?.full_name || 'Unknown'}:`, {
                    id: studentProfile?.id,
                    has_resume_url: studentProfile ? 'resume_url' in studentProfile : false,
                    resume_url_value: studentProfile?.resume_url
                });

                return {
                    ...app,
                    profiles: studentProfile || null
                };
            });

            console.log("🎯 DEBUG 8: Final Combined Data jo state me jaa raha hai ->", combinedData);
            setApplicants(combinedData);
        } else {
            console.log("⚠️ DEBUG: Applications array empty aaya hai DB se!");
            setApplicants([]);
        }
    } catch (err) {
        console.error("🚨 DEBUG GLOBAL CATCH ERROR:", err.message);
    } finally {
        setLoading(false);
    }
}, [jobId]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    // Glassy Approve Handler
    const handleStatusUpdate = async (applicationId, newStatus) => {
        console.log(`BACKEND SYNC SHURU: Application ID: ${applicationId} ko '${newStatus}' karne ka prayas...`);
        
        // Find applicant name for personalized feedback message
        const applicantName = applicants.find(app => app.id === applicationId)?.profiles?.full_name || "Developer";

        try {
            showNotification('', ''); // Reset previous message

            // 1. Supabase ke 'applications' table mein row update hit karo
            const { data, error } = await supabase
                .from('applications')
                .update({ status: newStatus }) // 'approved' ya 'rejected' 
                .eq('id', applicationId)
                .select(); // Data return karao sync validation ke liye

            if (error) {
                console.error("❌ SUPABASE DB UPDATE ERROR:", error.message);
                throw error;
            }

            if (!data || data.length === 0) {
                console.warn("⚠️ WARNING: DB me row update nahi hui! Shyad aap is Gig ke asli owner nahi hain.");
                showNotification("🚨 Permission Denied: You are not the creator of this gig!", "error");
                return;
            }

            console.log("🔥 DATABASE SUCCESS RESPONSE:", data);

            // 2. Local State sync karo taaki screen turant update ho jaye
            setApplicants(prev =>
                prev.map(app =>
                    app.id === applicationId ? { ...app, status: newStatus } : app
                )
            );
            
            // ✨ Show dynamic Success message based on the action taken
            if (newStatus === 'approved') {
                showNotification(`🎉 Deal locked successfully with ${applicantName.toUpperCase()}!`, "success");
            } else {
                showNotification(`✕ Application from ${applicantName.toUpperCase()} has been archived.`, "info");
            }

            // Auto hide notification banner after 3 seconds
            // setTimeout(() => showNotification('', ''), 3000);

            console.log(`✅ UI STATE SYNCED: Application ${applicationId} successfully updated to ${newStatus}`);

        } catch (err) {
            console.error("🚨 DATABASE SE SYNC FAIL HO GAYA:", err.message);
            showNotification(`Backend error: ${err.message}. Check RLS configurations!`, "error");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white -mt-2 selection:bg-blue-500/30">

            {/* Header */}
            <div className="mb-4">
                <h2 className="text-2xl font-black mt-2 uppercase italic tracking-tight">Applications for Gig: <span className="text-blue-500">{jobTitle || "Loading..."}</span></h2>
            </div>

            {/* ✨ Centered Dynamic Message Container */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] w-full max-w-md px-4 pointer-events-none">
                <div className={`p-4 rounded-2xl border text-xs font-black tracking-wider text-center pointer-events-auto shadow-2xl backdrop-blur-xl transition-all duration-500 ease-in-out transform ${isVisible && message.text
                        ? 'opacity-100 translate-y-0 scale-100 visible'
                        : 'opacity-0 translate-y-4 scale-95 invisible' // 👈 Ab transition 100% force hoga
                    } ${message.type === 'error'
                        ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.15)]'
                        : message.type === 'info'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                    }`}>
                    {message.text}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-48"><Loader className="animate-spin text-blue-500" size={32} /></div>
            ) : applicants.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/20 border border-white/5 text-center backdrop-blur-md">
                    <p className="text-slate-500 text-sm">No applications yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {applicants.map((app) => (
                        <div key={app.id} className="relative p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col justify-between hover:border-blue-500/30 transition-all duration-500 backdrop-blur-xl shadow-2xl group overflow-hidden">

                            {/* Glassy Glow Effect */}
                            <div className="absolute -right-10 -top-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />

                            {/* Card Content Top Block */}
                            <div>
                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex items-center gap-3">
                                        {app.profiles?.avatar_url ? (
                                            <img src={app.profiles.avatar_url} alt="Profile" className="w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-md" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-blue-400 font-bold text-lg shadow-md">
                                                {app.profiles?.full_name?.charAt(0) || "S"}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-black text-base text-white tracking-tight group-hover:text-blue-400 transition-colors duration-300">{app.profiles?.full_name}</h4>
                                            <span className="text-[10px] text-slate-500">Applied on {new Date(app.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border tracking-wider transition-all duration-300 ${app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        app.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            'bg-amber-500/10 text-amber-400 border-amber-500/20' // Pending
                                        }`}>{app.status || 'pending'}</span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/[0.02] border border-white/5 p-2.5 rounded-xl mb-4 shadow-inner">
                                    <Mail size={14} className="text-slate-500" />
                                    <span className="truncate">{app.profiles?.email}</span>
                                </div>

                                <div className="mb-4">
                                    {app.profiles?.resume_url ? (
                                        <a
                                            href={app.profiles.resume_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-2.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 text-[11px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300"
                                        >
                                            View Candidate Resume
                                        </a>
                                    ) : (
                                        <div className="w-full py-2.5 bg-white/[0.01] border border-white/5 border-dashed text-[11px] font-bold text-slate-600 uppercase tracking-wider rounded-xl text-center italic">
                                            No Resume Uploaded
                                        </div>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider">
                                        <Code size={12} /> Tech Skills
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {app.profiles?.skills?.length > 0 ? (
                                            app.profiles.skills.map((skill, index) => (
                                                <span key={index} className="text-[10px] bg-white/[0.03] text-slate-300 px-2.5 py-1 rounded-lg border border-white/5 font-medium">{skill}</span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-600 italic">No skills listed</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons Container */}
                            {app.status === 'pending' || !app.status ? (
                                <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                                    {/* APPROVE BUTTON */}
                                    <button
                                        onClick={() => handleStatusUpdate(app.id, 'approved')}
                                        className="flex-1 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 text-xs font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-1.5 transition-all duration-300 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                    >
                                        <Check size={14} strokeWidth={3} /> Approve Deal
                                    </button>

                                    {/* REJECT BUTTON */}
                                    <button
                                        onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                        className="py-3 px-4 bg-white/[0.02] hover:bg-red-500/10 active:scale-95 border border-white/5 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-2xl flex items-center justify-center transition-all duration-300 backdrop-blur-md"
                                        title="Reject Application"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-4 pt-4 border-t border-white/5 text-center">
                                    <div className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${app.status === 'approved'
                                        ? 'bg-emerald-500/[0.02] border-emerald-500/10 text-emerald-500/50'
                                        : 'bg-red-500/[0.02] border-red-500/10 text-red-500/50'
                                        }`}>
                                        {app.status === 'approved' ? "🎉 Deal locked with this dev" : "✕ Application archived"}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GigApplications;