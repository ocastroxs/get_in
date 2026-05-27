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
  return createElement(resolvedIcon, { size: 13 });
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
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-foreground md:text-[2rem]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
      <div className="flex items-center gap-1.5 rounded-full border border-border/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-1.5 shadow-sm shadow-slate-200/40 dark:shadow-none backdrop-blur transition-all duration-300 hover:border-primary/15 dark:hover:border-white/20 hover:shadow-md hover:shadow-slate-200/40 dark:hover:shadow-black/20">
        <span className="h-2 w-2 rounded-full bg-secondary dark:bg-[#4DA8EA] animate-pulse" />
        <span className="text-xs font-medium text-accent-foreground dark:text-gray-200">Tempo Real</span>
      </div>


        {secondaryButtonText && secondaryButtonHref ? (
          <Link href={secondaryButtonHref}>
            <Button variant="outline" size="sm" className="gap-1.5 border-border/70 bg-white/75 transition-all duration-300 hover:border-primary/20 hover:bg-white hover:shadow-md hover:shadow-slate-200/40">
              {renderActionIcon(secondaryButtonIcon, secondaryButtonText, Download)}
              {secondaryButtonText}
            </Button>
          </Link>
        ) : secondaryButtonText && onSecondaryButtonClick ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-border/70 bg-white/75 transition-all duration-300 hover:border-primary/20 hover:bg-white hover:shadow-md hover:shadow-slate-200/40"
            onClick={onSecondaryButtonClick}
            disabled={secondaryButtonDisabled}
          >
            {renderActionIcon(secondaryButtonIcon, secondaryButtonText, Download)}
            {secondaryButtonText}
          </Button>
        ) : null}

        {buttonText && buttonHref ? (
          <Link href={buttonHref}>
            <Button size="sm" className="gap-1.5 shadow-lg shadow-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20">
              {renderActionIcon(buttonIcon, buttonText, Plus)}
              {buttonText}
            </Button>
          </Link>
        ) : buttonText && onButtonClick ? (
          <Button size="sm" className="gap-1.5 shadow-lg shadow-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20" onClick={onButtonClick} disabled={buttonDisabled}>
            {renderActionIcon(buttonIcon, buttonText, Plus)}
            {buttonText}
          </Button>
        ) : null}
      </div>
    </header>
  );
}
