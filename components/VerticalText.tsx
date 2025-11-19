import React from 'react';

interface VerticalTextProps {
  text: string | string[];
  className?: string;
  highlight?: boolean;
}

export const VerticalText: React.FC<VerticalTextProps> = ({ text, className = "", highlight = false }) => {
  const content = Array.isArray(text) ? text : [text];

  return (
    <div className={`flex flex-row-reverse gap-4 sm:gap-8 h-full overflow-x-auto no-scrollbar py-4 ${className}`}>
      {content.map((line, index) => (
        <div 
          key={index} 
          className={`[writing-mode:vertical-rl] text-lg sm:text-2xl tracking-[0.2em] leading-loose ${highlight ? 'font-bold text-stone-900' : 'text-stone-700'}`}
          style={{ textOrientation: 'upright' }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};