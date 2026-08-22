import React from 'react';

export const AuthTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-8 border-b border-[#e8e4db] pb-3 mb-8">
      <button
        type="button"
        onClick={() => onTabChange('signin')}
        className={`font-semibold text-sm sm:text-base transition-colors relative pb-3 -mb-[13px] cursor-pointer ${
          activeTab === 'signin'
            ? 'text-[#1c3541]'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        Sign in
        {activeTab === 'signin' && (
          <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#c89e60] rounded-full animate-fade-in" />
        )}
      </button>

      <button
        type="button"
        onClick={() => onTabChange('signup')}
        className={`font-semibold text-sm sm:text-base transition-colors relative pb-3 -mb-[13px] cursor-pointer ${
          activeTab === 'signup'
            ? 'text-[#1c3541]'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        Create account
        {activeTab === 'signup' && (
          <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#c89e60] rounded-full animate-fade-in" />
        )}
      </button>
    </div>
  );
};
