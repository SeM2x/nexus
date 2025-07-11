import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/Logo';
import { Shield, Users, Zap } from 'lucide-react';
import Auth from '@/components/auth/Auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className='min-h-screen bg-linear-to-br from-background-900 via-background-800 to-background-900 flex'>
      {/* Left Side - Branding */}
      <div className='hidden lg:flex lg:flex-1 flex-col justify-center items-center px-12 py-24'>
        <div className='max-w-md'>
          {/* Clean Logo */}
          <div className='flex items-center gap-3 mb-8'>
            <Logo className='text-2xl' />
          </div>

          {/* Hero Content */}
          <div className='space-y-6'>
            <h2 className='text-4xl font-bold text-white leading-tight'>
              Organize Your Projects with
              <span className='text-transparent bg-clip-text bg-linear-to-r from-accent-400 to-accent-600'>
                {' '}
                Visual Clarity
              </span>
            </h2>

            <p className='text-lg text-secondary-300 leading-relaxed'>
              Transform your ideas into structured project plans. Create mind
              maps, manage tasks, and track progress with our intuitive visual
              interface.
            </p>

            {/* Features */}
            <div className='space-y-4 pt-6'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-accent-500/20 rounded-lg'>
                  <Zap className='w-5 h-5 text-accent-400' />
                </div>
                <span className='text-secondary-300 font-medium'>
                  Lightning-fast project setup
                </span>
              </div>

              <div className='flex items-center gap-3'>
                <div className='p-2 bg-accent-500/20 rounded-lg'>
                  <Users className='w-5 h-5 text-accent-400' />
                </div>
                <span className='text-secondary-300 font-medium'>
                  Collaborative workspace
                </span>
              </div>

              <div className='flex items-center gap-3'>
                <div className='p-2 bg-accent-500/20 rounded-lg'>
                  <Shield className='w-5 h-5 text-accent-400' />
                </div>
                <span className='text-secondary-300 font-medium'>
                  Secure cloud storage
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Separator */}
      <div className='hidden lg:flex items-center justify-center'>
        <div className='w-px h-3/5 bg-linear-to-b from-transparent via-accent-500/50 to-transparent' />
      </div>

      {/* Right Side - Authentication */}
      <div className='flex-1 flex flex-col justify-center px-6 py-12 lg:px-12'>
        <div className='mx-auto w-full max-w-md'>
          {/* Mobile Logo */}
          <div className='lg:hidden flex items-center justify-center gap-3 mb-8'>
            <Logo className='text-2xl' />
          </div>

          {/* Auth Header */}
          <div className='text-center mb-8'>
            <h2 className='text-3xl font-bold text-white tracking-tight'>
              Welcome Back
            </h2>
            <p className='mt-2 text-secondary-400 font-medium'>
              Sign in to access your projects and continue organizing your work
            </p>
          </div>

          {/* Auth Component Container */}
          <div className='bg-background-800/50 backdrop-blur-xl border border-background-700/50 rounded-xl p-8 shadow-2xl'>
            <Auth />
          </div>

          {/* Footer */}
          <div className='mt-8 text-center'>
            <p className='text-xs text-secondary-500'>
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
