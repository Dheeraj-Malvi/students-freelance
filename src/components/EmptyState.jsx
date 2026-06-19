import { Plus } from 'lucide-react';
import React from 'react';

const EmptyState = ({ userRole, activeTab, userSkills, onPostGigClick, onBrowseMarketplaceClick }) => {
    return (
        <div className="p-8 bg-slate-900/20 border border-white/5 border-dashed rounded-2xl col-span-1 lg:col-span-2 text-center py-12 mt-2 backdrop-blur-md">
            {userRole === 'client' ? (
                <>
                    <p className="text-slate-400 text-xs font-semibold tracking-wide max-w-sm mx-auto leading-relaxed">
                        You haven't posted any active gigs matching this section yet. Click below to hire top-tier student talent at half the cost! 🚀
                    </p>
                    <div className="flex justify-center w-full mt-4">
                        <button
                            type="button"
                            onClick={onPostGigClick}
                            className="relative group overflow-hidden bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/50 px-5 py-2.5 h-11 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all duration-300 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] whitespace-nowrap w-full sm:w-auto shrink-0"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300 shrink-0" />
                            Post New Gig
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <p className="text-slate-400 text-xs font-semibold tracking-wide">
                        {activeTab === 'for-you' && userSkills.length === 0
                            ? "Add your core skills in your profile dashboard to instantly unlock personalized recommendations! 🚀"
                            : "No active gigs found matching your current filters."}
                    </p>
                    {activeTab === 'for-you' && (
                        <div className="flex justify-center w-full mt-4">
                            <button
                                type="button"
                                onClick={onBrowseMarketplaceClick}
                                className="relative group/shiny overflow-hidden text-[10px] font-black uppercase tracking-widest bg-white/5 backdrop-blur-md border border-white/10 hover:border-blue-500/40 text-blue-400 hover:text-white px-5 py-3 rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/shiny:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
                                <span className="relative z-10 flex items-center justify-center gap-1.5">
                                    Browse General Marketplace
                                </span>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default EmptyState;