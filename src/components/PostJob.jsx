import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const PostJob = ({ onJobAdded }) => {
  const [formData, setFormData] = useState({ title: '', category: 'Web Dev', price: '' });
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPosting(true);

    try {
      // 1. Current logged-in user ki details nikalna zaroori hai
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("Bhai, pehle login toh kar lo!");
        setIsPosting(false);
        return;
      }

      // 2. Insert karte waqt 'user_id' bhej rahe hain taaki RLS policy pass ho jaye
      const { error } = await supabase
        .from('jobs')
        .insert([{ 
          title: formData.title, 
          category: formData.category, 
          price: formData.price,
          rating: "5.0",
          time_posted: "Just now",
          user_id: user.id // <-- Sabse important change
        }]);

      if (error) {
        throw error;
      } else {
        alert("Gig Posted Successfully! 🚀");
        setFormData({ title: '', category: 'Web Dev', price: '' });
        onJobAdded(); // Refresh the list
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mb-16">
      <form 
        onSubmit={handleSubmit} 
        className="bg-slate-900/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden"
      >
        {/* Glow effect for UI */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-600/10 blur-[50px]"></div>

        <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
          <span className="bg-blue-600 p-2 rounded-xl text-lg">💼</span> 
          Post a New Gig
        </h2>

        <div className="grid gap-6">
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase ml-2 mb-2 block tracking-widest">
              Job Title
            </label>
            <input 
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-all shadow-inner"
              placeholder="e.g. Senior React Developer"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-slate-400 text-xs font-bold uppercase ml-2 mb-2 block tracking-widest">
                Category
              </label>
              <select 
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option>Web Dev</option>
                <option>Design</option>
                <option>App Dev</option>
                <option>Writing</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-bold uppercase ml-2 mb-2 block tracking-widest">
                Price ($)
              </label>
              <input 
                type="number"
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-all shadow-inner"
                placeholder="e.g. 500"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPosting}
            className={`w-full mt-4 font-black py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] ${
              isPosting 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:shadow-blue-500/25'
            }`}
          >
            {isPosting ? 'Publishing...' : 'Publish Gig 🚀'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;