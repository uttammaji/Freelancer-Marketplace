// client/src/pages/auth/GoogleCallback.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { GoogleRoleModal } from './GoogleRoleModal';
import { Loader2 } from 'lucide-react';

export function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setCurrentUser, updateUserRole } = useAuth();
  const toast = useToast();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const isNewUser = searchParams.get('isNewUser') === 'true';
    
    console.log('=== GOOGLE CALLBACK DEBUG ===');
    console.log('Full URL:', window.location.href);
    console.log('Token:', token ? '✅ Present' : '❌ Missing');
    console.log('isNewUser param:', searchParams.get('isNewUser'));
    console.log('isNewUser boolean:', isNewUser);
    console.log('=== END DEBUG ===');
    
    if (token) {
      localStorage.setItem('skillhire_token', token);
      setToken(token);
      
      const fetchUser = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/me`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await response.json();
          
          console.log('=== FETCH USER DEBUG ===');
          console.log('Response:', data);
          console.log('=== END DEBUG ===');
          
          if (data.success && data.user) {
            localStorage.setItem('skillhire_user', JSON.stringify(data.user));
            setCurrentUser(data.user);
            
            console.log('User role:', data.user.role);
            console.log('isNewUser:', isNewUser);
            
            if (isNewUser) {
              console.log('Showing role modal...');
              setShowRoleModal(true);
            } else {
              console.log('Navigating to dashboard:', data.user.role);
              toast.success('Welcome back!', 'Logged in with Google.');
              navigate(`/dashboard/${data.user.role}`);
            }
          } else {
            toast.error('Login Failed', 'Could not fetch user data.');
            navigate('/login');
          }
        } catch (error) {
          console.error('Google callback error:', error);
          toast.error('Login Failed', 'Something went wrong.');
          navigate('/login');
        }
      };
      
      fetchUser();
    } else {
      toast.error('Login Failed', 'No token received.');
      navigate('/login');
    }
  }, []);

  const handleSelectRole = async (role) => {
    setIsUpdatingRole(true);
    const result = await updateUserRole(role);
    setIsUpdatingRole(false);

    if (result.success) {
      toast.success('Account Created!', `Welcome to SkillHire as a ${role}.`);
      navigate(`/dashboard/${role}`);
    } else {
      toast.error('Failed', result.error);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {showRoleModal ? 'Preparing your account...' : 'Completing Google login...'}
          </p>
        </div>
      </div>

      <GoogleRoleModal
        isOpen={showRoleModal}
        onSelectRole={handleSelectRole}
        isLoading={isUpdatingRole}
      />
    </>
  );
}