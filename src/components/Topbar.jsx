"use client";

import Link from "next/link";
import { createElement } from "react";
import { Download, FileText, Plus, RefreshCw, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function getActionIcon(label, fallback) {
  const text = String(label || "").toLowerCase();

  if (text.includes("atualizar")) return RefreshCw;
  if (text.includes("salvar")) return Save;
  if (text.includes("descartar") || text.includes("cancelar")) return X;
  if (text.includes("pdf") || text.includes("relat")) return FileText;
  if (text.includes("export") || text.includes("download")) return Download;

  return fallback;
}

function renderActionIcon(icon, label, fallback) {
  const resolvedIcon = icon || getActionIcon(label, fallback);
  return createElement(resolvedIcon, { size: 14, className: "shrink-0" });
}

function ActionButton({ children, href, onClick, disabled, variant = "primary" }) {
  const className =
    variant === "secondary"
      ? "h-9 max-w-full min-w-0 gap-1.5 rounded-xl border-border/70 bg-card/80 px-3 shadow-sm transition-all duration-300 hover:border-primary/20 hover:bg-card hover:shadow-md"
      : "h-9 max-w-full min-w-0 gap-1.5 rounded-xl px-3 shadow-lg shadow-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20";

  const button = (
    <Button
      type="button"
      variant={variant === "secondary" ? "outline" : "default"}
      size="sm"
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className="max-w-full">
        {button}
      </Link>
    );
  }

  return button;
}

export default function Topbar({
  title,
  subtitle,
  buttonText,
  buttonHref,
  onButtonClick,
  buttonIcon,
  secondaryButtonText,
  secondaryButtonHref,
  onSecondaryButtonClick,
  secondaryButtonIcon,
  buttonDisabled = false,
  secondaryButtonDisabled = false,
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-border/80 px-2 pb-6 animate-in fade-in slide-in-from-top-4 duration-700 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
        <h1 className="text-2xl font-semibold text-foreground md:text-[2rem]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex max-w-full flex-wrap items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-700 delay-200 md:justify-end">
        <div className="flex h-9 items-center gap-1.5 rounded-full border border-border/70 bg-card/80 px-3 shadow-sm shadow-slate-200/40 backdrop-blur transition-all duration-300 hover:border-primary/15 hover:shadow-md hover:shadow-slate-200/40 dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:hover:border-white/20 dark:hover:shadow-black/20">
          <span className="h-2 w-2 rounded-full bg-secondary dark:bg-[#4DA8EA] animate-pulse" />
          <span className="text-xs font-medium text-accent-foreground dark:text-gray-200">Tempo Real</span>
        </div>

        {secondaryButtonText && (secondaryButtonHref || onSecondaryButtonClick) ? (
          <ActionButton
            href={secondaryButtonHref}
            onClick={onSecondaryButtonClick}
            disabled={secondaryButtonDisabled}
            variant="secondary"
          >
            {renderActionIcon(secondaryButtonIcon, secondaryButtonText, Download)}
            <span className="truncate">{secondaryButtonText}</span>
          </ActionButton>
        ) : null}

        {buttonText && (buttonHref || onButtonClick) ? (
          <ActionButton href={buttonHref} onClick={onButtonClick} disabled={buttonDisabled}>
            {renderActionIcon(buttonIcon, buttonText, Plus)}
            <span className="truncate">{buttonText}</span>
          </ActionButton>
        ) : null}
      </div>
    </header>
  );
}
