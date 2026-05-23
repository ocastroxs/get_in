'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, MessageSquare, Plus, CreditCard, 
  Inbox, Folder, Calendar, Compass, Minus, Users, 
  UserSquare2, PanelLeftClose, PanelLeft, Sun, Moon, Bolt
} from 'lucide-react';

export default function UnifiedSoftSidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isThreadsOpen, setIsThreadsOpen] = useState(true);
  const [isThreadsOpen2, setIsThreadsOpen2] = useState(true);
  // --- LÓGICA DE TEMA ADICIONADA ---
  const [isDark, setIsDark] = useState(true);
useEffect(() => {
    // 1. Checa se existe uma preferência salva no navegador
    const savedTheme = localStorage.getItem('app_theme');
    
    if (savedTheme) {
      const shouldBeDark = savedTheme === 'dark';
      setIsDark(shouldBeDark);
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // 2. Se não houver nada salvo, define 'dark' como o padrão inicial do projeto
      document.documentElement.classList.add('dark');
      setIsDark(true);
      localStorage.setItem('app_theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const isNowDark = html.classList.contains('dark');
    
    setIsDark(isNowDark);
    
    // Salva a nova escolha do usuário para a próxima página lembrar
    localStorage.setItem('app_theme', isNowDark ? 'dark' : 'light');
    
    // Dispara o evento para atualizar o fundo de partículas instantaneamente
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: isNowDark }));
  };
  // --------------- 

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
          <NavItem isExpanded={isExpanded} href="/dashboard" icon={<Home size={20} strokeWidth={1.5} />} label="Dashboard" />
          
        
          
          <NavItem 
            isExpanded={isExpanded}
            href="/dashboard/visitantes" 
            icon={<Users size={20} strokeWidth={1.5} />} 
            label="Visitantes" 
          />
          
          <NavItem 
            isExpanded={isExpanded}
            href="/dashboard/funcionarios" 
            icon={<UserSquare2 size={20} strokeWidth={1.5} />} 
            label="Funcionários" 
          />
        </nav>

        <div className="w-full h-px bg-gray-200/60 dark:bg-white/5 my-4" />

        {/* Seção Acordeão */}
        <div className="flex flex-col">
          <div 
            onClick={() => {
              if (!isExpanded) setIsExpanded(true);
              setIsThreadsOpen(!isThreadsOpen);
            }}
            className={`
              flex items-center cursor-pointer transition-all duration-300
              ${isExpanded 
                ? 'justify-between px-4 py-3 bg-[#18181b] dark:bg-[#4DA8EA] text-white rounded-[20px] shadow-lg shadow-blue-500/10' 
                : 'justify-center p-3 mx-auto bg-white dark:bg-white/5 text-black dark:text-white shadow-sm rounded-full w-12 h-12 border border-gray-100 dark:border-white/10'
              }
            `}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="min-w-[20px]">
                <Inbox size={20} strokeWidth={1.5} className={(!isExpanded && !isDark) ? "text-black" : "text-white"} />
              </div>
              {isExpanded && <span className="text-[14px] font-medium whitespace-nowrap">Controle</span>}
            </div>
            {isExpanded && (
              isThreadsOpen ? <Minus size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />
            )}
          </div>

          <div className={`grid transition-all duration-300 ease-in-out ${isExpanded && isThreadsOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="ml-7 pl-4 border-l border-gray-300/80 dark:border-white/10 flex flex-col gap-1 py-1">
                <SubItem href="/dashboard/crachas" label="Crachás" active={pathname === '/dashboard/crachas'} />
                <SubItem href="/dashboard/checkin" label="Check-In" active={pathname === '/dashboard/checkin'} /> 
                <SubItem href="/dashboard/setores" label="Setores" active={pathname === '/dashboard/setores'} />
              </div>
            </div>
          </div>
        </div>
        <br></br>

                {/* Seção Acordeão 2*/}
        <div className="flex flex-col">
          <div 
            onClick={() => {
              if (!isExpanded) setIsExpanded(true);
              setIsThreadsOpen2(!isThreadsOpen2);
            }}
            className={`
              flex items-center cursor-pointer transition-all duration-300
              ${isExpanded 
                ? 'justify-between px-4 py-3 bg-[#18181b] dark:bg-[#4DA8EA] text-white rounded-[20px] shadow-lg shadow-blue-500/10' 
                : 'justify-center p-3 mx-auto bg-white dark:bg-white/5 text-black dark:text-white shadow-sm rounded-full w-12 h-12 border border-gray-100 dark:border-white/10'
              }
            `}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="min-w-[20px]">
                <Inbox size={20} strokeWidth={1.5} className={(!isExpanded && !isDark) ? "text-black" : "text-white"} />
              </div>
              {isExpanded && <span className="text-[14px] font-medium whitespace-nowrap">Acesso</span>}
            </div>
            {isExpanded && (
              isThreadsOpen2 ? <Minus size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />
            )}
          </div>

          <div className={`grid transition-all duration-300 ease-in-out ${isExpanded && isThreadsOpen2 ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="ml-7 pl-4 border-l border-gray-300/80 dark:border-white/10 flex flex-col gap-1 py-1">
                <SubItem href="/dashboard/circulacao" label="Circulação" active={pathname === '/dashboard/circulacao'} />
                <SubItem href="/dashboard/permissao" label="Permissões" active={pathname === '/dashboard/permissao'} /> 
                
              </div>
            </div>
          </div>
        </div>
        

        {/* Navegação Inferior */}
        <div className="mt-4 flex flex-col gap-2">
          <NavItem isExpanded={isExpanded} href="/dashboard/empresas" icon={<Calendar size={20} strokeWidth={1.5} />} label="Empresas" />
          <NavItem 
            isExpanded={isExpanded}
            href="/dashboard/relatorios" 
            icon={<Compass size={20} strokeWidth={1.5} />} 
            label="Relatórios" 
          />

        </div>



            
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