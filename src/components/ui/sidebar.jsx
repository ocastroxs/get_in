"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building,
  FileText,
  Folder,
  Home,
  Inbox,
  Lock,
  Minus,
  Moon,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Settings,
  Sun,
  UserSquare2,
  Users,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import SidebarUserProfile from '@/components/SidebarUserProfile';
import { useAppTheme } from '@/lib/theme';

const MAIN_ITEMS = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/visitantes', icon: Users, label: 'Visitantes' },
  { href: '/dashboard/funcionarios', icon: UserSquare2, label: 'Funcionários' },
];

const CONTROL_ITEMS = [
  { href: '/dashboard/crachas', label: 'Crachás' },
  { href: '/dashboard/checkin', label: 'Check-In / Out' },
  { href: '/dashboard/setores', label: 'Setores' },
];

const ACCESS_ITEMS = [
  { href: '/dashboard/circulacao', label: 'Circulação' },
  { href: '/dashboard/permissao', label: 'Permissões' },
];

const SECONDARY_ITEMS = [
  { href: '/dashboard/empresas', icon: Building, label: 'Empresas' },
  { href: '/dashboard/relatorios', icon: FileText, label: 'Relatórios' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isControlOpen, setIsControlOpen] = useState(true);
  const [isAccessOpen, setIsAccessOpen] = useState(true);
  const { isDark, toggleTheme } = useAppTheme();

  const isActive = (href) => pathname === href;
  const closeMobileSidebar = () => setIsMobileOpen(false);
  const closeSidebar = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setIsExpanded(false);
      return;
    }

    setIsMobileOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsExpanded(true);
          setIsMobileOpen(true);
        }}
        className={`fixed left-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white/90 text-gray-700 shadow-lg shadow-black/5 backdrop-blur transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none hover:bg-white hover:text-black active:scale-95 dark:border-white/10 dark:bg-[#061320]/90 dark:text-gray-200 dark:hover:bg-[#0b1b2b] lg:hidden ${
          isMobileOpen ? 'pointer-events-none -translate-x-2 opacity-0' : 'translate-x-0 opacity-100'
        }`}
        aria-label="Abrir menu lateral"
      >
        <PanelLeft size={22} strokeWidth={1.7} />
      </button>

      <button
        type="button"
        onClick={closeMobileSidebar}
        className={`fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none lg:hidden ${
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-label="Fechar menu lateral"
      />

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-[300px] max-w-[calc(100vw-32px)]
          transform-gpu flex-col overflow-y-auto overflow-x-hidden border-r border-gray-200/60 bg-[#f4f5f7]
          px-4 pt-8 pb-6 shadow-2xl shadow-black/10 transition-all
          duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          will-change-transform motion-reduce:transition-none
          dark:border-white/10 dark:bg-[#020C17]
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-[calc(100%+16px)]'}
          ${isExpanded ? 'lg:w-[300px] lg:translate-x-0 lg:px-4' : 'lg:w-[80px] lg:translate-x-0 lg:px-2'}
        `}
      >
        <SidebarHeader
          isDark={isDark}
          isExpanded={isExpanded}
          onToggleTheme={toggleTheme}
          onClose={closeSidebar}
          onOpen={() => setIsExpanded(true)}
        />

        <nav className="flex flex-col gap-2">
          {MAIN_ITEMS.map(({ href, icon: Icon, label }) => (
            <NavItem
              key={href}
              href={href}
              icon={<Icon size={20} strokeWidth={1.5} />}
              label={label}
              active={isActive(href)}
              isExpanded={isExpanded}
              onNavigate={closeMobileSidebar}
            />
          ))}
        </nav>

        <div className="my-4 h-px w-full bg-gray-200/60 dark:bg-white/5" />

        <CollapsibleSection
          title="Controle"
          icon={<Inbox size={20} strokeWidth={1.5} />}
          open={isControlOpen}
          isExpanded={isExpanded}
          onToggle={() => {
            if (!isExpanded) {
              setIsExpanded(true);
              return;
            }

            setIsControlOpen((current) => !current);
          }}
        >
          {CONTROL_ITEMS.map((item) => (
            <SubItem
              key={item.href}
              href={item.href}
              label={item.label}
              active={isActive(item.href)}
              isExpanded={isExpanded}
              onNavigate={closeMobileSidebar}
            />
          ))}
        </CollapsibleSection>

        <div className="mt-3">
          <CollapsibleSection
            title="Acesso"
            icon={<Lock size={20} strokeWidth={1.5} />}
            open={isAccessOpen}
            isExpanded={isExpanded}
            onToggle={() => {
              if (!isExpanded) {
                setIsExpanded(true);
                return;
              }

              setIsAccessOpen((current) => !current);
            }}
          >
            {ACCESS_ITEMS.map((item) => (
              <SubItem
                key={item.href}
                href={item.href}
                label={item.label}
                active={isActive(item.href)}
                isExpanded={isExpanded}
                onNavigate={closeMobileSidebar}
              />
            ))}
          </CollapsibleSection>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {SECONDARY_ITEMS.map(({ href, icon: Icon, label }) => (
            <NavItem
              key={href}
              href={href}
              icon={<Icon size={20} strokeWidth={1.5} />}
              label={label}
              active={isActive(href)}
              isExpanded={isExpanded}
              onNavigate={closeMobileSidebar}
            />
          ))}
        </div>

        <div className={`mt-auto pt-8 ${isExpanded ? 'space-y-3' : 'flex flex-col items-center gap-3'}`}>
          <SidebarUserProfile
            isExpanded={isExpanded}
            fallbackName="Administrador"
            fallbackEmail="admin@getin.com"
          />
          <NavItem
            href="/configuracoes"
            icon={<Settings size={20} strokeWidth={1.5} />}
            label="Configurações"
            active={isActive('/configuracoes')}
            isExpanded={isExpanded}
            onNavigate={closeMobileSidebar}
          />
        </div>
      </aside>

      <div
        className={`hidden shrink-0 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block ${isExpanded ? 'w-[300px]' : 'w-[80px]'}`}
        aria-hidden="true"
      />
    </>
  );
}

