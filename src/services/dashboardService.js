import { getActiveLanguage } from "@/lib/i18n-core";
import { api } from "./api";

/**
 * Serviço centralizado para gerenciar dados do dashboard
 * Consolida lógica de transformação e normalização de dados do back-end
 */

const HORAS_DIA = Array.from({ length: 24 }, (_, index) => index);
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const LIMITE_ALERTA_HORAS = 8;
const formatarDiaMes = (data) =>
  new Intl.DateTimeFormat(getActiveLanguage(), {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(data);

/**
 * Normaliza array response do back-end
 */
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

/**
 * Parse data com suporte a múltiplos formatos
 */
function parseData(valor) {
  if (!valor) return null;
  let dateStr = String(valor);
  if (dateStr.includes(" ") && !dateStr.includes("T")) {
    dateStr = dateStr.replace(" ", "T");
  }
  const data = new Date(dateStr);
  return Number.isNaN(data.getTime()) ? null : data;
}

/**
 * Parse data de requisição com fallback para múltiplos campos
 */
function parseDataRequisicao(item) {
  const campos = [
    "dataDaRequisicao",
    "solicitacao",
    "dataDeEntrada",
    "entrada",
    "createdAt",
    "created_at",
    "dataCriacao",
  ];

  for (const campo of campos) {
    const data = parseData(item?.[campo]);
    if (data) return data;
  }
  return null;
}

/**
 * Parse data de entrada do visitante
 */
function getEntradaVisitante(item) {
  return parseData(
    item?.dataEntrada ||
      item?.entrada ||
      item?.dataDeEntrada ||
      item?.horario_entrada
  );
}

/**
 * Parse data de saída do visitante
 */
function getSaidaVisitante(item) {
  return parseData(
    item?.dataSaida || item?.saida || item?.dataDeSaida
  );
}

/**
 * Verifica se visitante está dentro
 */
function isDentro(item) {
  const status = String(item?.status || "").toLowerCase();
  return (
    status === "dentro" ||
    status === "ativo" ||
    (!!getEntradaVisitante(item) && !getSaidaVisitante(item))
  );
}

/**
 * Verifica se há alerta de permanência
 */
function isAlertaPermanencia(item, agora = new Date()) {
  if (!isDentro(item)) return false;
  const entrada = getEntradaVisitante(item);
  if (!entrada) return false;
  const horas = (agora - entrada) / (1000 * 60 * 60);
  return horas >= LIMITE_ALERTA_HORAS;
}

/**
 * Calcula diferença em dias
 */
function diferencaEmDias(dataReferencia, dataComparada) {
  const inicio1 = new Date(
    dataReferencia.getFullYear(),
    dataReferencia.getMonth(),
    dataReferencia.getDate()
  );
  const inicio2 = new Date(
    dataComparada.getFullYear(),
    dataComparada.getMonth(),
    dataComparada.getDate()
  );
  return Math.round((inicio1 - inicio2) / (1000 * 60 * 60 * 24));
}

/**
 * Verifica se data está no período
 */
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
    return (
      data.getMonth() === referencia.getMonth() &&
      data.getFullYear() === referencia.getFullYear()
    );
  }

  return false;
}

/**
 * Conta únicos por chave
 */
function contarUnicos(items, getKey) {
  return new Set(items.map(getKey).filter(Boolean)).size;
}

/**
 * Calcula variação percentual
 */
function calcularVariacao(atual, anterior) {
  if (anterior === 0) return atual > 0 ? 100 : 0;
  return Math.round(((atual - anterior) / anterior) * 100);
}

/**
 * Get identidade do visitante
 */
function getIdentidadeVisitante(item, fallbackPrefix = "item") {
  return String(
    item?.idUsuario ||
      item?.usuario?.id ||
      item?.id ||
      item?.cpf ||
      `${fallbackPrefix}-${Math.random()}`
  );
}

/**
 * Gera dados de entradas por hora
 */
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

/**
 * Gera dados de entradas por semana
 */
function entradasPorSemana(visitantesLocal) {
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

  visitantesLocal.forEach((visitante) => {
    const entrada = getEntradaVisitante(visitante);
    if (!estaNoPeriodo(entrada, "semana", referencia)) return;

    const item = dias.find((dia) => diferencaEmDias(dia.data, entrada) === 0);
    if (item) item.value += 1;
  });

  return dias.map(({ hora, diaSemana, value }) => ({ hora, diaSemana, value }));
}

