'use client';

import { getAuthTipo, useAuth } from '@/lib/AuthContext';
import SupervisorSidebar from '@/components/supervisor/SupervisorSidebar';
import ParticlesBackground from '@/components/ui/ParticlesBackground';
import { Loader2 } from 'lucide-react';

export default function SupervisorLayout({ children }) {
  const { isAuthenticated, isLoading, funcionario, user } = useAuth();
  const tipo = getAuthTipo(funcionario, user);

  if (isLoading || !isAuthenticated || tipo !== 'sup') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative isolate flex min-h-screen">
      <ParticlesBackground />
      <SupervisorSidebar />
      <main className="relative z-10 ml-[0px] flex-1 overflow-x-hidden overflow-y-auto px-4 pt-5 pb-28 lg:p-6">{children}</main>
    </div>
  );
}
