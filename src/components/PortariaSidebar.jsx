'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { 
  LogOut,
  ChevronRight,
  Menu,
  X,
  Settings,
  Home,
  AlertTriangle,
  FileText
} from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';

export default function PortariaSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuth();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Botão Hambúrguer (Visível apenas em telas pequenas) */}
      <button 
        onClick={toggleSidebar}
        aria-label={isOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
        aria-expanded={isOpen}
        aria-controls="portaria-sidebar"
        className="lg:hidden fixed top-8 left-6 z-[60] p-2 bg-[#0A254052] rounded-2xl text-white active:scale-90 transition-all border border-white/10"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay (Sombra ao abrir no mobile) */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[50] animate-in fade-in duration-300"
        />
      )}

      {/* Sidebar Principal */}
      <aside id="portaria-sidebar" className={`
        fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#0A2540] flex flex-col shadow-2xl z-[55] transition-all duration-500 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Cabeçalho com Logo/Texto */}
        <div className="p-8 ml-18 mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
           
            <h1 className="text-2xl  font-black text-white tracking-tighter group-hover:tracking-normal transition-all duration-300">
              GET<span className="text-[#4DA8EA]">IN</span>
            </h1>
          </div>
          
          
        
        </div>

        {/* Navegação Principal */}
        <div className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
          <div>
            <p className="px-4 text-[10px] font-bold text-gray-300 tracking-[0.2em] uppercase mb-4 opacity-70">
              Fluxo de Portaria
            </p>
            <nav className="space-y-1.5">
              <NavItem 
                href="/portaria" 
                icon={Home} 
                label="Operação" 
                active={pathname === '/portaria'} 
                onClick={() => setIsOpen(false)} 
              />
              <NavItem 
                href="/portaria/pendencias" 
                icon={AlertTriangle} 
                label="Pendências" 
                active={pathname === '/portaria/pendencias'} 
                onClick={() => setIsOpen(false)} 
              />
              <NavItem 
                href="/portaria/historico" 
                icon={FileText} 
                label="Histórico" 
                active={pathname === '/portaria/historico'} 
                onClick={() => setIsOpen(false)} 
              />
            </nav>
          </div>
        </div>

        {/* Rodapé da Sidebar */}
          <div className="p-4 mt-auto border-t border-white/5">
            <div className="bg-white/5 rounded-2xl p-4 mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <UserAvatar 
                  name={user?.nome || 'Portaria'} 
                  email={user?.email || 'portaria@getin.com'} 
                  className="w-8 h-8 text-[10px]" 
                />
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{user?.nome || 'Portaria'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email || 'portaria@getin.com'}</p>
                </div>
              </div>
              <Link href="/configuracoes" onClick={() => setIsOpen(false)} className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10px] font-bold transition-all flex items-center justify-center space-x-2 group">
                <Settings className="w-3 h-3 group-hover:rotate-90 transition-transform duration-500" />
                <span>Configurações</span>
              </Link>
            </div>
          
          <button 
            onClick={handleLogout}
            className="w-full py-3 px-4 rounded-xl text-red-400 hover:bg-red-500/10 text-xs font-bold transition-all flex items-center space-x-3 group cursor-pointer active:scale-95 transition-transform"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Sair do Sistema</span>
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
      className={`group relative flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
        active 
          ? 'bg-[#4DA8EA] text-white shadow-lg shadow-blue-500/20' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
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
