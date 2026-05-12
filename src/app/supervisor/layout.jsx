'use client';

import { useAuth } from '@/lib/AuthContext';
import SupervisorSidebar from '@/components/supervisor/SupervisorSidebar';
import ParticlesBackground from '@/components/ui/ParticlesBackground';
import { Loader2 } from 'lucide-react';

export default function SupervisorLayout({ children }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <ParticlesBackground />
      <SupervisorSidebar />
      <main className="ml-[0px] flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 lg:p-6">{children}</main>
    </div>
  );
}
