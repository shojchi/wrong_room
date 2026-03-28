import type { GameItem } from '../lib/stateMachine';
import { motion } from 'framer-motion';

interface ItemCardProps {
  item: GameItem;
  onClick?: () => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  // Map tags to colors for dark fantasy aesthetic (red=combat, purple=magic, blue=utility)
  const getGlowClass = () => {
    switch (item.mechanicTag) {
      case 'combat': return 'shadow-[0_0_40px_-10px_rgba(239,68,68,0.4)] border-red-950/50';
      case 'magic': return 'shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)] border-purple-950/50';
      case 'utility': return 'shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)] border-blue-950/50';
      default: return 'shadow-[0_0_40px_-10px_rgba(156,163,175,0.4)] border-gray-800';
    }
  };

  const getBlurClass = () => {
    switch (item.mechanicTag) {
      case 'combat': return 'bg-red-500/20';
      case 'magic': return 'bg-purple-500/20';
      case 'utility': return 'bg-blue-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative w-full max-w-sm bg-[#161b22] rounded-2xl border ${getGlowClass()} p-5 flex flex-col justify-between overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform duration-300`}
      onClick={onClick}
    >
      {/* Background Ambience Layer */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-[#0a0f18]/90 z-0"></div>
      
      {/* Animated Glow layer */}
      <div className={`absolute -top-10 -right-10 w-48 h-48 ${getBlurClass()} blur-[60px] z-0 rounded-full transition-transform duration-700 ease-out group-hover:scale-[1.5] group-hover:translate-x-4 group-hover:-translate-y-4`}></div>
      
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        
        {/* Card Header */}
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500 mb-1 block drop-shadow-md">
            Dungeon Artifact
          </span>
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-white to-gray-500 mb-3 drop-shadow-sm pb-1 leading-tight">
            {item.name}
          </h2>
          <div className="h-[1px] w-12 bg-gray-700 mb-3"></div>
          <p className="text-gray-300 font-serif italic text-sm leading-relaxed antialiased">
            "{item.description}"
          </p>
        </div>
        
        {/* Card Footer / Requirements */}
        <div className="mt-6 pt-4 border-t border-gray-800/60">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center border border-gray-700/50 bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md">
              <div className={`w-2 h-2 rounded-full mr-2 bg-${item.mechanicTag === 'combat' ? 'red' : item.mechanicTag === 'magic' ? 'purple' : 'blue'}-500 shadow-[0_0_8px_currentColor]`}></div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-300">
                {item.mechanicTag}
              </span>
            </div>
            
            {onClick && (
              <span className="text-xs text-gray-500 ml-auto group-hover:text-white transition-colors uppercase tracking-widest font-semibold">
                Proceed
              </span>
            )}
          </div>
        </div>

      </div>
      
      {/* Glass overlay flash effect on hover */}
      <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full z-20"></div>
    </motion.div>
  );
}
