"use client";

import { useEffect, useMemo, useState } from "react";
import AlertaBanner from "@/components/AlertaBanner";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import EntradasChart from "@/components/EntradasChart";
import PicoMovimentoChart from "@/components/PicoMovimentoChart";
import TiposVisitanteChart from "@/components/TiposVisitantesChart";
import StatusVisitantesChart from "@/components/StatusVisitantesChart";
import { STATS_TODAY } from "@/lib/mockData";
import { api } from "@/services/api";
import { AlertTriangle, ArrowRightLeft, Bell, Clock3, Download, LogOut, Users } from "lucide-react";

const CORES_GRAFICO = ["#0f3a7d", "#34a853", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

// Helper: Parse data from multiple possible field names
function parseDataRequisicao(item) {
  // Priorizamos dataDaRequisicao (tabela requisicoes_de_visitas) e dataDeEntrada (logs)
  const campos = ["dataDaRequisicao", "solicitacao", "dataDeEntrada", "entrada", "createdAt", "created_at", "dataCriacao", "createdAtRequisicao"];
  
  for (const campo of campos) {
    if (item[campo]) {
      // Se for uma string de data do MySQL (YYYY-MM-DD HH:mm:ss), o JS pode interpretar errado dependendo do fuso
      // Vamos tentar normalizar substituindo o espaço por 'T' se necessário
      let dateStr = String(item[campo]);
      if (dateStr.includes(" ") && !dateStr.includes("T")) {
        dateStr = dateStr.replace(" ", "T");
      }
      
      const data = new Date(dateStr);
      if (!Number.isNaN(data.getTime())) {
        return data;
      }
    }
  }
  
  return null;
}

// Helper: Normalize motivo (trim, preserve original for display)
function normalizarMotivo(motivo) {
  if (!motivo || typeof motivo !== "string") return null;
  const trimmed = motivo.trim();
  if (!trimmed) return null;
  return trimmed;
}

function inicioDoDia(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

function diferencaEmDias(dataReferencia, dataComparada) {
  return Math.round((inicioDoDia(dataReferencia) - inicioDoDia(dataComparada)) / (1000 * 60 * 60 * 24));
}

function obterMaiorDataRequisicao(requisicoes) {
  return requisicoes.reduce((maior, req) => {
    const data = parseDataRequisicao(req);
    if (!data) return maior;
    return !maior || data > maior ? data : maior;
  }, null);
}

function formatarMotivos(mapa) {
  return [...mapa.values()]
    .map((item, index) => ({
      name: item.motivo,
      value: item.count,
      color: CORES_GRAFICO[index % CORES_GRAFICO.length],
    }))
    .sort((a, b) => b.value - a.value);
}

function somarMotivo(mapa, req) {
  const motivo = normalizarMotivo(req.motivo);
  if (!motivo) return;

  const chaveNormalizada = motivo.toLowerCase();
  const atual = mapa.get(chaveNormalizada) || { motivo, count: 0 };
  atual.count += 1;
  mapa.set(chaveNormalizada, atual);
}

// Helper: Group motivos for today
function agruparMotivosHoje(requisicoes) {
  const hoje = new Date();
  const mapa = new Map();

  requisicoes.forEach((req) => {
    const data = parseDataRequisicao(req);
    if (!data) return;

    const mesmoDia = data.getDate() === hoje.getDate() && 
                    data.getMonth() === hoje.getMonth() && 
                    data.getFullYear() === hoje.getFullYear();
    if (!mesmoDia) return;

    somarMotivo(mapa, req);
  });

  return formatarMotivos(mapa);
}

// Helper: Group motivos for the last 7 days
function agruparMotivosSemana(requisicoes) {
  const referencia = obterMaiorDataRequisicao(requisicoes) || new Date();
  const mapa = new Map();

  requisicoes.forEach((req) => {
    const data = parseDataRequisicao(req);
    if (!data) return;

    const diferenca = diferencaEmDias(referencia, data);
    
    // Aceitamos registros de hoje (0) até 6 dias atrás (totalizando 7 dias)
    if (diferenca < 0 || diferenca > 6) return;

    somarMotivo(mapa, req);
  });

  return formatarMotivos(mapa);
}

// Helper: Group motivos for the current month
function agruparMotivosMes(requisicoes) {
  const referencia = obterMaiorDataRequisicao(requisicoes) || new Date();
  const mapa = new Map();

  requisicoes.forEach((req) => {
    const data = parseDataRequisicao(req);
    if (!data) return;

    // Verifica se é o mesmo mês e ano
    const mesmoMes = data.getMonth() === referencia.getMonth() && data.getFullYear() === referencia.getFullYear();
    if (!mesmoMes) return;

    somarMotivo(mapa, req);
  });

  return formatarMotivos(mapa);
}

// Helper: Process status counts for today
function processarStatusHoje(requisicoes) {
  const hoje = new Date();
  const counts = {
    ativo: 0,
    pendente: 0,
    semsaida: 0,
    finalizado: 0,
  };

  requisicoes.forEach((req) => {
    const data = parseDataRequisicao(req);
    if (!data) return;

    const mesmoDia = data.getDate() === hoje.getDate() && 
                    data.getMonth() === hoje.getMonth() && 
                    data.getFullYear() === hoje.getFullYear();
    if (!mesmoDia) return;

    const status = String(req.status || "").toLowerCase();
    if (counts.hasOwnProperty(status)) {
      counts[status] += 1;
    }
  });

  return [
    { name: "Dentro da fábrica", value: counts.ativo, color: "var(--chart-2)" },
    { name: "Aguard. aprovação", value: counts.pendente, color: "var(--chart-3)" },
    { name: "Alerta permanência", value: counts.semsaida, color: "var(--chart-5)" },
    { name: "Check-out realizado", value: counts.finalizado, color: "rgba(15, 58, 125, 0.18)" },
  ];
}

// Helper: Process status counts for the last 7 days
function processarStatusSemana(requisicoes) {
  const hoje = new Date();
  const counts = {
    ativo: 0,
    pendente: 0,
    semsaida: 0,
    finalizado: 0,
  };

  requisicoes.forEach((req) => {
    const data = parseDataRequisicao(req);
    if (!data) return;

    const d1 = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const d2 = new Date(data.getFullYear(), data.getMonth(), data.getDate());
    const diferenca = Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
    
    if (diferenca < 0 || diferenca > 6) return;

    const status = String(req.status || "").toLowerCase();
    if (counts.hasOwnProperty(status)) {
      counts[status] += 1;
    }
  });

  return [
    { name: "Dentro da fábrica", value: counts.ativo, color: "var(--chart-2)" },
    { name: "Aguard. aprovação", value: counts.pendente, color: "var(--chart-3)" },
    { name: "Alerta permanência", value: counts.semsaida, color: "var(--chart-5)" },
    { name: "Check-out realizado", value: counts.finalizado, color: "rgba(15, 58, 125, 0.18)" },
  ];
}

export default function DashboardPage() {
  const [visitantesEmAlerta, setVisitantesEmAlerta] = useState([]);
  const [mostrarBanner, setMostrarBanner] = useState(true);
  const [motivosHoje, setMotivosHoje] = useState([]);
  const [motivosSemana, setMotivosSemana] = useState([]);
  const [motivosMes, setMotivosMes] = useState([]);
  const [statusHoje, setStatusHoje] = useState([]);
  const [statusSemana, setStatusSemana] = useState([]);

  useEffect(() => {
    async function carregarDados() {
      try {
        const response = await api.get("/requisicao-visitante");
        if (response.sucesso) {
          const requisicoes = response.data || [];
          
          // Filter alerts
          const alertas = requisicoes.filter((visitante) => visitante.status === "semsaida");
          setVisitantesEmAlerta(alertas);
          setMostrarBanner(alertas.length > 0);
          
          // Process motivos
          setMotivosHoje(agruparMotivosHoje(requisicoes));
          setMotivosSemana(agruparMotivosSemana(requisicoes));
          setMotivosMes(agruparMotivosMes(requisicoes));
          
          // Process status
          setStatusHoje(processarStatusHoje(requisicoes));
          setStatusSemana(processarStatusSemana(requisicoes));
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        setVisitantesEmAlerta([]);
        setMostrarBanner(false);
        setMotivosHoje([]);
        setMotivosSemana([]);
        setMotivosMes([]);
        setStatusHoje([]);
        setStatusSemana([]);
      }
    }

    carregarDados();
  }, []);

  const mostrarAlertaBanner = useMemo(
    () => mostrarBanner && visitantesEmAlerta.length > 0,
    [mostrarBanner, visitantesEmAlerta.length]
  );

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
              <p className="mt-1 text-sm text-slate-300">Visão rápida do fluxo e dos alertas do dia.</p>
            </div>

            <div className="ml-3 flex items-center gap-2">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/90 transition hover:bg-white/15"
                aria-label="Notificações"
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
            insight="+3 acessos nas últimas 2h"
            accentVar="var(--primary)"
          />
          <StatCard
            compact
            label="Entradas"
            value={STATS_TODAY.entradas.value}
            valueClassName="text-secondary"
            icon={<ArrowRightLeft size={16} className="text-secondary" strokeWidth={1.75} />}
            delta={STATS_TODAY.entradas.pct}
            deltaDir="up"
            sub="Registros validados"
            insight="100% confirmadas"
            accentVar="var(--secondary)"
          />
          <StatCard
            compact
            label="Saídas"
            value={STATS_TODAY.saidas.value}
            valueClassName="text-red-600"
            icon={<LogOut size={16} className="text-red-600" strokeWidth={1.75} />}
            delta={saidasPct}
            deltaDir="up"
            sub="Check-outs concluídos"
            insight={`${STATS_TODAY.saidas.aindaDentro} ainda dentro`}
            accentVar="#dc2626"
          />
          <StatCard
            compact
            label="Ativos Agora"
            value={STATS_TODAY.ativos.value}
            valueClassName="text-blue-900"
            icon={<Clock3 size={16} className="text-blue-900" strokeWidth={1.75} />}
            delta={ativosDelta}
            deltaDir={STATS_TODAY.ativos.alertas > 0 ? "down" : "up"}
            sub="Permanência ativa"
            insight={`${STATS_TODAY.ativos.alertas} alerta(s)`}
            accentVar="#1e3a8a"
          />
        </section>

        {mostrarAlertaBanner ? (
          <AlertaBanner alertas={visitantesEmAlerta} onDismiss={() => setMostrarBanner(false)} />
        ) : null}

        <EntradasChart mobileLayout />
        <PicoMovimentoChart mobileLayout />
        <TiposVisitanteChart
          mobileLayout
          data={motivosHoje}
          weekData={motivosSemana}
          monthData={motivosMes}
        />
        <StatusVisitantesChart mobileLayout="list" data={statusHoje} weekData={statusSemana} />

        <div className="rounded-[24px] border border-border bg-card p-5 shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={18} strokeWidth={1.75} />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Estado Critico</p>
              <h3 className="text-base font-semibold text-foreground">Atenção para permanência prolongada</h3>
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
          subtitle="Monitoramento operacional com foco em fluxo, permanência e alertas em tempo real."
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
              sub="Comparativo com o mesmo horário de ontem"
              insight="+3 acessos nas últimas 2h"
              accentVar="var(--primary)"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3 xl:col-span-7">
            <StatCard
              label="Entradas"
              value={STATS_TODAY.entradas.value}
              valueClassName="text-secondary"
              icon={<ArrowRightLeft size={17} className="text-secondary" strokeWidth={1.75} />}
              delta={STATS_TODAY.entradas.pct}
              deltaDir="up"
              sub="Registros confirmados hoje"
              insight="100% das entradas validadas"
              accentVar="var(--secondary)"
            />
            <StatCard
              label="Saídas"
              value={STATS_TODAY.saidas.value}
              valueClassName="text-red-600"
              icon={<LogOut size={17} className="text-red-600" strokeWidth={1.75} />}
              delta={saidasPct}
              deltaDir="up"
              sub="Check-outs concluídos"
              insight={`${STATS_TODAY.saidas.aindaDentro} pessoas ainda dentro`}
              accentVar="#dc2626"
            />
            <StatCard
              label="Ativos Agora"
              value={STATS_TODAY.ativos.value}
              valueClassName="text-blue-900"
              icon={<Clock3 size={17} className="text-blue-900" strokeWidth={1.75} />}
              delta={ativosDelta}
              deltaDir={STATS_TODAY.ativos.alertas > 0 ? "down" : "up"}
              sub="Pessoas em permanência ativa"
              insight={`${STATS_TODAY.ativos.alertas} alerta(s) exigem revisão`}
              accentVar="#1e3a8a"
            />
          </div>
        </section>

        {mostrarAlertaBanner ? (
          <AlertaBanner alertas={visitantesEmAlerta} onDismiss={() => setMostrarBanner(false)} />
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)]">
          <EntradasChart />
          <PicoMovimentoChart />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <TiposVisitanteChart
            data={motivosHoje}
            weekData={motivosSemana}
            monthData={motivosMes}
          />
          <div className="space-y-6">
            <StatusVisitantesChart data={statusHoje} weekData={statusSemana} />
          </div>
        </section>
      </div>
    </div>
  );
}
