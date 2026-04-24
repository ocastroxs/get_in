"use client";

import ParticlesBackground from "@/components/ui/ParticlesBackground";
import Sidebar from "@/components/ui/sidebar";
import { useAuth } from "@/lib/AuthContext";

export default function DashboardLayout({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <ParticlesBackground />
      <Sidebar />
      <main className="flex-1 ml-[20px] p-6 overflow-auto">{children}</main>
    </div>
  );
}
