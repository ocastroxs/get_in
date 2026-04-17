"use client"

import { useEffect, useRef } from "react"
import { LoginForm } from "@/components/login-form"
import { ChevronRight, Users, ShieldCheck, Activity } from "lucide-react"

/* ─────────────────────────────────────────────
   Canvas de partículas adaptado para o painel
   escuro (azul marinho) do lado esquerdo
───────────────────────────────────────────── */
function PanelParticles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    let animId

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    window.addEventListener("resize", resize)
    resize()

    class Particle {
      constructor() { this.reset() }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 1.8 + 0.6
        this.vx = (Math.random() - 0.5) * 0.4
        this.vy = (Math.random() - 0.5) * 0.4
        this.opacity = Math.random() * 0.45 + 0.08
      }
      update() {
        this.x += this.vx
        this.y += this.vy
        if (this.x > canvas.width)  this.x = 0
        else if (this.x < 0)        this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        else if (this.y < 0)        this.y = canvas.height
      }
      draw() {
        ctx.fillStyle = `rgba(96, 165, 250, ${this.opacity})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 12000))
    const particles = Array.from({ length: count }, () => new Particle())

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => { p.update(); p.draw() })

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 130) {
            ctx.strokeStyle = `rgba(96, 165, 250, ${0.12 * (1 - dist / 130)})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  )
}

/* ─────────────────────────────────────────────
   Componente de estatística individual
───────────────────────────────────────────── */
function StatItem({ value, suffix, label, icon: Icon }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-baseline gap-0.5">
        <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
        {suffix && <span className="text-sm font-bold text-blue-400">{suffix}</span>}
      </div>
      <p className="text-xs text-white/40 flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3 text-white/30" />}
        {label}
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Página de Login
───────────────────────────────────────────── */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full">

      {/* ── PAINEL ESQUERDO ── */}
      <div
        className="relative hidden w-[58%] lg:flex flex-col overflow-hidden"
        style={{ background: "#0B2447" }}
      >
        {/* Partículas animadas */}
        <PanelParticles />

        {/* Grade sutil */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Gradiente de vinheta nas bordas */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B2447]/60 via-transparent to-[#0B2447]/80 pointer-events-none" />

        {/* Brilho central suave */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

        {/* Conteúdo */}
        <div className="relative z-10 flex h-full flex-col p-10">

          {/* Logo */}
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <img src="/logo-w.svg" alt="GetIN" className="h-10 w-auto" />
          </div>

          {/* Texto central */}
          <div className="flex-1 flex flex-col gap-5 max-w-lg justify-center">

            {/* Badge "Sistema Ativo" */}
            <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 w-fit group hover:bg-blue-500/15 transition-all duration-300">
                {/* Ponto de pulso */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-[11px] uppercase tracking-[0.18em] text-blue-400 font-semibold">
                  Sistema Ativo
                </span>
              </div>
            </div>

            {/* Título */}
            <h1
              className="text-5xl font-bold leading-[1.1] text-white tracking-tight font-heading animate-in fade-in slide-in-from-left-4 duration-700 delay-200"
            >
              Controle de
              <br />
              acesso{" "}
              <span className="text-blue-400">inteligente</span>
              <br />
              para sua fábrica.
            </h1>

            {/* Descrição */}
            <p
              className="text-[15px] leading-relaxed text-white/50 max-w-sm animate-in fade-in slide-in-from-left-4 duration-700 delay-300"
            >
              Credenciamento digital, rastreabilidade em tempo real e auditoria
              completa de visitantes em todos os setores.
            </p>

            {/* Divisor */}
            <div className="w-12 h-0.5 rounded-full bg-blue-500/40 animate-in fade-in duration-700 delay-400" />
          </div>

          {/* Barra de estatísticas */}
          <div
            className="rounded-2xl bg-white/[0.05] border border-white/[0.09] p-5 backdrop-blur-sm
                        transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07]
                        animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500"
          >
            <div className="grid grid-cols-3 gap-4 divide-x divide-white/[0.08]">
              <StatItem value="38" label="Visitas hoje" icon={Users} />
              <div className="pl-4">
                <StatItem value="6" label="Setores ativos" icon={Activity} />
              </div>
              <div className="pl-4">
                <StatItem value="100" suffix="%" label="Rastreabilidade" icon={ShieldCheck} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PAINEL DIREITO (formulário) ── */}
      <div className="flex flex-1 lg:w-[42%] items-center justify-center bg-white px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>

    </div>
  )
}
