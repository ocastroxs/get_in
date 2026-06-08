import {
  EMPTY_VALUE,
  formatCPF,
  formatPhone,
  formatPortariaDateTime,
  getDescricaoValue,
  getResponseArray,
  getVisitanteIdentity,
  getVisitanteTimestamp,
  isToday,
  normalizeRequisicaoStatus,
  normalizeText,
  onlyDigits,
  pickFirst,
  sanitizeObservacao,
  searchIncludes,
} from "@/lib/portaria-data";
import { normalizeMotivoVisita } from "@/lib/visitanteMotivos";

export { formatCPF, formatPhone, getResponseArray, isToday, onlyDigits };

export const SUPERVISOR_STATUS_LABEL = {
  todos: "Todos",
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado",
  expirado: "Expirado",
  misto: "Misto",
};

export const SUPERVISOR_STATUS_STYLE = {
  pendente: "bg-amber-100 text-amber-700",
  aprovado: "bg-green-100 text-green-700",
  recusado: "bg-red-100 text-red-600",
  expirado: "bg-slate-100 text-slate-700",
  misto: "bg-blue-100 text-blue-700",
};

export const SUPERVISOR_MODAL_STATUS_STYLE = {
  pendente: "border-amber-200 bg-amber-50 text-amber-700",
  aprovado: "border-green-200 bg-green-50 text-green-700",
  recusado: "border-red-200 bg-red-50 text-red-700",
  expirado: "border-slate-200 bg-slate-50 text-slate-700",
  misto: "border-blue-200 bg-blue-50 text-blue-700",
};

export const SUPERVISOR_STATUS_OPTIONS = ["todos", "pendente", "aprovado", "recusado", "expirado"];
export const SUPERVISOR_APROVACAO_STATUS_OPTIONS = [...SUPERVISOR_STATUS_OPTIONS, "misto"];

const NO_OBSERVACAO_PORTARIA = "Nenhuma observação registrada pela portaria.";

function getSupervisorDataSolicitacao(requisicao) {
  return pickFirst(requisicao?.dataDaRequisicao, requisicao?.dataRequisicao, requisicao?.createdAt, requisicao?.validade);
}

export function formatSupervisorDateTime(value, fallback = "-") {
  return formatPortariaDateTime(value, fallback);
}

export function getSupervisorSetorNome(requisicao) {
  const descricao = requisicao?.descricao || "";

  return (
    pickFirst(
      requisicao?.setor,
      requisicao?.setores?.nome,
      requisicao?.departamento?.nome,
      requisicao?.setorResponsavel,
      requisicao?.setor_responsavel,
      getDescricaoValue(descricao, "Setor"),
      getDescricaoValue(descricao, ["Setor responsavel", "Setor responsável"])
    ) || EMPTY_VALUE
  );
}

export function getSupervisorEmpresaNome(requisicao) {
  const usuario = requisicao?.usuario || {};
  const descricao = requisicao?.descricao || "";

  return (
    pickFirst(
      requisicao?.empresa,
      requisicao?.empresa_visitante,
      usuario?.empresa,
      usuario?.empresas?.nome,
      requisicao?.empresas?.nome,
      requisicao?.empresa_nome,
      getDescricaoValue(descricao, "Empresa")
    ) || EMPTY_VALUE
  );
}

export function getSupervisorExpirationDate(requisicao) {
  const validade = new Date(requisicao?.validade);

  if (!Number.isNaN(validade.getTime())) {
    return validade;
  }

  const dataDaRequisicao = new Date(getSupervisorDataSolicitacao(requisicao));

  if (Number.isNaN(dataDaRequisicao.getTime())) {
    return null;
  }

  return new Date(dataDaRequisicao.getTime() + 24 * 60 * 60 * 1000);
}

export function getSupervisorEffectiveStatus(requisicao) {
  const status = normalizeRequisicaoStatus(pickFirst(requisicao?.status, requisicao?.solicitacao));
  const expirationDate = getSupervisorExpirationDate(requisicao);

  if (status === "pendente" && expirationDate && expirationDate.getTime() <= Date.now()) {
    return "expirado";
  }

  return status || "pendente";
}

export function getSupervisorObservacaoPortaria(requisicao) {
  const observacao = sanitizeObservacao(requisicao?.observacoes, requisicao?.observacao, requisicao?.descricao);

  return observacao === "Nenhuma observação cadastrada." ? NO_OBSERVACAO_PORTARIA : observacao;
}

