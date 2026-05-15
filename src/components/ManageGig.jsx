import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { User, Mail, ArrowLeft, Check, X, Loader2 } from 'lucide-react';

const ManageGig = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchApplicants = async () => {
        try {
            const { data, error } = await supabase
                .from('applications')
                .select(`
                    id, status, created_at,
                    profiles:applicant_id (full_name, email)
                `)
                .eq('job_id', jobId);
            if (error) throw error;
            setApplicants(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (jobId) fetchApplicants();
    }, [jobId]);

    const updateStatus = async (appId, newStatus) => {
        const { error } = await supabase
            .from('applications')
            .update({ status: newStatus })
            .eq('id', appId);
        
        if (!error) fetchApplicants(); // Refresh list
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase mb-8 transition-all">
                    <ArrowLeft size={14} /> Back to My Gigs
                </button>

                <h1 className="text-3xl font-black text-white uppercase italic mb-10">Review <span className="text-blue-500">Talent</span></h1>

                <div className="space-y-4">
                    {applicants.map((app) => (
                        <div key={app.id} className="bg-slate-900/40 border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between hover:bg-slate-900/60 transition-all">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 text-blue-500">
                                    <User size={28} />
                                </div>
                                <div>
                                    <h3 className="text-white font-black uppercase text-sm">{app.profiles?.full_name}</h3>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                        <Mail size={12} className="opacity-50" /> {app.profiles?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {app.status === 'pending' ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => updateStatus(app.id, 'accepted')} className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"><Check size={18} /></button>
                                        <button onClick={() => updateStatus(app.id, 'rejected')} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"><X size={18} /></button>
                                    </div>
                                ) : (
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${
                                        app.status === 'accepted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                                    }`}>
                                        {app.status}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManageGig;