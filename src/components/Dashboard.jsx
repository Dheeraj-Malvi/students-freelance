import React, { useState, useCallback, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Search, Plus, ArrowRight, Check } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import PostJob from './PostJob';

const Dashboard = () => {
    const { user, userRole } = useOutletContext();
    const navigate = useNavigate();
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [myGigs, setMyGigs] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [loadingGigs, setLoadingGigs] = useState(true);
    const [stats, setStats] = useState({ active: 0, completed: 0, earnings: 0 });

    const fetchDashboardData = useCallback(async () => {
        if (!user) return;
        setLoadingGigs(true);
        try {
            if (userRole === 'client') {
                const { data, count } = await supabase.from('jobs').select('*', { count: 'exact' }).eq('user_id', user.id).order('created_at', { ascending: false });
                setMyGigs(data || []);
                setStats(prev => ({ ...prev, active: count || 0 }));
            } else {
                const { data: allJobs } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
                const { data: myApps } = await supabase.from('applications').select('job_id').eq('applicant_id', user.id);
                setMyGigs(allJobs || []);
                setAppliedJobs(myApps?.map(app => app.job_id) || []);
                setStats(prev => ({ ...prev, active: myApps?.length || 0 }));
            }
        } catch (err) { console.error(err); } finally { setLoadingGigs(false); }
    }, [user, userRole]);

    const fetchGigs = async () => {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMyGigs(data || []);
        } catch (err) {
            console.error("Error fetching gigs:", err.message);
        }
    };

    useEffect(() => {
        if (userRole === 'student') {
            fetchGigs();
        }
    }, [userRole]);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    const handleApply = async (jobId) => {
        const { error } = await supabase.from('applications').insert([{ job_id: jobId, applicant_id: user.id, status: 'pending' }]);
        if (!error) { alert("Applied Successfully!"); fetchDashboardData(); }
    };

    const filteredGigs = myGigs.filter(gig => gig.title?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <>
            <div className="mb-6">
                <h2 className="text-xl md:text-2xl mb-1 font-bold text-white uppercase tracking-tight">
                    Welcome Back, <span className="text-blue-500">{user?.user_metadata?.full_name?.split(' ')[0]}</span> 👋
                </h2>
                <span className="text-sm text-slate-500 mb-4 tracking-widest">
                    <i className="text-blue-300">💡 {userRole === 'student' ? "Turn your skills into pocket money." : "Hire top-tier student talent at half the cost"}</i>
                </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <StatsCard title={userRole === 'client' ? "Gigs Posted" : "Applications"} value={stats.active} />
                <StatsCard title="Completed" value={stats.completed} />
                <StatsCard title="Earnings" value={`$${stats.earnings}`} color="text-emerald-400" />
            </div>

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-white uppercase tracking-widest">{userRole === 'client' ? "Manage Your Gigs" : "Marketplace"}</h3>
                {userRole === 'client' && (
                    <button onClick={() => setIsPostModalOpen(true)} className="relative group overflow-hidden bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/50 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 transition-all duration-300 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]">
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"/> 
                       <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300"/> 
                        Post New Gig                    
                    </button>
                )}
            </div>

            <div className="relative mb-6 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search gigs..." className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 text-xs text-white outline-none focus:border-blue-500/50" />
            </div>

            {loadingGigs ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-900/50 animate-pulse rounded-2xl border border-white/5" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredGigs.map(item => (
                        <GigCard 
                            key={item.id} 
                            item={item} 
                            userRole={userRole} 
                            isAlreadyApplied={appliedJobs.includes(item.id)} 
                            onApply={handleApply} 
                            navigate={navigate} 
                        />
                    ))}
                </div>
            )}

            {isPostModalOpen && <PostJob isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} onJobAdded={fetchGigs} onSuccess={fetchDashboardData} />}
        </>
    );
};

const GigCard = ({ item, userRole, isAlreadyApplied, onApply, navigate }) => (
    <div className="p-5 bg-slate-900/50 border border-white/5 rounded-2xl flex justify-between items-center hover:border-blue-500/30 transition-all backdrop-blur-md">
        <div>
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold rounded uppercase border border-blue-500/20">{item.category}</span>
            <p className="text-white font-bold text-sm uppercase mt-1">{item.title}</p>
            <p className="text-[9px] text-slate-500 mt-1">${item.price} • Active</p>
        </div>
        <button
            disabled={isAlreadyApplied}
            onClick={() => userRole === 'student' ? onApply(item.id) : navigate(`/manage-gig/${item.id}`)}
            className={`relative overflow-hidden text-[10px] px-5 py-2.5 rounded-xl font-black uppercase flex items-center gap-2 transition-all duration-300 border 
        ${isAlreadyApplied
                    ? 'bg-slate-800 text-slate-500 border-white/5 cursor-not-allowed'
                    : 'bg-blue-600/10 hover:bg-white/10 text-white border-white/10 hover:border-blue-500/50 hover:text-blue-200 shadow-[0_0_20px_rgba(37,99,235,0.1)] hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]'
                }`}
        >
            {!isAlreadyApplied && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>
            )}
            <span className="relative z-10 flex items-center gap-2">
                {userRole === 'student' ? (isAlreadyApplied ? "Applied" : "Apply Now") : "View Applicants"}
                {isAlreadyApplied ? (
                    <Check size={14} className="animate-in zoom-in duration-300" />
                ) : (
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                )}            
            </span>
        </button>    
    </div>
);

const StatsCard = ({ title, value, color = "text-white" }) => (
    <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl backdrop-blur-md shadow-lg shadow-black/20">
        <p className="text-slate-500 text-[10px] font-black uppercase mb-2 tracking-widest">{title}</p>
        <h3 className={`text-2xl font-black ${color}`}>{value.toString().padStart(2, '0')}</h3>
    </div>
);

export default Dashboard;