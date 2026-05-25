"use client";

import { useState, useRef, useEffect } from "react";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

// --- ÍCONES NATIVOS ---
const GithubIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

const LinkedinIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const GlobeIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);

const TEAM = [
  {
    nome: "Fernando Sanches",
    cargo: "Frontend & Backend",
    github: "https://github.com/FernandoSnchs",
    linkedin: "https://linkedin.com/",
    avatar: "https://github.com/FernandoSnchs.png",
  },
  {
    nome: "Bia Costa",
    cargo: "Frontend Developer",
    github: "https://github.com/",
    linkedin: "https://linkedin.com/",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bia",
  },
  {
    nome: "Carlos Lima",
    cargo: "UI/UX Designer",
    github: "https://github.com/",
    linkedin: "https://linkedin.com/",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
  },
  {
    nome: "Dani Souza",
    cargo: "DevOps Engineer",
    github: "https://github.com/",
    linkedin: "https://linkedin.com/",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dani",
  },
  {
    nome: "Eduardo Reis",
    cargo: "Mobile Developer",
    github: "https://github.com/",
    linkedin: "https://linkedin.com/",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Edu",
  },
  {
    nome: "Fernanda Alves",
    cargo: "QA Tester",
    github: "https://github.com/",
    linkedin: "https://linkedin.com/",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fefa",
  },
];

export function FloatingAboutBubble() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Controles
  const bubbleRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false); // Gerencia a animação CSS ao soltar
  
  const isDraggingRef = useRef(false); // Gerencia a diferença entre clique e arraste
  const startPosRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    startPosRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    isDraggingRef.current = false;
    setIsDragging(true); // Desativa animação para seguir o mouse sem lag
  };

  const handlePointerMove = (e) => {
    if (e.buttons !== 1 && e.pointerType === 'mouse') return;
    
    const newX = e.clientX - startPosRef.current.x;
    const newY = e.clientY - startPosRef.current.y;
    
    if (Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5) {
      isDraggingRef.current = true;
    }
    
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    if (!isDraggingRef.current) {
      setIsOpen(true);
    } else {
      // --- LÓGICA DO EFEITO IMÃ (SNAP TO EDGE) ---
      if (bubbleRef.current) {
        const rect = bubbleRef.current.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Ponto central da bolinha
        const bubbleCenterX = rect.left + rect.width / 2;
        
        let deltaX = 0;
        let deltaY = 0;
        const padding = 4; // Margem reduzida para ficar "quase colado" (antes era 24)

        // Atrái para a borda lateral mais próxima (Esquerda ou Direita)
        if (bubbleCenterX < screenWidth / 2) {
          deltaX = padding - rect.left; // Gruda na esquerda
        } else {
          deltaX = (screenWidth - padding) - rect.right; // Gruda na direita
        }

        // Impede de sair da tela por cima ou por baixo
        if (rect.top < padding) {
          deltaY = padding - rect.top;
        } else if (rect.bottom > screenHeight - padding) {
          deltaY = (screenHeight - padding) - rect.bottom;
        }

        setPosition((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));
      }
    }
    
    setIsDragging(false); // Reativa a animação CSS para fazer o deslize final ser suave
    
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 0);
  };

  // Trava scroll com modal aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <div
        ref={bubbleRef}
        className={cn(
          "fixed bottom-2 right-2 z-100 flex items-center justify-center", // Reduzido de bottom-6 right-6
          isDragging 
            ? "cursor-grabbing" 
            : "cursor-grab transition-transform duration-300 ease-out" 
        )}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          touchAction: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="relative group">
          <div className="absolute inset-0 rounded-full bg-primary/40 blur-md animate-pulse"></div>
          
          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-110 active:scale-95 border-2 border-background/20"
            aria-label="Sobre o projeto"
          >
            <Info size={26} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground font-heading">
                  Sobre a Equipe
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Conheça os desenvolvedores por trás do sistema.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
              {TEAM.map((member, idx) => (
                <div 
                  key={idx}
                  className="group flex flex-col items-center rounded-2xl border border-border bg-background p-5 text-center transition-all hover:-translate-y-1 hover:shadow-lg hover:border-primary/50"
                >
                  <div className="mb-4 h-20 w-20 overflow-hidden rounded-full border-4 border-muted transition-all group-hover:border-primary">
                    <img 
                      src={member.avatar} 
                      alt={member.nome}
                      className="h-full w-full object-cover bg-slate-100 dark:bg-slate-800" 
                    />
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground">{member.nome}</h3>
                  <p className="text-xs font-medium text-primary mb-4">{member.cargo}</p>
                  
                  <div className="flex gap-3 mt-auto">
                    <a href={member.github} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-foreground hover:text-background">
                      <GithubIcon size={16} />
                    </a>
                    <a href={member.linkedin} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-[#0077b5] hover:text-white">
                      <LinkedinIcon size={16} />
                    </a>
                    
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  );
}