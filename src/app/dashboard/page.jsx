"use client";

import { useEffect, useMemo, useState } from "react";
import AlertaBanner from "@/components/AlertaBanner";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import EntradasChart from "@/components/EntradasChart";
import PicoMovimentoChart from "@/components/PicoMovimentoChart";
import TiposVisitanteChart from "@/components/TiposVisitantesChart";
import StatusVisitantesChart from "@/components/StatusVisitantesChart";
import { api } from "@/services/api";
import { ArrowRightLeft, Bell, Clock3, Download, LogOut, Users } from "lucide-react";

const CORES_GRAFICO = ["#0f3a7d", "#34a853", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const HORAS_DIA = Array.from({ length: 24 }, (_, index) => index);
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const LIMITE_ALERTA_HORAS = 8;

const STATS_VAZIAS = {
  visitantes: { value: 0, delta: 0, deltaDir: "up" },
  entradas: { value: 0, pct: 0, ultimas2h: 0 },
  saidas: { value: 0, aindaDentro: 0 },
  ativos: { value: 0, alertas: 0 },
};

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

function parseDataValor(valor) {
  if (!valor) return null;

  let dateStr = String(valor);
  if (dateStr.includes(" ") && !dateStr.includes("T")) {
    dateStr = dateStr.replace(" ", "T");
  }

  const data = new Date(dateStr);
  return Number.isNaN(data.getTime()) ? null : data;
}

function parseDataCampos(item, campos) {
  for (const campo of campos) {
    const data = parseDataValor(item?.[campo]);
    if (data) return data;
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

function obterSetor(req) {
  const setorRelacionado = req?.setores || req?.setorRelacionado || req?.departamentoRelacionado;
  const nomeRelacionado = normalizarMotivo(setorRelacionado?.nome || setorRelacionado?.name || setorRelacionado?.descricao);
  if (nomeRelacionado) return nomeRelacionado;

  const setorDireto = normalizarMotivo(req?.setor || req?.nomeSetor || req?.departamento || req?.nomeDepartamento);
  if (setorDireto) return setorDireto;

  if (req?.idSetor) return `Setor ${req.idSetor}`;
  if (req?.idDepartamento) return `Setor ${req.idDepartamento}`;

  return null;
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

function agruparPicoPorSetor(requisicoes) {
  const mapa = new Map();

  requisicoes.forEach((req) => {
    const setor = obterSetor(req);
    if (!setor) return;

    const chaveNormalizada = setor.toLowerCase();
    const atual = mapa.get(chaveNormalizada) || { setor, value: 0 };
    atual.value += 1;
    mapa.set(chaveNormalizada, atual);
  });

  return [...mapa.values()]
    .sort((a, b) => b.value - a.value)
    .map((item) => ({
      setor: item.setor,
      value: item.value,
    }));
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
function processarStatusHoje(requisicoes, visitantesLocal = [], logs = []) {
  return processarStatusPeriodo(requisicoes, visitantesLocal, "hoje", logs);
}

// Helper: Process status counts for the last 7 days
function processarStatusSemana(requisicoes, visitantesLocal = [], logs = []) {
  return processarStatusPeriodo(requisicoes, visitantesLocal, "semana", logs);
}

function estaNoPeriodo(data, periodo, referencia = new Date()) {
  if (!data) return false;

  if (periodo === "hoje") {
    return diferencaEmDias(referencia, data) === 0;
  }

  if (periodo === "semana") {
    const diferenca = diferencaEmDias(referencia, data);
    return diferenca >= 0 && diferenca <= 6;
  }

  if (periodo === "mes") {
    return data.getMonth() === referencia.getMonth() && data.getFullYear() === referencia.getFullYear();
  }

  return false;
}

function getIdentidadeVisitante(item, fallbackPrefix = "item") {
  return String(item?.idUsuario || item?.usuario?.id || item?.id || item?.cpf || `${fallbackPrefix}-${Math.random()}`);
}

function getEntradaVisitante(item) {
  return parseDataCampos(item, ["dataEntrada", "entrada", "dataDeEntrada", "horario_entrada"]);
}

function getSaidaVisitante(item) {
  return parseDataCampos(item, ["dataSaida", "saida", "dataDeSaida"]);
}

function isDentro(item) {
  const status = String(item?.status || "").toLowerCase();
  return status === "dentro" || status === "ativo" || (!!getEntradaVisitante(item) && !getSaidaVisitante(item));
}

function isSaida(item) {
  const status = String(item?.status || "").toLowerCase();
  return status === "saida" || status === "saiu" || status === "finalizado" || !!getSaidaVisitante(item);
}

function isAlertaPermanencia(item, agora = new Date()) {
  if (!isDentro(item)) return false;

  const entrada = getEntradaVisitante(item);
  if (!entrada) return false;

  const horas = (agora - entrada) / (1000 * 60 * 60);
  return horas >= LIMITE_ALERTA_HORAS;
}

function normalizarArrayResponse(response, keys = []) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.dados)) return response.dados;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
    if (Array.isArray(response?.data?.[key])) return response.data[key];
    if (Array.isArray(response?.dados?.[key])) return response.dados[key];
  }

  return [];
}

function contarUnicos(items, getKey) {
  return new Set(items.map(getKey).filter(Boolean)).size;
}

function calcularVariacao(atual, anterior) {
  if (anterior === 0) return atual > 0 ? 100 : 0;
  return Math.round(((atual - anterior) / anterior) * 100);
}

function processarStatusPeriodo(requisicoes, visitantesLocal, periodo, logs = []) {
  const referencia = new Date();
  const counts = {
    dentro: 0,
    pendente: 0,
    alerta: 0,
    finalizado: 0,
  };

  requisicoes.forEach((req) => {
    const data = parseDataRequisicao(req);
    if (!estaNoPeriodo(data, periodo, referencia)) return;

    const status = String(req.status || "").toLowerCase();
    if (status === "pendente") counts.pendente += 1;
  });

  visitantesLocal.forEach((visitante) => {
    const entrada = getEntradaVisitante(visitante);
    const saida = getSaidaVisitante(visitante);

    if (isDentro(visitante) && estaNoPeriodo(entrada, periodo, referencia)) {
      counts.dentro += 1;
      if (isAlertaPermanencia(visitante, referencia)) counts.alerta += 1;
    }

    if (logs.length === 0 && isSaida(visitante) && estaNoPeriodo(saida || entrada, periodo, referencia)) {
      counts.finalizado += 1;
    }
  });

  logs.forEach((log) => {
    const saida = getSaidaVisitante(log);
    if (estaNoPeriodo(saida, periodo, referencia)) counts.finalizado += 1;
  });

  return [
    { name: "Dentro da fábrica", value: counts.dentro, color: "var(--chart-2)" },
    { name: "Aguard. aprovação", value: counts.pendente, color: "var(--chart-3)" },
    { name: "Alerta permanência", value: counts.alerta, color: "var(--chart-5)" },
    { name: "Check-out realizado", value: counts.finalizado, color: "rgba(15, 58, 125, 0.18)" },
  ];
}

function entradasPorHoraHoje(visitantesLocal) {
  const mapa = new Map(HORAS_DIA.map((hora) => [`${String(hora).padStart(2, "0")}h`, 0]));
  const referencia = new Date();

  visitantesLocal.forEach((visitante) => {
    const data = getEntradaVisitante(visitante);
    if (!estaNoPeriodo(data, "hoje", referencia)) return;

    const label = `${String(data.getHours()).padStart(2, "0")}h`;
    mapa.set(label, (mapa.get(label) || 0) + 1);
  });

  return [...mapa.entries()].map(([hora, value]) => ({ hora, value }));
}

function entradasPorSemana(visitantesLocal) {
  const referencia = new Date();
  const dias = Array.from({ length: 7 }, (_, index) => {
    const data = new Date(referencia);
    data.setDate(referencia.getDate() - (6 - index));
    return {
      data,
      hora: DIAS_SEMANA[data.getDay()],
      value: 0,
    };
  });

  visitantesLocal.forEach((visitante) => {
    const entrada = getEntradaVisitante(visitante);
    if (!estaNoPeriodo(entrada, "semana", referencia)) return;

    const item = dias.find((dia) => diferencaEmDias(dia.data, entrada) === 0);
    if (item) item.value += 1;
  });

  return dias.map(({ hora, value }) => ({ hora, value }));
}

function entradasPorMes(visitantesLocal) {
  const referencia = new Date();
  const diasNoMes = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 0).getDate();
  const buckets = [
    { inicio: 1, fim: 7, hora: "1-7", value: 0 },
    { inicio: 8, fim: 14, hora: "8-14", value: 0 },
    { inicio: 15, fim: 21, hora: "15-21", value: 0 },
    { inicio: 22, fim: diasNoMes, hora: `22-${diasNoMes}`, value: 0 },
  ];

  visitantesLocal.forEach((visitante) => {
    const entrada = getEntradaVisitante(visitante);
    if (!estaNoPeriodo(entrada, "mes", referencia)) return;

    const dia = entrada.getDate();
    const bucket = buckets.find((item) => dia >= item.inicio && dia <= item.fim);
    if (bucket) bucket.value += 1;
  });

  return buckets.map(({ hora, value }) => ({ hora, value }));
}

