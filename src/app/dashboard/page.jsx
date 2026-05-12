import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import EntradasChart from "@/components/EntradasChart";
import PicoMovimentoChart from "@/components/PicoMovimentoChart";
import TiposVisitanteChart from "@/components/TiposVisitantesChart";
import StatusVisitantesChart from "@/components/StatusVisitantesChart";
import { STATS_TODAY } from "@/lib/mockData";
import { AlertTriangle, ArrowRightLeft, Bell, Clock3, Download, LogOut, Users } from "lucide-react";


export default function DashboardPage() {


  const saidasPct =
    STATS_TODAY.visitantes.value > 0
      ? Math.round((STATS_TODAY.saidas.value / STATS_TODAY.visitantes.value) * 100)
      : 0;

  const ativosDelta =
    STATS_TODAY.entradas.value > 0
      ? Math.round((STATS_TODAY.ativos.value / STATS_TODAY.entradas.value) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6 pb-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6 lg:hidden">
        <header className="rounded-[24px] border border-white/10 bg-[#0A2540] px-4 py-4 pl-14 text-white shadow-lg shadow-slate-950/10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-[-0.03em] text-white">Dashboard Geral</h1>
              <p className="mt-1 text-sm text-slate-300">Visao rapida do fluxo e dos alertas do dia.</p>
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
                className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/90 transition hover:bg-white/15 min-[380px]:flex"
                aria-label="Exportar"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            compact
            featured
            label="Visitantes Hoje"
            value={STATS_TODAY.visitantes.value}
            valueClassName="text-primary"
            icon={<Users size={16} className="text-primary" strokeWidth={1.75} />}
            delta={STATS_TODAY.visitantes.delta}
            deltaDir={STATS_TODAY.visitantes.deltaDir}
            sub="Comparativo com ontem"
            insight="+3 acessos nas ultimas 2h"
            accentVar="var(--primary)"
          />
          <StatCard
            compact
            label="Entradas"
            value={STATS_TODAY.entradas.value}
            valueClassName="text-primary"
            icon={<ArrowRightLeft size={16} className="text-primary" strokeWidth={1.75} />}
            delta={STATS_TODAY.entradas.pct}
            deltaDir="up"
            sub="Registros validados"
            insight="100% confirmadas"
            accentVar="var(--primary)"
          />
          <StatCard
            compact
            label="Saidas"
            value={STATS_TODAY.saidas.value}
            valueClassName="text-secondary"
            icon={<LogOut size={16} className="text-secondary" strokeWidth={1.75} />}
            delta={saidasPct}
            deltaDir="up"
            sub="Check-outs concluidos"
            insight={`${STATS_TODAY.saidas.aindaDentro} ainda dentro`}
            accentVar="var(--secondary)"
          />
          <StatCard
            compact
            label="Ativos Agora"
            value={STATS_TODAY.ativos.value}
            valueClassName="text-foreground"
            icon={<Clock3 size={16} className="text-foreground" strokeWidth={1.75} />}
            delta={ativosDelta}
            deltaDir={STATS_TODAY.ativos.alertas > 0 ? "down" : "up"}
            sub="Permanencia ativa"
            insight={`${STATS_TODAY.ativos.alertas} alerta(s)`}
            accentVar="var(--destructive)"
          />
        </section>

        <EntradasChart mobileLayout />
        <PicoMovimentoChart mobileLayout />
        <TiposVisitanteChart mobileLayout />
        <StatusVisitantesChart mobileLayout="list" />

        <div className="rounded-[24px] border border-border bg-card p-5 shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={18} strokeWidth={1.75} />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Estado Critico</p>
              <h3 className="text-base font-semibold text-foreground">Atencao para permanencia prolongada</h3>
              <p className="text-sm text-muted-foreground">
                Existem {STATS_TODAY.ativos.alertas} visitante(s) acima da janela prevista.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-col lg:gap-6">
        <Topbar
          title="Dashboard Geral"
          subtitle="Monitoramento operacional com foco em fluxo, permanencia e alertas em tempo real."
        />

        <section className="grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <StatCard
              featured
              label="Visitantes Hoje"
              value={STATS_TODAY.visitantes.value}
              valueClassName="text-primary"
              icon={<Users size={18} className="text-primary" strokeWidth={1.75} />}
              delta={STATS_TODAY.visitantes.delta}
              deltaDir={STATS_TODAY.visitantes.deltaDir}
              sub="Comparativo com o mesmo horario de ontem"
              insight="+3 acessos nas ultimas 2h"
              accentVar="var(--primary)"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3 xl:col-span-7">
            <StatCard
              label="Entradas"
              value={STATS_TODAY.entradas.value}
              valueClassName="text-primary"
              icon={<ArrowRightLeft size={17} className="text-primary" strokeWidth={1.75} />}
              delta={STATS_TODAY.entradas.pct}
              deltaDir="up"
              sub="Registros confirmados hoje"
              insight="100% das entradas validadas"
              accentVar="var(--primary)"
            />
            <StatCard
              label="Saidas"
              value={STATS_TODAY.saidas.value}
              valueClassName="text-secondary"
              icon={<LogOut size={17} className="text-secondary" strokeWidth={1.75} />}
              delta={saidasPct}
              deltaDir="up"
              sub="Check-outs concluidos"
              insight={`${STATS_TODAY.saidas.aindaDentro} pessoas ainda dentro`}
              accentVar="var(--secondary)"
            />
            <StatCard
              label="Ativos Agora"
              value={STATS_TODAY.ativos.value}
              valueClassName="text-foreground"
              icon={<Clock3 size={17} className="text-foreground" strokeWidth={1.75} />}
              delta={ativosDelta}
              deltaDir={STATS_TODAY.ativos.alertas > 0 ? "down" : "up"}
              sub="Pessoas em permanencia ativa"
              insight={`${STATS_TODAY.ativos.alertas} alerta(s) exigem revisao`}
              accentVar="var(--destructive)"
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)]">
          <EntradasChart />
          <PicoMovimentoChart />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <TiposVisitanteChart />
          <div className="space-y-6">
            <StatusVisitantesChart />
            <div className="rounded-[24px] border border-border bg-card p-5 shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <AlertTriangle size={18} strokeWidth={1.75} />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Estado Critico</p>
                  <h3 className="text-lg font-semibold text-foreground">Atencao para permanencia prolongada</h3>
                  <p className="text-sm text-muted-foreground">
                    Existem {STATS_TODAY.ativos.alertas} visitante(s) acima da janela prevista. Priorize a validacao de saida.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
