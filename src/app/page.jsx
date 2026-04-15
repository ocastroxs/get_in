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
        <div className="relative z-10 flex h-full flex-col p-10">
          {/* Logo top */}
          <img src="logo-w.svg" alt="Logo" className="w-42 h-42 absolute -top-5"/>

          {/* Center content */}
          <div className="flex-1 flex flex-col gap-4 max-w-lg justify-center mt-50">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 w-fit transition-all duration-300 hover:scale-105 hover:cursor-pointer">
              <ChevronRight className="h-4 w-4 text-blue-400" />
              <span className="text-[12px] uppercase tracking-[0.15em] text-blue-400 font-medium">Sistema Ativo</span>
            </div>

            <h1 className="text-5xl font-bold leading-tight text-white tracking-tight font-heading">
              Controle de
              <br />
              acesso{" "}
              <span className="text-blue-400">inteligente</span>
              <br />
              para sua fábrica.
            </h1>

            <p className="text-md leading-relaxed text-white/50">
              Credenciamento digital, rastreabilidade em tempo real e auditoria completa de visitantes em todos os setores.
            </p>
          </div>

          {/* Stats bar */}
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-5 transition-all duration-300 hover:-translate-y-1">
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
      <div className="flex w-[40%] items-center bg-white">
        <div className="w-full px-20">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
