'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, MessageSquare, Plus, CreditCard, 
  Inbox, Folder, Calendar, Compass, Minus, Users, 
  UserSquare2, PanelLeftClose, PanelLeft, Sun, Moon,Album, BadgeCheck, Bolt
} from 'lucide-react';

export default function UnifiedSoftSidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isThreadsOpen, setIsThreadsOpen] = useState(true);
  const [isThreadsOpen2, setIsThreadsOpen2] = useState(true);
  // --- LÓGICA DE TEMA ADICIONADA ---
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const isNowDark = html.classList.contains('dark');
    setIsDark(isNowDark);
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: isNowDark }));
  };
  // --------------------------------

  return (
    <>
      <aside 
        className={`
          fixed left-0 top-0 h-screen z-50 flex flex-col 
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          bg-[#f4f5f7] dark:bg-[#020C17] 
          border-r border-gray-200/60 dark:border-white/10
          ${isExpanded ? 'w-[300px] px-4' : 'w-[80px] px-2'}
          py-6 overflow-y-auto no-scrollbar
        `}
      >
        
        {/* Cabeçalho com LOGO ORIGINAL e Botão de Tema */}
        <div className={`flex items-center mb-8 ${isExpanded ? 'justify-between px-2' : 'flex-col gap-4 justify-center'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            {isExpanded && (
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter transition-all duration-300">
                GET<span className="text-[#4DA8EA]">IN</span>
              </h1>
            )}
            {!isExpanded && (
              <span className="text-[#4DA8EA] font-black text-xl">G</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Botão de Troca de Tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-all active:scale-90 border border-gray-200 dark:border-white/10"
              title={isDark ? "Modo Claro" : "Modo Escuro"}
            >
              {isDark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
            </button>

            {isExpanded && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1.5 rounded-lg"
              >
                <PanelLeftClose size={20} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        {!isExpanded && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mb-6 mx-auto text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1.5"
          >
            <PanelLeft size={20} strokeWidth={1.5} />
          </button>
        )}

        {/* Navegação Superior */}
        <nav className="flex flex-col gap-2">
          <NavItem isExpanded={isExpanded} href="/supervisor" icon={<Home size={20} strokeWidth={1.5} />} label="Dashboard" />
          
        
          
          <NavItem 
            isExpanded={isExpanded}
            href="/supervisor/aprovacoes" 
            icon={<BadgeCheck size={20} strokeWidth={1.5} />} 
            label="Aprovações" 
          />
          
          <NavItem 
            isExpanded={isExpanded}
            href="/supervisor/historico" 
            icon={<Album size={20} strokeWidth={1.5} />} 
            label="Histórico" 
          />
        </nav>

        <div className="w-full h-px bg-gray-200/60 dark:bg-white/5 my-4" />

       

            
        <div className="mt-auto pt-8">
          <NavItem isExpanded={isExpanded} href="/configuracoes" icon={<Bolt size={20} strokeWidth={1.5} />} label="Configurações" />
        </div>
      </aside>

      <div className={`transition-all duration-500 ${isExpanded ? 'ml-[300px]' : 'ml-[80px]'}`} />
    </>
  );
}

function NavItem({ isExpanded, href, icon, label, dot, badge, suffix }) {
  return (
    <Link 
      href={href} 
      title={!isExpanded ? label : undefined}
      className={`
        group flex items-center justify-between transition-all duration-200
        text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white
        ${isExpanded ? 'px-4 py-2.5 rounded-[20px]' : 'p-3 mx-auto rounded-full w-12 h-12 flex justify-center'}
      `}
    >
      <div className="flex items-center gap-4 overflow-hidden">
        <div className="relative flex-shrink-0 flex items-center justify-center">
          {icon}
          {dot && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-pink-400 rounded-full border-2 border-[#f4f5f7] dark:border-[#020C17]"></span>
          )}
        </div>
        {isExpanded && <span className="text-[14px] font-medium whitespace-nowrap">{label}</span>}
      </div>
      
      {isExpanded && (
        <div className="flex items-center gap-2">
          {badge && (
            <span className="bg-[#18181b] dark:bg-[#4DA8EA] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {badge}
            </span>
          )}
          {suffix && suffix}
        </div>
      )}
    </Link>
  );
}

function SubItem({ href, label, active }) {
  return (
    <Link 
      href={href}
      className={`
        flex items-center gap-3 px-4 py-2.5 rounded-[18px] text-[13.5px] font-medium transition-all
        ${active 
          ? 'bg-white dark:bg-[#4DA8EA] text-black dark:text-white shadow-sm' 
          : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
        }
      `}
    >
      <Folder size={18} strokeWidth={1.5} className={active ? 'text-black dark:text-white' : 'text-gray-400'} />
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
}