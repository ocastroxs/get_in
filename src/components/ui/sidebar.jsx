"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Building,
  Building2,
  FileText,
  Home,
  IdCard,
  MapPinned,
  PanelLeft,
  PanelLeftClose,
  ShieldCheck,
  Sun,
  Moon,
  UserSquare2,
  Users,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import SidebarUserProfile from '@/components/SidebarUserProfile';
import { useSidebarPreference } from '@/hooks/useSidebarPreference';
import { useAppTheme } from '@/lib/theme';

const ADMIN_SECTIONS = [
  {
    title: 'Fluxo Administrativo',
    items: [
      { href: '/dashboard', icon: Home, label: 'Dashboard' },
      { href: '/dashboard/visitantes', icon: Users, label: 'Visitantes' },
      { href: '/dashboard/funcionarios', icon: UserSquare2, label: 'Funcionários' },
      { href: '/dashboard/crachas', icon: IdCard, label: 'Crachás' },
      { href: '/dashboard/setores', icon: Building2, label: 'Setores' },
      { href: '/dashboard/empresas', icon: Building, label: 'Empresas' },
    ],
  },
  {
    title: 'Gestão e Auditoria',
    items: [
      { href: '/dashboard/circulacao', icon: MapPinned, label: 'Circulação' },
      { href: '/dashboard/permissao', icon: ShieldCheck, label: 'Permissões' },
      { href: '/dashboard/relatorios', icon: FileText, label: 'Relatórios' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useSidebarPreference();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isDark, toggleTheme } = useAppTheme();

  const isActive = (href) =>
    href === '/dashboard'
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const closeMobileSidebar = () => setIsMobileOpen(false);
  const openMobileSidebar = () => {
    setIsExpanded(true);
    setIsMobileOpen(true);
  };
  const toggleExpanded = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
      return;
    }

    setIsExpanded((current) => !current);
  };

  return (
    <>
      <button
        type="button"
        onClick={openMobileSidebar}
        className={`fixed left-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white/90 text-gray-700 shadow-lg shadow-black/5 backdrop-blur transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white hover:text-black active:scale-95 dark:border-white/10 dark:bg-[#061320]/90 dark:text-gray-200 dark:hover:bg-[#0b1b2b] lg:hidden ${
          isMobileOpen ? 'pointer-events-none -translate-x-2 opacity-0' : 'translate-x-0 opacity-100'
        }`}
        aria-label="Abrir menu lateral"
      >
        <PanelLeft size={22} strokeWidth={1.7} />
      </button>

      <button
        type="button"
        onClick={closeMobileSidebar}
        className={`fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-opacity duration-500 lg:hidden ${
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-label="Fechar menu lateral"
      />

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-[300px] max-w-[calc(100vw-32px)] transform-gpu flex-col
          overflow-y-auto overflow-x-hidden border-r border-gray-200/60 bg-[#f4f5f7]/90 px-4 pt-8 pb-6 shadow-2xl shadow-black/10 backdrop-blur-[2px]
          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          dark:border-white/10 dark:bg-[#020C17]/95
          lg:shadow-none lg:bg-[#f4f5f7]/40 lg:dark:bg-[#020C17]/40
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-[calc(100%+16px)]'}
          ${isExpanded ? 'lg:w-[300px] lg:translate-x-0 lg:px-4' : 'lg:w-[80px] lg:translate-x-0 lg:px-2'}
        `}
      >
        <div className="relative z-10 flex min-h-full flex-col">
          <SidebarHeader
            isDark={isDark}
            isExpanded={isExpanded}
            onToggleTheme={toggleTheme}
            onToggleExpanded={toggleExpanded}
          />

          <nav className="flex flex-col gap-2">
            {ADMIN_SECTIONS.map(({ title, items }, sectionIndex) => (
              <div key={title} className={`flex flex-col gap-2 ${sectionIndex > 0 ? 'mt-4' : ''}`}>
                {isExpanded && (
                  <p className="mb-1 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-300 dark:opacity-70">
                    {title}
                  </p>
                )}

                {items.map(({ href, icon: Icon, label }) => (
                  <NavItem
                    key={href}
                    isExpanded={isExpanded}
                    href={href}
                    icon={<Icon size={20} strokeWidth={1.5} />}
                    label={label}
                    active={isActive(href)}
                    onNavigate={closeMobileSidebar}
                  />
                ))}
              </div>
            ))}
          </nav>

          <div className="my-4 h-px w-full bg-gray-200/60 dark:bg-white/5" />

          <div className={`mt-auto pt-8 ${isExpanded ? 'space-y-3' : 'flex flex-col items-center gap-3'}`}>
            <SidebarUserProfile
              isExpanded={isExpanded}
              fallbackName="Administrador"
              fallbackEmail="admin@getin.com"
            />
          </div>
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
      {isExpanded ? (
        <div className="min-w-0 overflow-hidden">
          <BrandLogo variant="dark" className="dark:hidden" />
          <BrandLogo variant="light" className="hidden dark:flex" />
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 transition-all hover:bg-gray-100 hover:text-black active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Expandir menu lateral"
          title="Expandir menu lateral"
        >
          <PanelLeft size={20} strokeWidth={1.5} />
        </button>
      )}

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

function NavItem({ isExpanded, href, icon, label, active, onNavigate }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
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
