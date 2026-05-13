"use client";

import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Topbar({
  title,
  subtitle,
  buttonText,
  buttonHref,
  onButtonClick,
  secondaryButtonText,
  secondaryButtonHref,
  onSecondaryButtonClick,
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
        <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-white/70 px-3 py-1.5 shadow-sm shadow-slate-200/40 backdrop-blur transition-all duration-300 hover:border-primary/15 hover:shadow-md hover:shadow-slate-200/40">
          <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-xs font-medium text-accent-foreground">Tempo Real</span>
        </div>

        {secondaryButtonText && secondaryButtonHref ? (
          <Link href={secondaryButtonHref}>
            <Button variant="outline" size="sm" className="gap-1.5 border-border/70 bg-white/75 transition-all duration-300 hover:border-primary/20 hover:bg-white hover:shadow-md hover:shadow-slate-200/40">
              <Download size={13} />
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
            <Download size={13} />
            {secondaryButtonText}
          </Button>
        ) : null}

        {buttonText && buttonHref ? (
          <Link href={buttonHref}>
            <Button size="sm" className="gap-1.5 shadow-lg shadow-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20">
              <Plus size={13} />
              {buttonText}
            </Button>
          </Link>
        ) : buttonText && onButtonClick ? (
          <Button size="sm" className="gap-1.5 shadow-lg shadow-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20" onClick={onButtonClick} disabled={buttonDisabled}>
            <Plus size={13} />
            {buttonText}
          </Button>
        ) : null}
      </div>
    </header>
  );
}
