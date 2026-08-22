import React from 'react';
import { ArrowRight } from 'lucide-react';

export const TodayPresenceCard = ({ onDirectoryClick }) => {
  const present = 3;
  const leave = 1;
  const away = 0;
  const total = 4;

  return (
    <div className="bg-[#faf8f5] sm:bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs flex flex-col justify-between">
      <div>
        {/* Header Tag & Title */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#a88243] font-mono">
            ACROSS THE ORG
          </span>
          <button
            type="button"
            onClick={onDirectoryClick}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b5832a] hover:text-[#1c3541] transition-colors cursor-pointer"
          >
            <span>Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <h3 className="font-serif-title text-xl font-bold text-[#1c3541] mb-6">
          Today's presence
        </h3>

        {/* Radial SVG Donut Chart */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle stroke */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#edf2f7"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Present Arc (75%) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#68d391"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset="62.8"
                strokeLinecap="round"
                className="transition-all duration-700"
              />
              {/* On Leave Arc (25%) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#e5b869"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset="188.4"
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-serif-title text-4xl font-bold text-[#1c3541] leading-none mb-1">
                {present}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                of {total} present
              </span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#68d391]" />
              <span>Present <strong className="text-slate-800">{present}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e5b869]" />
              <span>On leave <strong className="text-slate-800">{leave}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span>Away <strong className="text-slate-800">{away}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