function SidebarHeader({ isDark, isExpanded, onToggleTheme, onClose, onOpen }) {
  return (
    <div className={`mb-7 flex items-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isExpanded ? 'justify-between px-2' : 'flex-col justify-center gap-3'}`}>
      {isExpanded ? (
      <div className="min-w-0 overflow-hidden">
        <BrandLogo variant="dark" className="dark:hidden" />
        <BrandLogo variant="light" className="hidden dark:flex" />
      </div>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 transition-all duration-300 ease-out hover:bg-gray-100 hover:text-black active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
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
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white/50 text-gray-600 transition-all duration-300 ease-out active:scale-90 hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          title={isDark ? 'Modo claro' : 'Modo escuro'}
          aria-label={isDark ? 'Alternar para o modo claro' : 'Alternar para o modo escuro'}
        >
          {isDark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
        </button>

        {isExpanded && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-colors duration-300 ease-out hover:text-black dark:hover:text-white"
            aria-label="Recolher menu lateral"
          >
            <PanelLeftClose size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
}

function CollapsibleSection({ title, icon, open, isExpanded, onToggle, children }) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        className={`
          flex cursor-pointer items-center transition-all duration-300 ease-out
          ${
            isExpanded
              ? 'justify-between rounded-[20px] bg-[#18181b] px-4 py-3 text-white shadow-lg shadow-blue-500/10 dark:bg-[#4DA8EA]'
              : 'mx-auto h-12 w-12 justify-center rounded-full border border-gray-100 bg-white p-3 text-black shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white'
          }
        `}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="flex min-w-[20px] items-center justify-center">{icon}</span>
          <span className={`whitespace-nowrap text-[14px] font-medium transition-all duration-300 ease-out ${isExpanded ? 'max-w-32 opacity-100' : 'max-w-0 opacity-0'}`}>{title}</span>
        </div>
        {isExpanded && (open ? <Minus size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />)}
      </button>

      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded && open ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="ml-7 flex flex-col gap-1 border-l border-gray-300/80 py-1 pl-4 dark:border-white/10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, active, isExpanded, onNavigate }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`
        group flex items-center justify-between transition-all duration-300 ease-out
        ${
          active
            ? 'bg-white text-black shadow-sm dark:bg-[#4DA8EA] dark:text-white'
            : 'text-gray-500 hover:bg-black/5 hover:text-black dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
        }
        ${isExpanded ? 'rounded-[20px] px-4 py-2.5' : 'mx-auto h-12 w-12 justify-center rounded-full p-3'}
      `}
      title={!isExpanded ? label : undefined}
    >
      <div className={`flex items-center overflow-hidden transition-[gap] duration-300 ease-out ${isExpanded ? 'gap-4' : 'gap-0'}`}>
        <span className="relative flex flex-shrink-0 items-center justify-center">{icon}</span>
        <span className={`whitespace-nowrap text-[14px] font-medium transition-all duration-300 ease-out ${isExpanded ? 'max-w-44 opacity-100' : 'max-w-0 opacity-0'}`}>{label}</span>
      </div>
    </Link>
  );
}

function SubItem({ href, label, active, onNavigate }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`
        flex items-center gap-3 rounded-[18px] px-4 py-2.5 text-[13.5px] font-medium transition-all
        ${
          active
            ? 'bg-white text-black shadow-sm dark:bg-[#4DA8EA] dark:text-white'
            : 'text-gray-500 hover:bg-black/5 hover:text-black dark:hover:bg-white/5 dark:hover:text-white'
        }
      `}
    >
      <Folder size={18} strokeWidth={1.5} className={active ? 'text-black dark:text-white' : 'text-gray-400'} />
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
}
