"use client";

import React, { useState, useEffect } from "react";
import StatCard from "@/components/StatCard";
import EntradasChart from "@/components/EntradasChart";
import TiposVisitantesChart from "@/components/TiposVisitantesChart";
import HistoricoVisitas from "@/components/HistoricoVisitas";
import SetoresMaisVisitados from "@/components/SetoresMaisVisitados";
import EmpresasMaisVisitas from "@/components/EmpresasMaisVisitas";
import { Users, ArrowRightLeft, Clock, AlertTriangle } from "lucide-react";
import { useDashboardTopbar } from "@/components/dashboard/DashboardTopbarContext";
import { STATS_RELATORIOS, HISTORICO_VISITAS, SETORES_MAIS_VISITADOS, EMPRESAS_MAIS_VISITAS } from "@/lib/mockData";
import { title } from "@/components/checkbox-standard-6";

export default function RelatoriosPage() {
  useDashboardTopbar({
    primaryActionLabel: "Exportar PDF",
    onPrimaryAction: () => alert("Criar novo relatório"),
  });
  const [stats, setStats] = useState(STATS_RELATORIOS);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("");
        const data = await res.json();
        if (data.sucesso) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Erro ao buscar stats:", error);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="flex w-full flex-col gap-6 overflow-x-hidden pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        <StatCard
          label="Total de Visitas"
          value={stats.visitas.value}
          icon={<Users size={17} className="text-primary" />}
          delta={stats.visitas.delta}
          deltaDir={stats.visitas.deltaDir}
          sub={stats.visitas.sub}
          accentVar="var(--primary)"
        />
        <StatCard
          label="Check-outs Realizados"
          value={stats.checkouts.value}
          valueClassName="text-emerald-700 dark:text-emerald-300"
          icon={<ArrowRightLeft size={17} className="text-emerald-700 dark:text-emerald-300" />}
          delta={stats.checkouts.delta}
          deltaDir={stats.checkouts.deltaDir}
          sub={stats.checkouts.sub}
          accentVar="var(--chart-2)"
        />
        <StatCard
          label="Permanencia Media"
          value={stats.permanencia.value}
          valueClassName="text-sky-700 dark:text-sky-300"
          icon={<Clock size={17} className="text-sky-700 dark:text-sky-300" />}
          delta={stats.permanencia.delta}
          deltaDir={stats.permanencia.deltaDir}
          sub={stats.permanencia.sub}
          accentVar="var(--chart-3)"
        />
        <StatCard
          label="Alertas Gerados"
          value={stats.alertas.value}
          valueClassName="text-destructive"
          icon={<AlertTriangle size={17} className="text-destructive" />}
          delta={stats.alertas.delta}
          deltaDir={stats.alertas.deltaDir}
          sub={stats.alertas.sub}
          accentVar="var(--destructive)"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <EntradasChart
            title="Volume de Entradas"
            subtitle="Analise do periodo selecionado"
          />
        </div>
        <div>
          <TiposVisitantesChart
            title="Distribuicao por Tipo"
            subtitle="Proporcao de visitantes"
          />
        </div>
      </div>

      <HistoricoVisitas data={HISTORICO_VISITAS} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SetoresMaisVisitados data={SETORES_MAIS_VISITADOS} />
        <EmpresasMaisVisitas data={EMPRESAS_MAIS_VISITAS} />
      </div>
    </div>
  );
}
