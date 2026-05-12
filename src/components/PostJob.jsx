import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Briefcase } from 'lucide-react'; // Icons ke liye

const PostJob = ({ isOpen, onClose, onJobAdded }) => {
  const [formData, setFormData] = useState({ title: '', category: 'Web Dev', price: '' });
  const [isPosting, setIsPosting] = useState(false);

  // Agar modal open nahi hai toh kuch return mat karo
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPosting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("Bhai, pehle login toh kar lo!");
        setIsPosting(false);
        return;
      }

      const { error } = await supabase
        .from('jobs')
        .insert([{ 
          title: formData.title, 
          category: formData.category, 
          price: formData.price,
          rating: "5.0",
          user_id: user.id 
        }]);

      if (error) throw error;

      alert("Gig Posted Successfully! 🚀");
      setFormData({ title: '', category: 'Web Dev', price: '' });
      onJobAdded(); // Refresh list
      onClose();   // Modal band karo
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    // OVERLAY: Bahar click karne par 'onClose' trigger hoga
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      {/* MODAL CONTENT: stopPropagation taaki andar click karne par band na ho */}
      <div 
        className="bg-[#0B0F1A]/95 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative backdrop-blur-xl transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effect */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-600/20 blur-[60px] -z-10"></div>

        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 p-2.5 rounded-xl">
              <Briefcase className="text-blue-500" size={22} />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">
              Post a New Gig
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div>
            <label className="text-slate-500 text-[10px] font-black uppercase ml-1 mb-2 block tracking-[0.2em]">
              Job Title
            </label>
            <input 
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white text-sm outline-none focus:border-blue-500/50 transition-all shadow-inner"
              placeholder="e.g. Senior React Developer"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="text-slate-500 text-[10px] font-black uppercase ml-1 mb-2 block tracking-[0.2em]">
                Category
              </label>
              <select 
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white text-sm outline-none focus:border-blue-500/50 cursor-pointer appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option className="bg-[#0B0F1A]">Web Dev</option>
                <option className="bg-[#0B0F1A]">Design</option>
                <option className="bg-[#0B0F1A]">App Dev</option>
                <option className="bg-[#0B0F1A]">Writing</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="text-slate-500 text-[10px] font-black uppercase ml-1 mb-2 block tracking-[0.2em]">
                Price ($)
              </label>
              <input 
                type="number"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white text-sm outline-none focus:border-blue-500/50 transition-all shadow-inner"
                placeholder="500"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Action Button */}
          <button 
            type="submit" 
            disabled={isPosting}
            className={`w-full mt-4 font-black py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] uppercase text-[11px] tracking-widest ${
              isPosting 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
            }`}
          >
            {isPosting ? 'Publishing...' : 'Publish Gig 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;