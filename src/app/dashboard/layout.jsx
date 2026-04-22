"use client";

import { useAuth } from "@/lib/AuthContext";
import Sidebar from "@/components/Sidebar";
import { CURRENT_USER } from "@/lib/mockData";

export default function DashboardLayout({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const displayUser = user || CURRENT_USER;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={displayUser} />
      <main className="flex-1 ml-[220px] p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
