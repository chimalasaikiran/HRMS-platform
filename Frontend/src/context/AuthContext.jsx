import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

const INITIAL_DEMO_USERS = [
  {
    employeeId: 'HR-2025-01',
    email: 'maya.chen@dayflow.work',
    password: 'password123',
    fullName: 'Maya Chen',
    role: 'HR / People team',
    department: 'People Operations',
    joinedDate: 'Jan 2024',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    employeeId: 'EMP-2025-88',
    email: 'alex.morgan@dayflow.work',
    password: 'password123',
    fullName: 'Alex Morgan',
    role: 'Employee',
    department: 'Engineering',
    joinedDate: 'Mar 2024',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  }
];

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('dayflow_users');
    if (savedUsers) {
      try {
        return JSON.parse(savedUsers);
      } catch (e) {
        console.error('Failed to parse saved users', e);
      }
    }
    localStorage.setItem('dayflow_users', JSON.stringify(INITIAL_DEMO_USERS));
    return INITIAL_DEMO_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedSession = localStorage.getItem('dayflow_session');
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch (e) {
        console.error('Failed to parse current session', e);
      }
    }
    return null;
  });

  // Sync users list to localStorage on change
  useEffect(() => {
    localStorage.setItem('dayflow_users', JSON.stringify(users));
  }, [users]);

  // Sync active user session to localStorage on change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dayflow_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dayflow_session');
    }
  }, [currentUser]);

  // Login handler
  const login = async ({ email, password, role }) => {
    const formattedEmail = email.trim().toLowerCase();
    const payload = { email: formattedEmail, password, role };

    try {
      // Attempt backend API call to http://192.168.0.244:5000/api or http://100.64.1.27:5000/api
      const apiResult = await authApi.login(payload);
      const userFromBackend = apiResult.data?.user || apiResult.data;

      const activeUserSession = {
        employeeId: userFromBackend?.employeeId || userFromBackend?.id || 'EMP-' + Math.floor(1000 + Math.random() * 9000),
        email: userFromBackend?.email || formattedEmail,
        fullName: userFromBackend?.fullName || userFromBackend?.name || formattedEmail.split('@')[0],
        role: role || userFromBackend?.role || 'Employee',
        department: userFromBackend?.department || 'General Staff',
        token: apiResult.data?.token || apiResult.data?.accessToken,
        backendConnected: true,
        connectedUrl: apiResult.baseUrl
      };

      setCurrentUser(activeUserSession);
      return activeUserSession;
    } catch (apiErr) {
      console.warn('[AuthContext] Backend API login attempt:', apiErr.message);

      // If error is HTTP 400/401/403/404 from backend server, rethrow error to form
      if (apiErr.status) {
        throw new Error(apiErr.message || 'Authentication failed. Please verify email and password.');
      }

      // If backend network is unavailable (e.g. timeout / connection refused), fall back to local demo users
      const foundUser = users.find(
        (u) => u.email.toLowerCase() === formattedEmail
      );

      if (!foundUser) {
        throw new Error(`Unable to connect to backend server (${apiErr.message}). Demo fallback: No local account found with this email.`);
      }

      if (foundUser.password !== password) {
        throw new Error('Incorrect password. Please verify your credentials and try again.');
      }

      const activeUserSession = {
        ...foundUser,
        role: role || foundUser.role,
        backendConnected: false
      };

      setCurrentUser(activeUserSession);
      return activeUserSession;
    }
  };

  // Sign up handler
  const signup = async ({ employeeId, email, password, fullName, role }) => {
    const formattedEmail = email.trim().toLowerCase();
    const formattedEmpId = employeeId.trim().toUpperCase();

    const payload = {
      employeeId: formattedEmpId,
      email: formattedEmail,
      password: password,
      fullName: fullName.trim(),
      role: role || 'Employee'
    };

    try {
      // Attempt backend API call to http://192.168.0.244:5000/api or http://100.64.1.27:5000/api
      const apiResult = await authApi.signup(payload);
      const responseUser = apiResult.data?.user || apiResult.data;

      const newUser = {
        employeeId: responseUser?.employeeId || formattedEmpId,
        email: responseUser?.email || formattedEmail,
        fullName: responseUser?.fullName || fullName.trim() || 'New Teammate',
        role: responseUser?.role || role || 'Employee',
        department: responseUser?.department || (role === 'HR / People team' ? 'People Operations' : 'General Staff'),
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || 'User')}`,
        token: apiResult.data?.token || apiResult.data?.accessToken,
        backendConnected: true,
        connectedUrl: apiResult.baseUrl
      };

      setUsers((prevUsers) => [...prevUsers, newUser]);
      setCurrentUser(newUser);
      return newUser;
    } catch (apiErr) {
      console.warn('[AuthContext] Backend API signup attempt:', apiErr.message);

      // If error is specific server response (e.g. 400 user exists), rethrow error
      if (apiErr.status) {
        throw new Error(apiErr.message || 'Registration failed on server. Please check details.');
      }

      // If backend network is unreachable, check local store and register locally as fallback
      const existingEmail = users.find((u) => u.email.toLowerCase() === formattedEmail);
      if (existingEmail) {
        throw new Error('An account with this email address already exists.');
      }

      const existingEmpId = users.find((u) => u.employeeId.toUpperCase() === formattedEmpId);
      if (existingEmpId) {
        throw new Error('This Employee ID is already registered in the system.');
      }

      const newUser = {
        employeeId: formattedEmpId,
        email: formattedEmail,
        password: password,
        fullName: fullName.trim() || 'New Teammate',
        role: role || 'Employee',
        department: role === 'HR / People team' ? 'People Operations' : 'General Staff',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || 'User')}`,
        backendConnected: false
      };

      setUsers((prevUsers) => [...prevUsers, newUser]);
      setCurrentUser(newUser);
      return newUser;
    }
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
