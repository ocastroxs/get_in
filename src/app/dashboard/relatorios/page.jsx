"use client";

import React from "react";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import EntradasChart from "@/components/EntradasChart";
import TiposVisitantesChart from "@/components/TiposVisitantesChart";
import HistoricoVisitas from "@/components/HistoricoVisitas";
import SetoresMaisVisitados from "@/components/SetoresMaisVisitados";
import EmpresasMaisVisitas from "@/components/EmpresasMaisVisitas";
import { Download, FileText, Users, ArrowRightLeft, Clock, AlertTriangle } from "lucide-react";
import { STATS_RELATORIOS, HISTORICO_VISITAS, SETORES_MAIS_VISITADOS, EMPRESAS_MAIS_VISITAS } from "@/lib/mockData";

export default function RelatoriosPage() {
  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      
      {/* 1. TOPBAR E BOTÕES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Topbar 
          title="Relatórios e Analytics" 
          subtitle="Indústria Alimentos Puros • Visão Geral de Performance" 
        />
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-all shadow-sm">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-md">
            <FileText className="w-4 h-4" /> Gerar PDF
          </button>
        </div>
      </div>

      {/* 2. FILTROS */}
      <div className="bg-card text-card-foreground p-5 rounded-2xl border border-border flex flex-wrap items-end gap-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[220px]">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Período Selecionado</label>
          <div className="flex items-center gap-2">
            <input type="date" className="border border-input rounded-md px-3 py-2 text-sm w-full bg-background" defaultValue="2025-07-01" />
            <span className="text-muted-foreground text-xs">até</span>
            <input type="date" className="border border-input rounded-md px-3 py-2 text-sm w-full bg-background" defaultValue="2025-07-29" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tipo de Visitante</label>
          <select className="border border-input rounded-md px-3 py-2 text-sm bg-background">
            <option>Todos os tipos</option>
            <option>Técnico</option>
            <option>Fornecedor</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Setor Destino</label>
          <select className="border border-input rounded-md px-3 py-2 text-sm bg-background">
            <option>Todos os setores</option>
            <option>Produção</option>
            <option>Laboratório</option>
          </select>
        </div>
        <div className="flex gap-3">
           <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline transition-all">Limpar</button>
           <button className="px-6 py-2 bg-foreground text-background rounded-lg text-sm font-bold shadow-md hover:bg-foreground/90 transition-all">Aplicar</button>
        </div>
      </div>

      {/* 3. STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        <StatCard 
          label="Total de Visitas" 
          value={STATS_RELATORIOS.visitas.value} 
          icon={<Users size={17} className="text-primary" />}
          delta={STATS_RELATORIOS.visitas.delta}
          deltaDir={STATS_RELATORIOS.visitas.deltaDir}
          sub={STATS_RELATORIOS.visitas.sub}
          accentVar="var(--primary)"
        />
        <StatCard 
          label="Check-outs Realizados" 
          value={STATS_RELATORIOS.checkouts.value}
          valueClassName="text-chart-2"
          icon={<ArrowRightLeft size={17} className="text-chart-2" />}
          delta={STATS_RELATORIOS.checkouts.delta}
          deltaDir={STATS_RELATORIOS.checkouts.deltaDir}
          sub={STATS_RELATORIOS.checkouts.sub}
          accentVar="var(--chart-2)"
        />
        <StatCard 
          label="Permanência Média" 
          value={STATS_RELATORIOS.permanencia.value} 
          valueClassName="text-chart-3"
          icon={<Clock size={17} className="text-chart-3" />}
          delta={STATS_RELATORIOS.permanencia.delta}
          deltaDir={STATS_RELATORIOS.permanencia.deltaDir}
          sub={STATS_RELATORIOS.permanencia.sub}
          accentVar="var(--chart-3)"
        />
        <StatCard 
          label="Alertas Gerados" 
          value={STATS_RELATORIOS.alertas.value} 
          valueClassName="text-destructive"
          icon={<AlertTriangle size={17} className="text-destructive" />}
          delta={STATS_RELATORIOS.alertas.delta}
          deltaDir={STATS_RELATORIOS.alertas.deltaDir}
          sub={STATS_RELATORIOS.alertas.sub}
          accentVar="var(--destructive)"
        />
      </div>

      {/* 4. GRÁFICOS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <EntradasChart 
            title="Volume de Entradas" 
            subtitle="Análise do período selecionado" 
          />
        </div>
        <div>
          <TiposVisitantesChart 
            title="Distribuição por Tipo" 
            subtitle="Proporção de visitantes" 
          />
        </div>
      </div>

      {/* 5. TABELA DE HISTÓRICO */}
      <HistoricoVisitas data={HISTORICO_VISITAS} />

      {/* 6. GRID INFERIOR */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SetoresMaisVisitados data={SETORES_MAIS_VISITADOS} />
        <EmpresasMaisVisitas data={EMPRESAS_MAIS_VISITAS} />
      </div>
      
    </div>
  );
}