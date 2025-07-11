import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { LoadingButton } from '@/components/ui/loading-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusCard } from '@/components/ui/status-card';

interface ResetPasswordFormProps {
  onSwitchToLogin: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login#access_token={access_token}&type=recovery`
      });
      
      if (resetError) {
        setError(resetError.message);
      } else {
        setIsSubmitted(true);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred while sending the reset link';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className='space-y-6'>
        <StatusCard
          variant="success"
          title="Check Your Email"
        >
          <p className="text-sm text-accent-300">
            We've sent a password reset link to{' '}
            <strong className="text-white">{email}</strong>
          </p>
          
          <div className="mt-4 space-y-2">
            <p className="text-sm text-accent-300 font-medium">
              Didn't receive the email?
            </p>
            <ul className="text-xs text-secondary-400 space-y-1 list-disc list-inside">
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>The email may take a few minutes to arrive</li>
            </ul>
          </div>
        </StatusCard>

        <div className="space-y-3">
          <Button
            onClick={() => {
              setIsSubmitted(false);
              setEmail('');
              setError(null);
            }}
            variant="secondary"
            className='w-full'
          >
            Try Different Email
          </Button>

          <Button
            onClick={onSwitchToLogin}
            variant="ghost"
            className='w-full'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

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
          id='reset-email'
          type='email'
          label='Email Address'
          icon={<Mail />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Enter your email address'
          required
        />

        {/* Info Box */}
        <StatusCard variant="info">
          <p className='text-xs text-secondary-400'>
            <strong className='text-secondary-300'>Security Note:</strong> For
            your protection, we'll only send reset instructions to verified
            email addresses associated with an account.
          </p>
        </StatusCard>

        {/* Submit Button */}
        <LoadingButton
          type='submit'
          loading={isLoading}
          loadingText="Sending Reset Link..."
          className='w-full'
        >
          Send Reset Link
        </LoadingButton>
      </form>

      {/* Back to Login */}
      <div className='text-center pt-4 border-t border-background-600'>
        <Button
          onClick={onSwitchToLogin}
          variant="ghost"
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back to Sign In
        </Button>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
