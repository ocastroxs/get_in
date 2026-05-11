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
    <div className="flex h-screen bg-background">
      <ParticlesBackground />
      <SupervisorSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
