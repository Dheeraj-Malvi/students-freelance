import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import PostJob from './PostJob';
import JobCard from './JobCard';

function Home() {
    const {
        user,
        searchTerm,
        setSearchTerm,
        filteredJobs,
        handleDelete,
        fetchJobs
    } = useOutletContext();

    const role = user?.user_metadata?.role;
    const isClient = role === 'client';

    return (
        <>
            {/* --- HERO SECTION --- */}
            <div className="pt-24 pb-16 px-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent -z-10"></div>

                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight px-2 text-white">
                    Find the perfect <br />
                    <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent italic drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                        Student Gig
                    </span>
                </h1>

                {/* Glassy Search Bar */}
                <div className="w-full max-w-3xl mx-auto relative group mb-12 mt-10 px-2">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-[1.8rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative flex items-center bg-slate-900/80 border border-slate-800 p-2 rounded-[1.6rem] backdrop-blur-xl">
                        <span className="pl-6 opacity-60 text-xl">🔍</span>
                        <input
                            type="text"
                            placeholder="Search gigs by title or category..."
                            className="w-full bg-transparent border-none p-4 outline-none font-medium text-white placeholder:text-slate-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <main className="max-w-7xl mx-auto px-6 pb-24">

                <div className="mb-20">
                    {!user ? (
                        <div className="max-w-2xl mx-auto relative group/card">
                            {/* 1. OUTER GLOW: Card ke peeche ek emerald glow jo hover par bade ga */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-[2.6rem] blur-2xl opacity-0 group-hover/card:opacity-100 transition duration-700"></div>

                            <div className="relative bg-slate-950/40 backdrop-blur-2xl border border-white/10 p-12 rounded-[2.5rem] text-center shadow-2xl overflow-hidden">

                                {/* 2. DYNAMIC CORNER GLOWS: Different colors for variety */}
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[80px] pointer-events-none group-hover/card:bg-emerald-500/20 transition-all duration-500"></div>
                                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/10 blur-[80px] pointer-events-none group-hover/card:bg-blue-600/20 transition-all duration-500"></div>

                                {/* 3. CONTENT: Bold and Italicized for Gamer/Tech vibe */}
                                <h3 className="text-4xl font-black mb-4 text-white tracking-tighter italic uppercase drop-shadow-lg">
                                    Ready to <span className="text-emerald-400">hire?</span> 🚀
                                </h3>
                                <p className="text-slate-400 mb-10 font-medium italic max-w-md mx-auto leading-relaxed">
                                    Log in as a <span className="text-emerald-400 border-b border-emerald-500/30">Client</span> to post your requirements and find the best student talent in the market.
                                </p>

                                <Link
                                    to="/login"
                                    className="relative inline-flex items-center justify-center px-14 py-4 overflow-hidden font-black text-xs uppercase tracking-[0.2em] text-emerald-400 border border-emerald-500/40 rounded-xl bg-emerald-500/10 backdrop-blur-md transition-all duration-500 group/btn hover:text-white hover:bg-emerald-800 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95"
                                >
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"></span>
                                    <span className="relative">Login to Post</span>
                                </Link>
                            </div>
                        </div>
                    ) : isClient ? (
                        <PostJob onJobAdded={fetchJobs} />
                    ) : (
                        // Student view logic...
                        <div className="text-center py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest animate-pulse">● Live Opportunities Found</p>
                        </div>
                    )}
                </div>

                {/* --- JOBS LIST --- */}
                {filteredJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-20">
                        {filteredJobs.map((job) => (
                            <div key={job.id} className="relative group">
                                <JobCard
                                    title={job.title}
                                    category={job.category}
                                    price={job.price}
                                    rating={job.rating}
                                    created_at={job.created_at}
                                />
                                {user && user.id === job.user_id && (
                                    <button
                                        onClick={() => handleDelete(job.id)}
                                        className="absolute top-4 right-4 bg-red-500/10 backdrop-blur-md text-red-500 hover:bg-red-500 hover:text-white p-2.5 rounded-xl transition-all opacity-100 lg:opacity-0 group-hover:opacity-100 shadow-xl z-30 border border-red-500/20"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1-1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] backdrop-blur-sm relative z-20">
                        <h3 className="text-2xl font-black text-slate-700 tracking-tighter uppercase italic">No Gigs Found</h3>
                    </div>
                )}
            </main>
        </>
    );
}

export default Home;