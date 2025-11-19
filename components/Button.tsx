import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', icon, className = '', ...props }) => {
  const baseStyles = "relative overflow-hidden transition-all duration-500 font-serif tracking-widest flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-stone-900 text-stone-50 py-3 px-8 rounded-full hover:bg-stone-800 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
    secondary: "border border-stone-800 text-stone-800 py-2 px-6 rounded-full hover:bg-stone-200",
    icon: "p-3 text-stone-800 hover:bg-stone-200 rounded-full"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {icon && <span className="text-xl">{icon}</span>}
      {children}
    </button>
  );
};
