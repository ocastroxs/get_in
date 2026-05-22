'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  X,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import UserAvatar from '@/components/ui/UserAvatar';
import { useAuth } from '@/lib/AuthContext';

export default function PortariaSidebar() {
  const pathname = usePathname();
  const { logout, user, funcionario } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const isConfiguracoes = pathname === '/configuracoes';
  const avatarSrc = user?.avatarUrl || user?.imagem || funcionario?.avatarUrl || funcionario?.imagem;

  useEffect(() => {
    if (!document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleSidebar = () => setIsOpen((current) => !current);

  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const isNowDark = html.classList.contains('dark');
    setIsDark(isNowDark);
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: isNowDark }));
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={isOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
        aria-expanded={isOpen}
        aria-controls="portaria-sidebar"
        className="fixed left-6 top-8 z-[60] rounded-2xl border border-gray-200 bg-white p-2 text-gray-900 shadow-sm transition-all active:scale-90 dark:border-white/10 dark:bg-[#0A254052] dark:text-white lg:hidden"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-[50] bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 lg:hidden"
        />
      )}

      <aside
        id="portaria-sidebar"
        className={`fixed left-0 top-0 z-[55] flex h-screen w-72 flex-col border-r border-gray-200/70 bg-white/80 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-in-out dark:border-white/10 dark:bg-[#0A2540] lg:sticky ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="mb-4 flex items-center justify-between p-8">
          <div>
            <BrandLogo variant="dark" className="dark:hidden" />
            <BrandLogo variant="light" className="hidden dark:flex" />
          </div>
          <ThemeButton isDark={isDark} onClick={toggleTheme} />
        </div>

        <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto px-4">
          <NavSection title="Fluxo de Portaria">
            <NavItem href="/portaria" icon={LayoutDashboard} label="Operação" active={pathname === '/portaria'} onClick={() => setIsOpen(false)} />
            <NavItem href="/portaria/pendencias" icon={AlertTriangle} label="Pendências" active={pathname === '/portaria/pendencias'} onClick={() => setIsOpen(false)} />
            <NavItem href="/portaria/aprovacoes" icon={CheckCircle2} label="Aprovações" active={pathname === '/portaria/aprovacoes'} onClick={() => setIsOpen(false)} />
            <NavItem href="/portaria/historico" icon={FileText} label="Histórico" active={pathname === '/portaria/historico'} onClick={() => setIsOpen(false)} />
          </NavSection>
        </div>

        <SidebarFooter
          user={user}
          avatarSrc={avatarSrc}
          fallbackName="Portaria"
          fallbackEmail="portaria@getin.com"
          isConfiguracoes={isConfiguracoes}
          onClose={() => setIsOpen(false)}
          onLogout={logout}
        />
      </aside>
    </>
  );
}

function ThemeButton({ isDark, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl bg-gray-100 p-2 text-gray-600 transition-all hover:bg-gray-200 active:scale-90 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
      title={isDark ? 'Alternar para o modo claro' : 'Alternar para o modo escuro'}
      aria-label={isDark ? 'Alternar para o modo claro' : 'Alternar para o modo escuro'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function NavSection({ title, children }) {
  return (
    <div>
      <p className="mb-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-300 dark:opacity-70">
        {title}
      </p>
      <nav className="space-y-1.5">{children}</nav>
    </div>
  );
}

function SidebarFooter({ user, avatarSrc, fallbackName, fallbackEmail, isConfiguracoes, onClose, onLogout }) {
  const name = user?.nome || fallbackName;
  const email = user?.email || fallbackEmail;

  return (
    <div className="mt-auto border-t border-gray-100 p-4 dark:border-white/5">
      <div className="mb-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-colors duration-300 dark:border-transparent dark:bg-white/5">
        <div className="mb-3 flex items-center space-x-3">
          <UserAvatar name={name} email={email} src={avatarSrc} className="h-8 w-8 text-[10px]" />
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-xs font-bold text-gray-900 dark:text-white">{name}</p>
            <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">{email}</p>
          </div>
        </div>
        <Link
          href="/configuracoes"
          onClick={onClose}
          className={`flex w-full items-center justify-center space-x-2 rounded-xl px-3 py-2 text-[10px] font-bold transition-all group ${
            isConfiguracoes
              ? 'bg-[#4DA8EA] text-white shadow-lg shadow-blue-500/20'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
          }`}
        >
          <Settings className="h-3 w-3 transition-transform duration-500 group-hover:rotate-90" />
          <span>Configurações</span>
        </Link>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="group flex w-full cursor-pointer items-center space-x-3 rounded-xl px-4 py-3 text-xs font-bold text-red-500 transition-all active:scale-95 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
      >
        <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span>Sair do sistema</span>
      </button>
    </div>
  );
}

function NavItem({ href, icon: Icon, label, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
        active
          ? 'bg-[#4DA8EA] text-white shadow-lg shadow-blue-500/20'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white'
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`h-5 w-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="whitespace-nowrap">{label}</span>
      </div>

      {active && (
        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
          <ChevronRight className="h-4 w-4 opacity-50" />
        </div>
      )}

      {!active && <div className="absolute left-0 h-0 w-1 rounded-r-full bg-[#4DA8EA] transition-all duration-300 group-hover:h-6" />}
    </Link>
  );
}
