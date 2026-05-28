'use client';
import React, { useEffect, useRef, useState } from 'react';

function createParticle(canvas) {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 1,
    speedX: (Math.random() - 0.5) * 0.5,
    speedY: (Math.random() - 0.5) * 0.5,
    opacity: Math.random() * 0.5 + 0.1
  };
}

function updateParticle(particle, canvas) {
  particle.x += particle.speedX;
  particle.y += particle.speedY;
  if (particle.x > canvas.width) particle.x = 0;
  else if (particle.x < 0) particle.x = canvas.width;
  if (particle.y > canvas.height) particle.y = 0;
  else if (particle.y < 0) particle.y = canvas.height;
}

function drawParticle(particle, ctx, particleRgb) {
  ctx.fillStyle = `rgba(${particleRgb}, ${particle.opacity})`;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  ctx.fill();
}

const ParticlesBackground = () => {
  const canvasRef = useRef(null);
  
  // Controle do fundo em CSS
  const [isDarkState, setIsDarkState] = useState(true);
  const particlesArrayRef = useRef([]);

  // ─── EFEITO 1: MONITORAMENTO BLINDADO (FORÇA BRUTA) ────────────────────────
  useEffect(() => {
    // Essa função lê a classe real do DOM (impossível de falhar)
    const syncTheme = () => {
      const isDarkActive = document.documentElement.classList.contains('dark');
      setIsDarkState(isDarkActive);
    };

    // Sincroniza logo que carrega
    syncTheme();

    // Sincroniza via evento da Sidebar
    window.addEventListener('themeChanged', syncTheme);
    
    // BACKUP INFALÍVEL: Checa a cada 150ms se a classe mudou. 
    // Assim, se o evento falhar, o fundo muda sozinho!
    const intervalId = setInterval(syncTheme, 150);

    return () => {
      window.removeEventListener('themeChanged', syncTheme);
      clearInterval(intervalId);
    };
  }, []);

  // ─── EFEITO 2: LOOP DE ANIMAÇÃO DIRETO DO DOM ──────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    if (particlesArrayRef.current.length === 0) {
      const particlesCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000));
      particlesArrayRef.current = Array.from({ length: particlesCount }, () => createParticle(canvas));
    }
    const particlesArray = particlesArrayRef.current;
    let animationId;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // A MÁGICA ESTÁ AQUI: 
      // Lemos o DOM diretamente a cada frame! Se a Sidebar tirou o dark, ele desenha claro na mesma hora.
      const isDark = document.documentElement.classList.contains('dark');
      
      // Cores baseadas puramente na leitura do DOM acima
      const lineRgb = isDark ? '255, 255, 255' : '0, 0, 0'; // Linha Branca no escuro, Preta no claro
      const particleRgb = isDark ? '255, 255, 255' : '77, 168, 234'; // Bolinha Branca no escuro, Azul no claro
      
      particlesArray.forEach(particle => {
        updateParticle(particle, canvas);
        drawParticle(particle, ctx, particleRgb);
      });

      for (let i = 0; i < particlesArray.length; i++) {
        for (let j = i; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.strokeStyle = `rgba(${lineRgb}, ${0.1 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        transition: 'background 0.5s ease-in-out',
        // Troquei o #0A2540 por #020C17 (Marinho super escuro). 
        // Se quiser preto total, use '#000000'
        background: isDarkState ? '#020C17' : '#ffffff'
      }}
    />
  );
};

export default ParticlesBackground;
