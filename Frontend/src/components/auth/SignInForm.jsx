import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleSelector } from './RoleSelector';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ApiStatusBadge } from '../ui/ApiStatusBadge';
import { AlertCircle, Mail, Lock } from 'lucide-react';

export const SignInForm = ({ onSwitchToSignUp, onSuccessRedirect }) => {
  const { login } = useAuth();

  const [role, setRole] = useState('ADMIN');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier || !password) {
      setErrorMessage('Please enter both Login ID / Email and password.');
      return;
    }

    try {
      setIsLoading(true);
      await login({ identifier, password, role });
      if (onSuccessRedirect) {
        onSuccessRedirect();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Incorrect credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="text-[#c89e60] text-xs font-bold uppercase tracking-[0.18em]">
            WELCOME BACK
          </div>
          <ApiStatusBadge />
        </div>
        <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#1c3541] mb-2 tracking-tight">
          Good to see you again.
        </h2>
        <p className="text-slate-500 text-sm">
          Sign in to pick up where you left off.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs sm:text-sm text-red-700 animate-fade-in shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Authentication Error</span>
            {errorMessage}
          </div>
        </div>
      )}

      <RoleSelector selectedRole={role} onChange={setRole} label="I'm signing in as" />

      <form onSubmit={handleSubmit} className="space-y-1">
        <Input
          id="signInIdentifier"
          label="Login ID or Email"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="OIJODO20220001 or john.doe@dayflow.com"
          leftIcon={Mail}
          required
        />

        <Input
          id="signInPassword"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          leftIcon={Lock}
          required
        />

        <div className="pt-3">
          <Button type="submit" isLoading={isLoading} fullWidth>
            Enter Dayflow
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-xs sm:text-sm text-slate-500">
        Need an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="text-[#c89e60] hover:text-[#b38749] font-bold underline cursor-pointer ml-0.5 transition-colors"
        >
          Create one
        </button>
      </div>
    </div>
  );
};

