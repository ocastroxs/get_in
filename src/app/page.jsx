"use client"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import { Users2, ChevronRight } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full">
      {/* LEFT PANEL - decorative */}
      <div className="relative hidden w-[60%] lg:block" style={{ background: "#0B2447" }}>
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B2447]/0 via-[#0B2447]/0 to-[#0B2447]" />

        {/* Decorative circles */}
        <div className="absolute top-12 right-24 w-32 h-32 rounded-full border border-white/[0.06]" />
        <div className="absolute bottom-20 right-12 w-56 h-56 rounded-full border border-white/[0.04]" />
        <div className="absolute bottom-64 right-72 w-72 h-72 rounded-full border border-white/[0.03]" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          {/* Logo top */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
              <Users2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">GetIN</span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Controle de Acesso</p>
            </div>
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center gap-6 max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 w-fit">
              <ChevronRight className="h-3 w-3 text-blue-400" />
              <span className="text-[10px] uppercase tracking-[0.15em] text-blue-400 font-medium">Sistema Ativo</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight text-white tracking-tight [--font-heading]">
              Controle de acesso{" "}
              <span className="text-blue-400">inteligente</span>
              <br />
              para sua fábrica.
            </h1>

            <p className="text-sm leading-relaxed text-white/50 max-w-sm">
              Credenciamento digital, rastreabilidade em tempo real e auditoria completa de visitantes em todos os setores.
            </p>
          </div>

          {/* Stats bar */}
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-bold text-white">38</span>
                </div>
                <p className="mt-0.5 text-xs text-white/40">Visitas hoje</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">6</span>
                <p className="mt-0.5 text-xs text-white/40">Setores ativos</p>
              </div>
              <div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-bold text-white">100</span>
                  <span className="text-sm font-bold text-blue-400">%</span>
                </div>
                <p className="mt-0.5 text-xs text-white/40">Rastreabilidade</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - login form */}
      <div className="flex w-full items-center justify-center bg-white lg:w-[40%]">
        <div className="w-full max-w-sm px-6 py-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
