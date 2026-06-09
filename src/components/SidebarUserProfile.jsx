"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import ModalPortal from "@/components/ui/ModalPortal";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

const MENU_WIDTH = 224;
const MENU_ESTIMATED_HEIGHT = 112;
const MENU_GAP = 8;
const VIEWPORT_PADDING = 12;

function pickFirst(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== "") || "";
}

function clamp(value, min, max) {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

export default function SidebarUserProfile({
  isExpanded,
  fallbackName = "Usuario",
  fallbackEmail = "usuario@getin.com",
  className,
}) {
  const { user, funcionario, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ left: VIEWPORT_PADDING, top: VIEWPORT_PADDING });
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const name = pickFirst(user?.nome, funcionario?.nome, fallbackName);
  const email = pickFirst(user?.email, funcionario?.email, fallbackEmail);
  const avatarSrc = pickFirst(user?.avatarUrl, user?.imagem, funcionario?.avatarUrl, funcionario?.imagem);
  const tooltip = email ? `${name} - ${email}` : name;

  const updateMenuPosition = useCallback(() => {
    if (!rootRef.current || typeof window === "undefined") {
      return;
    }

    const rect = rootRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight || MENU_ESTIMATED_HEIGHT;
    const maxLeft = window.innerWidth - MENU_WIDTH - VIEWPORT_PADDING;
    const maxTop = window.innerHeight - menuHeight - VIEWPORT_PADDING;
    const topAbove = rect.top - menuHeight - MENU_GAP;
    const topBelow = rect.bottom + MENU_GAP;

    const left = isExpanded
      ? clamp(rect.left, VIEWPORT_PADDING, maxLeft)
      : clamp(rect.right + MENU_GAP, VIEWPORT_PADDING, maxLeft);
    const top = isExpanded
      ? topAbove >= VIEWPORT_PADDING
        ? topAbove
        : clamp(topBelow, VIEWPORT_PADDING, maxTop)
      : clamp(rect.bottom - menuHeight, VIEWPORT_PADDING, maxTop);

    setMenuPosition({ left, top });
  }, [isExpanded]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(updateMenuPosition);

    const handlePointerDown = (event) => {
      const clickedProfile = rootRef.current?.contains(event.target);
      const clickedMenu = menuRef.current?.contains(event.target);

      if (!clickedProfile && !clickedMenu) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, updateMenuPosition]);

  const toggleMenu = () => {
    if (!isOpen) {
      updateMenuPosition();
    }

    setIsOpen((current) => !current);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  if (!isExpanded) {
    return (
      <div ref={rootRef} className={cn("relative flex justify-center py-1", className)}>
        <button
          type="button"
          onClick={toggleMenu}
          title={tooltip}
          aria-label={`${tooltip}. Abrir menu da conta`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className="cursor-pointer rounded-full transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95"
        >
          <UserAvatar
            name={name}
            email={email}
            src={avatarSrc}
            className="h-10 w-10 text-[12px] shadow-sm"
          />
        </button>
        <AccountMenu
          isOpen={isOpen}
          menuRef={menuRef}
          position={menuPosition}
          onClose={() => setIsOpen(false)}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={toggleMenu}
        aria-label={`${tooltip}. Abrir menu da conta`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={cn(
          "flex w-full cursor-pointer items-center gap-3 rounded-[20px] border border-gray-200/70 bg-white/60 p-3 text-left shadow-sm transition-all hover:border-primary/20 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.99] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        )}
      >
        <UserAvatar
          name={name}
          email={email}
          src={avatarSrc}
          className="h-10 w-10 text-xs shadow-sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-gray-900 dark:text-white">{name}</p>
          <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">{email}</p>
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "ml-2 shrink-0 text-gray-400 transition-transform duration-200 dark:text-gray-500",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <AccountMenu
        isOpen={isOpen}
        menuRef={menuRef}
        position={menuPosition}
        onClose={() => setIsOpen(false)}
        onLogout={handleLogout}
      />
    </div>
  );
}

function AccountMenu({ isOpen, menuRef, position, onClose, onLogout }) {
  if (!isOpen) {
    return null;
  }

  return (
    <ModalPortal>
      <div
        ref={menuRef}
        role="menu"
        style={{ left: position.left, top: position.top }}
        className="fixed z-[120] w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 shadow-2xl shadow-slate-900/10 animate-in fade-in slide-in-from-bottom-4 dark:border-white/10 dark:bg-[#07121f] dark:shadow-black/30"
      >
        <Link
          href="/configuracoes"
          role="menuitem"
          onClick={onClose}
          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Settings size={16} strokeWidth={1.75} />
          Configurações
        </Link>
        <button
          type="button"
          role="menuitem"
          onClick={onLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
        >
          <LogOut size={16} strokeWidth={1.75} />
          Sair da conta
        </button>
      </div>
    </ModalPortal>
  );
}
