'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui';
import { GoogleIcon } from '@/components/icons';
import { SignupFormData } from '@/types';

export interface SignupFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const SignupForm = ({ onSuccess, onError }: SignupFormProps) => {
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof SignupFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    setError(null);
    setLoading(true);
    
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.error || 'Signup failed');
      }
      
      // Auto sign in after successful signup
      await signIn('credentials', { 
        email: formData.email, 
        password: formData.password, 
        redirect: true, 
        callbackUrl: '/' 
      });
      
      onSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google');
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-semibold mb-5">Sign up for GitHub</h2>

      {/* Google OAuth button */}
      <Button
        variant="outline"
        size="lg"
        className="w-full bg-white border border-black/10 shadow-sm flex items-center justify-center gap-2 text-sm font-medium text-black hover:bg-gray-50"
        onClick={handleGoogleSignIn}
      >
        <GoogleIcon /> Continue with Google
      </Button>

      {/* Divider */}
      <div className="my-5 flex items-center gap-4 text-black/50">
        <div className="h-px flex-1 bg-black/10" />
        <span className="text-xs">or</span>
        <div className="h-px flex-1 bg-black/10" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleInputChange('email')}
        />
        
        <Input
          label="Password"
          type="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={handleInputChange('password')}
          helper="Password should be at least 8 characters including a number and a lowercase letter."
        />
        
        <Input
          label="Name"
          type="text"
          placeholder="Your name"
          value={formData.name}
          onChange={handleInputChange('name')}
        />

        {/* Country/Region */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Your Country/Region
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select className="w-full h-11 rounded-md border border-black/10 bg-white px-3 pr-8 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10">
              <option>Greece</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Germany</option>
              <option>France</option>
              <option>India</option>
              <option>Other</option>
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-black/60"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path d="M5.75 7.75L10 12l4.25-4.25" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <p className="mt-1.5 text-xs text-black/60">
            For compliance reasons, we&apos;re required to collect country information to send you occasional updates and announcements.
          </p>
        </div>

        {/* Email preferences */}
        <label className="mt-2 flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1 size-4 rounded border border-black/20" />
          <span>Receive occasional product updates and announcements</span>
        </label>

        <Button
          type="submit"
          variant="github"
          size="lg"
          loading={loading}
          className="mt-2 w-full text-sm font-medium"
          disabled={!formData.email || !formData.password}
        >
          {loading ? 'Creating...' : 'Create account'}
          <span aria-hidden> →</span>
        </Button>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <p className="text-xs text-black/60 leading-relaxed mt-3">
          By creating an account, you agree to the Terms of Service. For more information about GitHub&apos;s privacy practices, see the GitHub Privacy Statement.
        </p>
      </form>
    </div>
  );
};

export default SignupForm;