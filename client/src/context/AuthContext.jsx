// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as authService from '../services/auth.service';
import * as profileService from '../services/profile.service';
import * as uploadService from '../services/upload.service';
import { compressImage, validateImage } from '../utils/imageCompression';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // ============ STATE ============
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

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

  const logout = useCallback(async () => {
    try {
      await authService.logoutUser();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setToken(null);
      setCurrentUser(null);
      setProfile(null);
      localStorage.removeItem('skillhire_token');
      localStorage.removeItem('skillhire_user');
      localStorage.removeItem('skillhire_profile');
    }
  }, []);

  const updateProfile = useCallback((updates) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // ============ PROFILE FUNCTIONS ============

  const fetchProfile = useCallback(async () => {
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
  }, []);

  const saveProfile = useCallback(async (profileData) => {
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
  }, []);

  // ============ AVATAR FUNCTIONS ============

  /**
   * Upload and update avatar
   * Flow: Validate → Compress → Upload to Cloudinary → Save to User model → Update state
   */
  const uploadAvatar = useCallback(async (file) => {
    setIsAvatarUploading(true);
    
    try {
      // 1. Validate
      const validation = validateImage(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // 2. Compress
      const compressedFile = await compressImage(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 400,
        useWebWorker: true,
        initialQuality: 0.85,
      });

      // 3. Upload to Cloudinary
      const uploadResult = await uploadService.uploadImage(
        compressedFile, 
        'avatars', 
        'avatar'
      );

      if (!uploadResult.success) {
        return { success: false, error: 'Upload failed' };
      }

      const avatarUrl = uploadResult.image.url;
      const avatarPublicId = uploadResult.image.publicId;

      // 4. Save to USER model via auth service 
      const updateResult = await authService.updateAvatar(avatarUrl, avatarPublicId);

      if (updateResult.success && updateResult.user) {
        // 5. Update state with response from backend
        const updatedUser = {
          ...currentUser,
          avatar: updateResult.user.avatar,
          avatarPublicId: updateResult.user.avatarPublicId,
        };

        setCurrentUser(updatedUser);

        // 6. Update localStorage immediately
        localStorage.setItem('skillhire_user', JSON.stringify(updatedUser));
      }

      return { 
        success: true, 
        avatarUrl,
        data: uploadResult 
      };
    } catch (error) {
      console.error('Avatar upload failed:', error);
      return { 
        success: false, 
        error: error.message || 'Avatar upload failed' 
      };
    } finally {
      setIsAvatarUploading(false);
    }
  }, [currentUser]);

  /**
   * Remove avatar
   */
  const removeAvatar = useCallback(async () => {
    try {
      // Delete from Cloudinary if publicId exists
      if (currentUser?.avatarPublicId) {
      try {
        await uploadService.deleteUpload(currentUser.avatarPublicId);
      } catch (deleteError) {
        console.error('Cloudinary delete failed:', deleteError);
        // Continue even if Cloudinary delete fails
      }
    }

      // Update backend
      const updateResult = await authService.updateAvatar('', null);

      if (updateResult.success) {
        const updatedUser = {
          ...currentUser,
          avatar: '',
          avatarPublicId: null,
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('skillhire_user', JSON.stringify(updatedUser));
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to remove avatar' 
      };
    }
  }, [currentUser]);

  // ============ CHANGE PASSWORD ============

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      return { success: true, data: response };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to change password' 
      };
    }
  }, []);

  // ============ RESEND OTP HELPERS ============

  const resendRegistrationOTP = useCallback(async (email) => {
    return authService.resendRegistrationOTP(email);
  }, []);

  const resendLoginOTP = useCallback(async (email) => {
    return authService.resendLoginOTP(email);
  }, []);

  const resendResetOTP = useCallback(async (email) => {
    return authService.resendResetOTP(email);
  }, []);

  // ============ MEMOIZED CONTEXT VALUE ============

  const value = useMemo(() => ({
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
    changePassword,
    
    resendRegistrationOTP,
    resendLoginOTP,
    resendResetOTP,
    
    profile,
    isProfileLoading,
    fetchProfile,
    saveProfile,
    
    uploadAvatar,
    removeAvatar,
    isAvatarUploading,
  }), [
    currentUser,
    token,
    isLoading,
    profile,
    isProfileLoading,
    isAvatarUploading,
    logout,
    updateProfile,
    changePassword,
    fetchProfile,
    saveProfile,
    uploadAvatar,
    removeAvatar,
    resendRegistrationOTP,
    resendLoginOTP,
    resendResetOTP,
  ]);

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