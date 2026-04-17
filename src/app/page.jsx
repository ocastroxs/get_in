"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { Users2, ChevronRight } from "lucide-react"

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
    <h1 className="text-5xl font-bold leading-tight text-white tracking-tight font-heading">
      {parts.map((part, idx) => (
        <span key={idx} className={part.isHighlight ? "text-blue-400" : ""}>
          {part.text}
        </span>
      ))}
      <span className="animate-pulse">|</span>
    </h1>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full">
      {/* LEFT PANEL - decorative */}
      <div className="relative hidden w-[60%] lg:block" style={{ background: "#0B2447" }}>
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
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

            <AnimatedTitle />

            <p className="text-md leading-relaxed text-white/50 h-6">
              Sistema de controle de acesso avançado para empresas modernas.
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
