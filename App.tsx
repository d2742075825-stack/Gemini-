import React, { Suspense } from 'react';
import Scene from './components/Scene';
import UI from './components/UI';

const App: React.FC = () => {
  return (
    <main className="w-full h-screen bg-black text-white overflow-hidden">
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
           <div className="text-[#D4AF37] font-serif tracking-widest animate-pulse">LOADING EXPERIENCE...</div>
        </div>
      }>
        <Scene />
      </Suspense>
      <UI />
    </main>
  );
};

export default App;