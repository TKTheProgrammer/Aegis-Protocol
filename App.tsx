import React from 'react';
import { GameCanvas } from './components/GameCanvas';

function App() {
  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      {/* Game Layer */}
      <div className="absolute inset-0 z-0">
        <GameCanvas />
      </div>

      {/* CRT Scanline Overlay */}
      <div className="pointer-events-none absolute inset-0 z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none" />
      
      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 z-40 bg-[radial-gradient(circle,rgba(0,0,0,0)_60%,rgba(0,0,0,0.6)_100%)]" />

      {/* Subtle CRT Flicker Animation via internal style since we can't use ext CSS */}
      <style>{`
        @keyframes flicker {
          0% { opacity: 0.97; }
          5% { opacity: 0.95; }
          10% { opacity: 0.9; }
          15% { opacity: 0.95; }
          20% { opacity: 0.99; }
          100% { opacity: 0.9; }
        }
        .crt-flicker {
            animation: flicker 0.15s infinite;
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 z-50 bg-white/5 opacity-[0.02] crt-flicker mix-blend-overlay"></div>
    </div>
  );
}

export default App;