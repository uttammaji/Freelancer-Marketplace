// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth.service';
import * as profileService from '../services/profile.service';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // ============ STATE ============
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);           //  Profile state
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // ============ LOCAL STORAGE EFFECTS ============
  
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

  // Save token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('skillhire_token', token);
    } else {
      localStorage.removeItem('skillhire_token');
    }
  }, [token]);

  // Save user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('skillhire_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('skillhire_user');
    }
  }, [currentUser]);

  // ============ AUTH FUNCTIONS ============

  // Register - Step 1
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

  // Verify Registration - Step 2
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

  // Login - Step 1
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

  // Verify Login - Step 2
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
      setProfile(null);  // Clear profile on logout
    }
  };

  // Update user profile (local state)
  const updateProfile = (updates) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updates
    }));
  };

  // ============ PROFILE FUNCTIONS ============

  // Fetch profile from backend
  const fetchProfile = async () => {
    setIsProfileLoading(true);
    try {
      const response = await profileService.getMyProfile();
      if (response.success) {
        setProfile(response.profile);
      }
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch profile',
        notFound: error.response?.status === 404
      };
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Save profile to backend
  const saveProfile = async (profileData) => {
    try {
      const response = await profileService.saveProfile(profileData);
      if (response.success) {
        setProfile(response.profile);
      }
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to save profile' 
      };
    }
  };

  // ============ RESEND OTP HELPERS ============

  const resendRegistrationOTP = async (email) => {
    return authService.resendRegistrationOTP(email);
  };

  const resendLoginOTP = async (email) => {
    return authService.resendLoginOTP(email);
  };

  const resendResetOTP = async (email) => {
    return authService.resendResetOTP(email);
  };

  // ============ CONTEXT VALUE ============

  const value = {
    // User
    currentUser,
    user: currentUser,
    token,
    role: currentUser?.role || 'guest',
    isAuthenticated: !!currentUser && !!token,
    isLoading,
    
    // Auth functions
    register,
    verifyRegistration,
    login,
    verifyLogin,
    forgotPassword,
    resetPassword,
    logout,
    updateProfile,
    
    // OTP resend
    resendRegistrationOTP,
    resendLoginOTP,
    resendResetOTP,
    
    // Profile
    profile,
    isProfileLoading,
    fetchProfile,
    saveProfile,
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