"use client";

import ParticlesBackground from "@/components/ui/ParticlesBackground";
import Sidebar from "@/components/ui/sidebar";
import { getAuthTipo, useAuth } from "@/lib/AuthContext";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

export default function DashboardLayout({ children }) {
  const { isAuthenticated, isLoading, funcionario, user } = useAuth();
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const tipo = getAuthTipo(funcionario, user);

  useEffect(() => {
    if (isLoading || !isAuthenticated || tipo !== "adm") {
      return;
    }

    const wrapper = wrapperRef.current;
    const content = contentRef.current;

    if (!wrapper || !content) {
      return;
    }

    const lenis = new Lenis({
      wrapper,
      content,
      autoRaf: false,
    });

    let frameId = 0;

    const raf = (time) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };

    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [isAuthenticated, isLoading, tipo]);

  if (isLoading || !isAuthenticated || tipo !== "adm") {
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
      <main
        ref={wrapperRef}
        className="dashboard-scroll ml-[0px] h-screen flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 lg:p-6"
      >
        <div ref={contentRef}>{children}</div>
      </main>
    </div>
  );
}