function calcularStatsDashboard(requisicoes, logs, visitantesLocal) {
  const hoje = new Date();
  const entradasHoje = logs.filter((item) => estaNoPeriodo(getEntradaVisitante(item), "hoje", hoje));
  const entradasOntem = logs.filter((item) => diferencaEmDias(hoje, getEntradaVisitante(item)) === 1);
  const saidasHoje = logs.filter((item) => estaNoPeriodo(getSaidaVisitante(item), "hoje", hoje));
  const visitantesHojeReq = requisicoes.filter((item) => estaNoPeriodo(parseDataRequisicao(item), "hoje", hoje));
  const visitantesOntemReq = requisicoes.filter((item) => diferencaEmDias(hoje, parseDataRequisicao(item)) === 1);
  const ativosAgora = visitantesLocal.filter(isDentro);
  const alertas = ativosAgora.filter((item) => isAlertaPermanencia(item, hoje)).length;
  const duasHorasAtras = new Date(hoje.getTime() - 2 * 60 * 60 * 1000);
  const ultimas2h = entradasHoje.filter((item) => {
    const entrada = getEntradaVisitante(item);
    return entrada && entrada >= duasHorasAtras;
  }).length;

  const visitantesHoje = Math.max(
    contarUnicos(visitantesHojeReq, (item) => getIdentidadeVisitante(item, "req")),
    contarUnicos(entradasHoje, (item) => getIdentidadeVisitante(item, "entrada"))
  );
  const visitantesOntem = Math.max(
    contarUnicos(visitantesOntemReq, (item) => getIdentidadeVisitante(item, "req-ontem")),
    contarUnicos(entradasOntem, (item) => getIdentidadeVisitante(item, "entrada-ontem"))
  );

  return {
    visitantes: {
      value: visitantesHoje,
      delta: Math.abs(calcularVariacao(visitantesHoje, visitantesOntem)),
      deltaDir: visitantesHoje >= visitantesOntem ? "up" : "down",
    },
    entradas: {
      value: entradasHoje.length,
      pct: Math.abs(calcularVariacao(entradasHoje.length, entradasOntem.length)),
      ultimas2h,
    },
    saidas: {
      value: saidasHoje.length,
      aindaDentro: ativosAgora.length,
    },
    ativos: {
      value: ativosAgora.length,
      alertas,
    },
  };
}

