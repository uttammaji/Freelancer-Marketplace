// client/src/pages/auth/GoogleCallback.jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Loader2 } from 'lucide-react';

export function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setCurrentUser } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const token = searchParams.get('token');
    
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
          
          if (data.success && data.user) {
            localStorage.setItem('skillhire_user', JSON.stringify(data.user));
            setCurrentUser(data.user);
            
            // ✅ Always navigate to dashboard based on role
            toast.success('Welcome!', 'Logged in with Google.');
            navigate(`/dashboard/${data.user.role}`);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Completing Google login...
        </p>
      </div>
    </div>
  );
}