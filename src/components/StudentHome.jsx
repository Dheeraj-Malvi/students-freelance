import React from 'react';
import { Search, Clock, ArrowRight } from 'lucide-react';

const StudentHome = ({ jobs }) => {
    return (
        <div className="space-y-12 pb-20">
            {/* --- GLASSY HERO SECTION --- */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.03] border border-white/10 p-8 md:p-16 backdrop-blur-xl shadow-2xl">
                {/* Glow Effects */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full"></div>
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 blur-[100px] rounded-full"></div>
                
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter uppercase italic">
                        Grab your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">GIG</span> & Earn.
                    </h1>
                    <p className="text-slate-400 mt-6 text-lg font-medium tracking-wide">
                        Explore technical tasks posted by clients. Build your portfolio while you're still a student.
                    </p>
                </div>
            </div>

            {/* --- GLASSY SEARCH BAR --- */}
            <div className="flex flex-col md:flex-row gap-4 relative z-20">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search for tasks..." 
                        className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white text-sm outline-none focus:bg-white/[0.08] focus:border-blue-500/50 backdrop-blur-md transition-all shadow-inner"
                    />
                </div>
                <button className="bg-white/[0.05] border border-white/10 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 backdrop-blur-md transition-all shadow-lg border-b-2 border-b-white/5">
                    Filters
                </button>
            </div>

            {/* --- GLASSY GIG CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {jobs.map((job) => (
                    <div key={job.id} className="relative group p-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] hover:bg-white/[0.05] hover:border-blue-500/40 transition-all duration-500 backdrop-blur-sm overflow-hidden">
                        {/* Hover Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-br from-blue-600/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity -z-10"></div>
                        
                        <div className="flex justify-between items-start mb-6">
                            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                                Active
                            </div>
                            <div className="text-blue-400 font-black text-xl drop-shadow-[0_0_10px_rgba(96,165,250,0.4)]">₹{job.budget || '500'}</div>
                        </div>

                        <h3 className="text-white font-black text-xl uppercase tracking-tighter leading-tight group-hover:text-blue-300 transition-colors">
                            {job.title}
                        </h3>

                        <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                <Clock size={14} /> 2 days ago
                            </div>
                            <button className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-90">
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentHome;