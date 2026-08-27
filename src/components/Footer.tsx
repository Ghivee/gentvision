import React from 'react';
import { Leaf } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#c4cb38]/30 py-8 pb-24 lg:pb-8 px-4 sm:px-6 lg:px-8 text-emerald-700/80 text-xs">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#1e6238] flex items-center justify-center text-white font-bold shadow-sm">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-extrabold text-emerald-950 font-sans">
            GENT<span className="text-[#1e6238]">-Vision</span>
          </span>
          <span className="text-emerald-600/70">•</span>
          <span className="text-emerald-800 font-medium">Smart Meat Packaging Platform</span>
        </div>

        {/* Copyright */}
        <div className="text-emerald-700/80 text-[11px]">
          © 2026 GENT-Vision Platform • Inovasi Kemasan Cerdas Daging Kolorimetri
        </div>

      </div>
    </footer>
  );
};
