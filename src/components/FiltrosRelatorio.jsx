"use client";

import React from "react";
import { Calendar, Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FiltrosRelatorio() {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
            Período
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
              <option>Este mês</option>
              <option>Mês passado</option>
              <option>Personalizado...</option>
            </select>
          </div>
        </div>

        <div className="flex-1 w-full space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
            Setor
          </label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer">
              <option>Todos os setores</option>
              <option>Produção</option>
              <option>Laboratório</option>
              <option>Administração</option>
              <option>Almoxarifado</option>
            </select>
          </div>
        </div>

        <div className="flex-1 w-full space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
            Tipo de Visitante
          </label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer">
              <option>Todos os tipos</option>
              <option>Técnico / Manutenção</option>
              <option>Auditor / Fiscal</option>
              <option>Fornecedor</option>
              <option>Visitante Geral</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 w-full lg:w-auto">
          <Button variant="outline" className="flex-1 lg:flex-none rounded-xl gap-2">
            <X size={16} />
            Limpar
          </Button>
          <Button className="flex-1 lg:flex-none rounded-xl gap-2">
            <Search size={16} />
            Filtrar
          </Button>
        </div>
      </div>
    </div>
  );
}
