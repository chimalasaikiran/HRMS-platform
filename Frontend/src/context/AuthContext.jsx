import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

const INITIAL_DEMO_USERS = [
  {
    loginId: 'OIHAAD20220001',
    email: 'hr@dayflow.com',
    password: 'Dayflow@123',
    fullName: 'Hari Admin',
    role: 'ADMIN',
    department: 'Human Resources',
    joinedDate: 'Jan 2022',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    loginId: 'OIJODO20220001',
    email: 'john.doe@dayflow.com',
    password: 'Dayflow@123',
    fullName: 'John Doe',
    role: 'EMPLOYEE',
    department: 'Engineering',
    joinedDate: 'Mar 2022',
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

  // Login handler accepting email or loginId as identifier
  const login = async ({ identifier, email, password, role }) => {
    const cleanId = (identifier || email || '').trim();
    const payload = { identifier: cleanId, password };

    try {
      const apiResult = await authApi.login(payload);
      const userFromBackend = apiResult.data?.user || apiResult.data;
      const rawRole = userFromBackend?.role || role || 'EMPLOYEE';
      const normalizedRole = (rawRole === 'ADMIN' || rawRole === 'HR / People team' || rawRole === 'Admin') ? 'ADMIN' : 'EMPLOYEE';

      const activeUserSession = {
        id: userFromBackend?.id || userFromBackend?._id,
        loginId: userFromBackend?.loginId || userFromBackend?.employeeId || cleanId,
        email: userFromBackend?.email || cleanId,
        fullName: userFromBackend?.name || userFromBackend?.fullName || cleanId.split('@')[0],
        role: normalizedRole,
        department: userFromBackend?.department || 'General Staff',
        token: apiResult.data?.token,
        mustChangePassword: !!apiResult.data?.mustChangePassword,
        backendConnected: true,
        connectedUrl: apiResult.baseUrl
      };

      setCurrentUser(activeUserSession);
      return activeUserSession;
    } catch (apiErr) {
      console.warn('[AuthContext] Backend API login fallthrough:', apiErr.message);

      if (apiErr.status) {
        throw new Error(apiErr.message || 'Authentication failed. Please check credentials.');
      }

      // Local fallback for offline mode
      const foundUser = users.find(
        (u) =>
          u.email.toLowerCase() === cleanId.toLowerCase() ||
          (u.loginId && u.loginId.toUpperCase() === cleanId.toUpperCase())
      );

      if (!foundUser) {
        throw new Error(`Unable to reach backend (${apiErr.message}). Demo mode: User not found.`);
      }

      if (foundUser.password !== password) {
        throw new Error('Incorrect password.');
      }

      const normalizedRole = (foundUser.role === 'ADMIN' || foundUser.role === 'HR / People team' || role === 'ADMIN') ? 'ADMIN' : 'EMPLOYEE';

      const activeUserSession = {
        ...foundUser,
        role: normalizedRole,
        backendConnected: false
      };

      setCurrentUser(activeUserSession);
      return activeUserSession;
    }
  };

  // Register company / admin handler
  const signup = async (payload) => {
    try {
      const registerPayload = {
        companyName: payload.companyName || payload.fullName || 'Company',
        adminName: payload.adminName || payload.fullName || 'Admin',
        email: payload.email,
        phone: payload.phone || '+91 9000000000',
        password: payload.password
      };
      const apiResult = await authApi.registerCompany(registerPayload);
      const userFromBackend = apiResult.data?.user || apiResult.data;

      const newUser = {
        id: userFromBackend?.id,
        loginId: userFromBackend?.loginId || 'OIADMIN20260001',
        email: payload.email,
        fullName: payload.fullName || payload.adminName,
        role: 'ADMIN',
        department: 'Human Resources',
        token: apiResult.data?.token,
        backendConnected: true
      };

      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      return newUser;
    } catch (apiErr) {
      if (apiErr.status) {
        throw new Error(apiErr.message || 'Registration failed.');
      }
      const newUser = {
        loginId: 'OIADMIN20260001',
        email: payload.email,
        password: payload.password,
        fullName: payload.fullName || payload.adminName,
        role: 'ADMIN',
        department: 'Human Resources',
        backendConnected: false
      };
      setUsers((prev) => [...prev, newUser]);
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
