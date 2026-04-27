import React from 'react';
import { MapPin, Clock, Wifi } from 'lucide-react';

interface TopBarProps {
  currentTime: string;
  city: string;
}

export const TopBar: React.FC<TopBarProps> = ({ currentTime, city }) => {
  return (
    <header className="relative z-20 flex items-center justify-between px-8 py-4
      bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95
      backdrop-blur-md border-b border-white/10 shadow-lg">

      {/* Left: Location */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30
          flex items-center justify-center">
          <MapPin size={20} className="text-blue-400" />
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest font-medium">You are in</p>
          <p className="text-white font-bold text-lg leading-tight">{city}</p>
        </div>
      </div>

      {/* Center: Brand */}
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl">🏙️</span>
          <div>
            <h1 className="text-white font-black text-2xl tracking-tight leading-none">
              Nova<span className="text-blue-400">Crest</span>
            </h1>
            <p className="text-white/40 text-xs tracking-widest uppercase text-center">
              Tourist Guide
            </p>
          </div>
        </div>
      </div>

      {/* Right: Time & Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Wifi size={16} className="text-emerald-400" />
          <span className="text-emerald-400 text-xs font-medium">ONLINE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10
            flex items-center justify-center">
            <Clock size={16} className="text-white/60" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none tabular-nums">
              {currentTime}
            </p>
            <p className="text-white/40 text-xs">Local Time</p>
          </div>
        </div>
      </div>
    </header>
  );
};
