'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  LayoutGrid,
  Lock,
  Activity,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  IdCard,
  Building,
  Check,
  Sun, // <- Novo Ícone adicionado
  Moon // <- Novo Ícone adicionado
} from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Estado para controlar o tema
  const [isDark, setIsDark] = useState(true);

  // Efeito para verificar o tema atual ao carregar a página
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
    // Define o tema escuro como padrão se nenhum estiver definido
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

    // Dispara um evento global para que todo o site saiba que o tema mudou
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: isNowDark }));
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Botão hambúrguer (visível apenas em telas pequenas) */}
      <button
        onClick={toggleSidebar}
        aria-label={isOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
        aria-expanded={isOpen}
        aria-controls="app-sidebar"
        className="lg:hidden fixed top-8 left-6 z-[60] p-2 bg-white dark:bg-[#0A254052] rounded-2xl text-gray-900 dark:text-white active:scale-90 transition-all border border-gray-200 dark:border-white/10 shadow-sm"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay (sombra ao abrir em dispositivos móveis) */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[50] animate-in fade-in duration-300"
        />
      )}

      {/* Barra lateral principal — com cores dinâmicas (claro / escuro) */}
    <aside id="app-sidebar" className={`
      fixed lg:sticky top-0 left-0 h-screen w-72 
      flex flex-col shadow-2xl z-[55] transition-all duration-500 ease-in-out 
      border-r border-white/20 dark:border-white/10
      bg-white/40 dark:bg-[#020C17]/40 
      backdrop-blur-xl
      
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}> 
            {/* Cabeçalho com logo/texto e botão de tema */}
            <div className="p-8 lg:ml-0 mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-3 group cursor-pointer">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter group-hover:tracking-normal transition-all duration-300">
                  GET<span className="text-[#4DA8EA]">IN</span>
                </h1>
              </div>

              {/* Botão para alternar o tema */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-all active:scale-90"
                title={isDark ? "Alternar para o modo claro" : "Alternar para o modo escuro"}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            {/* Navegação principal */}
            <div className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
              <div>
                <p className="px-4 text-[10px] font-bold text-gray-500 dark:text-gray-300 tracking-[0.2em] uppercase mb-4 dark:opacity-70">
                  Menu Principal
                </p>
                <nav className="space-y-1.5">
                  <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={pathname === '/dashboard'} onClick={() => setIsOpen(false)} />
                  <NavItem href="/dashboard/crachas" icon={IdCard} label="Crachás" active={pathname === '/dashboard/crachas'} onClick={() => setIsOpen(false)} />
                  <NavItem href="/dashboard/visitantes" icon={Users} label="Visitantes" active={pathname === '/dashboard/visitantes'} onClick={() => setIsOpen(false)} />
                  <NavItem href="/dashboard/funcionarios" icon={UserSquare2} label="Funcionários" active={pathname === '/dashboard/funcionarios'} onClick={() => setIsOpen(false)} />
                  <NavItem href="/dashboard/checkin" icon={Check} label="Check-In / Out" active={pathname === '/dashboard/checkin'} onClick={() => setIsOpen(false)} />
                  <NavItem href="/dashboard/setores" icon={LayoutGrid} label="Setores" active={pathname === '/dashboard/setores'} onClick={() => setIsOpen(false)} />
                  <NavItem href="/dashboard/empresas" icon={Building} label="Empresas" active={pathname === '/dashboard/empresas'} onClick={() => setIsOpen(false)} />
                </nav>
              </div>

              <div>
                <p className="px-4 text-[10px] font-bold text-gray-500 dark:text-gray-300 tracking-[0.2em] uppercase mb-4 dark:opacity-70">
                  Gestão de Acesso
                </p>
                <nav className="space-y-1.5">
                  <NavItem href="/dashboard/circulacao" icon={Activity} label="Circulação" active={pathname === '/dashboard/circulacao'} onClick={() => setIsOpen(false)} />
                  <NavItem href="/dashboard/permissao" icon={Lock} label="Permissões" active={pathname === '/dashboard/permissao'} onClick={() => setIsOpen(false)} />
                  <NavItem href="/dashboard/relatorios" icon={FileText} label="Relatórios" active={pathname === '/dashboard/relatorios'} onClick={() => setIsOpen(false)} />
                </nav>
              </div>
            </div>

            {/* Rodapé da barra lateral */}
            <div className="p-4 mt-auto border-t border-gray-100 dark:border-white/5">
              <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-transparent rounded-2xl p-4 mb-4 transition-colors duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <UserAvatar
                    name={user?.nome || 'Administrador'}
                    email={user?.email || 'admin@getin.com'}
                    className="w-8 h-8 text-[10px]"
                  />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user?.nome || 'Administrador'}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user?.email || 'admin@getin.com'}</p>
                  </div>
                </div>
                <Link href="/configuracoes" onClick={() => setIsOpen(false)} className="w-full py-2 px-3 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 dark:hover:text-white text-[10px] font-bold transition-all flex items-center justify-center space-x-2 group">
                  <Settings className="w-3 h-3 group-hover:rotate-90 transition-transform duration-500" />
                  <span>Configurações</span>
                </Link>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs font-bold transition-all flex items-center space-x-3 group cursor-pointer active:scale-95 transition-transform"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Sair do sistema</span>
              </button>
            </div>
          </aside>
        </>
      );
    }

function NavItem({ href, icon: Icon, label, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${active
        ? 'bg-[#4DA8EA] text-white shadow-lg shadow-blue-500/20'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
        }`}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="whitespace-nowrap">{label}</span>
      </div>

      {active && (
        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
          <ChevronRight className="w-4 h-4 opacity-50" />
        </div>
      )}

      {!active && (
        <div className="absolute left-0 w-1 h-0 bg-[#4DA8EA] rounded-r-full transition-all duration-300 group-hover:h-6" />
      )}
    </Link>
  );
}