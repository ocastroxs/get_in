"use client";

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
  const { isDark, toggleTheme } = useAppTheme();

  const isActive = (href) =>
    href === '/dashboard'
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <aside
        className={`
          fixed left-0 top-0 z-50 hidden h-screen flex-col lg:flex
          overflow-y-auto overflow-x-hidden border-r border-gray-200/60 bg-[#f4f5f7]/40 pt-8 pb-6 backdrop-blur-[2px]
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          dark:border-white/10 dark:bg-[#020C17]/40
          ${isExpanded ? 'w-[300px] px-4' : 'w-[80px] px-2'}
        `}
      >
        <div className="relative z-10 flex min-h-full flex-col">
          <SidebarHeader
            isDark={isDark}
            isExpanded={isExpanded}
            onToggleTheme={toggleTheme}
            onToggleExpanded={() => setIsExpanded((current) => !current)}
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
      <MobileNav items={ADMIN_SECTIONS.flatMap((section) => section.items)} isActive={isActive} />
    </>
  );
}

function MobileNav({ items, isActive }) {
  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-50 flex gap-1 overflow-x-auto rounded-2xl border border-gray-200/80 bg-white/95 p-2 shadow-lg backdrop-blur lg:hidden dark:border-white/10 dark:bg-[#020C17]/95"
      aria-label="Navegação principal"
    >
      {items.map(({ href, icon: Icon, label }) => {
        const active = isActive(href);

        return (
          <Link
            key={href}
            href={href}
            className={`flex min-w-[72px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition-colors ${
              active
                ? 'bg-[#4DA8EA] text-white'
                : 'text-gray-500 hover:bg-black/5 hover:text-black dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
            }`}
          >
            <Icon size={17} strokeWidth={1.8} />
            <span className="max-w-[64px] truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
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