export default function DashboardPage() {
  const [visitantesEmAlerta, setVisitantesEmAlerta] = useState([]);
  const [mostrarBanner, setMostrarBanner] = useState(true);
  const [motivosHoje, setMotivosHoje] = useState([]);
  const [motivosSemana, setMotivosSemana] = useState([]);
  const [motivosMes, setMotivosMes] = useState([]);
  const [picoSetores, setPicoSetores] = useState([]);
  const [statusHoje, setStatusHoje] = useState([]);
  const [statusSemana, setStatusSemana] = useState([]);
  const [statusMes, setStatusMes] = useState([]);
  const [entradasHoje, setEntradasHoje] = useState([]);
  const [entradasSemana, setEntradasSemana] = useState([]);
  const [entradasMes, setEntradasMes] = useState([]);
  const [statsDashboard, setStatsDashboard] = useState(STATS_VAZIAS);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        // Carregando dados consolidados do back-end
        const [requisicoesResponse, portariaResponse, logsResponse] = await Promise.all([
          api.get("/requisicao-visitante"),
          api.get("/portaria/vlocal"),
          api.get("/logs"),
        ]);

        if (requisicoesResponse.sucesso || portariaResponse.sucesso || logsResponse.sucesso) {
          // Normalizando respostas do back-end
          const requisicoes = normalizarArrayResponse(requisicoesResponse, ["requisicoes", "dados"]);
          const visitantesLocal = normalizarArrayResponse(portariaResponse, ["visitantes", "dados"]);
          const logs = normalizarArrayResponse(logsResponse, ["logs", "data"]);
          
          // Filter alerts
          const alertas = visitantesLocal.filter((visitante) => isAlertaPermanencia(visitante));
          setVisitantesEmAlerta(alertas);
          setMostrarBanner(alertas.length > 0);
          
          // Process motivos
          setMotivosHoje(agruparMotivosHoje(requisicoes));
          setMotivosSemana(agruparMotivosSemana(requisicoes));
          setMotivosMes(agruparMotivosMes(requisicoes));
          setPicoSetores(agruparPicoPorSetor(requisicoes));
          setEntradasHoje(entradasPorHoraHoje(logs));
          setEntradasSemana(entradasPorSemana(logs));
          setEntradasMes(entradasPorMes(logs));
          setStatsDashboard(calcularStatsDashboard(requisicoes, logs, visitantesLocal));
          
          // Process status
          setStatusHoje(processarStatusHoje(requisicoes, visitantesLocal, logs));
          setStatusSemana(processarStatusSemana(requisicoes, visitantesLocal, logs));
          setStatusMes(processarStatusPeriodo(requisicoes, visitantesLocal, "mes", logs));
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        setVisitantesEmAlerta([]);
        setMostrarBanner(false);
        setMotivosHoje([]);
        setMotivosSemana([]);
        setMotivosMes([]);
        setPicoSetores([]);
        setStatusHoje([]);
        setStatusSemana([]);
        setStatusMes([]);
        setEntradasHoje([]);
        setEntradasSemana([]);
        setEntradasMes([]);
        setStatsDashboard(STATS_VAZIAS);
      } finally {
        setIsDataLoading(false);
      }
    }

    carregarDados();
  }, []);

  const mostrarAlertaBanner = useMemo(
    () => mostrarBanner && visitantesEmAlerta.length > 0,
    [mostrarBanner, visitantesEmAlerta.length]
  );

  const stats = statsDashboard;

  const saidasPct =
    stats.visitantes.value > 0
      ? Math.round((stats.saidas.value / stats.visitantes.value) * 100)
      : 0;

  const ativosDelta =
    stats.entradas.value > 0
      ? Math.round((stats.ativos.value / stats.entradas.value) * 100)
      : 0;

  if (isDataLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="animate-pulse text-sm font-medium text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

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
        
        {mostrarAlertaBanner ? (
          <AlertaBanner alertas={visitantesEmAlerta} onDismiss={() => setMostrarBanner(false)} />
        ) : null}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            compact
            featured
            label="Visitantes Hoje"
            value={stats.visitantes.value}
            valueClassName="text-primary"
            icon={<Users size={16} className="text-primary" strokeWidth={1.75} />}
            delta={stats.visitantes.delta}
            deltaDir={stats.visitantes.deltaDir}
            sub="Comparativo com ontem"
            insight={`+${stats.entradas.ultimas2h} acessos nas ultimas 2h`}
            accentVar="var(--primary)"
          />
          <StatCard
            compact
            label="Entradas"
            value={stats.entradas.value}
            valueClassName="text-secondary"
            icon={<ArrowRightLeft size={16} className="text-secondary" strokeWidth={1.75} />}
            delta={stats.entradas.pct}
            deltaDir="up"
            sub="Registros validados"
            insight="100% confirmadas"
            accentVar="var(--secondary)"
          />
          <StatCard
            compact
            label="Saidas"
            value={stats.saidas.value}
            valueClassName="text-red-600"
            icon={<LogOut size={16} className="text-red-600" strokeWidth={1.75} />}
            delta={saidasPct}
            deltaDir="up"
            sub="Check-outs concluidos"
            insight={`${stats.saidas.aindaDentro} ainda dentro`}
            accentVar="#dc2626"
          />
          <StatCard
            compact
            label="Ativos Agora"
            value={stats.ativos.value}
            valueClassName="text-blue-900"
            icon={<Clock3 size={16} className="text-blue-900" strokeWidth={1.75} />}
            delta={ativosDelta}
            deltaDir={stats.ativos.alertas > 0 ? "down" : "up"}
            sub="Permanencia ativa"
            insight={`${stats.ativos.alertas} alerta(s)`}
            accentVar="#1e3a8a"
          />
        </section>

        

        <EntradasChart mobileLayout data={entradasHoje} weekData={entradasSemana} monthData={entradasMes} />
        <PicoMovimentoChart mobileLayout data={picoSetores} />
        <TiposVisitanteChart
          mobileLayout
          data={motivosHoje}
          weekData={motivosSemana}
          monthData={motivosMes}
        />
        <StatusVisitantesChart mobileLayout="list" data={statusHoje} weekData={statusSemana} monthData={statusMes} />

      </div>

      <div className="hidden lg:flex lg:flex-col lg:gap-6">
        <Topbar
          title="Dashboard Geral"
          subtitle="Monitoramento operacional com foco em fluxo, permanencia e alertas em tempo real."
        />

        {mostrarAlertaBanner ? (
          <AlertaBanner alertas={visitantesEmAlerta} onDismiss={() => setMostrarBanner(false)} />
        ) : null}

        <section className="grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <StatCard
              featured
              label="Visitantes Hoje"
              value={stats.visitantes.value}
              valueClassName="text-primary"
              icon={<Users size={18} className="text-primary" strokeWidth={1.75} />}
              delta={stats.visitantes.delta}
              deltaDir={stats.visitantes.deltaDir}
              sub="Comparativo com o mesmo horario de ontem"
              insight={`+${stats.entradas.ultimas2h} acessos nas ultimas 2h`}
              accentVar="var(--primary)"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3 xl:col-span-7">
            <StatCard
              label="Entradas"
              value={stats.entradas.value}
              valueClassName="text-secondary"
              icon={<ArrowRightLeft size={17} className="text-secondary" strokeWidth={1.75} />}
              delta={stats.entradas.pct}
              deltaDir="up"
              sub="Registros confirmados hoje"
              insight="100% das entradas validadas"
              accentVar="var(--secondary)"
            />
            <StatCard
              label="Saidas"
              value={stats.saidas.value}
              valueClassName="text-red-600"
              icon={<LogOut size={17} className="text-red-600" strokeWidth={1.75} />}
              delta={saidasPct}
              deltaDir="up"
              sub="Check-outs concluidos"
              insight={`${stats.saidas.aindaDentro} pessoas ainda dentro`}
              accentVar="#dc2626"
            />
            <StatCard
              label="Ativos Agora"
              value={stats.ativos.value}
              valueClassName="text-blue-900"
              icon={<Clock3 size={17} className="text-blue-900" strokeWidth={1.75} />}
              delta={ativosDelta}
              deltaDir={stats.ativos.alertas > 0 ? "down" : "up"}
              sub="Pessoas em permanencia ativa"
              insight={`${stats.ativos.alertas} alerta(s) exigem revisao`}
              accentVar="#1e3a8a"
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)]">
          <EntradasChart data={entradasHoje} weekData={entradasSemana} monthData={entradasMes} />
          <PicoMovimentoChart data={picoSetores} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <TiposVisitanteChart
            data={motivosHoje}
            weekData={motivosSemana}
            monthData={motivosMes}
          />
          <div className="space-y-6">
            <StatusVisitantesChart data={statusHoje} weekData={statusSemana} monthData={statusMes} />
          </div>
        </section>
      </div>
    </div>
  );
}
