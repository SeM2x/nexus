import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { PasswordInput } from '@/components/ui/password-input';
import { LoadingButton } from '@/components/ui/loading-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusCard } from '@/components/ui/status-card';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError(null);

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log(data);

    if (error) {
      setApiError(error.message);
    } else {
      // Check if email confirmation is required
      if (data.user && !data.session) {
        setConfirmEmail(email);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className='space-y-6'>
      {/* Confirmation Email Message */}
      {confirmEmail && (
        <div className="text-center space-y-4">
          <StatusCard 
            variant="success"
            icon={<CheckCircle className="w-8 h-8" />}
            title="Check Your Email"
          >
            <p className="text-sm text-accent-300">
              We've sent a confirmation link to{' '}
              <strong className="text-white">{confirmEmail}</strong>
            </p>
            <p className="text-sm text-accent-300 mt-3">
              Please check your email and click the confirmation link to complete your account setup.
            </p>
          </StatusCard>
          
          <Button
            onClick={onSwitchToLogin}
            variant="link"
          >
            Back to Sign In
          </Button>
        </div>
      )}

      {/* Signup Form */}
      {!confirmEmail && (
        <>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* API Error Display */}
            {apiError && (
              <Alert variant="destructive">
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <InputWithIcon
              id='signup-email'
              type='email'
              label='Email Address'
              icon={<Mail />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your email'
              required
            />

            {/* Password Field */}
            <PasswordInput
              id='signup-password'
              label='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Create a password'
              error={errors.password}
              helperText="Password must be at least 8 characters long"
              required
            />

            {/* Confirm Password Field */}
            <PasswordInput
              id='confirm-password'
              label='Confirm Password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder='Confirm your password'
              error={errors.confirmPassword}
              required
            />

            {/* Submit Button */}
            <LoadingButton
              type='submit'
              loading={isLoading}
              loadingText="Creating Account..."
              className='w-full'
            >
              Create Account
            </LoadingButton>
          </form>

          {/* Terms and Privacy */}
          <div className='text-center'>
            <p className='text-xs text-secondary-500'>
              By creating an account, you agree to our{' '}
              <a
                href='#'
                className='text-accent-400 hover:text-accent-300 transition-colors'
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href='#'
                className='text-accent-400 hover:text-accent-300 transition-colors'
              >
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Switch to Login */}
          <div className='text-center pt-4 border-t border-background-600'>
            <p className='text-secondary-400 text-sm'>
              Already have an account?{' '}
              <Button
                variant="link"
                onClick={onSwitchToLogin}
              >
                Sign in
              </Button>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default SignupForm;
