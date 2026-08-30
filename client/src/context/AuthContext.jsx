// client/src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import * as authService from "../services/auth.service";
import * as profileService from "../services/profile.service";
import * as uploadService from "../services/upload.service";
import { compressImage, validateImage } from "../utils/imageCompression";
import { connectSocket, disconnectSocket } from "../services/socket.service";

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

  useEffect(() => {
    const savedToken = localStorage.getItem("skillhire_token");
    const savedUser = localStorage.getItem("skillhire_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user:", e);
        localStorage.removeItem("skillhire_user");
        localStorage.removeItem("skillhire_token");
      }
    }
    setIsLoading(false);
  }, []);
  

  useEffect(() => {
    if (token) {
      localStorage.setItem("skillhire_token", token);
    } else {
      localStorage.removeItem("skillhire_token");
    }
  }, [token]);

  // Connect socket when token exists
useEffect(() => {
  if (token) {
    connectSocket(token);
  }
  return () => {
    disconnectSocket();
  };
}, [token]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("skillhire_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("skillhire_user");
    }
  }, [currentUser]);
  useEffect(() => {
    if (token) {
      const refreshUser = async () => {
        try {
          const response = await authService.getCurrentUser();
          if (response.success && response.user) {
            setCurrentUser(response.user);
            localStorage.setItem(
              "skillhire_user",
              JSON.stringify(response.user),
            );
          }
        } catch (error) {
          console.error("Failed to refresh user:", error);
        }
      };
      refreshUser();
    }
  }, [token]);

  // ============ AUTH FUNCTIONS ============

  const register = async (userData) => {
    try {
      const response = await authService.registerUser(userData);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
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
        error: error.response?.data?.message || "Verification failed",
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
        error: error.response?.data?.message || "Login failed",
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
        error: error.response?.data?.message || "Verification failed",
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
        error: error.response?.data?.message || "Request failed",
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
        error: error.response?.data?.message || "Reset failed",
      };
    }
  };

  const logout = useCallback(async () => {
    try {
      await authService.logoutUser();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      disconnectSocket();
      setToken(null);
      setCurrentUser(null);
      setProfile(null);
      localStorage.removeItem("skillhire_token");
      localStorage.removeItem("skillhire_user");
      localStorage.removeItem("skillhire_profile");
    }
  }, []);

  const updateProfile = useCallback((updates) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  }, []);

  // ============ PROFILE FUNCTIONS ============

  const fetchProfile = useCallback(async () => {
    setIsProfileLoading(true);
    try {
      const response = await profileService.getMyProfile();
      if (response.success) setProfile(response.profile);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch profile",
        notFound: error.response?.status === 404,
      };
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (profileData) => {
    try {
      const response = await profileService.saveProfile(profileData);
      if (response.success) setProfile(response.profile);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to save profile",
      };
    }
  }, []);

  // ============ AVATAR FUNCTIONS ============

  const uploadAvatar = useCallback(
    async (file) => {
      setIsAvatarUploading(true);
      try {
        const validation = validateImage(file);
        if (!validation.isValid)
          return { success: false, error: validation.error };

        const compressedFile = await compressImage(file, {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 400,
          useWebWorker: true,
          initialQuality: 0.85,
        });

        const uploadResult = await uploadService.uploadImage(
          compressedFile,
          "avatars",
          "avatar",
        );
        if (!uploadResult.success)
          return { success: false, error: "Upload failed" };

        const avatarUrl = uploadResult.image.url;
        const avatarPublicId = uploadResult.image.publicId;

        const updateResult = await authService.updateAvatar(
          avatarUrl,
          avatarPublicId,
        );
        if (updateResult.success && updateResult.user) {
          const updatedUser = {
            ...currentUser,
            avatar: updateResult.user.avatar,
            avatarPublicId: updateResult.user.avatarPublicId,
          };
          setCurrentUser(updatedUser);
          localStorage.setItem("skillhire_user", JSON.stringify(updatedUser));
        }
        return { success: true, avatarUrl, data: uploadResult };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Avatar upload failed",
        };
      } finally {
        setIsAvatarUploading(false);
      }
    },
    [currentUser],
  );

  const removeAvatar = useCallback(async () => {
    try {
      if (currentUser?.avatarPublicId) {
        try {
          await uploadService.deleteUpload(currentUser.avatarPublicId);
        } catch (deleteError) {
          console.error("Cloudinary delete failed:", deleteError);
        }
      }
      const updateResult = await authService.updateAvatar("", null);
      if (updateResult.success) {
        const updatedUser = {
          ...currentUser,
          avatar: "",
          avatarPublicId: null,
        };
        setCurrentUser(updatedUser);
        localStorage.setItem("skillhire_user", JSON.stringify(updatedUser));
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to remove avatar",
      };
    }
  }, [currentUser]);

  // ============ CHANGE PASSWORD ============

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword(
        currentPassword,
        newPassword,
      );
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to change password",
      };
    }
  }, []);

  // ============ CHANGE USERNAME ============

  const changeUsername = useCallback(
    async (username) => {
      try {
        const response = await authService.changeUsername(username);
        if (response.success && response.user) {
          const updatedUser = {
            ...currentUser,
            username: response.user.username,
          };
          setCurrentUser(updatedUser);
          localStorage.setItem("skillhire_user", JSON.stringify(updatedUser));
        }
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || "Failed to change username",
        };
      }
    },
    [currentUser],
  );

  // ============ PHONE VERIFICATION ============

  const sendPhoneOTP = useCallback(async (phone) => {
    try {
      const response = await authService.sendPhoneOTP(phone);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to send OTP",
      };
    }
  }, []);

  const verifyPhoneOTP = useCallback(
    async (phone, otp) => {
      try {
        const response = await authService.verifyPhoneOTP(phone, otp);
        if (response.success && response.user) {
          const updatedUser = {
            ...currentUser,
            phone: response.user.phone,
            isPhoneVerified: response.user.isPhoneVerified,
          };
          setCurrentUser(updatedUser);
          localStorage.setItem("skillhire_user", JSON.stringify(updatedUser));
        }
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || "Failed to verify phone",
        };
      }
    },
    [currentUser],
  );

  // ============ PHONE CHANGE ============

  const changePhone = useCallback(async (newPhone) => {
    try {
      const response = await authService.changePhone(newPhone);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to initiate phone change",
      };
    }
  }, []);

  const verifyOldPhoneOTP = useCallback(async (newPhone, oldPhoneOTP) => {
    try {
      const response = await authService.verifyOldPhoneOTP(
        newPhone,
        oldPhoneOTP,
      );
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to verify old phone OTP",
      };
    }
  }, []);

  const verifyNewPhoneOTP = useCallback(
    async (newPhone, newPhoneOTP) => {
      try {
        const response = await authService.verifyNewPhoneOTP(
          newPhone,
          newPhoneOTP,
        );
        if (response.success && response.user) {
          const updatedUser = {
            ...currentUser,
            phone: response.user.phone,
            isPhoneVerified: response.user.isPhoneVerified,
          };
          setCurrentUser(updatedUser);
          localStorage.setItem("skillhire_user", JSON.stringify(updatedUser));
        }
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error:
            error.response?.data?.message || "Failed to verify new phone OTP",
        };
      }
    },
    [currentUser],
  );

  // ============ EMAIL CHANGE ============

  const changeEmail = useCallback(async (newEmail) => {
    try {
      const response = await authService.changeEmail(newEmail);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to initiate email change",
      };
    }
  }, []);

  const verifyEmailChange = useCallback(
    async (newEmail, oldEmailOTP, newEmailOTP) => {
      try {
        const response = await authService.verifyEmailChange(
          newEmail,
          oldEmailOTP,
          newEmailOTP,
        );
        if (response.success && response.user) {
          const updatedUser = { ...currentUser, email: response.user.email };
          setCurrentUser(updatedUser);
          localStorage.setItem("skillhire_user", JSON.stringify(updatedUser));
        }
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error:
            error.response?.data?.message || "Failed to verify email change",
        };
      }
    },
    [currentUser],
  );
  

  // ============ RESEND OTP HELPERS ============

  const resendRegistrationOTP = useCallback(
    async (email) => authService.resendRegistrationOTP(email),
    [],
  );
  const resendLoginOTP = useCallback(
    async (email) => authService.resendLoginOTP(email),
    [],
  );
  const resendResetOTP = useCallback(
    async (email) => authService.resendResetOTP(email),
    [],
  );

  // ============ GOOGLE OAUTH ============
  const updateUserRole = useCallback(async (role) => {
  try {
    const response = await authService.updateRole(role);
    if (response.success && response.user) {
      const updatedUser = { ...currentUser, role: response.user.role };
      setCurrentUser(updatedUser);
      localStorage.setItem('skillhire_user', JSON.stringify(updatedUser));
    }
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to update role' };
  }
}, [currentUser]);




  // ============ CONTEXT VALUE ============

  const value = useMemo(
    () => ({
      currentUser,
      user: currentUser,
      token,
      role: currentUser?.role || "guest",
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
      changeUsername,
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
      sendPhoneOTP,
      verifyPhoneOTP,
      changePhone,
      verifyOldPhoneOTP,
      verifyNewPhoneOTP,
      changeEmail,
      verifyEmailChange,
      setToken,
      setCurrentUser,
      updateUserRole,
    }),
    [
      currentUser,
      token,
      isLoading,
      profile,
      isProfileLoading,
      isAvatarUploading,
      logout,
      updateProfile,
      changePassword,
      changeUsername,
      fetchProfile,
      saveProfile,
      uploadAvatar,
      removeAvatar,
      resendRegistrationOTP,
      resendLoginOTP,
      resendResetOTP,
      sendPhoneOTP,
      verifyPhoneOTP,
      changePhone,
      verifyOldPhoneOTP,
      verifyNewPhoneOTP,
      changeEmail,
      verifyEmailChange,
      setToken,
      setCurrentUser,
      updateUserRole,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
