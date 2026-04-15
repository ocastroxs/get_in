"use client";

import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Topbar({ title, subtitle }) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Tempo Real */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent rounded-lg border border-border">
          <span className="w-2 h-2 rounded-full bg-chart-2 animate-pulse" />
          <span className="text-xs font-medium text-accent-foreground">Tempo Real</span>
        </div>

        {/* Exportar */}
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download size={13} />
          Exportar
        </Button>

        {/* Novo Visitante */}
        <Button size="sm" className="gap-1.5">
          <Plus size={13} />
          Novo Visitante
        </Button>
      </div>
    </header>
  );
}