/**
 * Gera dados de entradas por mês
 */
function entradasPorMes(visitantesLocal) {
  const referencia = new Date();
  const diasNoMes = new Date(
    referencia.getFullYear(),
    referencia.getMonth() + 1,
    0
  ).getDate();
  const dias = Array.from({ length: diasNoMes }, (_, index) => {
    const data = new Date(
      referencia.getFullYear(),
      referencia.getMonth(),
      index + 1
    );
    return {
      data,
      hora: formatarDiaMes(data),
      value: 0,
    };
  });

  visitantesLocal.forEach((visitante) => {
    const entrada = getEntradaVisitante(visitante);
    if (!estaNoPeriodo(entrada, "mes", referencia)) return;

    const item = dias[entrada.getDate() - 1];
    if (item) item.value += 1;
  });

  return dias.map(({ hora, value }) => ({ hora, value }));
}

/**
 * Calcula stats do dashboard
 */
function calcularStatsDashboard(requisicoes, logs, visitantesLocal) {
  const hoje = new Date();
  const entradasHoje = logs.filter((item) =>
    estaNoPeriodo(getEntradaVisitante(item), "hoje", hoje)
  );
  const entradasOntem = logs.filter(
    (item) => diferencaEmDias(hoje, getEntradaVisitante(item)) === 1
  );
  const saidasHoje = logs.filter((item) =>
    estaNoPeriodo(getSaidaVisitante(item), "hoje", hoje)
  );
  const visitantesHojeReq = requisicoes.filter((item) =>
    estaNoPeriodo(parseDataRequisicao(item), "hoje", hoje)
  );
  const visitantesOntemReq = requisicoes.filter(
    (item) => diferencaEmDias(hoje, parseDataRequisicao(item)) === 1
  );
  const ativosAgora = visitantesLocal.filter(isDentro);
  const alertas = ativosAgora.filter((item) =>
    isAlertaPermanencia(item, hoje)
  ).length;
  const duasHorasAtras = new Date(hoje.getTime() - 2 * 60 * 60 * 1000);
  const ultimas2h = entradasHoje.filter((item) => {
    const entrada = getEntradaVisitante(item);
    return entrada && entrada >= duasHorasAtras;
  }).length;

  const visitantesHoje = Math.max(
    contarUnicos(visitantesHojeReq, (item) =>
      getIdentidadeVisitante(item, "req")
    ),
    contarUnicos(entradasHoje, (item) =>
      getIdentidadeVisitante(item, "entrada")
    )
  );
  const visitantesOntem = Math.max(
    contarUnicos(visitantesOntemReq, (item) =>
      getIdentidadeVisitante(item, "req-ontem")
    ),
    contarUnicos(entradasOntem, (item) =>
      getIdentidadeVisitante(item, "entrada-ontem")
    )
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

/**
 * Serviço principal do dashboard
 */
export const dashboardService = {
  /**
   * Carrega todos os dados necessários para o dashboard
   */
  async carregarDados() {
    try {
      const [requisicoesResponse, portariaResponse, logsResponse] =
        await Promise.all([
          api.get("/requisicao-visitante"),
          api.get("/portaria/vlocal"),
          api.get("/logs"),
        ]);

      const requisicoes = normalizarArrayResponse(requisicoesResponse, [
        "requisicoes",
      ]);
      const visitantesLocal = normalizarArrayResponse(portariaResponse, [
        "visitantes",
      ]);
      const logs = normalizarArrayResponse(logsResponse, ["logs"]);

      // Calcula stats
      const stats = calcularStatsDashboard(requisicoes, logs, visitantesLocal);

      // Calcula alertas
      const alertas = visitantesLocal.filter((v) => isAlertaPermanencia(v));

      // Gera dados de entradas
      const entradasHoje = entradasPorHoraHoje(logs);
      const entradasSemana = entradasPorSemana(logs);
      const entradasMes = entradasPorMes(logs);

      return {
        sucesso: true,
        stats,
        alertas,
        entradasHoje,
        entradasSemana,
        entradasMes,
        requisicoes,
        visitantesLocal,
        logs,
      };
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      return {
        sucesso: false,
        erro: error.message,
      };
    }
  },

  /**
   * Helpers exportados para uso em componentes
   */
  helpers: {
    isDentro,
    isAlertaPermanencia,
    getEntradaVisitante,
    getSaidaVisitante,
    estaNoPeriodo,
    parseDataRequisicao,
  },
};
