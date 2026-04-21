import React from 'react';
import { Clock, DollarSign, Star } from 'lucide-react';

const JobCard = ({ title, category, price, rating, created_at }) => {
  
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
    // Outer Wrapper for Hover Scale & Shadow
    <div className="relative group cursor-pointer transition-all duration-500 hover:scale-[1.02]">

      {/* 1. Liquid Border Glow */}
      <div className="absolute -inset-[1px] bg-gradient-to-br from-blue-500/40 via-transparent to-emerald-500/40 rounded-[2rem] opacity-0 group-hover:opacity-100 blur-[2px] transition-opacity duration-500"></div>

      {/* 2. Main Glass Body */}
      <div className="relative h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 p-7 rounded-[2rem] shadow-2xl overflow-hidden">

        {/* Inner Decor: Liquid Blob */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700"></div>

        {/* Top Header Section */}
        <div className="flex justify-between items-start mb-5">
          <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-blue-400/20 backdrop-blur-md">
            {category}
          </span>

          <div className="flex items-center text-yellow-500 gap-1 bg-yellow-500/10 px-2.5 py-1 rounded-lg border border-yellow-500/20 mr-8 lg:mr-0 group-hover:mr-8 transition-all duration-300">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-black">{rating}</span>
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
            {/* UPDATED TIME LOGIC HERE */}
            <span className="font-medium text-[13px]">{formatTimeAgo(created_at)}</span>
          </div>
          <div className="flex items-center gap-0.5 text-emerald-400 font-bold bg-emerald-500/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/20">
            <DollarSign className="w-4 h-4" />
            <span className="text-base tracking-tight">{price}</span>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full relative overflow-hidden bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-2xl font-bold transition-all duration-300 border border-white/10 hover:border-blue-500/50 hover:text-blue-200 group-hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]">
          <span className="relative z-10">Apply Now</span>
        </button>
      </div>
    </div>
  );
};

export default JobCard;