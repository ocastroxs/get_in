"use client";

import ParticlesBackground from "@/components/ui/ParticlesBackground";
import PortariaSidebar from "@/components/PortariaSidebar";
import { useAuth } from "@/lib/AuthContext";

export default function PortariaLayout({ children }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <ParticlesBackground />
      <PortariaSidebar />
      <main className="ml-[0px] flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 lg:p-6">{children}</main>
    </div>
  );
}
