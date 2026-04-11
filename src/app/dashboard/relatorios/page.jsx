"use client";

import React from "react";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import EntradasChart from "@/components/EntradasChart";
import TiposVisitantesChart from "@/components/TiposVisitantesChart";
import HistoricoVisitas from "@/components/HistoricoVisitas";
import SetoresMaisVisitados from "@/components/SetoresMaisVisitados";
import EmpresasMaisVisitas from "@/components/EmpresasMaisVisitas";
import { Users, ArrowRightLeft, Clock, AlertTriangle } from "lucide-react";
import { STATS_RELATORIOS, HISTORICO_VISITAS, SETORES_MAIS_VISITADOS, EMPRESAS_MAIS_VISITAS } from "@/lib/mockData";

export default function RelatoriosPage() {
  return (
    <div className="flex flex-col gap-6 w-full pb-10">

      {/* TOPBAR */}
      <Topbar
        title="Relatórios e Analytics"
        subtitle="Indústria Alimentos Puros • Visão Geral de Performance"
      />

      {/* STAT CARDS */}
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

      {/* GRÁFICOS */}
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

      {/* TABELA DE HISTÓRICO */}
      <HistoricoVisitas data={HISTORICO_VISITAS} />

      {/* GRID INFERIOR */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SetoresMaisVisitados data={SETORES_MAIS_VISITADOS} />
        <EmpresasMaisVisitas data={EMPRESAS_MAIS_VISITAS} />
      </div>

    </div>
  );
}