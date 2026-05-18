import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Briefcase, UserCircle, LogOut,
    Bell, Menu, ChevronLeft, ChevronRight
} from 'lucide-react';

const DashboardLayout = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const userRole = user?.user_metadata?.role;
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => { if (window.innerWidth >= 768) setIsSidebarOpen(true); };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const closeSidebarOnMobile = () => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
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
            <aside className={`fixed inset-y-0 md:left-0 z-[70] bg-slate-900 border-r border-white/10 transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'}`}>

                <div className="p-6 flex items-center justify-between">
                    <h1 className="font-black text-white tracking-tighter transition-all duration-300">
                        {isSidebarOpen ? (
                            <span className="animate-in fade-in duration-500">STUDENT GIG</span>
                        ) : (
                            <span className="text-blue-500 text-xl animate-in zoom-in duration-300">SG</span>
                        )}
                    </h1>

                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:block text-slate-500 hover:text-white transition-colors">
                        {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {/* Overview */}
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Overview"
                        to="/dashboard"
                        active={location.pathname === '/dashboard'}
                        isOpen={isSidebarOpen}
                        onClick={closeSidebarOnMobile}
                    />

                    {/* Dynamic Applications/Gigs Link */}
                    <NavItem
                        icon={<Briefcase size={20} />}
                        label={userRole === 'client' ? 'My Gigs' : 'My Applications'}
                        to={userRole === 'client' ? '/my-gigs' : '/my-applications'}
                        active={location.pathname === '/my-applications' || location.pathname === '/my-gigs'}
                        isOpen={isSidebarOpen}
                        onClick={closeSidebarOnMobile}
                    />

                    {/* Profile */}
                    <NavItem
                        icon={<UserCircle size={20} />}
                        label="Profile"
                        to="/profiledetails"
                        active={location.pathname === '/profiledetails'}
                        isOpen={isSidebarOpen}
                        onClick={closeSidebarOnMobile}
                    />
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button onClick={handleLogout} className={`flex items-center gap-4 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-bold text-[10px] uppercase tracking-widest ${!isSidebarOpen && 'justify-center'}`}>
                        <LogOut size={20} /> <span className={`${!isSidebarOpen && 'hidden'}`}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-8 shrink-0">
                    <button className="md:hidden p-2 text-slate-400" onClick={() => setIsSidebarOpen(true)}>
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-3 md:gap-6 ml-auto">
                        <Bell className="text-slate-500 hover:text-white cursor-pointer" size={20} />
                        <div className="relative pl-3 md:pl-6 border-l border-white/10">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 border border-white/10 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                            >
                                <span className="text-white font-black text-xs uppercase">
                                    {user?.user_metadata?.full_name ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : "DM"}
                                </span>
                            </button>

                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-[80]" onClick={() => setIsProfileOpen(false)}></div>
                                    <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-[90] py-2 overflow-hidden animate-in fade-in zoom-in duration-150">
                                        <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                                            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">{userRole}</p>
                                            <p className="text-white font-bold text-sm truncate">{user?.user_metadata?.full_name}</p>
                                            <p className="text-slate-500 text-[10px] truncate">{user?.email}</p>
                                        </div>
                                        <div className="p-1">
                                            <Link
                                                to="/profiledetails"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 rounded-xl transition-all"
                                            >
                                                <UserCircle size={16} /> My Profile
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-red-400/10 transition-all flex items-center gap-3 font-bold rounded-xl"
                                            >
                                                <LogOut size={16} /> Logout
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                    <Outlet context={{ user, userRole }} />
                </div>
            </main>
        </div>
    );
};

// Liquid Glass UI NavItem Component with clean React Router integration
const NavItem = ({ icon, label, active = false, isOpen, to, onClick }) => (
    <Link 
        to={to || '#'} 
        onClick={onClick}
        className={`flex items-center gap-4 px-4 py-3 w-full rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest backdrop-blur-md border border-transparent
        ${active 
            ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-[0_8px_32px_0_rgba(59,130,246,0.15)]' 
            : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
        } ${!isOpen && 'justify-center'}`}
    >
        <div className={`transition-colors duration-200 ${active ? 'text-blue-400' : 'text-slate-500'}`}>
            {icon}
        </div>
        <span className={`${!isOpen && 'hidden'}`}>{label}</span>
    </Link>
);

export default DashboardLayout;