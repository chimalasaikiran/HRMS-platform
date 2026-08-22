import React from 'react';

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#faf8f5] overflow-x-hidden font-sans">
      {/* Left Branding Showcase Panel */}
      <div className="w-full md:w-[45%] lg:w-[42%] xl:w-[40%] bg-[#1c3541] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden min-h-[420px] md:min-h-screen">
        {/* Subtle Background Radial/Circular Arch Graphics */}
        <div className="absolute -bottom-48 -left-36 w-[580px] h-[580px] rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -bottom-24 -left-12 w-[420px] h-[420px] rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-72 h-72 rounded-full bg-[#c89e60]/10 blur-3xl pointer-events-none animate-float-glow" />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#c89e60] text-[#1c3541] font-serif font-bold text-xl flex items-center justify-center shadow-md">
            d
          </div>
          <span className="font-serif-title font-bold text-2xl tracking-wide text-white">
            dayflow
          </span>
        </div>

        {/* Main Center Branding Content */}
        <div className="relative z-10 my-auto py-10 max-w-md">
          {/* Quote Symbol */}
          <div className="text-[#c89e60] text-5xl font-serif leading-none mb-4 opacity-90 select-none">
            “
          </div>

          {/* Display Headline */}
          <h1 className="font-serif-title text-4xl sm:text-5xl lg:text-5xl font-bold text-amber-50/95 leading-[1.12] mb-6 tracking-tight">
            Make room for the work that matters.
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed mb-8">
            Dayflow keeps the people side of work clear, calm, and moving.
          </p>

          {/* Accent Tagline */}
          <div className="text-[#c89e60] text-xs font-bold uppercase tracking-[0.2em]">
            PEOPLE OPERATIONS, WITH A PULSE.
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 font-light border-t border-white/10 pt-6">
          <span>© 2025 Dayflow</span>
          <span>Made for the humans at work</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full md:w-[55%] lg:w-[58%] xl:w-[60%] flex flex-col justify-center items-center p-6 sm:p-10 md:p-12 lg:p-16 relative bg-[#faf8f5]">
        <div className="w-full max-w-md my-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
