"use client";

import React, { useMemo, useState } from 'react';
import { cn, getAvatarSrc } from '@/lib/utils';

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-indigo-500',
  'bg-cyan-500',
  'bg-orange-500',
];

/**
 * Componente de Avatar padronizado que exibe a inicial do nome
 * com uma cor de fundo baseada no nome do usuário para manter consistência.
 */
export default function UserAvatar({ name, email, src, className }) {
  const [failedSrc, setFailedSrc] = useState("");
  const initials = useMemo(() => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  }, [name]);

  const avatarSrc = useMemo(() => getAvatarSrc(src), [src]);

  const backgroundColor = useMemo(() => {
    // Usar o nome ou email para gerar um índice consistente para a cor
    const seed = name || email || 'user';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  }, [name, email]);

  return (
    <div 
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-full text-white font-bold shadow-inner",
        backgroundColor,
        className
      )}
    >
      {avatarSrc && failedSrc !== avatarSrc ? (
        <img
          src={avatarSrc}
          alt={name || email || 'Avatar'}
          className="h-full w-full object-cover"
          onError={() => setFailedSrc(avatarSrc)}
        />
      ) : (
        initials
      )}
    </div>
  );
}
