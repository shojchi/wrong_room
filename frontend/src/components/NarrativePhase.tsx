import React, { useEffect, useState } from 'react';
import { Ghost, Play, Volume2 } from 'lucide-react';

interface NarrativePhaseProps {
  transcript: string;
  isAudioPlaying: boolean;
  onContinue?: () => void;
  canContinue: boolean;
}

export const NarrativePhase: React.FC<NarrativePhaseProps> = ({ 
  transcript, 
  isAudioPlaying, 
  onContinue,
  canContinue 
}) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (isAudioPlaying) {
      const interval = setInterval(() => {
        setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isAudioPlaying]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-black/40 rounded-3xl border border-purple-500/20 backdrop-blur-md animate-in fade-in zoom-in duration-500">
      <div className="relative mb-12">
        {/* Animated Rings for Audio Visualization */}
        <div className={`absolute inset-0 rounded-full bg-purple-500/10 blur-xl transition-all duration-300 ${isAudioPlaying ? 'scale-150 animate-pulse' : 'scale-100'}`} />
        <div className={`absolute inset-0 rounded-full border-2 border-purple-500/30 transition-all duration-700 ${isAudioPlaying ? 'scale-110 opacity-100' : 'scale-95 opacity-0'}`} />
        
        <div className={`relative z-10 w-32 h-32 rounded-full bg-linear-to-br from-purple-800 to-indigo-900 flex items-center justify-center border-4 border-black/50 shadow-[0_0_50px_rgba(139,92,246,0.3)] transition-transform duration-500 ${isAudioPlaying ? 'scale-110' : 'scale-100'}`}>
          <Ghost className={`w-16 h-16 text-purple-200 transition-all duration-500 ${isAudioPlaying ? 'animate-bounce text-white drop-shadow-[0_0_10px_rgba(167,139,250,0.8)]' : ''}`} />
        </div>

        {isAudioPlaying && (
          <div className="absolute -top-4 -right-4 bg-purple-500 text-white p-2 rounded-full animate-bounce shadow-lg">
            <Volume2 className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-indigo-300 mb-6 drop-shadow-sm font-serif italic">
          The Grim Game Master Speaks...
        </h2>

        {/* Dynamic Transcript Area */}
        <div className="min-h-[120px] mb-8 relative">
          <div className="absolute inset-0 bg-black/20 rounded-xl -m-4 blur-sm" />
          <p className="relative text-xl text-purple-100/90 leading-relaxed font-serif animate-in slide-in-from-bottom-2 duration-700">
            {transcript || "Waiting for the void..."}
            {isAudioPlaying && <span className="inline-block w-8 text-left">{dots}</span>}
          </p>
        </div>

        {/* Control Button - Only active when transcript is ready and audio is done */}
        <div className="flex justify-center transition-opacity duration-500" style={{ opacity: canContinue ? 1 : 0.3 }}>
          <button
            onClick={onContinue}
            disabled={!canContinue}
            className={`group flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all 
              ${canContinue 
                ? 'bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] cursor-pointer' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
          >
            {canContinue ? (
              <>
                <span>Enter the Challenge</span>
                <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            ) : (
              <span>Listening to the darkness...</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
