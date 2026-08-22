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
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  },
  {
    employeeId: 'EMP-2025-88',
    email: 'alex.morgan@dayflow.work',
    password: 'password123',
    fullName: 'Alex Morgan',
    role: 'Employee',
    department: 'Engineering',
    joinedDate: 'Mar 2024',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
];

function toDisplayRole(role) {
  if (!role) return 'Employee';
  const r = String(role);
  if (r === 'ADMIN' || r === 'HR / People team') return 'HR / People team';
  return 'Employee';
}

function buildSessionFromBackend(apiResult, fallback = {}) {
  const responseUser = apiResult.data?.user || apiResult.data || {};
  const fullName =
    responseUser.fullName ||
    responseUser.name ||
    fallback.fullName ||
    (responseUser.email || fallback.email || '').split('@')[0];

  return {
    id: responseUser.id || null,
    employeeId: responseUser.employeeId || fallback.employeeId || null,
    loginId: responseUser.loginId || fallback.loginId || fallback.employeeId || '',
    email: responseUser.email || fallback.email,
    fullName,
    role: toDisplayRole(responseUser.role) || toDisplayRole(fallback.role),
    department: responseUser.department || fallback.department || 'General Staff',
    companyId: responseUser.companyId || null,
    companyName: responseUser.companyName || '',
    avatar:
      responseUser.avatarUrl ||
      fallback.avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || 'User')}`,
    token: apiResult.data?.token || apiResult.data?.accessToken || null,
    backendConnected: true,
    connectedUrl: apiResult.baseUrl,
  };
}

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

  useEffect(() => {
    localStorage.setItem('dayflow_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dayflow_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dayflow_session');
    }
  }, [currentUser]);

  const login = async ({ email, password, role }) => {
    const formattedEmail = email.trim().toLowerCase();
    const payload = {
      email: formattedEmail,
      identifier: formattedEmail,
      password,
      role,
    };

    try {
      const apiResult = await authApi.login(payload);
      const activeUserSession = buildSessionFromBackend(apiResult, {
        email: formattedEmail,
        role,
      });
      setCurrentUser(activeUserSession);
      return activeUserSession;
    } catch (apiErr) {
      console.warn('[AuthContext] Backend API login attempt:', apiErr.message);

      if (apiErr.status) {
        throw new Error(
          apiErr.message || 'Authentication failed. Please verify email and password.'
        );
      }

      const foundUser = users.find((u) => u.email.toLowerCase() === formattedEmail);
      if (!foundUser) {
        throw new Error(
          `Unable to connect to backend server (${apiErr.message}). Demo fallback: No local account found with this email.`
        );
      }
      if (foundUser.password !== password) {
        throw new Error('Incorrect password. Please verify your credentials and try again.');
      }

      const activeUserSession = {
        ...foundUser,
        role: role || foundUser.role,
        backendConnected: false,
        token: null,
      };
      setCurrentUser(activeUserSession);
      return activeUserSession;
    }
  };

  const signup = async ({ employeeId, email, password, fullName, role }) => {
    const formattedEmail = email.trim().toLowerCase();
    const formattedEmpId = employeeId.trim().toUpperCase();

    const payload = {
      employeeId: formattedEmpId,
      email: formattedEmail,
      password,
      fullName: fullName.trim(),
      role: role || 'Employee',
    };

    try {
      const apiResult = await authApi.signup(payload);
      const newUser = buildSessionFromBackend(apiResult, {
        email: formattedEmail,
        fullName: fullName.trim(),
        role,
        loginId: formattedEmpId,
        department: role === 'HR / People team' ? 'People Operations' : 'General Staff',
      });

      setUsers((prevUsers) => [
        ...prevUsers,
        {
          employeeId: newUser.loginId || formattedEmpId,
          email: newUser.email,
          fullName: newUser.fullName,
          role: newUser.role,
          department: newUser.department,
        },
      ]);
      setCurrentUser(newUser);
      return newUser;
    } catch (apiErr) {
      console.warn('[AuthContext] Backend API signup attempt:', apiErr.message);

      if (apiErr.status) {
        throw new Error(apiErr.message || 'Registration failed on server. Please check details.');
      }

      const existingEmail = users.find((u) => u.email.toLowerCase() === formattedEmail);
      if (existingEmail) {
        throw new Error('An account with this email address already exists.');
      }
      const existingEmpId = users.find(
        (u) => String(u.employeeId || '').toUpperCase() === formattedEmpId
      );
      if (existingEmpId) {
        throw new Error('This Employee ID is already registered in the system.');
      }

      const newUser = {
        employeeId: formattedEmpId,
        loginId: formattedEmpId,
        email: formattedEmail,
        password,
        fullName: fullName.trim() || 'New Teammate',
        role: role || 'Employee',
        department: role === 'HR / People team' ? 'People Operations' : 'General Staff',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || 'User')}`,
        backendConnected: false,
        token: null,
      };

      setUsers((prevUsers) => [...prevUsers, newUser]);
      setCurrentUser(newUser);
      return newUser;
    }
  };

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
        logout,
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
