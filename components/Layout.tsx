
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'history';
  setActiveTab: (tab: 'dashboard' | 'history') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-[#020617] shadow-2xl overflow-hidden relative">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-pink-600/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-80 h-80 bg-fuchsia-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <header className="p-6 border-b border-pink-500/10 bg-slate-950/40 backdrop-blur-xl sticky top-0 z-50 flex justify-between items-center">
        <div className="relative">
          <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic leading-tight">
            75-Day <span className="bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">Hot Girl</span>
          </h1>
          <p className="text-[10px] text-pink-300/60 font-black tracking-widest uppercase flex items-center gap-1">
            <i className="fa-solid fa-sparkles text-[8px]"></i> Your Glow Up Starts Now
          </p>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.4)]">
          <i className="fa-solid fa-crown text-white text-sm"></i>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="border-t border-pink-500/10 bg-slate-950/80 backdrop-blur-2xl p-3 flex justify-around items-center sticky bottom-0 z-50">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${
            activeTab === 'dashboard' 
            ? 'text-white bg-gradient-to-br from-pink-600/40 to-rose-500/20 shadow-[inset_0_0_10px_rgba(236,72,153,0.2)] border border-pink-500/30' 
            : 'text-slate-500 hover:text-pink-400'
          }`}
        >
          <i className="fa-solid fa-heart text-lg mb-1"></i>
          <span className="text-[9px] font-black uppercase tracking-widest">Self Care</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${
            activeTab === 'history' 
            ? 'text-white bg-gradient-to-br from-pink-600/40 to-rose-500/20 shadow-[inset_0_0_10px_rgba(236,72,153,0.2)] border border-pink-500/30' 
            : 'text-slate-500 hover:text-pink-400'
          }`}
        >
          <i className="fa-solid fa-wand-magic-sparkles text-lg mb-1"></i>
          <span className="text-[9px] font-black uppercase tracking-widest">Glow Log</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
