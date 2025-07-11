import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { LoadingButton } from '@/components/ui/loading-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusCard } from '@/components/ui/status-card';

interface UpdatePasswordFormProps {
  onSwitchToLogin: () => void;
}

const UpdatePasswordForm: React.FC<UpdatePasswordFormProps> = ({
  onSwitchToLogin,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred while updating your password';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className='space-y-6'>
        <div className='text-center'>
          <StatusCard
            variant="success"
            title="Password Updated Successfully"
          >
            <p className='text-sm text-accent-300'>
              Your password has been updated. You can now sign in with your new
              password.
            </p>
            
            <div className="mt-4 space-y-2">
              <p className="text-sm text-accent-300 font-medium">Security Tips:</p>
              <ul className="text-xs text-secondary-400 space-y-1 list-disc list-inside">
                <li>Keep your password secure and don't share it with anyone</li>
                <li>Consider using a password manager for better security</li>
                <li>Sign out of all devices if you suspect unauthorized access</li>
              </ul>
            </div>
          </StatusCard>

          <Button
            onClick={onSwitchToLogin}
            className='w-full mt-4'
          >
            Continue to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h3 className='text-xl font-semibold text-white mb-2'>
          Update Your Password
        </h3>
        <p className='text-secondary-400 text-sm'>
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className='w-4 h-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* New Password Field */}
        <PasswordInput
          id='new-password'
          label='New Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Enter your new password'
          error={validationErrors.password}
          helperText="Password must be at least 8 characters long"
          required
        />

        {/* Confirm Password Field */}
        <PasswordInput
          id='confirm-new-password'
          label='Confirm New Password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder='Confirm your new password'
          error={validationErrors.confirmPassword}
          required
        />

        {/* Submit Button */}
        <LoadingButton
          type='submit'
          loading={isLoading}
          loadingText="Updating Password..."
          className='w-full'
        >
          Update Password
        </LoadingButton>
      </form>

      {/* Back to Login */}
      <div className='text-center pt-4 border-t border-background-600'>
        <Button
          onClick={onSwitchToLogin}
          variant="ghost"
        >
          Back to Sign In
        </Button>
      </div>
    </div>
  );
};

export default UpdatePasswordForm;
