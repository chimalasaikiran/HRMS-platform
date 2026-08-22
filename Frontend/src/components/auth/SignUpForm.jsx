import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleSelector } from './RoleSelector';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ApiStatusBadge } from '../ui/ApiStatusBadge';
import { AlertCircle, Mail, Lock, User, Hash, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SignUpForm = ({ onSwitchToSignIn, onSuccessRedirect }) => {
  const { signup } = useAuth();

  const [role, setRole] = useState('Employee');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!employeeId || !email || !password || !fullName) {
      setErrorMessage('Please fill in all required fields to create your account.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      await signup({
        employeeId,
        email,
        password,
        fullName,
        role
      });

      // Celebration confetti effect on successful registration
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore confetti fallback
      }

      if (onSuccessRedirect) {
        onSuccessRedirect();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header section */}
      <div className="mb-5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="text-[#c89e60] text-xs font-bold uppercase tracking-[0.18em]">
            JOIN THE WORKSPACE
          </div>
          <ApiStatusBadge />
        </div>
        <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#1c3541] mb-2 tracking-tight">
          A better workday starts here.
        </h2>
        <p className="text-slate-500 text-sm">
          Set up your Dayflow account in a minute.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs sm:text-sm text-red-700 animate-fade-in shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Registration Error</span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Role Selection Toggle */}
      <RoleSelector selectedRole={role} onChange={setRole} label="I'm signing up as" />

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-0.5">
        <Input
          id="signUpEmpId"
          label="Employee ID"
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="e.g. EMP-2026-01"
          leftIcon={Hash}
          required
        />

        <Input
          id="signUpEmail"
          label="Work email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          leftIcon={Mail}
          required
        />

        <Input
          id="signUpPassword"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          leftIcon={Lock}
          required
        />

        <Input
          id="signUpFullName"
          label="Your name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          leftIcon={User}
          required
        />

        {/* Submit Button */}
        <div className="pt-3">
          <Button type="submit" isLoading={isLoading} fullWidth>
            Create my account
          </Button>
        </div>
      </form>

      {/* Bottom Switcher Link */}
      <div className="mt-5 text-center text-xs sm:text-sm text-slate-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="text-[#c89e60] hover:text-[#b38749] font-bold underline cursor-pointer ml-0.5 transition-colors"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};
