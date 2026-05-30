import React from 'react';
import { Clock, DollarSign, Trash2 } from 'lucide-react'; // 🗑️ Trash2 icon standard design ke liye

const ManageJobCard = ({ title, category, price, created_at, onDelete }) => {

  // Dynamic Time Helper Function
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Just now";

    const now = new Date();
    const postedDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - postedDate) / 1000);

    if (diffInSeconds < 60) return "Just now";

    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative group cursor-pointer transition-all duration-500 hover:scale-[1.02]">
      <div className="absolute -inset-[1px] bg-gradient-to-br from-blue-500/40 via-transparent to-emerald-500/40 rounded-[2rem] opacity-0 group-hover:opacity-100 blur-[2px] transition-opacity duration-500"></div>
      <div className="relative h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 p-7 rounded-[2rem] shadow-2xl overflow-hidden">
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700"></div>
        
        <div className="flex justify-between items-start mb-5">
          <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-blue-400/20 backdrop-blur-md">
            {category}
          </span>
          <div className="flex items-center gap-0.5 text-emerald-400 font-bold bg-emerald-500/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/20">
            <DollarSign className="w-4 h-4" />
            <span className="text-base tracking-tight">{price}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-white text-xl font-bold mb-3 group-hover:text-blue-300 transition-colors leading-tight">
          {title}
        </h3>

        {/* Info Stats */}
        <div className="flex items-center gap-5 text-slate-400 text-sm mb-7">
          <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-[13px]">{formatTimeAgo(created_at)}</span>
          </div>
        </div>

        {/* Action Button: Replaced Apply Now with Red Cyberpunk Delete Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); // 💥 Restricts card navigation popup redirect
            if (onDelete) onDelete();
          }} 
          className="w-full relative group/btn overflow-hidden bg-red-500/5 hover:bg-red-500/20 text-red-400 hover:text-red-200 py-3.5 rounded-2xl font-bold transition-all duration-300 border border-red-500/10 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] flex items-center justify-center gap-2"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out"></span>
          <Trash2 className="w-4 h-4" />
          <span className="relative z-10">Delete Listing</span>
        </button>
      </div>
    </div>
  );
};

export default ManageJobCard;