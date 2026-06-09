"use client";

import { getActiveLanguage } from "@/lib/i18n-core";
import { useState } from "react";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import EntradasChart from "@/components/EntradasChart";
import PicoMovimentoChart from "@/components/PicoMovimentoChart";
import TiposVisitanteChart from "@/components/TiposVisitantesChart";
import StatusVisitantesChart from "@/components/StatusVisitantesChart";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { api } from "@/services/api";
import { ArrowRightLeft, Clock3, LogOut, Users } from "lucide-react";

const CORES_GRAFICO = ["#0f3a7d", "#34a853", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const HORAS_DIA = Array.from({ length: 24 }, (_, index) => index);
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const LIMITE_ALERTA_HORAS = 8;
const PRAZO_REQUISICAO_HORAS = 24;

const STATS_VAZIAS = {
  visitantes: { value: 0 },
  entradas: { value: 0 },
  saidas: { value: 0, aindaDentro: 0 },
  ativos: { value: 0, alertas: 0 },
};

function formatarDiaMes(data) {
  return new Intl.DateTimeFormat(getActiveLanguage(), {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(data);
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

function normalizarTexto(valor) {
  if (!valor || typeof valor !== "string") return null;
  const texto = valor.trim();
  return texto || null;
}

function obterMotivo(req) {
  return normalizarTexto(req?.motivo);
}

function obterSetor(req) {
  const setorRelacionado = req?.setores || req?.setorRelacionado || req?.departamentoRelacionado;
  const nomeRelacionado = normalizarTexto(setorRelacionado?.nome || setorRelacionado?.name || setorRelacionado?.descricao);
  if (nomeRelacionado) return nomeRelacionado;

  const setorDireto = normalizarTexto(req?.setor || req?.nomeSetor || req?.departamento || req?.nomeDepartamento);
  if (setorDireto) return setorDireto;

  if (req?.idSetor) return `Setor ${req.idSetor}`;
  if (req?.idDepartamento) return `Setor ${req.idDepartamento}`;

  return null;
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

function getIdentidadeVisitante(item, fallbackPrefix = "item", index = 0) {
  const usuario = item?.usuario || {};
  const identidade =
    item?.idUsuario ||
    usuario?.id ||
    item?.usuario_id ||
    item?.cpf ||
    usuario?.cpf ||
    item?.email ||
    usuario?.email ||
    item?.id;

  return String(identidade || `${fallbackPrefix}-${index}`);
}

function contarUnicos(items, getKey) {
  return new Set(items.map((item, index) => getKey(item, index)).filter(Boolean)).size;
}

function getEntradaVisitante(item) {
  return parseDataCampos(item, ["dataEntrada", "entrada", "dataDeEntrada", "horario_entrada"]);
}

function getSaidaVisitante(item) {
  return parseDataCampos(item, ["dataSaida", "saida", "dataDeSaida"]);
}

function getDataRequisicao(item) {
  return parseDataCampos(item, [
    "dataDaRequisicao",
    "solicitacao",
    "dataDeEntrada",
    "entrada",
    "createdAt",
    "created_at",
    "dataCriacao",
    "createdAtRequisicao",
  ]);
}

function inicioDoDia(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

function diferencaEmDias(dataReferencia, dataComparada) {
  if (!dataReferencia || !dataComparada) return Number.POSITIVE_INFINITY;

  return Math.round((inicioDoDia(dataReferencia) - inicioDoDia(dataComparada)) / (1000 * 60 * 60 * 24));
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
    const diferenca = diferencaEmDias(referencia, data);
    return diferenca >= 0 && diferenca <= 29;
  }

  return false;
}

function normalizarStatusRequisicao(status) {
  return String(status || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isStatusRecusado(status) {
  return ["recusado", "recusada", "rejeitado", "rejeitada", "negado", "negada"].includes(
    normalizarStatusRequisicao(status)
  );
}

function isRequisicaoExpirada(requisicao, agora = new Date()) {
  const status = normalizarStatusRequisicao(requisicao?.status || "pendente");
  if (status === "expirado" || status === "expirada") return true;
  if (status !== "pendente") return false;

  const dataRequisicao = getDataRequisicao(requisicao);
  if (!dataRequisicao) return false;

  const horas = (agora - dataRequisicao) / (1000 * 60 * 60);
  return horas >= PRAZO_REQUISICAO_HORAS;
}

function isDentro(item) {
  const status = String(item?.status || "").toLowerCase();
  return status === "dentro" || status === "ativo" || (!!getEntradaVisitante(item) && !getSaidaVisitante(item));
}

function isAlertaPermanencia(item, agora = new Date()) {
  if (!isDentro(item)) return false;

  const entrada = getEntradaVisitante(item);
  if (!entrada) return false;

  const horas = (agora - entrada) / (1000 * 60 * 60);
  return horas >= LIMITE_ALERTA_HORAS;
}

function agruparMotivosPeriodo(requisicoes, periodo) {
  const mapa = new Map();
  const referencia = new Date();

  requisicoes.forEach((req) => {
    if (!estaNoPeriodo(getDataRequisicao(req), periodo, referencia)) return;

    const motivo = obterMotivo(req);
    if (!motivo) return;

    const chave = motivo.toLowerCase();
    const atual = mapa.get(chave) || { motivo, count: 0 };
    atual.count += 1;
    mapa.set(chave, atual);
  });

  return [...mapa.values()]
    .map((item, index) => ({
      name: item.motivo,
      value: item.count,
      color: CORES_GRAFICO[index % CORES_GRAFICO.length],
    }))
    .sort((a, b) => b.value - a.value);
}

function agruparPicoPorSetor(requisicoes) {
  const mapa = new Map();

  requisicoes.forEach((req) => {
    const setor = obterSetor(req);
    if (!setor) return;

    const chave = setor.toLowerCase();
    const atual = mapa.get(chave) || { setor, value: 0 };
    atual.value += 1;
    mapa.set(chave, atual);
  });

  return [...mapa.values()]
    .sort((a, b) => b.value - a.value)
    .map((item) => ({
      setor: item.setor,
      value: item.value,
    }));
}

function entradasPorHoraHoje(logs) {
  const mapa = new Map(HORAS_DIA.map((hora) => [`${String(hora).padStart(2, "0")}h`, 0]));
  const referencia = new Date();

  logs.forEach((log) => {
    const data = getEntradaVisitante(log);
    if (!estaNoPeriodo(data, "hoje", referencia)) return;

    const chave = `${String(data.getHours()).padStart(2, "0")}h`;
    mapa.set(chave, (mapa.get(chave) || 0) + 1);
  });

  return [...mapa.entries()].map(([hora, value]) => ({
    hora,
    value,
  }));
}

function entradasPorSemana(logs) {
  const referencia = new Date();
  const dias = Array.from({ length: 7 }, (_, index) => {
    const data = new Date(referencia);
    data.setDate(referencia.getDate() - (6 - index));

    return {
      data,
      hora: formatarDiaMes(data),
      diaSemana: DIAS_SEMANA[data.getDay()],
      value: 0,
    };
  });

  logs.forEach((log) => {
    const entrada = getEntradaVisitante(log);
    if (!estaNoPeriodo(entrada, "semana", referencia)) return;

    const item = dias.find((dia) => diferencaEmDias(dia.data, entrada) === 0);
    if (item) item.value += 1;
  });

  return dias.map(({ hora, diaSemana, value }) => ({
    hora,
    diaSemana,
    value,
  }));
}

function entradasPorMes(logs) {
  const referencia = new Date();
  const dias = Array.from({ length: 30 }, (_, index) => {
    const data = new Date(referencia);
    data.setDate(referencia.getDate() - (29 - index));

    return {
      data,
      hora: formatarDiaMes(data),
      value: 0,
    };
  });

  logs.forEach((log) => {
    const entrada = getEntradaVisitante(log);
    if (!estaNoPeriodo(entrada, "mes", referencia)) return;

    const item = dias[entrada.getDate() - 1];
    if (item) item.value += 1;
  });

  return dias.map(({ hora, value }) => ({
    hora,
    value,
  }));
}

function processarStatusPeriodo(requisicoes, logs = [], periodo) {
  const agora = new Date();
  const requisicoesNoPeriodo = requisicoes.filter((req) => estaNoPeriodo(getDataRequisicao(req), periodo, agora));

  const counts = {
    finalizado: logs.filter((log) => estaNoPeriodo(getSaidaVisitante(log), periodo, agora)).length,
    recusado: requisicoesNoPeriodo.filter((req) => isStatusRecusado(req?.status)).length,
    expirado: requisicoesNoPeriodo.filter((req) => isRequisicaoExpirada(req, agora)).length,
  };

  return [
    { name: "Finalizados", value: counts.finalizado, color: "var(--chart-2)" },
    { name: "Recusados", value: counts.recusado, color: "var(--destructive)" },
    { name: "Expirados", value: counts.expirado, color: "var(--muted-foreground)" },
  ];
}

function calcularStatsDashboard(requisicoes, logs, visitantesLocal) {
  const entradas = logs.filter((item) => getEntradaVisitante(item));
  const saidas = logs.filter((item) => getSaidaVisitante(item));
  const ativosAgora = visitantesLocal.filter(isDentro);
  const alertas = ativosAgora.filter((item) => isAlertaPermanencia(item)).length;

  return {
    visitantes: {
      value: contarUnicos(requisicoes, (item, index) => getIdentidadeVisitante(item, "req", index)),
    },
    entradas: {
      value: entradas.length,
    },
    saidas: {
      value: saidas.length,
      aindaDentro: ativosAgora.length,
    },
    ativos: {
      value: ativosAgora.length,
      alertas,
    },
  };
}

export default function DashboardPage() {
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

  async function carregarDados({ silent = false } = {}) {
    if (!silent) setIsDataLoading(true);

    try {
      const [requisicoesResponse, portariaResponse, logsResponse] = await Promise.all([
        api.get("/requisicao-visitante"),
        api.get("/portaria/vlocal"),
        api.get("/logs"),
      ]);

      if (requisicoesResponse.sucesso || portariaResponse.sucesso || logsResponse.sucesso) {
        const requisicoes = normalizarArrayResponse(requisicoesResponse, ["requisicoes", "dados"]);
        const visitantesLocal = normalizarArrayResponse(portariaResponse, ["visitantes", "dados"]);
        const logs = normalizarArrayResponse(logsResponse, ["logs", "data"]);

        setMotivosHoje(agruparMotivosPeriodo(requisicoes, "hoje"));
        setMotivosSemana(agruparMotivosPeriodo(requisicoes, "semana"));
        setMotivosMes(agruparMotivosPeriodo(requisicoes, "mes"));
        setPicoSetores(agruparPicoPorSetor(requisicoes));
        setEntradasHoje(entradasPorHoraHoje(logs));
        setEntradasSemana(entradasPorSemana(logs));
        setEntradasMes(entradasPorMes(logs));
        setStatusHoje(processarStatusPeriodo(requisicoes, logs, "hoje"));
        setStatusSemana(processarStatusPeriodo(requisicoes, logs, "semana"));
        setStatusMes(processarStatusPeriodo(requisicoes, logs, "mes"));
        setStatsDashboard(calcularStatsDashboard(requisicoes, logs, visitantesLocal));
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
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

  useAutoRefresh(carregarDados);

  const stats = statsDashboard;
  const saidasPct = stats.entradas.value > 0 ? Math.round((stats.saidas.value / stats.entradas.value) * 100) : 0;

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
        <Topbar
          title="Dashboard Geral"
          subtitle="Visao acumulada de visitantes, entradas e saidas."
        />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            compact
            featured
            label="Visitantes Cadastrados"
            value={stats.visitantes.value}
            valueClassName="text-primary"
            icon={<Users size={16} className="text-primary" strokeWidth={1.75} />}
            sub="Visitantes únicos nas requisições"
            insight={`${stats.ativos.value} ativo(s) agora`}
            accentVar="var(--primary)"
          />
          <StatCard
            compact
            label="Entradas"
            value={stats.entradas.value}
            valueClassName="text-secondary"
            icon={<ArrowRightLeft size={16} className="text-secondary" strokeWidth={1.75} />}
            sub="Registros validados"
            insight="Histórico acumulado"
            accentVar="var(--secondary)"
          />
          <StatCard
            compact
            label="Saídas"
            value={stats.saidas.value}
            valueClassName="text-red-600"
            icon={<LogOut size={16} className="text-red-600" strokeWidth={1.75} />}
            sub="Saídas registradas"
            insight={`${stats.saidas.aindaDentro} ainda dentro`}
            accentVar="#dc2626"
          />
          <StatCard
            compact
            label="Ativos Agora"
            value={stats.ativos.value}
            valueClassName="text-blue-900"
            icon={<Clock3 size={16} className="text-blue-900" strokeWidth={1.75} />}
            sub="Permanência ativa"
            insight={`${stats.ativos.alertas} alerta(s) de permanência`}
            accentVar="#1e3a8a"
          />
        </section>

        <EntradasChart
          mobileLayout
          title="Entradas"
          subtitle="Fluxo de visitantes por dia, semana ou mês."
          data={entradasHoje}
          weekData={entradasSemana}
          monthData={entradasMes}
        />
        <PicoMovimentoChart mobileLayout data={picoSetores} />
        <TiposVisitanteChart
          mobileLayout
          title="Motivos"
          data={motivosHoje}
          weekData={motivosSemana}
          monthData={motivosMes}
          emptyMessage="Nenhum motivo registrado no dia."
        />
        <StatusVisitantesChart
          mobileLayout="list"
          data={statusHoje}
          weekData={statusSemana}
          monthData={statusMes}
          subtitle="Finalizados, recusados e expirados por período."
        />
      </div>

      <div className="hidden lg:flex lg:flex-col lg:gap-6">
        <Topbar
          title="Dashboard Geral"
          subtitle="Monitoramento acumulado de visitantes cadastrados, movimentações e saídas."
        />

        <section className="grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <StatCard
              featured
              label="Visitantes Cadastrados"
              value={stats.visitantes.value}
              valueClassName="text-primary"
              icon={<Users size={18} className="text-primary" strokeWidth={1.75} />}
              sub="Visitantes únicos nas requisições"
              insight={`${stats.ativos.value} pessoa(s) em permanência ativa`}
              accentVar="var(--primary)"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3 xl:col-span-7">
            <StatCard
              label="Entradas"
              value={stats.entradas.value}
              valueClassName="text-secondary"
              icon={<ArrowRightLeft size={17} className="text-secondary" strokeWidth={1.75} />}
              sub="Registros de entrada acumulados"
              insight="Histórico completo carregado"
              accentVar="var(--secondary)"
            />
            <StatCard
              label="Saídas"
              value={stats.saidas.value}
              valueClassName="text-red-600"
              icon={<LogOut size={17} className="text-red-600" strokeWidth={1.75} />}
              sub="Saídas registradas"
              insight={`${saidasPct}% das entradas com saída registrada`}
              accentVar="#dc2626"
            />
            <StatCard
              label="Ativos Agora"
              value={stats.ativos.value}
              valueClassName="text-blue-900"
              icon={<Clock3 size={17} className="text-blue-900" strokeWidth={1.75} />}
              sub="Pessoas em permanência ativa"
              insight={`${stats.ativos.alertas} alerta(s) de permanência`}
              accentVar="#1e3a8a"
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)]">
          <EntradasChart
            title="Entradas"
            subtitle="Fluxo de visitantes por dia, semana ou mês."
            data={entradasHoje}
            weekData={entradasSemana}
            monthData={entradasMes}
          />
          <PicoMovimentoChart data={picoSetores} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <TiposVisitanteChart
            title="Motivos"
            data={motivosHoje}
            weekData={motivosSemana}
            monthData={motivosMes}
            emptyMessage="Nenhum motivo registrado no dia."
          />
          <div className="space-y-6">
            <StatusVisitantesChart
              data={statusHoje}
              weekData={statusSemana}
              monthData={statusMes}
              subtitle="Finalizados, recusados e expirados por período."
            />
          </div>
        </section>
      </div>
    </div>
  );
}
