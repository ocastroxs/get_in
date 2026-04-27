"use client";

import ParticlesBackground from "@/components/ui/ParticlesBackground";
import Sidebar from "@/components/ui/sidebar";
import { useAuth } from "@/lib/AuthContext";

export default function DashboardLayout({ children }) {
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
      <Sidebar />
      <main className="ml-[20px] flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 lg:p-6">{children}</main>
    </div>
  );
}
