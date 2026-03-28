import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Skull } from 'lucide-react';

interface SanityBarProps {
  sanity: number;
  maxSanity: number;
}

export const SanityBar: React.FC<SanityBarProps> = ({ sanity, maxSanity }) => {
  const percentage = (sanity / maxSanity) * 100;
  const isCritical = percentage <= 30;

  return (
    <div className="w-full max-w-xs mx-auto mb-8">
      <div className="flex justify-between items-end mb-2 px-1">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">
          Soul Fragments
        </span>
        <span className={`text-xs font-mono font-bold ${isCritical ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
          {sanity}/{maxSanity}
        </span>
      </div>
      
      <div className="h-2 w-full bg-black/50 rounded-full border border-white/10 p-[2px] overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className={`h-full rounded-full ${
            isCritical 
              ? 'bg-linear-to-r from-red-600 to-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
              : 'bg-linear-to-r from-purple-600 to-indigo-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
          }`}
        />
      </div>

      <div className="flex justify-between mt-2 opacity-20">
        <Skull className="w-3 h-3 text-red-500" />
        <Heart className="w-3 h-3 text-purple-500" />
      </div>
    </div>
  );
};
