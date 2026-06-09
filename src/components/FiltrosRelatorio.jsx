"use client";

import React, { useState } from "react";
import { Calendar, Filter, Search, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModalFiltro from "@/components/ui/ModalFiltro";

export default function FiltrosRelatorio() {
  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState("");
  
  // Estados de filtro (simulados para o componente visual)
  const [periodo, setPeriodo] = useState("Últimos 7 dias");
  const [setor, setSetor] = useState("Todos os setores");
  const [tipo, setTipo] = useState("Todos os tipos");
  
  // Estados temporários para o modal
  const [tempPeriodo, setTempPeriodo] = useState("Últimos 7 dias");
  const [tempSetor, setTempSetor] = useState("Todos os setores");
  const [tempTipo, setTempTipo] = useState("Todos os tipos");

  const aplicarFiltros = () => {
    setPeriodo(tempPeriodo);
    setSetor(tempSetor);
    setTipo(tempTipo);
    setModalAberto(false);
  };

  const limparFiltros = () => {
    setTempPeriodo("Últimos 7 dias");
    setTempSetor("Todos os setores");
    setTempTipo("Todos os tipos");
    setPeriodo("Últimos 7 dias");
    setSetor("Todos os setores");
    setTipo("Todos os tipos");
    setBusca("");
  };

  const temFiltrosAtivos = periodo !== "Últimos 7 dias" || setor !== "Todos os setores" || tipo !== "Todos os tipos" || busca !== "";

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Buscar nos relatórios..."
              className="pl-10 h-11 rounded-xl border-border/60 bg-background/80 text-sm"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
          
          <Button
            type="button"
            onClick={() => setModalAberto(true)}
            variant="outline"
            className="h-11 px-4 gap-2 rounded-xl border-border/60 bg-background/80"
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filtros Avançados</span>
            {temFiltrosAtivos && (
              <span className="ml-1 w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                {(periodo !== "Últimos 7 dias" ? 1 : 0) + (setor !== "Todos os setores" ? 1 : 0) + (tipo !== "Todos os tipos" ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="hidden lg:block px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-semibold text-muted-foreground">
            Filtrando por: {periodo}
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={limparFiltros}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Resetar
          </Button>
        </div>
      </div>

      {temFiltrosAtivos && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros aplicados:</span>
          {busca && (
            <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
              Termo: {busca}
            </span>
          )}
          {periodo !== "Últimos 7 dias" && (
            <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
              Período: {periodo}
            </span>
          )}
          {setor !== "Todos os setores" && (
            <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
              Setor: {setor}
            </span>
          )}
          {tipo !== "Todos os tipos" && (
            <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
              Tipo: {tipo}
            </span>
          )}
        </div>
      )}

      <ModalFiltro
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      >
        <div className="space-y-5">
          {/* Período */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Período de Análise
            </label>
            <div className="grid grid-cols-1 gap-2">
              {["Últimos 7 dias", "Últimos 30 dias", "Este mês", "Mês passado"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTempPeriodo(p)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all border ${
                    tempPeriodo === p
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  <span>{p}</span>
                  {tempPeriodo === p && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Setor */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Setor Específico
            </label>
            <select 
              value={tempSetor}
              onChange={(e) => setTempSetor(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border/60 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option>Todos os setores</option>
              <option>Produção</option>
              <option>Laboratório</option>
              <option>Administração</option>
              <option>Almoxarifado</option>
            </select>
          </div>

          {/* Tipo de Visitante */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Categoria de Visitante
            </label>
            <select 
              value={tempTipo}
              onChange={(e) => setTempTipo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border/60 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option>Todos os tipos</option>
              <option>Técnico / Manutenção</option>
              <option>Auditor / Fiscal</option>
              <option>Fornecedor</option>
              <option>Visitante Geral</option>
            </select>
          </div>
        </div>
      </ModalFiltro>
    </div>
  );
}
