import React, { useState } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthTabs } from '../components/auth/AuthTabs';
import { SignInForm } from '../components/auth/SignInForm';
import { SignUpForm } from '../components/auth/SignUpForm';

export const AuthPage = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('signin');

  return (
    <AuthLayout>
      {/* Tab Switcher header */}
      <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Form Content */}
      {activeTab === 'signin' ? (
        <SignInForm
          onSwitchToSignUp={() => setActiveTab('signup')}
          onSuccessRedirect={onAuthSuccess}
        />
      ) : (
        <SignUpForm
          onSwitchToSignIn={() => setActiveTab('signin')}
          onSuccessRedirect={onAuthSuccess}
        />
      )}
    </AuthLayout>
  );
};
