
import React from 'react';
import { WATER_GOAL_OZ } from '../constants';

interface WaterTrackerProps {
  currentOz: number;
  onUpdate: (oz: number) => void;
}

const WaterTracker: React.FC<WaterTrackerProps> = ({ currentOz, onUpdate }) => {
  const percentage = Math.min((currentOz / WATER_GOAL_OZ) * 100, 100);
  
  const addWater = (amount: number) => {
    onUpdate(Math.min(currentOz + amount, WATER_GOAL_OZ));
  };

  return (
    <div className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-pink-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative group">
      <div className="relative z-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-[10px] font-black text-pink-300/60 uppercase tracking-[0.2em] mb-1">Hydration Slay</h3>
            <p className="text-4xl font-black text-white italic">
              {currentOz}<span className="text-base text-pink-500/50 not-italic ml-1 tracking-tighter">/ {WATER_GOAL_OZ} oz</span>
            </p>
          </div>
          <div className="text-pink-400 text-3xl animate-pulse">
            <i className="fa-solid fa-wine-glass-empty"></i>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {[8, 16, 32].map((amount) => (
            <button 
              key={amount}
              onClick={() => addWater(amount)}
              className="bg-pink-500/10 border border-pink-500/20 text-pink-300 py-3 rounded-2xl font-black text-xs hover:bg-pink-500/30 hover:border-pink-500/40 transition-all active:scale-95 shadow-[0_4px_15px_rgba(236,72,153,0.1)]"
            >
              +{amount}oz
            </button>
          ))}
        </div>
      </div>

      {/* "Pink Lemonade" Water Animation */}
      <div 
        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-pink-600/30 via-fuchsia-500/20 to-transparent transition-all duration-1000 ease-in-out"
        style={{ height: `${percentage}%` }}
      >
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-pink-400/40 via-white/20 to-pink-400/40 blur-md animate-[pulse_2s_infinite]"></div>
      </div>
    </div>
  );
};

export default WaterTracker;
