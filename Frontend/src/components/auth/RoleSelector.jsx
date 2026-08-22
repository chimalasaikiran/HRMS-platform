import React from 'react';
import { ShieldCheck, User } from 'lucide-react';

export const RoleSelector = ({ selectedRole, onChange, label = "I'm signing in as" }) => {
  const isAdmin = selectedRole === 'ADMIN' || selectedRole === 'HR / People team';
  return (
    <div className="mb-5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('ADMIN')}
          className={`flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            isAdmin
              ? 'bg-[#f4efe4] border-[#d8c5a4] text-[#1c3541] shadow-xs ring-2 ring-[#d8c5a4]/30'
              : 'bg-white/80 border-[#e8e4db] text-slate-600 hover:bg-[#f9f7f2] hover:border-[#dcd5c9]'
          }`}
        >
          <ShieldCheck
            className={`w-4 h-4 transition-colors ${
              isAdmin ? 'text-[#1c3541]' : 'text-slate-400'
            }`}
          />
          <span>Admin / HR</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('EMPLOYEE')}
          className={`flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            !isAdmin
              ? 'bg-[#f4efe4] border-[#d8c5a4] text-[#1c3541] shadow-xs ring-2 ring-[#d8c5a4]/30'
              : 'bg-white/80 border-[#e8e4db] text-slate-600 hover:bg-[#f9f7f2] hover:border-[#dcd5c9]'
          }`}
        >
          <User
            className={`w-4 h-4 transition-colors ${
              !isAdmin ? 'text-[#1c3541]' : 'text-slate-400'
            }`}
          />
          <span>Employee</span>
        </button>
      </div>
    </div>
  );
};

