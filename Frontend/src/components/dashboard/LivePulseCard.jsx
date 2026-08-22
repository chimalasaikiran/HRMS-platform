import React from 'react';
import { ArrowRight } from 'lucide-react';

export const LivePulseCard = ({ onViewAttendance }) => {
  const days = [
    { label: 'M', height: '65%', active: false },
    { label: 'T', height: '80%', active: false },
    { label: 'W', height: '75%', active: false },
    { label: 'T', height: '85%', active: false },
    { label: 'F', height: '70%', active: false },
    { label: 'S', height: '90%', active: false },
    { label: 'T', height: '100%', active: true } // Current day highlighted in mustard gold
  ];

  return (
    <div className="relative overflow-hidden bg-[#1d3b45] text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-lg border border-[#2c4e5a]">
      {/* Background SVG decorative arcs */}
      <svg
        className="absolute right-0 top-0 h-full w-auto opacity-25 pointer-events-none"
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="350" cy="150" r="140" stroke="#e5b869" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle cx="350" cy="150" r="200" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
        <circle cx="350" cy="150" r="260" stroke="#ffffff" strokeWidth="0.8" opacity="0.15" />
      </svg>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left Column Text Content */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#e5b869] text-[10px] font-semibold tracking-widest uppercase mb-4 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#e5b869] pulse-soft" />
            <span>LIVE PULSE</span>
          </div>

          <h2 className="font-serif-title text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 leading-tight">
            People are <span className="text-[#e5b869] italic font-normal">in motion.</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Keep a clear view of the workday, without chasing updates across five tabs.
          </p>

          <button
            type="button"
            onClick={onViewAttendance}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#e5b869] hover:text-white transition-colors cursor-pointer group"
          >
            <span>View attendance</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Right Column Chart & Attendance Rate Stat Block */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 bg-black/20 backdrop-blur-xs p-5 sm:p-6 rounded-2xl border border-white/10">
          {/* Bar Chart */}
          <div className="flex items-end gap-3.5 h-32 pt-4 px-2 border-b sm:border-b-0 sm:border-r border-white/10 pb-3 sm:pb-0 sm:pr-8">
            {days.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-4 bg-white/20 rounded-full flex items-end h-full overflow-hidden">
                  <div
                    style={{ height: day.height }}
                    className={`w-full rounded-full transition-all duration-500 ${
                      day.active ? 'bg-[#e5b869]' : 'bg-[#5c8290]'
                    }`}
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-300 font-semibold">{day.label}</span>
              </div>
            ))}
          </div>

          {/* Stat Block */}
          <div className="text-center sm:text-left">
            <div className="text-xs text-slate-300 font-medium mb-1">
              Attendance rate
            </div>
            <div className="font-serif-title text-4xl sm:text-5xl font-bold text-[#e5b869] tracking-tight mb-1">
              92.4%
            </div>
            <div className="text-[11px] text-slate-300 font-medium">
              +2.8% from last week
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
