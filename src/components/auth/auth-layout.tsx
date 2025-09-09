import { ReactNode } from 'react';
import { Logo } from '@/components/ui';

export interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  showLogo?: boolean;
}

const AuthLayout = ({ children, title, showLogo = true }: AuthLayoutProps) => {
  return (
    <main className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col">
      <section className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {showLogo && (
            <div className="flex justify-center mb-6">
              <Logo size={40} />
            </div>
          )}

          <h1 className="text-center text-2xl font-semibold text-white mb-6">
            {title}
          </h1>

          {children}
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;