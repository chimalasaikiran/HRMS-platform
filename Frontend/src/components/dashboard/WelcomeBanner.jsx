import React, { useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const WelcomeBanner = () => {
  const { currentUser } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  // Extract first name (e.g., "Maya" from "Maya Chen")
  const firstName = currentUser?.fullName ? currentUser.fullName.split(' ')[0] : 'Maya';

  const handleExportSnapshot = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    }, 800);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-[#a88243] mb-1.5 font-mono">
          TUESDAY, MARCH 18, 2025
        </div>
        <h1 className="font-serif-title text-4xl sm:text-5xl font-bold text-[#1c3541] tracking-tight leading-none mb-2">
          Good morning, {firstName}.
        </h1>
        <p className="text-slate-600 text-sm sm:text-base font-normal">
          Here's the shape of your team's day so far.
        </p>
      </div>

      <div className="shrink-0">
        <button
          type="button"
          onClick={handleExportSnapshot}
          disabled={exporting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1c3541] hover:bg-[#28495a] text-white font-semibold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-75"
        >
          {exported ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Snapshot Exported</span>
            </>
          ) : exporting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-[#e5b869]" />
              <span>Export snapshot</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
