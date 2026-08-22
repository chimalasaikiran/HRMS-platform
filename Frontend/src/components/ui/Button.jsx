import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  onClick,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  fullWidth = true,
  className = '',
  icon: Icon = ArrowRight
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-medium px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-sm';

  const variants = {
    primary:
      'bg-[#1c3541] text-white hover:bg-[#142630] focus:ring-4 focus:ring-[#1c3541]/20 shadow-md',
    secondary:
      'bg-white text-slate-700 border border-[#e4dfd3] hover:bg-[#f8f6f0] focus:ring-2 focus:ring-slate-200',
    outline:
      'bg-transparent text-[#1c3541] border border-[#1c3541] hover:bg-[#1c3541]/5'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white/80" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {Icon && <Icon className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
        </>
      )}
    </button>
  );
};