export function normalizeSupervisorRequisicao(requisicao) {
  const usuario = requisicao?.usuario || {};
  const descricao = requisicao?.descricao || "";
  const dataSolicitacao = getSupervisorDataSolicitacao(requisicao);
  const visitante = pickFirst(requisicao?.visitante, requisicao?.nome, usuario?.nome, getDescricaoValue(descricao, "Visitante"));
  const cpf = pickFirst(requisicao?.cpf, usuario?.cpf, getDescricaoValue(descricao, "CPF"));
  const telefone = pickFirst(
    requisicao?.telefone,
    requisicao?.celular,
    usuario?.celular,
    usuario?.telefone,
    getDescricaoValue(descricao, "Telefone")
  );
  const email = pickFirst(requisicao?.email, usuario?.email, getDescricaoValue(descricao, ["Email", "E-mail"]));
  const empresa = getSupervisorEmpresaNome(requisicao);
  const setorResponsavel = getSupervisorSetorNome(requisicao);
  const motivoVisita = normalizeMotivoVisita(pickFirst(requisicao?.motivo, getDescricaoValue(descricao, "Motivo"), "Outro"));
  const statusEfetivo = getSupervisorEffectiveStatus({ ...requisicao, dataDaRequisicao: dataSolicitacao });
  const id = pickFirst(requisicao?.id, requisicao?.idRequisicao);
  const idUsuario = pickFirst(requisicao?.idUsuario, usuario?.id);

  return {
    ...requisicao,
    id,
    idUsuario,
    usuario: {
      ...usuario,
      id: idUsuario || usuario?.id,
      nome: visitante || usuario?.nome || EMPTY_VALUE,
      cpf,
      email,
      telefone: telefone || usuario?.telefone,
      celular: pickFirst(usuario?.celular, telefone),
    },
    visitante: visitante || EMPTY_VALUE,
    cpf,
    empresa,
    setor: setorResponsavel,
    setorResponsavel,
    setoresSolicitados: requisicao?.setoresSolicitados,
    telefone,
    email,
    motivo: motivoVisita,
    motivoVisita,
    status: statusEfetivo,
    statusEfetivo,
    statusOriginal: requisicao?.status,
    dataEntrada: pickFirst(requisicao?.dataEntrada, requisicao?.entrada),
    dataSaida: pickFirst(requisicao?.dataSaida, requisicao?.saida),
    dataSolicitacao,
    dataDaRequisicao: dataSolicitacao,
    observacoesPortaria: getSupervisorObservacaoPortaria(requisicao),
  };
}

export function normalizeSupervisorSolicitacao(item, requisicao = {}) {
  const merged = normalizeSupervisorRequisicao({
    ...requisicao,
    ...item,
    usuario: item?.usuario || requisicao?.usuario,
    empresa: pickFirst(item?.empresa, requisicao?.empresa),
    motivo: pickFirst(item?.motivo, requisicao?.motivo, requisicao?.motivoVisita),
    descricao: pickFirst(item?.descricao, requisicao?.descricao),
    dataDaRequisicao: pickFirst(item?.dataDaRequisicao, item?.dataSolicitacao, requisicao?.dataDaRequisicao, requisicao?.dataSolicitacao),
  });

  return {
    ...item,
    id: pickFirst(item?.id, item?.idRequisicao),
    setor: merged.setorResponsavel,
    status: merged.statusEfetivo,
    statusEfetivo: merged.statusEfetivo,
    motivo: merged.motivoVisita,
    dataDaRequisicao: merged.dataDaRequisicao,
    dataSolicitacao: merged.dataSolicitacao,
  };
}

export function getSupervisorSolicitacoes(requisicao) {
  const itens =
    (Array.isArray(requisicao?.setoresSolicitados) && requisicao.setoresSolicitados.length > 0 && requisicao.setoresSolicitados) ||
    (Array.isArray(requisicao?.solicitacoes) && requisicao.solicitacoes.length > 0 && requisicao.solicitacoes) ||
    (Array.isArray(requisicao?.requisicoes) && requisicao.requisicoes.length > 0 && requisicao.requisicoes) ||
    (Array.isArray(requisicao?.itens) && requisicao.itens.length > 0 && requisicao.itens) ||
    [requisicao];

  return itens.filter(Boolean).map((item) => normalizeSupervisorSolicitacao(item, requisicao));
}

export function getSupervisorTimestamp(requisicao) {
  return getVisitanteTimestamp(requisicao);
}

export function sortSupervisorRequisicoesDesc(a, b) {
  const timestampDiff = getSupervisorTimestamp(b) - getSupervisorTimestamp(a);

  if (timestampDiff !== 0) {
    return timestampDiff;
  }

  return Number(b?.id || b?.idRequisicao || 0) - Number(a?.id || a?.idRequisicao || 0);
}

export function getSupervisorGroupKey(requisicao) {
  return [
    getVisitanteIdentity(requisicao, "supervisor"),
    normalizeText(requisicao?.empresa),
    normalizeText(requisicao?.motivoVisita || requisicao?.motivo),
    requisicao?.validade || "",
    requisicao?.descricao || "",
  ].join("|");
}

