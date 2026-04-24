import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import JobCard from './components/JobCard';
import { supabase } from './lib/supabaseClient';
import PostJob from './components/PostJob';
import { Link } from 'react-router-dom';

function App() {
  const [jobs, setJobs] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Sab kuch ek saath initialize karo
    const init = async () => {
      try {
        // Auth aur Jobs dono ka wait karo
        const [sessionRes, jobsRes] = await Promise.all([
          supabase.auth.getSession(),
          supabase.from('jobs').select('*').order('created_at', { ascending: false })
        ]);

        setUser(sessionRes.data.session?.user ?? null);
        setJobs(jobsRes.data || []);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setAuthLoading(false);
      }
    };

    init();

    // Listeners (Realtime & Auth Change)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const channel = supabase
      .channel('realtime-jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, (payload) => {
        if (payload.eventType === 'INSERT') setJobs((prev) => [payload.new, ...prev]);
        if (payload.eventType === 'DELETE') setJobs((prev) => prev.filter(j => j.id !== payload.old.id));
        if (payload.eventType === 'UPDATE') setJobs((prev) => prev.map(j => j.id === payload.new.id ? payload.new : j));
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  // --- LOADING STATE ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mb-4"></div>
          <p className="text-slate-500 text-xs font-bold tracking-[0.3em]">LOADING...</p>
        </div>
      </div>
    );
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm("Bhai, delete kar dein?")) {
      await supabase.from('jobs').delete().eq('id', id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 overflow-x-hidden">
      <Navbar />

      <div className="pt-24 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent -z-10"></div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight px-2">
          Find the perfect <br />
          <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent italic">Student Gig</span>
        </h1>

        <div className="w-full max-w-3xl mx-auto relative group mb-12 mt-10 px-2">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-[1.8rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative flex items-center bg-slate-900 border border-slate-800 p-2 rounded-[1.6rem]">
            <span className="pl-6">🔍</span>
            <input
              type="text"
              placeholder="Search gigs..."
              className="w-full bg-transparent border-none p-4 outline-none font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="mb-20">
          {user ? (
            <PostJob onJobAdded={() => { }} />
          ) : (
            <div className="max-w-2xl mx-auto bg-slate-900/40 backdrop-blur-md border border-white/[0.05] p-10 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden group/card">
              {/* Subtle Background Glow for the card */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[80px] pointer-events-none"></div>

              <h3 className="text-3xl font-black mb-3 text-white tracking-tighter italic">Ready to hire? 🚀</h3>
              <p className="text-slate-400 mb-8 font-medium italic">Log in to post your requirements and find the best student talent.</p>

              {/* LIQUID GLASS BUTTON */}
              <Link
                to="/login"
                className="inline-block relative group overflow-hidden px-12 py-4 rounded-xl transition-all duration-300 active:scale-95
      /* Glass Effect Base */
      bg-blue-600/20 backdrop-blur-md 
      /* Borders */
      border border-blue-500/30 border-t-blue-400/50
      /* Text Color */
      text-blue-400 hover:text-white font-black uppercase tracking-widest text-xs
      /* Shadow & Glow */
      shadow-[0_0_20px_rgba(37,99,235,0.1)]
      hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]
      hover:bg-blue-600/40"
              >
                {/* Glass Shine Animation Layer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>

                <span className="relative z-10">
                  Login to Post
                </span>
              </Link>
            </div>)}
        </div>

        {/* Jobs List Logic with "No Results Found" */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    className="absolute top-3 right-3 bg-white/5 backdrop-blur-md text-red-500 hover:text-red-400 p-2 rounded-lg transition-all opacity-100 lg:opacity-0 group-hover:opacity-100 shadow-xl z-30 border border-white/10 hover:border-red-500/50"
                    title="Delete your post"
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
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold">No results found for "{searchTerm}"</h3>
            <p className="text-slate-500 mt-2">Search something else!</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;