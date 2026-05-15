import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useOutletContext } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

const MyApplications = () => {
    const { user } = useOutletContext();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            if (!user) return;

            try {
                // Hum 'applications' table se data la rahe hain aur saath mein 'jobs' table ko join kar rahe hain
                const { data, error } = await supabase
                    .from('applications')
                    .select(`
                        id,
                        created_at,
                        status,
                        jobs (
                            id,
                            title,
                            company_name,
                            location,
                            salary
                        )
                    `)
                    .eq('applicant_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setApplications(data || []);
            } catch (err) {
                console.error("Error fetching applications:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
                <div className="animate-pulse font-black tracking-widest text-xs uppercase">Loading Your Applications...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic">
                    My <span className="text-emerald-500">Applications</span>
                </h1>
                <p className="text-slate-500 text-sm mb-8 font-bold uppercase tracking-widest">
                    Track your journey with {applications.length} active applications
                </p>

                {applications.length === 0 ? (
                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-20 text-center">
                        <Briefcase className="mx-auto text-slate-700 mb-4" size={48} />
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No applications found yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <div 
                                key={app.id} 
                                className="group bg-slate-900/40 border border-white/5 p-5 rounded-[2rem] hover:bg-slate-900/60 transition-all hover:border-emerald-500/20"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                                            <Briefcase className="text-emerald-500" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-black uppercase text-sm group-hover:text-emerald-400 transition-colors">
                                                {app.jobs?.title || 'Unknown Job'}
                                            </h3>
                                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                                {app.jobs?.company_name} • {app.jobs?.location}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <div className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                                                app.status === 'accepted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                                app.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                            }`}>
                                                {app.status || 'pending'}
                                            </div>
                                            <p className="text-[9px] text-slate-600 mt-1 font-bold">
                                                Applied on {new Date(app.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <ChevronRight className="text-slate-700 group-hover:text-white transition-all" size={20} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyApplications;