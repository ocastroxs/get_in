"use client";

import { getActiveLanguage } from "@/lib/i18n-core";
import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import EntradasChart from "@/components/EntradasChart";
import PicoMovimentoChart from "@/components/PicoMovimentoChart";
import TiposVisitanteChart from "@/components/TiposVisitantesChart";
import StatusVisitantesChart from "@/components/StatusVisitantesChart";
import { api } from "@/services/api";
import { ArrowRightLeft, Clock3, LogOut, Users } from "lucide-react";

const CORES_GRAFICO = ["#0f3a7d", "#34a853", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const LIMITE_ALERTA_HORAS = 8;

const STATS_VAZIAS = {
  visitantes: { value: 0 },
  entradas: { value: 0 },
  saidas: { value: 0, aindaDentro: 0 },
  ativos: { value: 0, expirados: 0 },
};

function formatarDataEntrada(data) {
  return new Intl.DateTimeFormat(getActiveLanguage(), {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
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

function isDentro(item) {
  const status = String(item?.status || "").toLowerCase();
  return status === "dentro" || status === "ativo" || (!!getEntradaVisitante(item) && !getSaidaVisitante(item));
}

function isPermanenciaExpirada(item, agora = new Date()) {
  if (!isDentro(item)) return false;

  const entrada = getEntradaVisitante(item);
  if (!entrada) return false;

  const horas = (agora - entrada) / (1000 * 60 * 60);
  return horas >= LIMITE_ALERTA_HORAS;
}

function agruparMotivosGeral(requisicoes) {
  const mapa = new Map();

  requisicoes.forEach((req) => {
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

function entradasGerais(logs) {
  const mapa = new Map();

  logs.forEach((log) => {
    const data = getEntradaVisitante(log);
    if (!data) return;

    const chave = formatarDataEntrada(data);
    const atual = mapa.get(chave) || { data, hora: chave, value: 0 };
    atual.value += 1;
    mapa.set(chave, atual);
  });

  return [...mapa.values()]
    .sort((a, b) => a.data - b.data)
    .map(({ hora, value }) => ({
      hora,
      value,
    }));
}

function processarStatusGeral(requisicoes, visitantesLocal = [], logs = []) {
  const counts = {
    dentro: visitantesLocal.filter(isDentro).length,
    pendente: 0,
    finalizado: logs.filter((log) => getSaidaVisitante(log)).length,
  };

  requisicoes.forEach((req) => {
    const status = String(req.status || "").toLowerCase();
    if (status === "pendente") counts.pendente += 1;
  });

  return [
    { name: "Dentro da fabrica", value: counts.dentro, color: "var(--chart-2)" },
    { name: "Aguard. aprovacao", value: counts.pendente, color: "var(--chart-3)" },
    { name: "Saida registrada", value: counts.finalizado, color: "rgba(15, 58, 125, 0.18)" },
  ];
}

function calcularStatsDashboard(requisicoes, logs, visitantesLocal) {
  const entradas = logs.filter((item) => getEntradaVisitante(item));
  const saidas = logs.filter((item) => getSaidaVisitante(item));
  const ativosAgora = visitantesLocal.filter(isDentro);
  const expirados = ativosAgora.filter((item) => isPermanenciaExpirada(item)).length;

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
      expirados,
    },
  };
}

export default function DashboardPage() {
  const [motivosGeral, setMotivosGeral] = useState([]);
  const [picoSetores, setPicoSetores] = useState([]);
  const [statusGeral, setStatusGeral] = useState([]);
  const [entradasGeral, setEntradasGeral] = useState([]);
  const [statsDashboard, setStatsDashboard] = useState(STATS_VAZIAS);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
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

          setMotivosGeral(agruparMotivosGeral(requisicoes));
          setPicoSetores(agruparPicoPorSetor(requisicoes));
          setEntradasGeral(entradasGerais(logs));
          setStatusGeral(processarStatusGeral(requisicoes, visitantesLocal, logs));
          setStatsDashboard(calcularStatsDashboard(requisicoes, logs, visitantesLocal));
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        setMotivosGeral([]);
        setPicoSetores([]);
        setStatusGeral([]);
        setEntradasGeral([]);
        setStatsDashboard(STATS_VAZIAS);
      } finally {
        setIsDataLoading(false);
      }
    }

    carregarDados();
  }, []);

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
            sub="Visitantes unicos nas requisicoes"
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
            insight="Historico acumulado"
            accentVar="var(--secondary)"
          />
          <StatCard
            compact
            label="Saidas"
            value={stats.saidas.value}
            valueClassName="text-red-600"
            icon={<LogOut size={16} className="text-red-600" strokeWidth={1.75} />}
            sub="Saidas registradas"
            insight={`${stats.saidas.aindaDentro} ainda dentro`}
            accentVar="#dc2626"
          />
          <StatCard
            compact
            label="Ativos Agora"
            value={stats.ativos.value}
            valueClassName="text-blue-900"
            icon={<Clock3 size={16} className="text-blue-900" strokeWidth={1.75} />}
            sub="Permanencia ativa"
            insight={`${stats.ativos.expirados} expirado(s)`}
            accentVar="#1e3a8a"
          />
        </section>

        <EntradasChart
          mobileLayout
          title="Entradas Acumuladas"
          subtitle="Fluxo geral agrupado por data"
          data={entradasGeral}
          showPeriodToggle={false}
          emptyMessage="Nenhuma entrada registrada no historico."
        />
        <PicoMovimentoChart mobileLayout data={picoSetores} />
        <TiposVisitanteChart
          mobileLayout
          title="Motivos"
          subtitle="Distribuicao geral das requisicoes"
          data={motivosGeral}
          showPeriodToggle={false}
          emptyMessage="Nenhum motivo registrado no historico."
        />
        <StatusVisitantesChart
          mobileLayout="list"
          data={statusGeral}
          showPeriodToggle={false}
          subtitle="Visao geral de permanencia, pendencias e saidas."
        />
      </div>

      <div className="hidden lg:flex lg:flex-col lg:gap-6">
        <Topbar
          title="Dashboard Geral"
          subtitle="Monitoramento acumulado de visitantes cadastrados, movimentacoes e saidas."
        />

        <section className="grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <StatCard
              featured
              label="Visitantes Cadastrados"
              value={stats.visitantes.value}
              valueClassName="text-primary"
              icon={<Users size={18} className="text-primary" strokeWidth={1.75} />}
              sub="Visitantes unicos nas requisicoes"
              insight={`${stats.ativos.value} pessoa(s) em permanencia ativa`}
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
              insight="Historico completo carregado"
              accentVar="var(--secondary)"
            />
            <StatCard
              label="Saidas"
              value={stats.saidas.value}
              valueClassName="text-red-600"
              icon={<LogOut size={17} className="text-red-600" strokeWidth={1.75} />}
              sub="Saidas registradas"
              insight={`${saidasPct}% das entradas com saida registrada`}
              accentVar="#dc2626"
            />
            <StatCard
              label="Ativos Agora"
              value={stats.ativos.value}
              valueClassName="text-blue-900"
              icon={<Clock3 size={17} className="text-blue-900" strokeWidth={1.75} />}
              sub="Pessoas em permanencia ativa"
              insight={`${stats.ativos.expirados} expirado(s)`}
              accentVar="#1e3a8a"
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)]">
          <EntradasChart
            title="Entradas Acumuladas"
            subtitle="Fluxo geral agrupado por data"
            data={entradasGeral}
            showPeriodToggle={false}
            emptyMessage="Nenhuma entrada registrada no historico."
          />
          <PicoMovimentoChart data={picoSetores} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <TiposVisitanteChart
            title="Motivos"
            subtitle="Distribuicao geral das requisicoes"
            data={motivosGeral}
            showPeriodToggle={false}
            emptyMessage="Nenhum motivo registrado no historico."
          />
          <div className="space-y-6">
            <StatusVisitantesChart
              data={statusGeral}
              showPeriodToggle={false}
              subtitle="Visao geral de permanencia, pendencias e saidas."
            />
          </div>
        </section>
      </div>
    </div>
  );
}
