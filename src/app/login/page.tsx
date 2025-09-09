'use client';

import { AuthLayout, LoginForm, AuthFooter } from '@/components/auth';

export default function LoginPage() {
  return (
    <>
      <AuthLayout title="Sign in to GitHub">
        <LoginForm />
      </AuthLayout>
      <AuthFooter />
    </>
  );
}
