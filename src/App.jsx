import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import Navbar from './components/Navbar';

function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setJobs(data);
  };

  const hideNavbarPages = ['/login', '/signup', '/profiledetails', '/forgot-password', '/update-password', '/dashboard', '/client-home', '/student-home', '/my-gigs', '/my-applications', '/GigApplications'];

  // 1. CHECK IF CURRENT PATH STARTS WITH ANY OF THE HIDDEN PAGES
  const isInsideHiddenPages = hideNavbarPages.some(page => location.pathname.startsWith(page));

  const isValidPage = location.pathname === '/' || isInsideHiddenPages;

  // 2. FINAL CONDITION: Navbar will be visible only if it's a valid page and not inside hidden pages
  const shouldHideNavbar = isInsideHiddenPages || !isValidPage;

  useEffect(() => {
    // 🛡️ FAIL-SAFE: Agar 3 second tak session nahi mila, toh loading band kar do
    const timeout = setTimeout(() => {
      setAuthLoading(false);
    }, 3000);

    const initAuth = async () => {
      try {
        // 1. Current session check karo
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
        } else {
          // 2. Backup: Kabhi-kabhi HashRouter mein session delay hota hai, getUser se force check karo
          const { data: { user: authUser } } = await supabase.auth.getUser();
          setUser(authUser ?? null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setAuthLoading(false);
        clearTimeout(timeout);
      }
    };

    initAuth();
    fetchJobs();

    // 3. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // --- LOADER UI ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase">Verifying Session...</p>
        </div>
      </div>
    );
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (!error) fetchJobs();
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {!shouldHideNavbar && <Navbar user={user} />}
      <main>
        <Outlet context={{
          user,
          jobs,
          searchTerm,
          setSearchTerm,
          filteredJobs,
          handleDelete,
          fetchJobs
        }} />
      </main>
    </div>
  );
}

export default App;