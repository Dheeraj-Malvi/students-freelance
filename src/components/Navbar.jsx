import { Link } from 'react-router-dom';

const Navbar = () => {


  return (
    <div className="absolute top-0 left-0 right-0 z-50 px-4 pt-6">
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[94%] max-w-7xl z-50 mx-auto bg-slate-900/40 backdrop-blur-[20px] border border-white/[0.08] px-3 md:px-6 py-2.5 flex items-center justify-between rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group">

        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-emerald-500/10 pointer-events-none group-hover:opacity-100 transition-opacity opacity-50"></div>


        <Link to="/" className="relative z-10 flex items-center gap-3 group/logo">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-full scale-100 group-hover/logo:scale-110 group-hover/logo:rotate-[15deg] transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"></div>

            <div className="absolute inset-x-2 -bottom-2 h-1 bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-blue-500/10 blur-md opacity-0 group-hover/logo:opacity-100 transition-opacity"></div>
            <div className="relative z-10 w-6 h-6 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-full h-full text-white transition-all duration-300"
              >
                <defs>
                  <linearGradient id="planeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#34d399', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#planeGradient)" // Gradient applied to the fill
                  className="group-hover/logo:fill-white transition-colors duration-300"
                  d="M13.8 2.6c.4-.6 1.1-.9 1.9-.8.7.1 1.4.6 1.7 1.3l6.4 16.5c.3.8-.1 1.8-.9 2.1s-1.8.1-2.1-.7L12 11 3.2 21c-.6.7-1.7.8-2.4.2-.7-.6-.8-1.7-.2-2.4L11.8 3c.3-.6 1.1-.9 2-.4z"
                />
              </svg>
            </div>
          </div>

          <span className="text-sm sm:text-xl md:text-2xl font-black tracking-tighter italic whitespace-nowrap">
            <span className="text-white">Freelance</span>
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent ml-1.5">
              Students
            </span>
          </span>
        </Link>

        {/* <Link to="/dashboard" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
          My Dashboard
        </Link> */}

        <div className="relative z-10 flex items-center gap-6">
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest px-2">
              Login
            </Link>
            <Link
              to="/signup"
              className="relative group/btn overflow-hidden px-6 py-2.5 rounded-full bg-blue-600/20 border border-blue-400/30 text-blue-400 hover:text-white hover:bg-blue-600/30 transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />

              <span className="relative z-10">Join Now</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;