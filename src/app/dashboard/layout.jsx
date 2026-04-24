"use client";

import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/lib/AuthContext";

export default function DashboardLayout({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 ml-[220px] p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
