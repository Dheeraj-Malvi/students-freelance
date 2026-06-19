import React from 'react';

const DashboardStats = ({ stats }) => {
    // stats expected array format: [{ label: 'GIGS POSTED', value: '00', color: 'text-white' }]
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, idx) => (
                <div 
                    key={idx} 
                    className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-between shadow-2xl backdrop-blur-md min-h-[112px]"
                >
                    <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        {stat.label}
                    </span>
                    <h3 className={`text-2xl font-black tracking-tight mt-2 ${stat.color || 'text-white'}`}>
                        {stat.value}
                    </h3>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;