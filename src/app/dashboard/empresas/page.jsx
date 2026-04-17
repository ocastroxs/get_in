"use client";

import React, { useState } from "react";
import { 
  Building2, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit2, 
  History, 
  Printer,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Users,
  ArrowUpRight
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { STATS_EMPRESAS, EMPRESAS_LISTA } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EmpresasPage() {
  const [filtroStatus, setFiltroStatus] = useState("Todas");
  const [busca, setBusca] = useState("");

  const empresasFiltradas = EMPRESAS_LISTA.filter(emp => {
    const matchesStatus = filtroStatus === "Todas" || emp.status === filtroStatus;
    const matchesBusca = emp.nome.toLowerCase().includes(busca.toLowerCase()) || 
                         emp.cnpj.includes(busca);
    return matchesStatus && matchesBusca;
  });

  const maxVisitantes = Math.max(...EMPRESAS_LISTA.map(e => e.visitantes));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Empresas Terceirizadas</h1>
          <p className="text-sm text-muted-foreground">
            Indústria Alimentos Puros • Ter 08h00 - 18h • 29 de julho de 2025
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={14} /> Exportar
          </Button>
          <Button size="sm" className="gap-2 bg-sidebar-primary text-sidebar-primary-foreground">
            <Plus size={14} /> Cadastrar Empresa
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Cadastradas"
          value={STATS_EMPRESAS.total.value}
          icon={<Briefcase size={18} className="text-blue-500" />}
          sub={STATS_EMPRESAS.total.sub}
          delta={STATS_EMPRESAS.total.delta}
          deltaDir={STATS_EMPRESAS.total.deltaDir}
          accentVar="#3b82f6"
        />
        <StatCard
          label="Empresas Ativas"
          value={STATS_EMPRESAS.ativas.value}
          icon={<CheckCircle2 size={18} className="text-green-500" />}
          sub={`${STATS_EMPRESAS.ativas.pct}% ${STATS_EMPRESAS.ativas.sub}`}
          accentVar="#10b981"
        />
        <StatCard
          label="Mais Visitantes"
          value={STATS_EMPRESAS.maisVisitada.nome}
          valueClassName="text-xl"
          icon={<TrendingUp size={18} className="text-blue-400" />}
          sub={`${STATS_EMPRESAS.maisVisitada.visitas} visitas acumuladas`}
          accentVar="#60a5fa"
        />
        <StatCard
          label="Menos Visitantes"
          value={STATS_EMPRESAS.menosVisitada.nome}
          valueClassName="text-xl"
          icon={<TrendingDown size={18} className="text-yellow-500" />}
          sub={`${STATS_EMPRESAS.menosVisitada.visitas} visitas acumuladas`}
          accentVar="#f59e0b"
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-2 rounded-lg border border-border">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <span className="text-[10px] font-bold uppercase text-muted-foreground px-2">Status:</span>
          {["Todas", "Ativa", "Inativa", "Suspensa"].map((status) => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                filtroStatus === status 
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {status}
            </button>
          ))}
          <div className="h-4 w-[1px] bg-border mx-2" />
          <Button variant="ghost" size="sm" className="text-xs gap-2">
            <Filter size={14} /> Ordenar por
          </Button>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <Input 
            placeholder="Buscar empresa, CNPJ..." 
            className="pl-9 h-9 text-xs"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">Registro de Empresas</h3>
            <p className="text-[10px] text-muted-foreground">
              {empresasFiltradas.length} empresas cadastradas • mostrando 8 por página
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Download size={14} />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Printer size={14} />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">CNPJ</th>
                <th className="px-4 py-3">Responsável</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Visitantes</th>
                <th className="px-4 py-3">Última Visita</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {empresasFiltradas.map((emp) => (
                <tr key={emp.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: emp.color }}
                      >
                        {emp.nome.substring(0, 1)}
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-none">{emp.nome}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{emp.categoria}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] font-medium text-muted-foreground">
                    {emp.cnpj}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-bold leading-none">{emp.responsavel}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{emp.celular}</p>
                  </td>
                  <td className="px-4 py-3 text-[11px] font-medium text-muted-foreground">
                    {emp.contato}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-[100px]">
                      <span className="text-xs font-bold w-4">{emp.visitantes}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${(emp.visitantes / maxVisitantes) * 100}%`,
                            backgroundColor: emp.color
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] font-medium leading-none">
                      {emp.ultimaVisita.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {emp.ultimaVisita.split(' ')[1]}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">
                        {emp.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1.5 px-2">
                        <Edit2 size={10} /> Editar
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <History size={12} className="text-muted-foreground" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
