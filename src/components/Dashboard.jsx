import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import {
    LayoutDashboard,
    Briefcase,
    UserCircle,
    Settings,
    LogOut,
    Search,
    Bell,
    ChevronLeft,
    ChevronRight,
    Menu,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ArrowRight } from 'lucide-react';
import PostJob from './PostJob';
import { Plus } from 'lucide-react';


const Dashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate()
    const [isPostModalOpen, setIsPostModalOpen] = useState(false); // Modal control
    const userRole = user?.user_metadata?.role;

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768); // Desktop par by default open rahega
    const [myGigs, setMyGigs] = useState([]);
    const [loadingGigs, setLoadingGigs] = useState(true);
    const [stats, setStats] = useState({ active: 0, completed: 0, earnings: 0 });

    // console.log(user);

    // --- FETCH LOGIC ---

    // 1. Function ko useCallback mein wrap kiya taaki ye stable rahe
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoadingGigs(true);
    const userRole = user?.user_metadata?.role;

    try {
        if (userRole === 'client') {
            // Client ko sirf uski post ki hui jobs dikhao
            const { data, count, error } = await supabase
                .from('jobs')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMyGigs(data || []);
            setStats(prev => ({ ...prev, active: count || 0 }));
        } else {
            // STUDENT: Saari available jobs dikhao (Marketplace)
            const { data, count, error } = await supabase
                .from('jobs') // <--- Yahan 'applications' ki jagah 'jobs' karo
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMyGigs(data || []);
            setStats(prev => ({ ...prev, active: count || 0 }));
            
            // Stats ke liye student ki applications count kar sakte ho alag se
            const { count: appCount } = await supabase
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .eq('applicant_id', user.id);

            setStats(prev => ({ ...prev, active: appCount || 0 }));
        }
    } catch (err) {
        console.error("Dashboard Fetch Error:", err.message);
    } finally {
        setLoadingGigs(false);
    }
}, [user]);


    const handleApply = async (jobId) => {
        if (!user) return alert("Please login first!");

        try {
            const { error } = await supabase
                .from('applications')
                .insert([
                    {
                        job_id: jobId,
                        applicant_id: user.id,
                        status: 'pending'
                    }
                ]);

            if (error) {
                // Check for duplicate application (Unique constraint error)
                if (error.code === '23505') {
                    alert("You've already applied for this gig!");
                } else {
                    throw error;
                }
            } else {
                alert("Application submitted successfully! Keep an eye on your dashboard.");
                fetchDashboardData(); // Refresh list to show updated status
            }
        } catch (err) {
            console.error("Apply Error:", err.message);
            alert("Something went wrong. Please try again.");
        }
    };

    // 2. Ab useEffect safe hai aur warning nahi dega
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]); // ✅ fetchDashboardData ab stable dependency hai
    const handleLogout = async () => {
        await signOut()
        navigate('/login'); // Logout ke baad login page par bhejo
    };


    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.trim().split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0].slice(0, 1).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 flex relative overflow-hidden">

            {/* --- MOBILE SIDEBAR OVERLAY --- */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* --- SIDEBAR (Mobile & Desktop) --- */}
            <aside className={`
                fixed inset-y-0 md:left-0 z-[70] bg-slate-900 border-r border-white/10 transition-all duration-300 ease-in-out
                md:relative md:translate-x-0
                ${isSidebarOpen ? 'w-64 translate-x-0 left-0' : 'w-64 -translate-x-full -left-10 md:w-20 md:translate-x-0 md:left-0'}
    flex flex-col
            `}>
                {/* Desktop Toggle Button (Only visible on MD+) */}
                <button
                    onClick={toggleSidebar}
                    className="hidden md:flex absolute -right-3 top-10 bg-blue-600 rounded-full p-1 text-white border border-slate-950 z-50"
                >
                    {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>

                {/* Logo Section */}
                <div className="p-6 flex items-center justify-between">
                    <h1 className={`font-black text-white tracking-tighter transition-opacity ${!isSidebarOpen && 'md:opacity-0'}`}>
                        STUDENT GIG
                    </h1>
                    {/* Mobile Close Button */}
                    <button className="md:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>
                        {/* <X size={20} /> */}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active isOpen={isSidebarOpen} />
                    <NavItem icon={<Briefcase size={20} />} label="My Gigs" isOpen={isSidebarOpen} />
                    <NavItem icon={<UserCircle size={20} />} label="Profile" isOpen={isSidebarOpen} />
                    <NavItem icon={<Settings size={20} />} label="Settings" isOpen={isSidebarOpen} />
                </nav>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 bg-slate-900 rounded-lg text-slate-400"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={20} />
                        </button>

                        <div className="relative hidden sm:block w-48 lg:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search for tasks..."
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-blue-500/50 text-xs"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        <button className="relative text-slate-400 hover:text-white p-2">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border border-slate-950"></span>
                        </button>

                        <div className="relative pl-3 md:pl-6 border-l border-white/10">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 border border-white/10 flex items-center justify-center shadow-lg overflow-hidden active:scale-95 transition-transform"
                            >
                                {user?.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white font-black text-sm">{getInitials(user?.user_metadata?.full_name)}</span>
                                )}
                            </button>

                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                                    <div className="absolute right-0 mt-3 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 z-20">
                                        <div className="mb-3 border-b border-white/5 pb-3">
                                            <p className="text-xs font-black text-white truncate uppercase">{user?.user_metadata?.full_name || "USER"}</p>
                                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">{user?.user_metadata?.role === 'client' ? 'CLIENT' : 'STUDENT'}</p>
                                        </div>


                                        <button className="flex items-center gap-2 text-[10px] text-slate-400 hover:text-white font-bold uppercase w-full py-2">
                                            <UserCircle size={14} /> My Profile
                                        </button>
                                        <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] text-red-400 hover:text-red-300 font-bold uppercase w-full py-2">
                                            <LogOut size={14} /> Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Dashboard Body */}
                <div className="p-4 md:p-8 overflow-y-auto">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                        Welcome back, <span className="text-blue-400 uppercase">{user?.user_metadata?.full_name?.split(' ')[0]}</span> ! 👋
                    </h2>

                    {/* STATS SECTION */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <StatsCard
                            title={user?.user_metadata?.role === 'client' ? "Gigs Posted" : "Active Applications"}
                            value={stats.active.toString().padStart(2, '0')}
                            change="+0 this week"
                        />
                        <StatsCard title="Completed Gigs" value={stats.completed.toString().padStart(2, '0')} />
                        <StatsCard title="Total Earnings" value={`$ ${stats.earnings}`} color="text-emerald-400" />
                    </div>

                    {/* DYNAMIC LIST SECTION */}
                    <div className="mt-10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">
                                {userRole === 'client' ? "Your Posted Gigs" : "Marketplace: Available Gigs"}
                            </h3>

                            {/* AGAR CLIENT HAI TOH 'POST GIG' BUTTON DIKHAO */}
                            {userRole === 'client' && (
                                <button
                                    onClick={() => setIsPostModalOpen(true)}
                                    className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 backdrop-blur-md border border-blue-500/30 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
                                >
                                    <Plus size={14} className="text-blue-400" /> Post a New Gig
                                </button>)}
                        </div>

                        {/* --- GIGS LIST --- */}
                        {loadingGigs ? (
                            <div className="loading-spinner">...</div>
                        ) : myGigs.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {myGigs.map((item) => (
                                    <div key={item.id} className="p-5 bg-slate-900/50 border border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center hover:border-blue-500/30 transition-all group mb-4">
                                        {/* --- Left Side: Info --- */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold rounded uppercase">
                                                    {item.category || 'General'}
                                                </span>
                                                <span className="text-emerald-400 text-[10px] font-bold">$ {item.price}</span>
                                            </div>

                                            <p className="text-white font-bold text-sm uppercase truncate max-w-[200px]">
                                                {item.title}
                                            </p>

                                            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1">
                                                {new Date(item.created_at).toLocaleDateString()} •
                                                <span className="text-blue-500 ml-1">
                                                    {userRole === 'client' ? 'Applicants tracking active' : 'Active Gig'}
                                                </span>
                                            </p>
                                        </div>

                                        {/* --- Right Side: Actions (Buttons) --- */}
                                        <div className="mt-4 sm:mt-0">
                                            {userRole === 'student' ? (
                                                // STUDENT VIEW: "Apply Now" Button
                                                <button
                                                    onClick={() => handleApply(item.id)}
                                                    className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-black uppercase flex items-center gap-2 border border-blue-500/50 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                                                >
                                                    Apply Now <ArrowRight size={14} />
                                                </button>
                                            ) : (
                                                // CLIENT VIEW: "Manage" Button
                                                <button
                                                    onClick={() => navigate(`/manage-gig/${item.id}`)}
                                                    className="text-[10px] bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl font-black uppercase flex items-center gap-2 border border-white/10 transition-all active:scale-95"
                                                >
                                                    View Applicants <ArrowRight size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}                            </div>
                        ) : (
                            <div className="empty-state">...</div>
                        )}
                    </div>

                </div>
            </main>
            {isPostModalOpen && (
                <PostJob
                    isOpen={isPostModalOpen}
                    onClose={() => setIsPostModalOpen(false)}
                    onSuccess={() => {
                        setIsPostModalOpen(false);
                        fetchDashboardData(); // Fresh data fetch karo post ke baad
                    }}
                    onJobAdded={fetchDashboardData}
                />
            )}
        </div>
    );
};

const NavItem = ({ icon, label, active = false, isOpen }) => (
    <button className={`
        flex items-center gap-4 px-4 py-3 w-full rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest
        ${active ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}
        ${!isOpen ? 'justify-center md:px-2' : ''}
    `}>
        {icon}
        <span className={`${!isOpen && 'md:hidden'}`}>{label}</span>
    </button>
);

const StatsCard = ({ title, value, change, color = "text-white" }) => (
    <div className="p-6 bg-slate-900/50 border border-white/5 rounded-[1.5rem] hover:border-white/10 transition-all">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{title}</p>
        <h3 className={`text-2xl md:text-3xl font-black ${color}`}>{value}</h3>
        {change && <p className="text-[10px] text-emerald-500 mt-2 font-bold">{change}</p>}
    </div>
);

export default Dashboard;