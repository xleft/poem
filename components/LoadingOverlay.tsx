
import React from 'react';
import { INK_PATHS } from '../constants';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = "寻访中..." }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#f5f5f4] overflow-hidden">
      
      {/* Define SVG Filters for the Ink Effect */}
      <svg className="absolute w-0 h-0">
        <defs>
          {/* Filter to create the bleeding/rough edge of ink on paper */}
          <filter id="ink-spread">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
          
          {/* Filter to create a flowing liquid distortion */}
          <filter id="ink-flow">
            <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="2" result="turbulence">
              <animate attributeName="baseFrequency" values="0.01;0.02;0.01" dur="8s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="40" />
          </filter>
        </defs>
      </svg>

      {/* Background Noise Texture */}
      <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
           }}>
      </div>

      {/* Main Ink Vortex Container */}
      <div className="relative w-full h-full flex items-center justify-center scale-110 md:scale-150">
        
        {/* Rotating Layer 1 (Clockwise) */}
        <div className="absolute w-[600px] h-[600px] animate-[spin_40s_linear_infinite] opacity-80 mix-blend-multiply">
           <div className="w-full h-full" style={{ filter: 'url(#ink-spread)' }}>
             <svg viewBox="0 0 200 200" className="w-full h-full fill-stone-900">
               <path d={INK_PATHS[0]} transform="scale(1.8) translate(-45, -45)" />
             </svg>
           </div>
        </div>

        {/* Rotating Layer 2 (Counter-Clockwise) */}
        <div className="absolute w-[500px] h-[500px] animate-[spin_25s_linear_infinite_reverse] opacity-70 mix-blend-multiply">
           <div className="w-full h-full" style={{ filter: 'url(#ink-flow)' }}>
             <svg viewBox="0 0 200 200" className="w-full h-full fill-stone-800">
               <path d={INK_PATHS[1]} transform="scale(1.5) translate(-35, -35)" />
             </svg>
           </div>
        </div>

         {/* Rotating Layer 3 (Slow, Center) */}
         <div className="absolute w-[400px] h-[400px] animate-[spin_60s_linear_infinite] opacity-90 mix-blend-multiply">
           <div className="w-full h-full" style={{ filter: 'url(#ink-spread)' }}>
             <svg viewBox="0 0 200 200" className="w-full h-full fill-black">
               <path d={INK_PATHS[2]} transform="scale(1.2) translate(-20, -20)" />
             </svg>
           </div>
        </div>

      </div>

      {/* Text Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full pointer-events-none">
        <div className="bg-[#f5f5f4]/10 backdrop-blur-[2px] p-12 rounded-full shadow-2xl border border-white/10">
            <div className="flex flex-col items-center gap-8">
                <h2 className="text-5xl md:text-7xl font-calligraphy text-stone-900 tracking-[0.2em] drop-shadow-lg animate-pulse">
                    {message}
                </h2>
                <div className="w-[2px] h-24 bg-gradient-to-b from-stone-900 to-transparent opacity-60"></div>
                <p className="text-stone-700 font-serif tracking-[0.5em] text-sm md:text-base">
                    神游太虚 · 意会古今
                </p>
            </div>
        </div>
      </div>
      
    </div>
  );
};
