'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui';
import { GoogleIcon } from '@/components/icons';
import { LoginFormData } from '@/types';

export interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const LoginForm = ({ onSuccess, onError }: LoginFormProps) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (error) setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setLoading(true);
    
    try {
      const res = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      if (res?.error) {
        const errorMessage = 'Invalid username/email or password';
        setError(errorMessage);
        onError?.(errorMessage);
      } else {
        onSuccess?.();
        router.push('/');
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google');
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        label="Username or email address"
        type="text"
        variant="dark"
        placeholder=""
        value={formData.email}
        onChange={handleInputChange('email')}
        error={error && !formData.email ? 'Email is required' : undefined}
      />

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm text-white">Password</label>
          <a href="#" className="text-sm text-[#58a6ff] hover:underline">
            Forgot password?
          </a>
        </div>
        <Input
          type="password"
          variant="dark"
          placeholder=""
          value={formData.password}
          onChange={handleInputChange('password')}
          error={error && !formData.password ? 'Password is required' : undefined}
        />
      </div>

      <Button
        type="submit"
        variant="github"
        size="lg"
        loading={loading}
        className="w-full text-sm font-medium"
        disabled={!formData.email || !formData.password}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      {/* Divider */}
      <div className="flex items-center gap-4 text-[#6e7681]">
        <div className="h-px flex-1 bg-[#30363d]" />
        <span className="text-xs">or</span>
        <div className="h-px flex-1 bg-[#30363d]" />
      </div>

      {/* Google Sign In */}
      <Button
        type="button"
        variant="github-secondary"
        size="lg"
        className="w-full flex items-center justify-center gap-2 text-sm font-medium"
        onClick={handleGoogleSignIn}
      >
        <GoogleIcon /> Continue with Google
      </Button>

      {/* Create account link */}
      <p className="text-center text-sm text-[#8b949e]">
        New to GitHub?{' '}
        <Link href="/signup" className="text-[#58a6ff] hover:underline">
          Create an account
        </Link>
      </p>

      <p className="text-center text-sm">
        <a href="#" className="text-[#58a6ff] hover:underline">
          Sign in with a passkey
        </a>
      </p>
    </form>
  );
};

export default LoginForm;