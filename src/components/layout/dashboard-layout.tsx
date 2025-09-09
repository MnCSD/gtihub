import { ReactNode } from 'react';
import Navbar from '@/components/dashboard/navbar';
import Sidebar from '@/components/dashboard/sidebar';
import { NavUser } from '@/types';

export interface DashboardLayoutProps {
  children: ReactNode;
  user: NavUser;
}

const DashboardLayout = ({ children, user }: DashboardLayoutProps) => {
  const owner = (user?.name || user?.email || 'you').split('@')[0];

  return (
    <main className="min-h-screen bg-[#010409] text-white">
      <Navbar user={user} />
      
      <div className="px-4 sm:px-6 lg:p-0 py-6 grid grid-cols-1 md:flex min-h-[calc(100vh-56px)]">
        {/* Left sidebar */}
        <div className="xl:col-span-3 h-full w-[340px]">
          <Sidebar owner={owner} ownerImage={user?.image || null} />
        </div>

        {/* Main content */}
        <div className="flex-1 lg:max-w-[1100px] 3xl:max-w-[1540px] mx-auto w-full pt-18">
          {children}
        </div>
      </div>
    </main>
  );
};

export default DashboardLayout;