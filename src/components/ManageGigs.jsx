import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useOutletContext } from 'react-router-dom';
import JobCard from './JobCard';
import { Loader2 } from 'lucide-react';
import ManageJobCard from './ManageJobCard';

function ManageGigs() {
    const { user } = useOutletContext();
    
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchMyJobs = async () => {
            if (!user?.id) return;
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setMyJobs(data || []);
            } catch (error) {
                console.error("Error loading user jobs:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMyJobs();
    }, [user]);

    // Simple Delete Handler
    const handleDeletePost = async (jobId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this listing permanently?");
        if (!confirmDelete) return;

        try {
            setMessage({ text: '', type: '' });
            
            const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', jobId)
                .eq('user_id', user.id);

            if (error) throw error;

            setMyJobs((prev) => prev.filter((job) => job.id !== jobId));
            
            setMessage({ text: 'Gig deleted successfully!', type: 'success' });

            setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 3000);
            
        } catch (error) {
            setMessage({ text: `Error deleting post: ${error.message}`, type: 'error' });
            setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 5000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-white">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading your postings...</p>
            </div>
        );
    }

    return (
        <>
            {/* --- TOP HEADER SECTION (Clean & Minimal) --- */}
            <div className="min-h-screen bg-slate-950">
                <div className="max-w-6xl mx-auto"> 

                    <div className="flex justify-between italic border-b border-white/10 pb-4 items-end mb-8">
                        <div>
                            <h2 className="text-2xl sm:text-2xl md:text-2xl font-black mb-2 tracking-tighter uppercase text-white">
                                Manage <span className="text-blue-500">Listings</span>
                            </h2>
                            <p className="text-blue-300 text-xs italic tracking-[0.1em] mt-2">
                                Manage your active listings.
                            </p>
                        </div>
                    </div>

                    {message.text && (
                        <div className="w-full flex-center px-6 mb-6">
                            <div className={`p-4 rounded-xl border text-xs font-bold transition-all text-center min-w-full max-w-md ${
                                message.type === 'error'
                                    ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.05)]'
                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                            }`}>
                                {message.text}
                            </div>
                        </div>
                    )}  

                    {/* --- JOBS GRID --- */}
                    <main className="max-w-7xl mx-auto px-6 pb-24">
                        {myJobs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-20">
                                {myJobs.map((job) => (
                                    <div
                                        key={job.id}
                                        className="relative group transition-all duration-500 hover:scale-[1.02]"
                                    >
                                        <ManageJobCard
                                            title={job.title}
                                            category={job.category}
                                            price={job.price}
                                            created_at={job.created_at}
                                            onDelete={() => handleDeletePost(job.id)}
                                        />

                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* --- EMPTY STATE --- */
                            <div className="text-center py-32 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] backdrop-blur-sm relative z-20">
                                <h3 className="text-2xl font-black text-slate-700 tracking-tighter uppercase italic">No Gigs Found</h3>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}

export default ManageGigs;