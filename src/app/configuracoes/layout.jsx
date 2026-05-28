"use client";

import ParticlesBackground from "@/components/ui/ParticlesBackground";
import Sidebar from "@/components/ui/sidebar";
import PortariaSidebar from "@/components/PortariaSidebar";
import SupervisorSidebar from "@/components/supervisor/SupervisorSidebar";
import { getAuthTipo, useAuth } from "@/lib/AuthContext";

function ConfiguracoesSidebar({ tipo }) {
  if (tipo === "port") {
    return <PortariaSidebar />;
  }

  if (tipo === "sup") {
    return <SupervisorSidebar />;
  }

  return <Sidebar />;
}

export default function ConfiguracoesLayout({ children }) {
  const { isAuthenticated, isLoading, funcionario, user } = useAuth();
  const tipo = getAuthTipo(funcionario, user);

  if (isLoading || !isAuthenticated || !["adm", "port", "sup"].includes(tipo)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="relative isolate flex min-h-screen">
      <ParticlesBackground />
      <ConfiguracoesSidebar tipo={tipo} />
      <main className="relative z-10 ml-[0px] flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 lg:p-6">
        {children}
      </main>
    </div>
  );
}
