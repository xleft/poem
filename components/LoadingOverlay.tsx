
import React from 'react';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = "寻访中..." }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#f5f5f4] overflow-hidden">
      
      {/* Define SVG Filters for the Ink/Paper Effect */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="ink-wash-landscape">
            {/* Creates the rough, bleeding edge effect for ink */}
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" />
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
           <filter id="paper-texture">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" stitchTiles="stitch" />
          </filter>
        </defs>
      </svg>

      {/* Background Paper Texture */}
      <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' filter='url(%23paper-texture)' opacity='0.5'/%3E%3C/svg%3E")`
           }}>
      </div>

      {/* Ink Wash Landscape Layers */}
      <div className="absolute inset-0 flex items-end justify-center opacity-90 pointer-events-none">
          <svg viewBox="0 0 1200 800" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
              <defs>
                  <linearGradient id="mist-gradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#f5f5f4" stopOpacity="0" />
                      <stop offset="40%" stopColor="#f5f5f4" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#f5f5f4" stopOpacity="1" />
                  </linearGradient>
              </defs>

              {/* Distant Mountain (Faint) */}
              <path 
                d="M0,800 L0,500 C150,480 300,550 450,520 C600,490 750,400 900,450 C1050,500 1200,480 1200,500 L1200,800 Z" 
                fill="#d6d3d1" 
                filter="url(#ink-wash-landscape)"
                opacity="0.5"
              />
              
              {/* Middle Mountain (Medium) */}
              <path 
                d="M0,800 L0,650 C200,600 400,680 600,620 C800,560 1000,650 1200,600 L1200,800 Z" 
                fill="#a8a29e" 
                filter="url(#ink-wash-landscape)"
                opacity="0.7"
              />

              {/* Foreground Mountain (Dark) */}
              <path 
                d="M0,800 L0,750 C250,700 500,780 700,720 C900,660 1100,750 1200,700 L1200,800 Z" 
                fill="#57534e" 
                filter="url(#ink-wash-landscape)"
              />
              
              {/* Mist Overlay */}
              <rect x="0" y="400" width="1200" height="400" fill="url(#mist-gradient)" />
          </svg>
      </div>

      {/* Text Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full pointer-events-none pb-32">
        <div className="bg-[#f5f5f4]/30 backdrop-blur-[2px] px-10 py-8 rounded-2xl border border-white/20 shadow-sm">
            <div className="flex flex-col items-center gap-6">
                {/* Minimalist Spinner */}
                <div className="w-10 h-10 border-2 border-stone-800/50 border-t-stone-800 rounded-full animate-spin"></div>
                
                <h2 className="text-4xl md:text-5xl font-calligraphy text-stone-900 tracking-[0.2em] drop-shadow-lg animate-pulse">
                    {message}
                </h2>
                <p className="text-stone-600 font-serif tracking-[0.3em] text-sm opacity-80">
                    云深不知处 · 意恐迟迟归
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
