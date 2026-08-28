// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth.service';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('skillhire_token');
    const savedUser = localStorage.getItem('skillhire_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user:', e);
        localStorage.removeItem('skillhire_user');
        localStorage.removeItem('skillhire_token');
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (token) {
      localStorage.setItem('skillhire_token', token);
    } else {
      localStorage.removeItem('skillhire_token');
    }
  }, [token]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('skillhire_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('skillhire_user');
    }
  }, [currentUser]);

  // Register - Step 1: Send user data, get OTP
  const register = async (userData) => {
    try {
      const response = await authService.registerUser(userData);
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // Verify Registration - Step 2: Verify OTP, get token
  const verifyRegistration = async (email, otp) => {
    try {
      const response = await authService.verifyRegistration(email, otp);
      
      if (response.token) {
        setToken(response.token);
        setCurrentUser(response.user);
      }
      
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Verification failed' 
      };
    }
  };

  // Login - Step 1: Password check, get OTP
  const login = async (email, password) => {
    try {
      const response = await authService.loginUser(email, password);
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  // Verify Login - Step 2: Verify OTP, get token
  const verifyLogin = async (email, otp) => {
    try {
      const response = await authService.verifyLoginOTP(email, otp);
      
      if (response.token) {
        setToken(response.token);
        setCurrentUser(response.user);
      }
      
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Verification failed' 
      };
    }
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Request failed' 
      };
    }
  };

  // Reset Password
  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await authService.resetPassword(email, otp, newPassword);
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Reset failed' 
      };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logoutUser();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setToken(null);
      setCurrentUser(null);
    }
  };

  // Update profile
  const updateProfile = (updates) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Resend OTP helpers
  const resendRegistrationOTP = async (email) => {
    return authService.resendRegistrationOTP(email);
  };

  const resendLoginOTP = async (email) => {
    return authService.resendLoginOTP(email);
  };

  const resendResetOTP = async (email) => {
    return authService.resendResetOTP(email);
  };

  const value = {
    currentUser,
    user: currentUser,
    token,
    role: currentUser?.role || 'guest',
    isAuthenticated: !!currentUser && !!token,
    isLoading,
    register,
    verifyRegistration,
    login,
    verifyLogin,
    forgotPassword,
    resetPassword,
    logout,
    updateProfile,
    resendRegistrationOTP,
    resendLoginOTP,
    resendResetOTP,
  };

  return (
    <AuthContext.Provider value={value}>
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