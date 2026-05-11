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

const Dashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate()

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
            // Fetch Gigs posted by Client
            const { data, count, error } = await supabase
                .from('jobs')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id);

            if (error) throw error;
            setMyGigs(data || []);
            setStats(prev => ({ ...prev, active: count || 0 }));
        } else {
            // Fetch Applications by Student
            const { data, count, error } = await supabase
                .from('applications')
                .select('*, jobs(*)', { count: 'exact' })
                .eq('applicant_id', user.id);

            if (error) throw error;
            setMyGigs(data || []);
            setStats(prev => ({ ...prev, active: count || 0 }));
        }
    } catch (err) {
        console.error("Dashboard Fetch Error:", err.message);
    } finally {
        setLoadingGigs(false);
    }
}, [user]); // 🔥 Ye tabhi refresh hoga jab 'user' change hoga

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
                        <StatsCard title="Total Earnings" value={`₹${stats.earnings}`} color="text-emerald-400" />
                    </div>

                    {/* DYNAMIC LIST SECTION */}
                    <div className="mt-10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">
                                {user?.user_metadata?.role === 'client' ? "Your Posted Gigs" : "Your Recent Applications"}
                            </h3>
                        </div>

                        {loadingGigs ? (
                            <div className="flex flex-col items-center justify-center h-48 border border-white/5 rounded-[2rem] bg-slate-900/30">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">Fetching from database...</p>
                            </div>
                        ) : myGigs.length > 0 ? (
                            <div className="space-y-4">
                                {myGigs.map((item) => (
                                    <div key={item.id} className="p-5 bg-slate-900/50 border border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center hover:border-blue-500/30 transition-all">
                                        <div>
                                            <p className="text-white font-bold text-sm uppercase tracking-tight">
                                                {user?.user_metadata?.role === 'client' ? item.title : item.jobs?.title}
                                            </p>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">
                                                {new Date(item.created_at).toLocaleDateString()} • {item.status || 'Active'}
                                            </p>
                                        </div>
                                        <button className="mt-4 sm:mt-0 text-[10px] bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl font-black uppercase flex items-center gap-2 border border-white/5 transition-all">
                                            View Details <ArrowRight size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-white/5 rounded-[2rem] h-64 flex flex-col items-center justify-center text-slate-600 gap-4">
                                <Briefcase size={32} className="opacity-10" />
                                <p className="text-xs font-bold uppercase tracking-widest opacity-40 italic">Nothing found in your records</p>
                            </div>
                        )}
                    </div>

                    {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <StatsCard title="Active Applications" value="12" change="+2 from last week" />
                        <StatsCard title="Completed Gigs" value="08" />
                        <StatsCard title="Total Earnings" value="₹4,500" color="text-emerald-400" />
                    </div>

                    <div className="mt-10 border-2 border-dashed border-white/5 rounded-[2rem] h-64 flex items-center justify-center text-slate-600 italic text-sm text-center px-4">
                        Recent Activity content will come here...
                    </div> */}
                </div>
            </main>
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