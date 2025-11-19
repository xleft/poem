
import React from 'react';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = "寻访中..." }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#f5f5f4] overflow-hidden">
      
      {/* Define SVG Filters for the Ink Effect */}
      <svg className="absolute w-0 h-0">
        <defs>
          {/* Filter for rough edges to look like dry brush on paper */}
          <filter id="brush-texture">
            <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" />
          </filter>
        </defs>
      </svg>

      {/* Background Noise Texture */}
      <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
           }}>
      </div>

      {/* Rapid Brush Stroke Animation Container */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
         <div className="relative w-[120%] h-48">
             {/* The Brush Stroke SVG */}
             <svg viewBox="0 0 600 100" className="w-full h-full" preserveAspectRatio="none">
                <path 
                   d="M-50,50 C100,30 300,70 650,50" 
                   stroke="#1c1917" 
                   strokeWidth="60" 
                   fill="none" 
                   style={{
                       filter: 'url(#brush-texture)',
                       strokeDasharray: 800,
                       strokeDashoffset: 800,
                       animation: 'draw-stroke 2s cubic-bezier(0.25, 1, 0.5, 1) infinite'
                   }}
                />
                {/* Secondary splash stroke for detail */}
                <path 
                   d="M0,60 C150,40 350,80 600,60" 
                   stroke="#44403c" 
                   strokeWidth="20" 
                   fill="none" 
                   opacity="0.5"
                   style={{
                       filter: 'url(#brush-texture)',
                       strokeDasharray: 800,
                       strokeDashoffset: 800,
                       animation: 'draw-stroke 2s cubic-bezier(0.25, 1, 0.5, 1) infinite 0.1s'
                   }}
                />
             </svg>
         </div>
      </div>

      {/* Text Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full pointer-events-none">
        <div className="bg-[#f5f5f4]/20 backdrop-blur-[1px] p-12 rounded-full">
            <div className="flex flex-col items-center gap-8">
                <h2 className="text-5xl md:text-7xl font-calligraphy text-stone-900 tracking-[0.2em] drop-shadow-lg animate-pulse">
                    {message}
                </h2>
                <p className="text-stone-700 font-serif tracking-[0.5em] text-sm md:text-base opacity-80">
                    墨韵流转 · 意境自生
                </p>
            </div>
        </div>
      </div>
      
      <style>{`
         @keyframes draw-stroke {
             0% { stroke-dashoffset: 800; opacity: 0; }
             10% { opacity: 1; }
             50% { stroke-dashoffset: 0; opacity: 1; }
             80% { stroke-dashoffset: 0; opacity: 0; }
             100% { stroke-dashoffset: 0; opacity: 0; }
         }
      `}</style>
    </div>
  );
};
