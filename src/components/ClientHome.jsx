import React from 'react';
import { PlusCircle, Users, Zap, ShieldCheck, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientHome = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-12 pb-20">
            {/* Hero Section */}
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
                        onClick={() => navigate('/post-job')} // Make sure to create this route
                        className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-slate-950 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all"
                    >
                        <PlusCircle size={18} /> Post a New Gig
                    </button>
                    <button className="w-full sm:w-auto bg-slate-900 border border-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/5 transition-all">
                        How it works
                    </button>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Quick Stats / Social Proof */}
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
    <div className="p-8 bg-slate-900/50 border border-white/5 rounded-[2rem] hover:border-white/10 transition-all">
        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
            {icon}
        </div>
        <h4 className="text-white font-bold uppercase tracking-tight mb-2">{title}</h4>
        <p className="text-slate-500 text-xs leading-relaxed font-medium">{desc}</p>
    </div>
);

export default ClientHome;