"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import {
  LayoutDashboard, Users, Building2, CreditCard,
  ArrowLeftRight, Briefcase, FileBarChart,
  UserCog, Settings, User, ChevronDown, LogOut,
} from "lucide-react";
import { MENU_ITEMS } from "@/lib/mockData";

const ICON_MAP = {
  LayoutDashboard, Users, Building2, CreditCard,
  ArrowLeftRight, Briefcase, FileBarChart,
  UserCog, Settings, User,
};

const SECTION_LABELS = {
  principal: "Principal",
  operacao: "Operação",
  admin: "Admin",
};

function NavItem({ item, active }) {
  const Icon = ICON_MAP[item.icon] || User;
  return (
    <Link
      href={item.href}
      className={[
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      ].join(" ")}
    >
      <Icon size={15} className="shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span className="text-[10px] bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center font-bold">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const menu = MENU_ITEMS[user?.role] ?? MENU_ITEMS["gerente"];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-sidebar border-r border-sidebar-border flex flex-col z-40">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border hover:bg-sidebar-accent/50 transition-colors">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div>
          <p className="text-sidebar-foreground font-semibold text-sm leading-tight">VisitaTrack</p>
          <p className="text-sidebar-foreground/40 text-[10px]">Controle de Acesso</p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {Object.entries(menu).map(([section, items]) => (
          <div key={section}>
            <p className="text-sidebar-foreground/30 text-[10px] font-semibold uppercase tracking-widest px-1 mb-1.5">
              {SECTION_LABELS[section] ?? section}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  active={pathname === item.href || pathname.startsWith(item.href + "/")}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 pt-3 border-t border-sidebar-border space-y-2">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-600 transition-all duration-200 group"
          title="Clique para sair"
        >
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-bold shrink-0 group-hover:bg-red-600 transition-colors">
            {user?.initials ?? "??"}
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-sidebar-foreground text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-sidebar-foreground/40 text-[10px] truncate">{user?.title}</p>
          </div>
          <LogOut size={13} className="text-sidebar-foreground/30 group-hover:text-red-600 transition-colors" />
        </button>
      </div>
    </aside>
  );
}
