import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import JobCard from './components/JobCard';
import { supabase } from './lib/supabaseClient';
import PostJob from './components/PostJob';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
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
        // Jab dono kaam ho jayein tabhi loading false karo
        setAuthLoading(false);
        setLoading(false);
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

  // --- CRITICAL FIX: Jab tak loading hai, kuch aur render mat karo ---
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
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      <Navbar />
      
      <div className="pt-24 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent -z-10"></div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
          Find the perfect <br />
          <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent italic">Student Gig</span>
        </h1>
        
        <div className="max-w-3xl mx-auto relative group mb-12 mt-10">
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
        {/* Is section mein flicker ab nahi aayega kyunki user state ab confirm ho chuki hai */}
        <div className="mb-20">
          {user ? (
            <PostJob onJobAdded={() => {}} />
          ) : (
            <div className="max-w-2xl mx-auto bg-slate-900/40 backdrop-blur-sm border border-slate-800 p-10 rounded-[2.5rem] text-center shadow-2xl">
              <h3 className="text-2xl font-bold mb-3">Ready to hire? 🚀</h3>
              <p className="text-slate-400 mb-8">Log in to post your requirements.</p>
              <Link to="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black transition-all">
                Login to Post
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJobs.map((job) => (
            <div key={job.id} className="relative group">
              <JobCard
                title={job.title}
                category={job.category}
                price={job.price}
                rating={job.rating}
                time={job.created_at ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true }) : "Just now"}
              />
              {user && user.id === job.user_id && (
                <button
                  onClick={() => handleDelete(job.id)}
className="absolute top-3 right-3 bg-white/5 backdrop-blur-md text-red-500 hover:text-red-400 p-2 rounded-lg transition-all opacity-100 lg:opacity-0 group-hover:opacity-100 shadow-xl z-30 border border-white/10 hover:border-red-500/50"
    title="Delete your post"                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;