import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import EntradasChart from "@/components/EntradasChart";
import PicoMovimentoChart from "@/components/PicoMovimentoChart";
import TiposVisitanteChart from "@/components/TiposVisitantesChart";
import StatusVisitantesChart from "@/components/StatusVisitantesChart";
import UltimosCheckins from "@/components/UltimosCheckins";
import UltimosCheckouts from "@/components/UltimosCheckouts";
import NaEmpresaAgora from "@/components/NaEmpresaAgora";
import { STATS_TODAY } from "@/lib/mockData";
import { Users, ArrowRightLeft, LogOut, Clock } from "lucide-react";
import ParticlesBackground from "@/components/ui/ParticlesBackground";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <Topbar
        title="Dashboard Geral"
        subtitle="Visão rápida do desempenho e atividades recentes"
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 animate-in fade-in duration-700 delay-100">
        <StatCard
          label="Visitantes Hoje"
          value={STATS_TODAY.visitantes.value}
          icon={<Users size={17} className="text-primary" />}
          delta={STATS_TODAY.visitantes.delta}
          deltaDir={STATS_TODAY.visitantes.deltaDir}
          sub="vs ontem"
          accentVar="var(--primary)"
        />
        <StatCard
          label="Entradas Hoje"
          value={STATS_TODAY.entradas.value}
          valueClassName="text-chart-2"
          icon={<ArrowRightLeft size={17} className="text-chart-2" />}
          sub={`${STATS_TODAY.entradas.pct}% registradas`}
          accentVar="var(--chart-2)"
        />
        <StatCard
          label="Saídas Hoje"
          value={STATS_TODAY.saidas.value}
          valueClassName="text-chart-3"
          icon={<LogOut size={17} className="text-chart-3" />}
          sub={`${STATS_TODAY.saidas.aindaDentro} ainda dentro`}
          accentVar="var(--chart-3)"
        />
        <StatCard
          label="Ativos Agora"
          value={STATS_TODAY.ativos.value}
          valueClassName="text-destructive"
          icon={<Clock size={17} className="text-destructive" />}
          sub={`${STATS_TODAY.ativos.alertas} alertas pendentes`}
          accentVar="var(--destructive)"
        />
      </div>

      {/* Gráficos — linha 1 */}
      <div className="grid grid-cols-3 gap-4 animate-in fade-in duration-700 delay-200">
        <div className="col-span-2">
          <EntradasChart />
        </div>
        <PicoMovimentoChart />
      </div>

      {/* Gráficos — linha 2 */}
      <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-700 delay-300">
        <TiposVisitanteChart />
        <StatusVisitantesChart />
      </div>

      {/* Tabelas */}
      <div className="grid grid-cols-3 gap-4 animate-in fade-in duration-700 delay-400">
        <UltimosCheckins />
        <UltimosCheckouts />
        <NaEmpresaAgora />
      </div>
    </div>
  );
}
