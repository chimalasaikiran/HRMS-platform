import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error = '',
  leftIcon: LeftIcon,
  hint = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordType = type === 'password';
  const actualType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-600 mb-1.5 capitalize"
        >
          {label}
          {required && <span className="text-amber-700 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {LeftIcon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          type={actualType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full px-4 py-2.5 text-sm rounded-xl bg-white border text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:outline-none ${
            LeftIcon ? 'pl-10' : ''
          } ${isPasswordType ? 'pr-11' : ''} ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-[#e6e1d5] focus:border-[#1c3541] focus:ring-2 focus:ring-[#1c3541]/10'
          }`}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600 flex items-center gap-1">
          <span>•</span> {error}
        </p>
      )}
    </div>
  );
};
