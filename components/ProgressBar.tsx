
import React from 'react';
import { TOTAL_DAYS } from '../constants';

interface ProgressBarProps {
  currentDay: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentDay }) => {
  const percentage = Math.min((currentDay / TOTAL_DAYS) * 100, 100);

  return (
    <div className="w-full bg-slate-950 rounded-full h-5 overflow-hidden border border-pink-500/10 p-1 shadow-inner relative">
      <div 
        className="h-full bg-gradient-to-r from-pink-600 via-fuchsia-500 to-rose-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(236,72,153,0.3)]"
        style={{ width: `${percentage}%` }}
      >
        <div className="w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.1)_50%,rgba(255,255,255,.1)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] opacity-30 animate-[stripes_2s_linear_infinite]"></div>
      </div>
    </div>
  );
};

export default ProgressBar;
