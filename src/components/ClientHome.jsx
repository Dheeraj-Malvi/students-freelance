import React, { useEffect, useState } from 'react';
import { PlusCircle, Users, Zap, ShieldCheck, Briefcase, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const ClientHome = () => {
    const navigate = useNavigate();
    const [myGigs, setMyGigs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyGigs = async () => {
            try {
                // 1. Logged in user ki details lo
                const { data: { user } } = await supabase.auth.getUser();
                
                if (user) {
                    // 2. Database se sirf wahi jobs uthao jo is user ne post ki hain
                    const { data, error } = await supabase
                        .from('jobs') 
                        .select('*')
                        .eq('client_id', user.id) // Filter for only this client's posts
                        .order('created_at', { ascending: false });

                    if (!error) setMyGigs(data);
                }
            } catch (error) {
                console.error("Error fetching gigs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyGigs();
    }, []);

    return (
        <div className="space-y-12 pb-20 pt-4">
            {/* --- HERO SECTION --- */}
            <div className="text-center py-16 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest animate-bounce">
                    <Zap size={12} fill="currentColor" /> Hire the best student talent
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter uppercase italic">
                    Get it done <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-400">faster.</span>
                </h1>
                <p className="text-slate-400 max-w-xl mx-auto text-sm font-medium leading-relaxed">
                    Post your technical, creative, or administrative tasks and let talented students handle the rest. Efficient, affordable, and high-quality.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                        onClick={() => navigate('/post-job')} 
                        className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-slate-950 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                    >
                        <PlusCircle size={18} /> Post a New Gig
                    </button>
                    <button className="w-full sm:w-auto bg-slate-900 border border-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/5 transition-all">
                        How it works
                    </button>
                </div>
            </div>

            {/* --- CLIENT'S POSTED GIGS SECTION --- */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                        <Briefcase size={16} className="text-blue-500" /> Your Gigs ({myGigs.length})
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        /* Loading State */
                        [1, 2, 3].map((n) => (
                            <div key={n} className="h-64 bg-white/5 border border-white/10 rounded-[2.5rem] animate-pulse"></div>
                        ))
                    ) : myGigs.length > 0 ? (
                        /* Data State */
                        myGigs.map((gig) => (
                            <div key={gig.id} className="p-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] backdrop-blur-xl group hover:bg-white/[0.05] transition-all relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div className="flex justify-between items-start mb-6">
                                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest">
                                        {gig.category || "General"}
                                    </span>
                                    <span className="text-emerald-400 font-black italic">${gig.budget}</span>
                                </div>
                                
                                <h3 className="text-white font-black text-xl uppercase italic tracking-tighter mb-8 leading-tight h-14 overflow-hidden">
                                    {gig.title}
                                </h3>
                                
                                <div className="flex gap-2">
                                    <button onClick={() => navigate(`/manage-gig/${gig.id}`)} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                                        <Eye size={14} /> View Applicants
                                    </button>
                                    <button className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500/20 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        /* Empty State */
                        <div className="col-span-full py-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem]">
                            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">No gigs posted yet. Start by clicking 'Post a New Gig'.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- FEATURES GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
                <FeatureCard 
                    icon={<Users className="text-blue-500" />} 
                    title="Verified Students" 
                    desc="Talent from top engineering and creative colleges." 
                />
                <FeatureCard 
                    icon={<ShieldCheck className="text-emerald-500" />} 
                    title="Secure Payments" 
                    desc="Your money is safe until the task is completed." 
                />
                <FeatureCard 
                    icon={<Briefcase className="text-purple-500" />} 
                    title="Quick Turnaround" 
                    desc="Most tasks get completed within 48 hours." 
                />
            </div>

            {/* --- LOGO STRIP --- */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-b from-slate-900 to-slate-950 border border-white/5 text-center">
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Trusted by growing startups</h3>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-30 grayscale">
                    <span className="text-2xl font-black text-white italic">TECHNO</span>
                    <span className="text-2xl font-black text-white italic">CREATIVE.CO</span>
                    <span className="text-2xl font-black text-white italic">STUDIO</span>
                    <span className="text-2xl font-black text-white italic">GIG-X</span>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-8 bg-slate-900/50 border border-white/5 rounded-[2rem] hover:border-white/10 transition-all group">
        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h4 className="text-white font-bold uppercase tracking-tight mb-2 text-sm">{title}</h4>
        <p className="text-slate-500 text-[11px] leading-relaxed font-medium">{desc}</p>
    </div>
);

export default ClientHome;