import React from 'react';
import { useStore } from '../store';
import { TreeState } from '../types';

const UI: React.FC = () => {
  const { mode, toggleMode } = useStore();

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      {/* Header */}
      <header className="flex flex-col items-center mt-4 opacity-90">
        <h2 className="text-gold-400 tracking-[0.3em] text-xs uppercase mb-2">Arix Signature</h2>
        <h1 className="text-4xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFF8E7] to-[#D4AF37] drop-shadow-lg text-center">
          Holiday Collection
        </h1>
      </header>

      {/* Controls */}
      <div className="flex flex-col items-center mb-12 pointer-events-auto">
        <button
          onClick={toggleMode}
          className={`
            group relative px-8 py-3 overflow-hidden rounded-full 
            transition-all duration-500 ease-out
            border border-[#D4AF37]/30 backdrop-blur-md
            ${mode === TreeState.TREE_SHAPE ? 'bg-[#00241B]/80' : 'bg-transparent'}
          `}
        >
          <span className={`
            absolute inset-0 w-full h-full bg-gradient-to-r from-[#D4AF37] to-[#FEEAA6] 
            opacity-0 group-hover:opacity-20 transition-opacity duration-500
          `} />
          
          <div className="flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${mode === TreeState.TREE_SHAPE ? 'bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]' : 'bg-gray-500'}`} />
             <span className="font-serif text-[#FFF8E7] tracking-widest text-sm">
                {mode === TreeState.TREE_SHAPE ? 'DISSOLVE' : 'ASSEMBLE'}
             </span>
          </div>
        </button>
        
        <p className="mt-4 text-[#D4AF37]/60 text-xs tracking-widest uppercase text-center">
            Interactive 3D Experience
        </p>
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-[#D4AF37]/20 m-6 rounded-tl-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-[#D4AF37]/20 m-6 rounded-tr-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b border-l border-[#D4AF37]/20 m-6 rounded-bl-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-[#D4AF37]/20 m-6 rounded-br-3xl pointer-events-none" />
    </div>
  );
};

export default UI;