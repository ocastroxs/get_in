"use client"

import { useState, useEffect, useRef } from "react"
import { LoginForm } from "@/components/login-form"
import { ChevronRight, Users, ShieldCheck, Activity, Sparkles } from "lucide-react"

const TITLES = [
  {
    text: "Controle de acesso inteligente para sua fábrica.",
    highlights: ["inteligente"]
  },
  {
    text: "Rastreabilidade em tempo real.",
    highlights: ["tempo real"]
  },
  {
    text: "Auditoria completa de visitantes.",
    highlights: ["completa"]
  },
];

function AnimatedTitle() {
  const [displayedText, setDisplayedText] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [speed, setSpeed] = useState(100);

  useEffect(() => {
    const currentTitle = TITLES[titleIndex].text;
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayedText.length < currentTitle.length) {
          setDisplayedText(currentTitle.substring(0, displayedText.length + 1));
          setSpeed(100);
        } else {
          setSpeed(2000);
          setIsDeleting(true);
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(displayedText.substring(0, displayedText.length - 1));
          setSpeed(50);
        } else {
          setIsDeleting(false);
          setTitleIndex((prev) => (prev + 1) % TITLES.length);
          setSpeed(500);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedText, titleIndex, isDeleting, speed]);

  const renderHighlightedText = () => {
    const highlights = TITLES[titleIndex].highlights;
    let parts = [{ text: displayedText, isHighlight: false }];

    highlights.forEach((word) => {
      const newParts = [];
      parts.forEach((part) => {
        if (part.isHighlight) {
          newParts.push(part);
        } else {
          const regex = new RegExp(`(${word})`, "gi");
          const split = part.text.split(regex);
          split.forEach((segment, index) => {
            if (segment.toLowerCase() === word.toLowerCase()) {
              newParts.push({ text: segment, isHighlight: true });
            } else if (segment) {
              newParts.push({ text: segment, isHighlight: false });
            }
          });
        }
      });
      parts = newParts;
    });

    return parts;
  };

  const parts = renderHighlightedText();

  return (
    <h1 className="text-5xl font-bold leading-tight text-white tracking-tight font-heading min-h-[160px]">
      {parts.map((part, idx) => (
        <span 
          key={idx} 
          className={part.isHighlight ? "text-blue-400 font-extrabold drop-shadow-lg" : ""}
        >
          {part.text}
        </span>
      ))}
      <span className="animate-pulse ml-1">|</span>
    </h1>
  );
}

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

export default function LoginPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      {/* LEFT PANEL - decorative */}
      <div className="relative hidden w-[60%] lg:flex flex-col overflow-hidden" style={{ background: "#0B2447" }}>
        {/* Partículas animadas */}
        <PanelParticles />

        {/* Animated gradient background */}
        <div 
          className="absolute inset-0 opacity-20 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 0.1}% ${mousePosition.y * 0.1}%, rgba(74, 168, 234, 0.3) 0%, transparent 50%)`
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.25] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B2447]/60 via-transparent to-[#0B2447]/80 pointer-events-none" />

        {/* Decorative circles com animação */}
        <div className="absolute top-12 right-24 w-32 h-32 rounded-full border border-white/[0.06] animate-pulse" />
        <div className="absolute bottom-20 right-12 w-56 h-56 rounded-full border border-white/[0.04] animate-pulse delay-1000" />
        <div className="absolute bottom-64 right-72 w-72 h-72 rounded-full border border-white/[0.03] animate-pulse delay-500" />

        {/* Glow effect */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col p-10">
          {/* Logo top */}
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <img src="logo-w.svg" alt="Logo" className="h-10 w-auto" />
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col gap-6 max-w-lg justify-center">
            {/* Status badge com animação */}
            <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 w-fit group hover:bg-blue-500/15 transition-all duration-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-[11px] uppercase tracking-[0.18em] text-blue-400 font-semibold">Sistema Ativo</span>
              </div>
            </div>

            {/* Animated title */}
            <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
              <AnimatedTitle />
            </div>

            {/* Subtitle */}
            <p className="text-md leading-relaxed text-white/60 animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
              Sistema de controle de acesso avançado para empresas modernas.
            </p>
          </div>

          {/* Stats bar com glassmorphism */}
          <div className="rounded-xl bg-white/[0.08] border border-white/[0.12] p-5 transition-all duration-300 hover:-translate-y-1 backdrop-blur-md hover:bg-white/[0.12] hover:shadow-xl hover:shadow-blue-500/10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <div className="grid grid-cols-3 gap-4">
              <StatItem value="38" label="Visitas hoje" icon={Users} />
              <StatItem value="6" label="Setores ativos" icon={ShieldCheck} />
              <StatItem value="100" suffix="%" label="Rastreabilidade" icon={Activity} />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - login form */}
      <div className="flex w-[40%] items-center justify-center bg-gradient-to-br from-white via-white to-gray-50/50 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #0B2447 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        {/* Glassmorphic container */}
        <div className="w-full px-20 relative z-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