function pushUniqueSolicitacao(group, solicitacao) {
  const key = solicitacao.id ? `id:${solicitacao.id}` : `setor:${normalizeText(solicitacao.setor)}:${solicitacao.status}`;
  const exists = group.setoresSolicitados.some((item) => {
    const itemKey = item.id ? `id:${item.id}` : `setor:${normalizeText(item.setor)}:${item.status}`;
    return itemKey === key;
  });

  if (!exists) {
    group.setoresSolicitados.push(solicitacao);
    group.solicitacoes.push(solicitacao);
  }
}

export function groupSupervisorAprovacoes(requisicoes) {
  const groups = new Map();

  requisicoes.map(normalizeSupervisorRequisicao).forEach((requisicao) => {
    const key = getSupervisorGroupKey(requisicao);
    const solicitacao = normalizeSupervisorSolicitacao(requisicao, requisicao);
    const current = groups.get(key);

    if (!current) {
      groups.set(key, {
        ...requisicao,
        key,
        setoresSolicitados: [solicitacao],
        solicitacoes: [solicitacao],
      });
      return;
    }

    pushUniqueSolicitacao(current, solicitacao);

    if (getSupervisorTimestamp(requisicao) > getSupervisorTimestamp(current)) {
      current.dataDaRequisicao = requisicao.dataDaRequisicao;
      current.dataSolicitacao = requisicao.dataSolicitacao;
    }
  });

  return Array.from(groups.values())
    .map((group) => {
      const statuses = Array.from(new Set(group.setoresSolicitados.map((item) => item.status)));
      const hasPendencia = group.setoresSolicitados.some((item) => item.status === "pendente");
      const statusEfetivo = hasPendencia ? "pendente" : statuses.length === 1 ? statuses[0] : "misto";

      return {
        ...group,
        hasPendencia,
        status: statusEfetivo,
        statusEfetivo,
      };
    })
    .sort(sortSupervisorRequisicoesDesc);
}

export function groupSupervisorHistorico(requisicoes) {
  const groups = new Map();

  requisicoes.map(normalizeSupervisorRequisicao).forEach((requisicao) => {
    const key = `${getVisitanteIdentity(requisicao, "supervisor-historico")}|${requisicao.statusEfetivo}`;
    const setor = requisicao.setorResponsavel;
    const solicitacao = normalizeSupervisorSolicitacao(requisicao, requisicao);
    const current = groups.get(key);

    if (!current) {
      groups.set(key, {
        ...requisicao,
        key,
        status: requisicao.statusEfetivo,
        setores: setor && setor !== EMPTY_VALUE ? [setor] : [],
        setoresSolicitados: [solicitacao],
        solicitacoes: [solicitacao],
      });
      return;
    }

    if (setor && setor !== EMPTY_VALUE && !current.setores.includes(setor)) {
      current.setores.push(setor);
    }

    pushUniqueSolicitacao(current, solicitacao);

    if (getSupervisorTimestamp(requisicao) > getSupervisorTimestamp(current)) {
      current.empresa = requisicao.empresa || current.empresa;
      current.motivo = requisicao.motivo || current.motivo;
      current.motivoVisita = requisicao.motivoVisita || current.motivoVisita;
      current.dataDaRequisicao = requisicao.dataDaRequisicao;
      current.dataSolicitacao = requisicao.dataSolicitacao;
    }
  });

  return Array.from(groups.values()).sort(sortSupervisorRequisicoesDesc);
}

export function matchesSupervisorSearch(registro, busca) {
  const termoBuscaDigitos = onlyDigits(busca);
  const solicitacoes = getSupervisorSolicitacoes(registro);
  const setores = [
    registro?.setor,
    registro?.setorResponsavel,
    ...(Array.isArray(registro?.setores) ? registro.setores : []),
    ...solicitacoes.map((item) => item.setor),
  ].join(" ");
  const searchableValues = [
    registro?.visitante,
    registro?.usuario?.nome,
    registro?.empresa,
    registro?.motivo,
    registro?.motivoVisita,
    registro?.email,
    registro?.telefone,
    registro?.cpf,
    formatCPF(registro?.cpf),
    formatPhone(registro?.telefone),
    setores,
  ];

  return (
    !busca ||
    searchableValues.some((value) => searchIncludes(value, busca)) ||
    (termoBuscaDigitos !== "" &&
      (onlyDigits(registro?.cpf).includes(termoBuscaDigitos) || onlyDigits(registro?.telefone).includes(termoBuscaDigitos)))
  );
}

export function matchesSupervisorStatus(registro, filtroStatus) {
  if (!filtroStatus || filtroStatus === "todos") {
    return true;
  }

  if (filtroStatus === "misto") {
    return registro?.status === "misto" || registro?.statusEfetivo === "misto";
  }

  return (
    registro?.status === filtroStatus ||
    registro?.statusEfetivo === filtroStatus ||
    getSupervisorSolicitacoes(registro).some((item) => item.status === filtroStatus)
  );
}
