
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { INK_PATHS } from '../constants';

interface SplashScreenProps {
  onComplete: (lang: Language) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'select' | 'animating' | 'done'>('select');
  const [selectedLang, setSelectedLang] = useState<Language>('zh');
  const [typedText, setTypedText] = useState("");

  // Typewriter effect logic for English
  useEffect(() => {
    if (stage === 'animating' && selectedLang === 'en') {
      const text = "Poem Paper";
      let i = 0;
      const timer = setInterval(() => {
        setTypedText(text.substring(0, i + 1));
        i++;
        if (i === text.length) {
            clearInterval(timer);
            setTimeout(() => onComplete('en'), 1500);
        }
      }, 150);
      return () => clearInterval(timer);
    }
  }, [stage, selectedLang, onComplete]);

  // Ink effect logic for Chinese
  useEffect(() => {
    if (stage === 'animating' && selectedLang === 'zh') {
        setTimeout(() => onComplete('zh'), 3500);
    }
  }, [stage, selectedLang, onComplete]);

  const handleSelect = (lang: Language) => {
    setSelectedLang(lang);
    setStage('animating');
  };

  if (stage === 'select') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f5f5f4]">
         <div className="flex flex-col gap-8">
             <button 
                onClick={() => handleSelect('zh')}
                className="group relative overflow-hidden px-12 py-4 border-2 border-stone-800 rounded-full transition-all duration-500 hover:bg-stone-800"
             >
                <span className="relative z-10 text-2xl font-calligraphy text-stone-800 group-hover:text-stone-50 transition-colors">
                   中文版
                </span>
             </button>

             <button 
                onClick={() => handleSelect('en')}
                className="group relative overflow-hidden px-12 py-4 border-2 border-stone-800 rounded-full transition-all duration-500 hover:bg-stone-800"
             >
                <span className="relative z-10 text-xl font-serif text-stone-800 group-hover:text-stone-50 transition-colors tracking-widest">
                   ENGLISH
                </span>
             </button>
         </div>
         <div className="absolute bottom-12 text-stone-400 text-xs tracking-widest font-serif">
            SHI YIN · POETRY HERMIT
         </div>
      </div>
    );
  }

  // English Animation (Typewriter)
  if (selectedLang === 'en') {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f0ebe5]">
            <h1 className="text-5xl font-serif font-bold text-stone-800 tracking-widest border-r-4 border-stone-800 pr-2 animate-pulse">
                {typedText}
            </h1>
        </div>
      );
  }

  // Chinese Animation (Ink Drop)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f5f5f4] overflow-hidden">
        {/* Ink Animation reused from LoadingOverlay but simplified/focused for intro */}
        <div className="relative flex items-center justify-center">
            <svg className="absolute w-0 h-0">
                <filter id="splash-ink-spread">
                    <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="4" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" />
                    <feGaussianBlur stdDeviation="0.5" />
                </filter>
            </svg>
            
            <div className="w-[1000px] h-[1000px] absolute opacity-0 animate-[ink-spread_3s_ease-out_forwards]">
                 <div className="w-full h-full bg-stone-900 rounded-full blur-xl" style={{ filter: 'url(#splash-ink-spread)' }}></div>
            </div>

            <div className="relative z-10 opacity-0 animate-[fade-in_1s_ease-out_2s_forwards]">
                <h1 className="text-8xl font-calligraphy text-stone-50 drop-shadow-xl">
                    诗隐
                </h1>
            </div>
        </div>
        <style>{`
            @keyframes ink-spread {
                0% { transform: scale(0); opacity: 0.8; }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes fade-in {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
        `}</style>
    </div>
  );
};
