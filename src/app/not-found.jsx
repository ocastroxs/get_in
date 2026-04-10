import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      
      {/* Contêiner da animação de erro RFID */}
      <div className="relative flex items-center justify-center w-32 h-32 mb-8">
        
        {/* Anéis de alerta estáticos/piscando simulando falha de sinal */}
        <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute inset-2 rounded-full border border-red-500/40 border-dashed animate-[spin_4s_linear_infinite]"></div>

        {/* Ícone central do Microchip com erro */}
        <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-white rounded-xl shadow-lg border-2 border-red-200">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-red-500"
          >
            {/* Corpo do chip */}
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            
            {/* O "X" indicando erro na leitura */}
            <line x1="9" y1="9" x2="15" y2="15" className="text-red-600" strokeWidth="2"></line>
            <line x1="15" y1="9" x2="9" y2="15" className="text-red-600" strokeWidth="2"></line>
            
            {/* Pinos superiores e inferiores */}
            <line x1="9" y1="1" x2="9" y2="4"></line>
            <line x1="15" y1="1" x2="15" y2="4"></line>
            <line x1="9" y1="20" x2="9" y2="23"></line>
            <line x1="15" y1="20" x2="15" y2="23"></line>
            {/* Pinos laterais */}
            <line x1="20" y1="9" x2="23" y2="9"></line>
            <line x1="20" y1="14" x2="23" y2="14"></line>
            <line x1="1" y1="9" x2="4" y2="9"></line>
            <line x1="1" y1="14" x2="4" y2="14"></line>
          </svg>
        </div>
      </div>

      {/* Textos de Erro */}
      <div className="flex flex-col items-center text-center gap-2 mb-8">
        <h1 className="text-6xl font-black text-slate-800 tracking-tighter">404</h1>
        <h2 className="text-lg font-bold text-slate-700 tracking-[0.15em] uppercase">
          Página Não Localizada
        </h2>
        <p className="text-slate-500 max-w-sm mt-2">
          O sinal foi perdido. A página que você está tentando acessar não existe ou o caminho está errado.
        </p>
      </div>

      {/* Botão de Retorno */}
      <Link 
        href="/" 
        className="group flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all active:scale-95"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="transition-transform group-hover:-translate-x-1"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Voltar para a página anterior
      </Link>

    </div>
  );
}