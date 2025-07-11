import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { PasswordInput } from '@/components/ui/password-input';
import { LoadingButton } from '@/components/ui/loading-button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onSwitchToReset: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToSignup,
  onSwitchToReset,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError) {
      setError(authError.message);
    } else {
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  return (
    <div className='space-y-6'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Email Field */}
        <InputWithIcon
          id='email'
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
          id='password'
          label='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Enter your password'
          required
        />

        {/* Forgot Password Link */}
        <div className='flex justify-end'>
          <Button
            type='button'
            variant="link"
            onClick={onSwitchToReset}
          >
            Forgot your password?
          </Button>
        </div>

        {/* Submit Button */}
        <LoadingButton
          type='submit'
          loading={isLoading}
          loadingText="Signing In..."
          className='w-full'
        >
          Sign In
        </LoadingButton>
      </form>

      {/* Switch to Signup */}
      <div className='text-center pt-4 border-t border-background-600'>
        <p className='text-secondary-400 text-sm'>
          Don't have an account?{' '}
          <Button
            variant="link"
            onClick={onSwitchToSignup}
          >
            Sign up
          </Button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
