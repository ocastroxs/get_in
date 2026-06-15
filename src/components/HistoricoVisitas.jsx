"use client";

import { useState } from "react";
import { Search, Filter, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModalFiltro from "@/components/ui/ModalFiltro";
import PaginationControls from "@/components/ui/PaginationControls";
import { usePagination } from "@/hooks/usePagination";

export default function HistoricoVisitas({ 
  title = "Histórico de Visitas", 
  data = [],
  searchPlaceholder = "Buscar visitante..."
}) {
  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState("");
  
  // Estados de filtro
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [setorFiltro, setSetorFiltro] = useState("Todos");
  
  // Estados temporários
  const [tempStatusFiltro, setTempStatusFiltro] = useState("Todos");
  const [tempSetorFiltro, setTempSetorFiltro] = useState("Todos");

  const aplicarFiltros = () => {
    setStatusFiltro(tempStatusFiltro);
    setSetorFiltro(tempSetorFiltro);
    setModalAberto(false);
  };

  const limparFiltros = () => {
    setTempStatusFiltro("Todos");
    setTempSetorFiltro("Todos");
    setStatusFiltro("Todos");
    setSetorFiltro("Todos");
    setBusca("");
  };

  const filtrados = data.filter(item => {
    const matchBusca = !busca.trim() || 
      item.visitante.toLowerCase().includes(busca.toLowerCase()) ||
      item.empresa.toLowerCase().includes(busca.toLowerCase());
    
    const matchStatus = statusFiltro === "Todos" || item.status === statusFiltro;
    const matchSetor = setorFiltro === "Todos" || item.setor === setorFiltro;
    
    return matchBusca && matchStatus && matchSetor;
  });

  const {
    page,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems: paginaAtual,
  } = usePagination(filtrados);

  const setoresUnicos = ["Todos", ...new Set(data.map(item => item.setor))];
  const statusUnicos = ["Todos", ...new Set(data.map(item => item.status))];

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
      <div className="p-6 border-b border-border flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-muted/20">
        <h2 className="font-bold text-lg text-foreground">{title}</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder={searchPlaceholder} 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 pr-4 py-2 border border-input rounded-xl text-sm w-full md:w-64 outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground transition-all h-10" 
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <Button 
            variant="outline"
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 px-4 h-10 border border-input rounded-xl text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Filter className="w-4 h-4 text-muted-foreground" /> 
            <span className="hidden md:inline">Filtros</span>
            {(statusFiltro !== "Todos" || setorFiltro !== "Todos") && (
              <span className="ml-1 w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                {(statusFiltro !== "Todos" ? 1 : 0) + (setorFiltro !== "Todos" ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap">Visitante</th>
              <th className="px-6 py-4">Empresa</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Setor</th>
              <th className="px-6 py-4">Entrada/Saída</th>
              <th className="px-6 py-4">Permanência</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-border">
            {filtrados.length > 0 ? (
              paginaAtual.map((item, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-foreground whitespace-nowrap">{item.visitante}</td>
                  <td className="px-6 py-4 text-muted-foreground font-medium">{item.empresa}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.tipo === 'Técnico' || item.tipo === 'Manutenção' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300' :
                      item.tipo === 'Auditor' ? 'bg-violet-500/10 text-violet-700 dark:text-violet-300' :
                      'bg-slate-500/10 text-slate-700 dark:text-slate-300'
                    }`}>
                      {item.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{item.setor}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs">{item.entrada}</span>
                    <span className="text-muted-foreground text-xs mx-1">→</span>
                    <span className="font-mono text-xs text-muted-foreground">{item.saida}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-14 text-xs font-medium text-foreground">{item.tempo}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full w-24 overflow-hidden">
                         <div 
                          className={`h-full transition-all duration-1000 ease-out ${item.permanenciaStatus > 80 ? 'bg-destructive' : item.permanenciaStatus > 50 ? 'bg-amber-500' : 'bg-primary'}`} 
                          style={{width: `${item.permanenciaStatus}%`}}
                         ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      item.status === 'CONCLUÍDO' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-12 h-12 text-muted/30" />
                    <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filtrados.length > 0 && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          currentCount={paginaAtual.length}
          onPageChange={setPage}
          itemLabel="registro(s)"
        />
      )}

      <ModalFiltro
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Status da Visita
            </label>
            <div className="grid grid-cols-1 gap-2">
              {statusUnicos.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTempStatusFiltro(status)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all border ${
                    tempStatusFiltro === status
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  <span>{status === "Todos" ? "Todos os Status" : status}</span>
                  {tempStatusFiltro === status && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Setor Visitado
            </label>
            <select 
              value={tempSetorFiltro}
              onChange={(e) => setTempSetorFiltro(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border/60 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {setoresUnicos.map(setor => (
                <option key={setor} value={setor}>{setor === "Todos" ? "Todos os Setores" : setor}</option>
              ))}
            </select>
          </div>
        </div>
      </ModalFiltro>
    </div>
  );
}
