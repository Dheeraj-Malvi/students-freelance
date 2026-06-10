import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Briefcase } from 'lucide-react';

const PostJob = ({ isOpen, onClose, onJobAdded, showNotification }) => { // 👈 1. Prop receive kiya yahan
  const [formData, setFormData] = useState({ title: '', category: 'Web Dev', price: '', skills: '' });
  const [isPosting, setIsPosting] = useState(false);
  const [animate, setAnimate] = useState(false); // Controls transition trigger
  const [shouldRender, setShouldRender] = useState(isOpen); // Controls actual DOM mounting

  const jobtitleRef = useRef(null);
  
  // 🎭 Handle mounting and unmounting smoothly
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setAnimate(true);
        if (jobtitleRef.current)
           jobtitleRef.current.focus();
      }, 10);

      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setShouldRender(false), 500); 
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSmoothClose = () => {
    setAnimate(false); // Exit animation start
    setTimeout(() => {
      onClose(); 
    }, 500);
  };

  // dont show component at all if shouldRender is false, this allows exit animation to play before unmounting
  if (!shouldRender) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.price || Number(formData.price) <= 0) {
      showNotification("Price should be atleast $1", "error"); 
      return;
    }

    setIsPosting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showNotification("Bhai, pehle login toh kar lo!", "error");
        setIsPosting(false);
        return;
      }

      const skillsArray = formData.skills
        ? formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '')
        : [];

      const { error } = await supabase
        .from('jobs')
        .insert([{
          title: formData.title,
          category: formData.category,
          price: formData.price,
          skills: skillsArray,
          user_id: user.id
        }]);

      if (error) throw error;

      // 🎯 Success Toast Notification trigger!
      showNotification("Gig Posted Successfully!", "success");
      setFormData({ title: '', category: 'Web Dev', price: '', skills: '' });
      onJobAdded(); 
      handleSmoothClose();
    } catch (error) {
      showNotification(`Error: ${error.message}`, "error");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    // OVERLAY: handles smooth fade-out background
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto transition-all duration-500 ease-in-out ${
        animate 
        ? 'bg-black/60 backdrop-blur-md opacity-100' 
        : 'bg-transparent backdrop-blur-none opacity-0'
      }`}
      onClick={handleSmoothClose}
    >
      {/* MODAL CONTENT: handles smooth scale-down and slide-down */}
      <div
        className={`bg-[#0B0F1A]/95 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative backdrop-blur-xl transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
          animate 
          ? 'scale-100 translate-y-0 opacity-100' 
          : 'scale-95 translate-y-8 opacity-0'
        }`}
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
            type="button"
            onClick={handleSmoothClose}
            className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all hover:rotate-90 duration-300"
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
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white text-sm outline-none focus:border-blue-500/50 transition-all shadow-inner duration-300"
              placeholder="e.g. Senior React Developer"
              ref={jobtitleRef}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white text-sm outline-none focus:border-blue-500/50 cursor-pointer appearance-none transition-all duration-300"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                min="1"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white text-sm outline-none focus:border-blue-500/50 transition-all shadow-inner duration-300"
                placeholder="500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-500 text-[10px] font-black uppercase ml-1 mb-2 block tracking-[0.2em]">
              Required Skills (Comma Separated)
            </label>
            <input
              type="text"
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white text-sm outline-none focus:border-blue-500/50 transition-all shadow-inner duration-300"
              placeholder="e.g. React, Tailwind, Supabase"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              required
            />
          </div>


          {/* Action Button */}
          <button
            type="submit"
            disabled={isPosting}
            className={`relative group overflow-hidden px-5 py-4 rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-2 transition-all duration-300 backdrop-blur-md w-full mt-4 tracking-widest ${isPosting
              ? 'bg-slate-900/40 text-slate-500 border border-slate-800/50 cursor-not-allowed'
              : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] active:scale-[0.98]'
              }`}
          >
            {!isPosting && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}

            <span className="flex items-center gap-2">
              {isPosting ? (
                <>Publishing...</>
              ) : (
                <>
                  Publish Gig
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                    🚀
                  </span>
                </>
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;