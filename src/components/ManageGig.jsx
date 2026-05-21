import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, User, Mail, Check, X, Loader, Code } from 'lucide-react';

const ManageGig = () => {
    const params = useParams();
    const jobId = params.id || params.jobId; 
    const navigate = useNavigate();
    
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jobTitle, setJobTitle] = useState("");

    const fetchApplicants = useCallback(async () => {if (!jobId) {
            console.log("❌ DEBUG: URL se jobId hi nahi mili boss!");
            return;
        }
        
        setLoading(true);
        try {
            console.log("🚀 DEBUG 1: Fetching process shuru hua for Job ID:", jobId);

            // 1. Job Title check karo
            const { data: jobData, error: jobError } = await supabase.from('jobs').select('title').eq('id', jobId).single();
            console.log("📊 DEBUG 2: Jobs table se ye aaya ->", { jobData, jobError });
            if (jobData) setJobTitle(jobData.title);

            // 2. Applications table check karo
            console.log("📡 DEBUG 3: Applications table ko query maar rahe hain...");
            const { data: appsData, error: appsError } = await supabase
                .from('applications')
                .select('*')
                .eq('job_id', jobId);

            console.log("📊 DEBUG 4: Applications table ka raw data ->", appsData);
            if (appsError) {
                console.error("🚨 DEBUG ERROR (Applications Fetch):", appsError.message);
                throw appsError;
            }

            if (appsData && appsData.length > 0) {
                const applicantIds = appsData.map(app => app.applicant_id);
                console.log("🆔 DEBUG 5: Map kiye huye Applicant IDs:", applicantIds);

                // 3. Profiles table check karo
                console.log("📡 DEBUG 6: Profiles table ko query maar rahe hain...");
                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, full_name, skills, email, avatar_url')
                    .in('id', applicantIds);

                console.log("📊 DEBUG 7: Profiles table ka raw data ->", profilesData);
                if (profilesError) {
                    console.error("🚨 DEBUG ERROR (Profiles Fetch):", profilesError.message);
                }

                // 4. Combine process check karo
                const combinedData = appsData.map(app => {
                    const studentProfile = profilesData?.find(p => p.id === app.applicant_id);
                    return {
                        ...app,
                        profiles: studentProfile || null
                    };
                });

                console.log("🎯 DEBUG 8: Final Combined Data jo state me jaa raha hai ->", combinedData);
                setApplicants(combinedData);
            } else {
                console.log("⚠️ DEBUG: Applications array ekdum khali (empty) aaya hai DB se!");
                setApplicants([]);
            }
        } catch (err) {
            console.error("🚨 DEBUG GLOBAL CATCH ERROR:", err.message);
        } finally {
            setLoading(false);
        }}, [jobId]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    // Glassy Approve Handler
    const handleStatusUpdate = async (applicationId, newStatus) => {
        try {
            const { error } = await supabase
                .from('applications')
                .update({ status: newStatus })
                .eq('id', applicationId);

            if (error) throw error;
            alert(`Deal ${newStatus === 'accepted' ? 'Approved' : 'Rejected'} Successfully!`);
            fetchApplicants(); 
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 selection:bg-blue-500/30">
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white mb-6 transition-colors duration-300">
                <ArrowLeft size={14} /> Back to Dashboard
            </button>

            {/* Header */}
            <div className="mb-8">
                <span className="text-[10px] bg-blue-500/10 text-blue-400 font-bold px-2 py-1 rounded uppercase border border-blue-500/20 tracking-wider">Applicants Portal</span>
                <h2 className="text-2xl font-black mt-2 uppercase tracking-tight">Gig: <span className="text-blue-500">{jobTitle || "Loading..."}</span></h2>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-48"><Loader className="animate-spin text-blue-500" size={32} /></div>
            ) : applicants.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/20 border border-white/5 text-center backdrop-blur-md">
                    <p className="text-slate-500 text-sm">Bhai, abhi tak kisi student ne is gig ke liye apply nahi kiya hai.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {applicants.map((app) => (
                        <div key={app.id} className="relative p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col justify-between hover:border-blue-500/30 transition-all duration-500 backdrop-blur-xl shadow-2xl group overflow-hidden">
                            
                            {/* Glassy Glow Effect */}
                            <div className="absolute -right-10 -top-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />

                            <div>
                                {/* Top Profile Layout */}
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
                                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border tracking-wider ${
                                        app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        app.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}>{app.status}</span>
                                </div>

                                {/* Email display */}
                                <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/[0.02] border border-white/5 p-2.5 rounded-xl mb-4 shadow-inner">
                                    <Mail size={14} className="text-slate-500" />
                                    <span className="truncate">{app.profiles?.email}</span>
                                </div>

                                {/* Tech Skills */}
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

                            {/* Glassy Action Buttons */}
                            {app.status === 'pending' && (
                                <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                                    <button 
                                        onClick={() => handleStatusUpdate(app.id, 'accepted')} 
                                        className="flex-1 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 text-xs font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-1.5 transition-all duration-300 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                    >
                                        <Check size={14} strokeWidth={3} /> Approve Deal
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleStatusUpdate(app.id, 'rejected')} 
                                        className="py-3 px-4 bg-white/[0.02] hover:bg-red-500/10 active:scale-95 border border-white/5 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-2xl flex items-center justify-center transition-all duration-300 backdrop-blur-md"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageGig;