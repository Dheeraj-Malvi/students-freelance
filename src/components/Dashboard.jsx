import React, { useState, useCallback, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowRight, Check, X, Clock, Sparkles, Globe, Upload, FileText, Loader } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import PostJob from './PostJob';
import EmptyState from './EmptyState';
import DashboardStats from './DashboardStats';

const formatTimeAgo = (dateString) => {
    if (!dateString) return "Just now";
    const now = new Date();
    const postedDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - postedDate) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const Dashboard = () => {
    const { user, userRole } = useOutletContext();
    const navigate = useNavigate();
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [myGigs, setMyGigs] = useState([]);
    const [userSkills, setUserSkills] = useState([]);
    const [activeTab, setActiveTab] = useState("for-you");
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [loadingGigs, setLoadingGigs] = useState(true);
    const [stats, setStats] = useState({ active: 0, completed: 0, earnings: 0 });
    const [isFocused, setIsFocused] = useState(false);

    // 🟢 NEW STATES FOR RESUME MODAL & COMPILATION
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadingResume, setUploadingResume] = useState(false);

    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [toastStatus, setToastStatus] = useState("idle");

    const handleCloseToast = useCallback(() => {
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
            setToastStatus("idle");
        }, 400);
    }, []);

    const showNotification = useCallback((message, type = "success") => {
        setToast({ show: true, message, type });
        setToastStatus("showing");

        const timer = setTimeout(() => {
            handleCloseToast();
        }, 4500);

        return () => clearTimeout(timer);
    }, [handleCloseToast]);

    const fetchUserSkills = useCallback(async () => {
        if (!user || userRole !== 'student') return;
        try {
            const { data } = await supabase.from('profiles').select('skills').eq('id', user.id).single();
            if (data?.skills) setUserSkills(data.skills.map(s => s.toLowerCase()));
        } catch (err) {
            console.error("Error fetching skills:", err);
        }
    }, [user, userRole]);

    const fetchDashboardData = useCallback(async () => {
        if (!user) return;
        setLoadingGigs(true);
        try {
            if (userRole === 'client') {
                const { data, count } = await supabase
                    .from('jobs')
                    .select('*', { count: 'exact' })
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                setMyGigs(data || []);
                setStats(prev => ({ ...prev, active: count || 0 }));
            } else {
                const { data: allJobs } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
                const { data: myApps } = await supabase.from('applications').select('job_id').eq('applicant_id', user.id);
                setMyGigs(allJobs || []);
                setAppliedJobs(myApps?.map(app => app.job_id) || []);
                setStats(prev => ({ ...prev, active: myApps?.length || 0 }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingGigs(false);
        }
    }, [user, userRole]);

    useEffect(() => {
        if (userRole === 'student') {
            fetchUserSkills();
        }
        fetchDashboardData();
    }, [userRole, fetchUserSkills, fetchDashboardData]);

    // 🟢 CLICK HANDLER FROM GIG CARD (TRIPWIRE FOR MODAL)
    const handleApplyClick = (jobId) => {
        setSelectedJobId(jobId);
        setSelectedFile(null); // Reset prev state
        setIsResumeModalOpen(true);
    };

    // 🟢 CORE LOGIC: VALIDATION -> STORAGE UPLOAD -> PROFILE UPDATE -> JOB APPLICATION
    const handleResumeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            showNotification("Please select a PDF file first!", "error");
            return;
        }

        try {
            setUploadingResume(true);

            // Path formatting setup
            const fileExt = 'pdf';
            const fileName = `resume_${user.id}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload file to Supabase Storage 'resume' Bucket
            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, selectedFile, { cacheControl: '3600', upsert: true });

            if (uploadError) throw uploadError;

            // 2. Extract Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('resumes')
                .getPublicUrl(filePath);

            // 3. Update profile with latest resume reference
            const { error: profileUpdateError } = await supabase
                .from('profiles')
                .update({ resume_url: publicUrl })
                .eq('id', user.id);

            if (profileUpdateError) throw profileUpdateError;

            // 4. Submit Job Application
            const { error: appError } = await supabase
                .from('applications')
                .insert([{
                    job_id: selectedJobId,
                    applicant_id: user.id,
                    status: 'pending',
                    resume_url: publicUrl, // Store resume link with application for client access
                }]);

            if (appError) throw appError;

            // Success Execution Sequence
            showNotification("Applied Successfully!");
            setIsResumeModalOpen(false);
            fetchDashboardData();

        } catch (error) {
            console.error('Submission ledger break:', error);
            showNotification("Failed to submit application process.", "error");
        } finally {
            setUploadingResume(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Strict PDF Check
        if (file.type !== "application/pdf" && !file.name.endsWith('.pdf')) {
            showNotification("Strictly PDF format is accepted!", "error");
            setSelectedFile(null);
            return;
        }

        // Size Restriction (Max 5MB Safety Block)
        if (file.size > 5 * 1024 * 1024) {
            showNotification("File size must be under 5MB!", "error");
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
    };

    const filteredGigs = myGigs.filter(gig => {
        const matchesSearch = gig.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            gig.category?.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        if (userRole === 'client' || activeTab === 'explore') return true;

        if (activeTab === 'for-you') {
            const isApplied = appliedJobs.includes(gig.id);
            if (isApplied) return true;

            if (userSkills.length > 0) {
                if (!gig.skills || !Array.isArray(gig.skills) || gig.skills.length === 0) return false;
                const cleanGigSkills = gig.skills.map(s => s.trim().toLowerCase());
                return userSkills.some(studentSkill =>
                    cleanGigSkills.includes(studentSkill.trim())
                );
            }
            return false;
        }
        return true;
    });

    return (
        <>
            {/* --- HEADER WELCOME BLOCK --- */}
            <div className="mb-6 px-1">
                <h2 className="text-lg md:text-2xl mb-1 font-bold text-white tracking-tight">
                    <i>Welcome Back, <span className="text-blue-500">{user?.user_metadata?.full_name?.split(' ')[0]?.toUpperCase()}</span> </i>👋
                </h2>
                <span className="text-sm text-slate-500 mb-4 tracking-widest">
                    💡<i className="text-blue-300"> {userRole === 'student' ? "Turn your skills into pocket money." : "Hire top-tier student talent at half the cost"}</i>
                </span>
            </div>

            <DashboardStats stats={[
                { label: userRole === 'client' ? "Gigs Posted" : "Applications", value: stats.active },
                { label: "Completed", value: stats.completed },
                { label: "Earnings", value: `$${stats.earnings}`, color: "text-emerald-400" }
            ]} />


            {/* --- ⚡ CONTROLS & CONTROLLERS BAR --- */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest shrink-0">
                        {userRole === 'client' ? "Manage Your Gigs" : "Marketplace"}
                    </h3>

                    {userRole === 'student' && (
                        <div className="flex items-center gap-1 p-1 bg-slate-950/60 rounded-xl border border-white/5 w-fit shrink-0">
                            <button
                                type="button"
                                onClick={() => setActiveTab('for-you')}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300
                                    ${activeTab === 'for-you'
                                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-400 border border-transparent'}`}
                            >
                                <Sparkles size={11} /> For You
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('explore')}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300
                                    ${activeTab === 'explore'
                                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-400 border border-transparent'}`}
                            >
                                <Globe size={11} /> Explore All
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto justify-end">
                    <div
                        className={`relative flex items-center transition-all duration-500 ease-out h-11 rounded-2xl border backdrop-blur-md shadow-inner group w-full 
                            ${isFocused
                                ? 'lg:w-72 bg-white/10 border-blue-500/40 shadow-[0_0_25px_rgba(59,130,246,0.15)]'
                                : 'lg:w-52 bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                    >
                        <div className="absolute left-4 pointer-events-none flex items-center justify-center">
                            <Search
                                size={14}
                                className={`transition-all duration-300 ${isFocused ? 'text-blue-400 scale-110' : 'text-slate-500 group-hover:text-slate-400'}`}
                            />
                        </div>

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Search gigs..."
                            className="w-full h-full bg-transparent pl-10 pr-8 text-xs font-medium text-white placeholder-slate-500 outline-none transition-all duration-300"
                        />

                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 p-1 rounded-lg bg-white/0 hover:bg-white/10 text-slate-500 hover:text-white transition-all duration-300"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {userRole === 'client' && (
                        <button
                            type="button"
                            onClick={() => setIsPostModalOpen(true)}
                            className="relative group overflow-hidden bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/50 px-5 py-2.5 h-11 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all duration-300 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] whitespace-nowrap w-full sm:w-auto shrink-0"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300 shrink-0" />
                            Post New Gig
                        </button>
                    )}
                </div>
            </div>

            {/* --- GIGS LIST GRID FEED --- */}
            {loadingGigs ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-900/50 animate-pulse rounded-2xl border border-white/5" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredGigs.length > 0 ? (
                        filteredGigs.map(item => {
                            const isEligible = !item.skills || item.skills.length === 0 || (
                                userSkills.length > 0 && item.skills.some(skill => userSkills.includes(skill.toLowerCase().trim()))
                            );

                            return (
                                <GigCard
                                    key={item.id}
                                    item={item}
                                    userRole={userRole}
                                    isAlreadyApplied={appliedJobs.includes(item.id)}
                                    isEligible={isEligible}
                                    onApply={handleApplyClick}
                                    navigate={navigate}
                                />
                            );
                        })
                    ) : (
                        <EmptyState
                            userRole={userRole}
                            activeTab={activeTab}
                            userSkills={userSkills}
                            onPostGigClick={() => setIsPostModalOpen(true)}
                            onBrowseMarketplaceClick={() => setActiveTab('explore')}
                        />
                    )}
                </div>
            )}

            {/* 🟢 NEW UPLOAD RESUME MODAL POPUP FOR STUDENTS */}
            {isResumeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative w-full max-w-md p-6 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
                        <button
                            type="button"
                            onClick={() => !uploadingResume && setIsResumeModalOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all duration-300 hover:bg-white/10"
                        >
                            <X size={14} />
                        </button>

                        <div className="mb-4">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <FileText size={16} className="text-blue-400" /> Apply Sequence Initialization
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-1 font-medium">
                                A dynamic copy of your resume (PDF) is required by the client to authorize and transition this deal context.
                            </p>
                        </div>

                        <form onSubmit={handleResumeSubmit} className="space-y-4">
                            <label className={`group border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 text-center select-none
                                ${selectedFile
                                    ? 'border-blue-500/40 bg-blue-500/5'
                                    : 'border-white/10 bg-white/0 hover:border-white/20 hover:bg-white/5'}`}
                            >
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    disabled={uploadingResume}
                                    className="hidden"
                                />
                                {selectedFile ? (
                                    <>
                                        <FileText size={24} className="text-blue-400 animate-bounce" />
                                        <p className="text-xs font-bold text-white max-w-[240px] truncate uppercase tracking-wide">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-semibold">
                                            {((selectedFile.size) / (1024 * 1024)).toFixed(2)} MB • Ready
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={24} className="text-slate-500 group-hover:text-blue-400 transition-colors duration-300" />
                                        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                            Select PDF Resume
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium">
                                            Strictly PDF up to 5MB allocations
                                        </p>
                                    </>
                                )}
                            </label>

                            <button
                                type="submit"
                                disabled={uploadingResume || !selectedFile}
                                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all duration-300
        ${uploadingResume || !selectedFile
                                        ? 'bg-slate-800 text-slate-600 border-transparent cursor-not-allowed shadow-none'
                                        : 'bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border-blue-500/20 hover:border-blue-500 shadow-lg shadow-blue-500/5 hover:shadow-blue-600/20 active:scale-[0.98]'}`}
                            >
                                {uploadingResume ? (
                                    <>
                                        <Loader size={12} className="animate-spin text-blue-400" /> Processing Ledger...
                                    </>
                                ) : (
                                    <>
                                        Confirm & Submit Application ➔
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isPostModalOpen && (
                <PostJob
                    isOpen={isPostModalOpen}
                    onClose={() => setIsPostModalOpen(false)}
                    onJobAdded={fetchDashboardData}
                    showNotification={showNotification}
                />
            )}

            {toast.show && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out pointer-events-none
                    ${toastStatus === 'vanishing'
                        ? 'opacity-0 scale-90 translate-y-4 blur-sm'
                        : 'opacity-100 scale-100 translate-y-0'
                    }
                `}>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all duration-300 ${toast.type === 'success'
                        ? 'bg-slate-900/80 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5'
                        : 'bg-slate-900/80 border-rose-500/30 text-rose-400 shadow-rose-500/5'
                        }`}>
                        {toast.type === 'success' ?
                            <Check size={14} className="shrink-0" /> :
                            <X size={14} className="shrink-0" />}
                        <span className="text-[11px] font-black uppercase tracking-wider">{toast.message}</span>
                    </div>
                </div>
            )}
        </>
    );
};

const GigCard = ({ item, userRole, isAlreadyApplied, isEligible, onApply, navigate }) => {
    const isButtonDisabled = isAlreadyApplied || (userRole === 'student' && !isEligible);

    return (
        <div className="group relative p-5 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-500/30 transition-all duration-300">
            <div className="relative z-10 w-full md:w-auto">
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold rounded uppercase border border-blue-500/20 shadow-sm">
                    {item.category}
                </span>
                <p className="text-white font-bold text-sm uppercase mt-1.5 group-hover:text-blue-400 transition-colors duration-300 leading-snug">
                    {item.title}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[9px] text-slate-500 font-semibold tracking-wide">
                    <span className="text-emerald-400 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                        ${item.price} • Active
                    </span>
                    <span className="text-slate-700">•</span>
                    <div className="flex items-center gap-1 text-slate-400/80">
                        <Clock size={11} className="text-slate-500" />
                        <span>{formatTimeAgo(item.created_at)}</span>
                    </div>
                </div>
                {item.skills && item.skills.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/5 w-full">
                        <p className="text-[8px] font-black tracking-widest text-slate-500 uppercase mb-1.5">
                            Required Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {item.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="inline-block text-[9px] font-black bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md uppercase tracking-wide shadow-sm"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="relative z-10 w-full md:w-auto pt-3 md:pt-0 border-t border-white/5 md:border-none shrink-0">
                <button
                    disabled={isButtonDisabled}
                    onClick={() => userRole === 'student' ? onApply(item.id) : navigate(`/GigApplications/${item.id}`)}
                    className={`relative group/btn overflow-hidden text-[10px] w-full md:w-auto px-5 py-2.5 rounded-xl font-black uppercase flex items-center justify-center gap-2 transition-all duration-300 border tracking-widest
                        ${isButtonDisabled
                            ? isAlreadyApplied
                                ? 'bg-slate-800 text-slate-500 border-white/5 cursor-not-allowed'
                                : 'bg-rose-950/20 text-rose-400/60 border-rose-900/30 cursor-not-allowed shadow-none'
                            : 'bg-blue-600/10 hover:bg-white/10 text-white border-white/10 hover:border-blue-500/50 hover:text-blue-200 shadow-[0_0_20px_rgba(37,99,235,0.1)] hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]'
                        }`}
                >
                    {!isButtonDisabled && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"></div>
                    )}
                    <span className="relative z-10 flex items-center gap-2 w-full justify-center">
                        {userRole === 'student' ? (
                            isAlreadyApplied ? (
                                <>Applied <Check size={14} className="animate-in zoom-in duration-300 text-emerald-400" /></>
                            ) : !isEligible ? (
                                <>Not Eligible <X size={14} className="text-rose-400 animate-in scale-in duration-200" /></>
                            ) : (
                                <>Apply Now <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform duration-300" /></>
                            )
                        ) : (
                            <>View Applicants <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform duration-300" /></>
                        )}
                    </span>
                </button>
            </div>
        </div>
    );
};

const StatsCard = ({ title, value, color = "text-white" }) => (
    <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl backdrop-blur-md shadow-lg shadow-black/20">
        <p className="text-slate-500 text-[10px] font-black uppercase mb-2 tracking-widest">{title}</p>
        <h3 className={`text-2xl font-black ${color}`}>{value.toString().padStart(2, '0')}</h3>
    </div>
);

export default Dashboard;