import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

const AVATAR_PUBLIC_BASE_URL = "https://dmlshwvpsoqpptjmplfq.supabase.co/storage/v1/object/public/usuarios";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

export function maskCPF(value) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskPhone(value) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4,5})(\d{4})$/, "$1-$2");
}

export function maskCNPJ(value) {
  return onlyDigits(value)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function maskCEP(value) {
  return onlyDigits(value)
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function formatPhone(value) {
  const raw = String(value || "").trim();
  let digits = onlyDigits(raw);

  if (!digits) {
    return "";
  }

  if (digits.length > 11 && digits.startsWith("55")) {
    digits = digits.slice(2);
  }

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return raw;
}

export function formatCPF(value) {
  const digits = onlyDigits(value);

  if (!digits) {
    return "";
  }

  return maskCPF(digits);
}

export function formatCNPJ(value) {
  const digits = onlyDigits(value);

  if (!digits) {
    return "";
  }

  return maskCNPJ(digits);
}

export function getAvatarSrc(...values) {
  const raw = values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");

  if (!raw) {
    return "";
  }

  const src = String(raw).trim();

  if (/^(https?:|data:|blob:)/i.test(src)) {
    return src;
  }

  return `${AVATAR_PUBLIC_BASE_URL}/${src.replace(/^\/+/, "")}`;
}
