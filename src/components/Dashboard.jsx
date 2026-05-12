import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import {
    LayoutDashboard, Briefcase, UserCircle, Settings, LogOut,
    Search, Bell, ChevronLeft, ChevronRight, Menu, X, Plus, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import PostJob from './PostJob';

const Dashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const userRole = user?.user_metadata?.role;

    // --- STATES ---
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [searchTerm, setSearchTerm] = useState(""); // 🔍 Search functionality ke liye

    const [myGigs, setMyGigs] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [loadingGigs, setLoadingGigs] = useState(true);
    const [stats, setStats] = useState({ active: 0, completed: 0, earnings: 0 });

    // --- 📱 SIDEBAR RESPONSIVE FIX ---
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setIsSidebarOpen(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- 🔄 FETCH LOGIC ---
    const fetchDashboardData = useCallback(async () => {
        if (!user) return;
        setLoadingGigs(true);

        try {
            if (userRole === 'client') {
                const { data, count, error } = await supabase
                    .from('jobs')
                    .select('*', { count: 'exact' })
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setMyGigs(data || []);
                setStats(prev => ({ ...prev, active: count || 0 }));
            } else {
                const { data: allJobs, error: jobsErr } = await supabase
                    .from('jobs')
                    .select('*')
                    .order('created_at', { ascending: false });

                const { data: myApps, error: appsErr } = await supabase
                    .from('applications')
                    .select('job_id')
                    .eq('applicant_id', user.id);

                if (jobsErr) throw jobsErr;
                if (appsErr) throw appsErr;

                setMyGigs(allJobs || []);
                setAppliedJobs(myApps?.map(app => app.job_id) || []);
                setStats(prev => ({ ...prev, active: myApps?.length || 0 }));
            }
        } catch (err) {
            console.error("Dashboard Fetch Error:", err.message);
        } finally {
            setLoadingGigs(false);
        }
    }, [user, userRole]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // --- 🔍 SEARCH FILTER LOGIC ---
    const filteredGigs = myGigs.filter(gig =>
        gig.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gig.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleApply = async (jobId) => {
        if (!user) return alert("Please login first!");
        try {
            const { error } = await supabase
                .from('applications')
                .insert([{ 
                    job_id: jobId, 
                    applicant_id: user.id, 
                    status: 'pending'
                }]);

            if (error) {
                if (error.code === '23505') return alert("Already applied!");
                throw error;
            }
            setAppliedJobs(prev => [...prev, jobId]); 
        
        // Stats ko bhi update kar dete hain (+1 application)
            setStats(prev => ({ ...prev, active: prev.active + 1 }));

            alert("Applied successfully! 🚀");
            fetchDashboardData();
        } catch (err) {
            console.log("Application Error:", err);
            alert("Application failed.");
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 flex relative overflow-hidden font-sans">

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 md:left-0 z-[70] bg-slate-900 border-r border-white/10 transition-all duration-300 ease-in-out md:relative md:translate-x-0 
                ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'}`}>

                <div className="p-6 flex items-center justify-between">
                    <h1 className={`font-black text-white tracking-tighter ${!isSidebarOpen && 'hidden'}`}>STUDENT GIG</h1>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:block text-slate-500 hover:text-white transition-colors">
                        {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active isOpen={isSidebarOpen} />
                    <NavItem icon={<Briefcase size={20} />} label={userRole === 'client' ? 'My Gigs' : 'My Applications'} isOpen={isSidebarOpen} />
                    <NavItem icon={<UserCircle size={20} />} label="Profile" isOpen={isSidebarOpen} />
                    <NavItem icon={<Settings size={20} />} label="Settings" isOpen={isSidebarOpen} />
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button onClick={handleLogout} className={`flex items-center gap-4 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-bold text-[10px] uppercase tracking-widest ${!isSidebarOpen && 'justify-center'}`}>
                        <LogOut size={20} /> <span className={`${!isSidebarOpen && 'hidden'}`}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-8 shrink-0">
                    <div className="flex items-center gap-4 flex-1">
                        <button className="md:hidden p-2 text-slate-400" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>

                        {/* Search Bar Bound to searchTerm */}
                        <div className="relative w-full max-w-md hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by title or category..."
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-blue-500/50 text-xs text-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        <button className="relative text-slate-400 hover:text-white p-2 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border border-slate-950"></span>
                        </button>

                        <div className="relative pl-3 md:pl-6 border-l border-white/10">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 border border-white/10 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                            >
                                <span className="text-white font-black text-xs uppercase">
                                    {user?.user_metadata?.full_name? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) 
            : "???"}
                                </span>
                            </button>

                            {/* --- YE RAHA TERA DROPDOWN JO GAYAB THA --- */}
                            {isProfileOpen && (
                                <>
                                    {/* Backdrop to close dropdown when clicking outside */}
                                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>

                                    <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden animate-in fade-in zoom-in duration-150">
                                        <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                                            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">{userRole}</p>
                                            <p className="text-white font-bold text-sm truncate">{user?.user_metadata?.full_name}</p>
                                            <p className="text-slate-500 text-[10px] truncate">{user?.email}</p>
                                        </div>


                                        <div className="h-px bg-white/5 my-1"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-red-400/10 transition-all flex items-center gap-3 font-bold"
                                        >
                                            <LogOut size={14} /> Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>                    </div>
                </header>

                {/* Dashboard Scrollable Body */}
                <div className="p-4 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-6 uppercase tracking-tight">
                        Welcome, <span className="text-blue-500">{user?.user_metadata?.full_name?.split(' ')[0]}</span> 👋
                    </h2>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                        <StatsCard title={userRole === 'client' ? "Gigs Posted" : "Applications"} value={stats.active} />
                        <StatsCard title="Completed" value={stats.completed} />
                        <StatsCard title="Earnings" value={`$${stats.earnings}`} color="text-emerald-400" />
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">
                            {userRole === 'client' ? "Manage Your Gigs" : "Marketplace: Available Gigs"}
                        </h3>
                        {userRole === 'client' && (
                            <button onClick={() => setIsPostModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all shadow-lg active:scale-95">
                                <Plus size={14} /> Post New Gig
                            </button>
                        )}
                    </div>

                    {/* --- GIGS LIST SECTION --- */}
                    {loadingGigs ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-28 bg-slate-900/50 animate-pulse rounded-2xl border border-white/5" />
                            ))}
                        </div>
                    ) : filteredGigs.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-10">
                            {filteredGigs.map((item) => (
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
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                            <Search className="mx-auto text-slate-700 mb-4" size={40} />
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                                {searchTerm ? `No results for "${searchTerm}"` : "No gigs found"}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            {isPostModalOpen && (
                <PostJob
                    isOpen={isPostModalOpen}
                    onClose={() => setIsPostModalOpen(false)}
                    onSuccess={fetchDashboardData}
                    onJobAdded={fetchDashboardData} // 👈 Ye line add karni hai bas!
                />
            )}
        </div>
    );
};

// --- HELPER COMPONENTS ---

const GigCard = ({ item, userRole, isAlreadyApplied, onApply, navigate }) => (
    <div className="p-5 bg-slate-900/50 border border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between items-center hover:border-blue-500/30 transition-all group shadow-sm">
        <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold rounded uppercase">
                    {item.category || 'General'}
                </span>
                <span className="text-emerald-400 text-[10px] font-bold">$ {item.price}</span>
            </div>
            <p className="text-white font-bold text-sm uppercase truncate max-w-[250px]">{item.title}</p>
            <p className="text-[9px] text-slate-500 uppercase mt-1">
                {new Date(item.created_at).toLocaleDateString()} • Active
            </p>
        </div>
        <div className="mt-4 sm:mt-0 w-full sm:w-auto">
            {userRole === 'student' ? (
                <button
                    disabled={isAlreadyApplied}
                    onClick={() => onApply(item.id)}
                    className={`w-full sm:w-auto text-[10px] px-5 py-2.5 rounded-xl font-black uppercase transition-all flex items-center justify-center gap-2 
                        ${isAlreadyApplied ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-lg shadow-blue-900/20'}`}
                >
                    {isAlreadyApplied ? "Applied ✅" : <>Apply Now <ArrowRight size={14} /></>}
                </button>
            ) : (
                <button onClick={() => navigate(`/manage-gig/${item.id}`)} className="w-full sm:w-auto text-[10px] bg-white/5 text-white px-5 py-2.5 rounded-xl font-black uppercase border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    View Applicants <ArrowRight size={14} />
                </button>
            )}
        </div>
    </div>
);

const NavItem = ({ icon, label, active = false, isOpen }) => (
    <button className={`flex items-center gap-4 px-4 py-3 w-full rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest 
        ${active ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-950/50' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'} 
        ${!isOpen && 'justify-center'}`}>
        {icon} <span className={`${!isOpen && 'hidden'}`}>{label}</span>
    </button>
);

const StatsCard = ({ title, value, color = "text-white" }) => (
    <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
        <p className="text-slate-500 text-[10px] font-black uppercase mb-2 tracking-widest">{title}</p>
        <h3 className={`text-2xl font-black ${color}`}>{value.toString().padStart(2, '0')}</h3>
    </div>
);

export default Dashboard;