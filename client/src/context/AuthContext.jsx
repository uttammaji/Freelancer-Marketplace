import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../data/mockUsers';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Default to 'freelancer' (Rahul Sharma) or 'client' (Sarah Connor) for rich demo experience
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('skillhire_auth_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error(e);
      }
    }
    // Default to client (Sarah Connor) or freelancer (Rahul Sharma)
    return mockUsers[0]; // Sarah Connor (Client)
  });

  const [role, setRole] = useState(() => currentUser?.role || 'client');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('skillhire_auth_user', JSON.stringify(currentUser));
      setRole(currentUser.role);
    } else {
      localStorage.removeItem('skillhire_auth_user');
      setRole('guest');
    }
  }, [currentUser]);

  const switchRole = (newRole) => {
    if (newRole === 'guest') {
      setCurrentUser(null);
      setRole('guest');
      return;
    }

    let targetUser = mockUsers.find(u => u.role === newRole);
    if (!targetUser) {
      targetUser = mockUsers[0];
    }
    setCurrentUser(targetUser);
    setRole(targetUser.role);
  };

  const login = (email, password, desiredRole = 'client') => {
    const matched = mockUsers.find(u => u.email === email) || mockUsers.find(u => u.role === desiredRole) || mockUsers[0];
    setCurrentUser(matched);
    setRole(matched.role);
    return matched;
  };

  const register = (userData) => {
    const newUser = {
      id: 'usr-' + Date.now(),
      name: userData.name || 'New Member',
      email: userData.email,
      role: userData.role || 'client',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      title: userData.role === 'freelancer' ? 'Professional Freelancer' : 'Project Sponsor',
      location: 'Remote, Global',
      memberSince: 'Just now',
      totalSpent: 0,
      totalEarned: 0,
      rating: 5.0,
      reviewsCount: 0,
      isVerified: true
    };
    setCurrentUser(newUser);
    setRole(newUser.role);
    return newUser;
  };

  const logout = () => {
    setCurrentUser(null);
    setRole('guest');
  };

  const updateProfile = (updates) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updates
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        role: currentUser?.role || 'guest',
        isAuthenticated: !!currentUser,
        switchRole,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
