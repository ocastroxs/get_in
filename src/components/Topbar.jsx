"use client";

import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Topbar({ title, subtitle }) {
  return (
    <header className="flex items-center justify-between mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
        {/* Tempo Real */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent rounded-lg border border-border transition-all hover:shadow-md">
          <span className="w-2 h-2 rounded-full bg-chart-2 animate-pulse" />
          <span className="text-xs font-medium text-accent-foreground">Tempo Real</span>
        </div>

        {/* Exportar */}
        <Button variant="outline" size="sm" className="gap-1.5 transition-all hover:shadow-md">
          <Download size={13} />
          Exportar
        </Button>

        {/* Novo Visitante */}
        <Button size="sm" className="gap-1.5 transition-all hover:shadow-md">
          <Plus size={13} />
          Novo Visitante
        </Button>
      </div>
    </header>
  );
}
