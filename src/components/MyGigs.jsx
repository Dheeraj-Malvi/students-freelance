import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Briefcase, Users, ChevronRight, Plus } from 'lucide-react';

const MyGigs = () => {
    const { user } = useOutletContext();
    const navigate = useNavigate();
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyGigs = async () => {
            if (!user) return;
            try {
                // Fetching jobs and counting related applications
                const { data, error } = await supabase
                    .from('jobs')
                    .select(`
                        *,
                        applications (id)
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setGigs(data || []);
            } catch (err) {
                console.error("Error fetching gigs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyGigs();
    }, [user]);

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 animate-pulse uppercase text-xs font-black">Loading Your Gigs...</div>;

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between italic items-end mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">My <span className="text-blue-500">Gigs</span></h1>
                        <p className="text-blue-300 text-xs italic tracking-[0.2em] mt-2">Manage your active postings and talent</p>
                    </div>
                </div>

                {gigs.length === 0 ? (
                    <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-20 text-center">
                        <Briefcase className="mx-auto text-slate-800 mb-4" size={50} />
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No gigs posted yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {gigs.map((gig) => (
                            <div key={gig.id} className="group bg-slate-900/40 border border-white/5 p-6 rounded-[2.5rem] hover:border-blue-500/30 transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6">
                                    <div className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full border border-blue-500/20 uppercase">
                                        {gig.category}
                                    </div>
                                </div>
                                <h3 className="text-white text-xl font-black uppercase tracking-tight mb-1 mt-4">{gig.title}</h3>
                                <p className="text-emerald-400 font-bold text-sm mb-6">${gig.price}</p>
                                
                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Users size={16} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                            {gig.applications?.length || 0} Applicants
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/GigApplications/${gig.id}`)}
                                        className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        Manage <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyGigs;