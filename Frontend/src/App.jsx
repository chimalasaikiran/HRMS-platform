import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HrmsProvider } from './context/HrmsContext';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './components/dashboard/Dashboard';

const MainApp = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <AuthPage />
      )}
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <HrmsProvider>
        <MainApp />
      </HrmsProvider>
    </AuthProvider>
  );
}

