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
import { Users, ArrowRightLeft, LogOut, Clock, Bell, Download } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 lg:hidden">
        <header className="flex items-start justify-between rounded-2xl border border-border bg-[#0A2540]/90 px-4 py-4 pl-14 text-white shadow-lg shadow-slate-900/10 backdrop-blur-sm">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold leading-tight">Dashboard Geral</h1>
            <p className="mt-1 text-sm text-blue-100/80">Visao rapida de hoje</p>
          </div>

          <div className="ml-3 flex items-center gap-2">

            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/90 transition hover:bg-white/15"
              aria-label="Notificacoes"
            >
              <Bell size={16} />
            </button>
            <button
              type="button"
              className="hidden min-[380px]:flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/90 transition hover:bg-white/15"
              aria-label="Exportar"
            >
              <Download size={16} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-700 delay-100">
          <StatCard
            compact
            label="Visitantes Hoje"
            value={STATS_TODAY.visitantes.value}
            icon={<Users size={15} className="text-primary" />}
            delta={STATS_TODAY.visitantes.delta}
            deltaDir={STATS_TODAY.visitantes.deltaDir}
            sub="vs ontem"
            accentVar="var(--primary)"
          />
          <StatCard
            compact
            label="Entradas Hoje"
            value={STATS_TODAY.entradas.value}
            valueClassName="text-chart-2"
            icon={<ArrowRightLeft size={15} className="text-chart-2" />}
            sub={`${STATS_TODAY.entradas.pct}% registradas`}
            accentVar="var(--chart-2)"
          />
          <StatCard
            compact
            label="Saidas Hoje"
            value={STATS_TODAY.saidas.value}
            valueClassName="text-chart-3"
            icon={<LogOut size={15} className="text-chart-3" />}
            sub={`${STATS_TODAY.saidas.aindaDentro} ainda dentro`}
            accentVar="var(--chart-3)"
          />
          <StatCard
            compact
            label="Ativos Agora"
            value={STATS_TODAY.ativos.value}
            valueClassName="text-destructive"
            icon={<Clock size={15} className="text-destructive" />}
            sub={`${STATS_TODAY.ativos.alertas} alertas pendentes`}
            accentVar="var(--destructive)"
          />
        </div>

        <EntradasChart mobileLayout />
        <PicoMovimentoChart mobileLayout />
        <TiposVisitanteChart mobileLayout />
        <StatusVisitantesChart mobileLayout="list" />

        <div className="grid grid-cols-1 gap-3 animate-in fade-in duration-700 delay-400">
          <UltimosCheckins />
          <UltimosCheckouts />
          <NaEmpresaAgora />
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-col lg:gap-6">
        <Topbar
          title="Dashboard Geral"
          subtitle="Visao rapida do desempenho e atividades recentes"
        />

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
            label="Saidas Hoje"
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

        <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-700 delay-200 xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,1fr)]">
          <div className="xl:max-w-[900px]">
            <EntradasChart />
          </div>
          <PicoMovimentoChart />
        </div>

        <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-700 delay-300 xl:grid-cols-2">
          <TiposVisitanteChart />
          <StatusVisitantesChart />
        </div>

        <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-700 delay-400 xl:grid-cols-3">
          <UltimosCheckins />
          <UltimosCheckouts />
          <NaEmpresaAgora />
        </div>
      </div>
    </div>
  );
}
