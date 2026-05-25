"use client";

import UserAvatar from "@/components/ui/UserAvatar";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

function pickFirst(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== "") || "";
}

export default function SidebarUserProfile({
  isExpanded,
  fallbackName = "Usuario",
  fallbackEmail = "usuario@getin.com",
  className,
}) {
  const { user, funcionario } = useAuth();
  const name = pickFirst(user?.nome, funcionario?.nome, fallbackName);
  const email = pickFirst(user?.email, funcionario?.email, fallbackEmail);
  const avatarSrc = pickFirst(user?.avatarUrl, user?.imagem, funcionario?.avatarUrl, funcionario?.imagem);
  const tooltip = email ? `${name} - ${email}` : name;

  if (!isExpanded) {
    return (
      <div className={cn("flex justify-center py-1", className)} title={tooltip} aria-label={tooltip}>
        <UserAvatar
          name={name}
          email={email}
          src={avatarSrc}
          className="h-10 w-10 border border-gray-200 text-[12px] shadow-sm ring-1 ring-black/5 dark:border-white/10 dark:ring-white/10"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[20px] border border-gray-200/70 bg-white/60 p-3 shadow-sm dark:border-white/10 dark:bg-white/5",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar
          name={name}
          email={email}
          src={avatarSrc}
          className="h-10 w-10 border border-gray-200 text-xs shadow-sm ring-1 ring-black/5 dark:border-white/10 dark:ring-white/10"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-gray-900 dark:text-white">{name}</p>
          <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">{email}</p>
        </div>
      </div>
    </div>
  );
}
