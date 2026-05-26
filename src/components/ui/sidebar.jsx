"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building,
  Building2,
  FileText,
  Home,
  IdCard,
  MapPinned,
  PanelLeft,
  PanelLeftClose,
  Settings,
  ShieldCheck,
  Sun,
  Moon,
  UserSquare2,
  Users,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import SidebarUserProfile from '@/components/SidebarUserProfile';
import { useAppTheme } from '@/lib/theme';

const ADMIN_ITEMS = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/visitantes', icon: Users, label: 'Visitantes' },
  { href: '/dashboard/funcionarios', icon: UserSquare2, label: 'Funcionarios' },
  { href: '/dashboard/crachas', icon: IdCard, label: 'Crachas' },
  { href: '/dashboard/setores', icon: Building2, label: 'Setores' },
  { href: '/dashboard/circulacao', icon: MapPinned, label: 'Circulacao' },
  { href: '/dashboard/permissao', icon: ShieldCheck, label: 'Permissoes' },
  { href: '/dashboard/empresas', icon: Building, label: 'Empresas' },
  { href: '/dashboard/relatorios', icon: FileText, label: 'Relatorios' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const { isDark, toggleTheme } = useAppTheme();

  const isActive = (href) =>
    href === '/dashboard'
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col
          overflow-y-auto border-r border-gray-200/60 bg-[#f4f5f7] pt-8 pb-6
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          dark:border-white/10 dark:bg-[#020C17]
          ${isExpanded ? 'w-[300px] px-4' : 'w-[80px] px-2'}
        `}
      >
        <SidebarHeader
          isDark={isDark}
          isExpanded={isExpanded}
          onToggleTheme={toggleTheme}
          onToggleExpanded={() => setIsExpanded((current) => !current)}
        />

        {!isExpanded && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="mx-auto mb-6 flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-colors hover:text-black dark:hover:text-white"
            aria-label="Expandir menu lateral"
          >
            <PanelLeft size={20} strokeWidth={1.5} />
          </button>
        )}

        {isExpanded && (
          <p className="mb-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-300 dark:opacity-70">
            Fluxo Administrativo
          </p>
        )}

        <nav className="flex flex-col gap-2">
          {ADMIN_ITEMS.map(({ href, icon: Icon, label }) => (
            <NavItem
              key={href}
              isExpanded={isExpanded}
              href={href}
              icon={<Icon size={20} strokeWidth={1.5} />}
              label={label}
              active={isActive(href)}
            />
          ))}
        </nav>

        <div className="my-4 h-px w-full bg-gray-200/60 dark:bg-white/5" />

        <div className={`mt-auto pt-8 ${isExpanded ? 'space-y-3' : 'flex flex-col items-center gap-3'}`}>
          <SidebarUserProfile
            isExpanded={isExpanded}
            fallbackName="Administrador"
            fallbackEmail="admin@getin.com"
          />
          <NavItem
            isExpanded={isExpanded}
            href="/configuracoes"
            icon={<Settings size={20} strokeWidth={1.5} />}
            label="Configuracoes"
            active={isActive('/configuracoes')}
          />
        </div>
      </aside>

      <div
        className={`hidden shrink-0 transition-all duration-500 lg:block ${isExpanded ? 'w-[300px]' : 'w-[80px]'}`}
        aria-hidden="true"
      />
    </>
  );
}

function SidebarHeader({ isDark, isExpanded, onToggleTheme, onToggleExpanded }) {
  return (
    <div className={`mb-7 flex items-center ${isExpanded ? 'justify-between px-2' : 'flex-col justify-center gap-3'}`}>
      <div className={isExpanded ? 'min-w-0 overflow-hidden' : 'flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/5'}>
        <BrandLogo variant="dark" compact={!isExpanded} className="dark:hidden" />
        <BrandLogo variant="light" compact={!isExpanded} className="hidden dark:flex" />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white/50 text-gray-600 transition-all active:scale-90 hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          title={isDark ? 'Modo claro' : 'Modo escuro'}
          aria-label={isDark ? 'Alternar para o modo claro' : 'Alternar para o modo escuro'}
        >
          {isDark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
        </button>

        {isExpanded && (
          <button
            type="button"
            onClick={onToggleExpanded}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-colors hover:text-black dark:hover:text-white"
            aria-label="Recolher menu lateral"
          >
            <PanelLeftClose size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
}

function NavItem({ isExpanded, href, icon, label, active }) {
  return (
    <Link
      href={href}
      title={!isExpanded ? label : undefined}
      className={`
        group flex items-center justify-between transition-all duration-200
        ${
          active
            ? 'bg-white text-black shadow-sm dark:bg-[#4DA8EA] dark:text-white'
            : 'text-gray-500 hover:bg-black/5 hover:text-black dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
        }
        ${isExpanded ? 'rounded-[20px] px-4 py-2.5' : 'mx-auto flex h-12 w-12 justify-center rounded-full p-3'}
      `}
    >
      <div className="flex items-center gap-4 overflow-hidden">
        <span className="relative flex flex-shrink-0 items-center justify-center">{icon}</span>
        {isExpanded && <span className="whitespace-nowrap text-[14px] font-medium">{label}</span>}
      </div>
    </Link>
  );
}
