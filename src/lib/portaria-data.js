import { compareText, formatDateTime as formatLocalizedDateTime, getActiveLanguage } from "@/lib/i18n-core";
import { formatCPF, formatPhone, maskCPF, maskPhone, onlyDigits } from "@/lib/utils";
import { normalizeMotivoVisita } from "@/lib/visitanteMotivos";

export { formatCPF, formatPhone, maskCPF, maskPhone, onlyDigits };

export const EMPTY_VALUE = "—";

export const PORTARIA_STATUS_LABEL = {
  ativo: "Dentro",
  saida: "Saída",
  alerta: "Alerta",
  recusado: "Recusado",
  pendente: "Pendente",
};

export const PORTARIA_STATUS_STYLE = {
  ativo: "bg-green-100 text-green-700",
  saida: "bg-blue-100 text-blue-700",
  alerta: "bg-red-100 text-red-600",
  recusado: "bg-red-100 text-red-600",
  pendente: "bg-amber-100 text-amber-700",
};

export const PORTARIA_STATUS_DOT = {
  ativo: "bg-green-500",
  saida: "bg-blue-500",
  alerta: "bg-red-500",
  recusado: "bg-red-500",
  pendente: "bg-amber-500",
};

export const PORTARIA_STATUS_FILTERS = [
  { label: "Todos", value: "Todos" },
  { label: "Dentro", value: "ativo" },
  { label: "Saída", value: "saida" },
];

export const REQUISICAO_STATUS_LABEL = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado",
  expirado: "Expirado",
};

export const APROVACAO_STATUS_STYLE = {
  aprovado: "bg-green-100 text-green-700",
  recusado: "bg-red-100 text-red-700",
};

export const HISTORICO_STATUS_OPTIONS = ["Todos", "Finalizado", "Em andamento", "Expirado"];

export const HISTORICO_STATUS_FILTER_VALUE = {
  Finalizado: "finalizado",
  "Em andamento": "em_andamento",
  Expirado: "expirado",
};

export const HISTORICO_STATUS_LABEL = {
  finalizado: "Finalizado",
  em_andamento: "Em andamento",
  expirado: "Expirado",
};

export const HISTORICO_STATUS_STYLE = {
  finalizado: "bg-green-100 text-green-700",
  em_andamento: "bg-amber-100 text-amber-700",
  expirado: "bg-slate-100 text-slate-700",
};

const BACKEND_STATUS_TO_PORTARIA = {
  aprovado: "ativo",
  aprovada: "ativo",
  ativo: "ativo",
  dentro: "ativo",
  liberado: "ativo",
  pendente: "pendente",
  recusado: "recusado",
  recusada: "recusado",
  rejeitado: "recusado",
  rejeitada: "recusado",
  negado: "recusado",
  negada: "recusado",
  saida: "saida",
  saiu: "saida",
  finalizado: "saida",
  concluido: "saida",
  alerta: "alerta",
};

const OBSERVACAO_DESCRICAO_LABELS = [
  "Observacao da Portaria",
  "Observação da Portaria",
  "Observacao",
  "Observação",
  "Observacoes",
  "Observações",
  "ObservaÃ§Ã£o da Portaria",
  "ObservaÃ§Ã£o",
  "ObservaÃ§Ãµes",
];

export function pickFirst(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== "") || "";
}

export function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function getDescricaoValue(descricao, labels) {
  if (typeof descricao !== "string" || !descricao.trim()) {
    return "";
  }

  const normalizedLabels = new Set(
    (Array.isArray(labels) ? labels : [labels]).map(normalizeText).filter(Boolean)
  );

  return (
    descricao
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean)
      .reduce((found, part) => {
        if (found) return found;

        const separatorIndex = part.indexOf(":");
        if (separatorIndex < 0) return "";

        const label = part.slice(0, separatorIndex);
        const value = part.slice(separatorIndex + 1).trim();

        return normalizedLabels.has(normalizeText(label)) ? value : "";
      }, "") || ""
  );
}

export function splitSetores(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item && normalizeText(item) !== "nenhum");
}

export function getSetorResponsavelFromDescricao(descricao, fallback = "") {
  return pickFirst(
    getDescricaoValue(descricao, ["Setor responsavel", "Setor responsável"]),
    getDescricaoValue(descricao, ["Area responsavel", "Área responsável"]),
    getDescricaoValue(descricao, "Setor"),
    fallback
  );
}

export function getSetoresPermitidosFromDescricao(descricao, fallback = "") {
  const setoresPermitidos = splitSetores(getDescricaoValue(descricao, "Setores permitidos"));
  return setoresPermitidos.length > 0 ? setoresPermitidos : splitSetores(fallback);
}

export function getResponseArray(response, keys = []) {
  if (!response || typeof response !== "object" || !response.sucesso) {
    return [];
  }

  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.dados)) return response.dados;

  for (const key of keys) {
    if (Array.isArray(response.data?.[key])) return response.data[key];
    if (Array.isArray(response.dados?.[key])) return response.dados[key];
    if (Array.isArray(response[key])) return response[key];
  }

  return [];
}

export function formatPortariaDateTime(value, fallback = EMPTY_VALUE) {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value || fallback;
  }

  return formatLocalizedDateTime(date, {}, getActiveLanguage());
}

export function isToday(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function normalizePortariaStatus(value) {
  const normalized = normalizeText(value);

  if (normalized.includes("aguard")) {
    return "pendente";
  }

  return BACKEND_STATUS_TO_PORTARIA[normalized] || normalized || "pendente";
}

export function normalizeRequisicaoStatus(value) {
  const normalized = normalizeText(value);

  if (normalized.includes("aguard")) return "pendente";
  if (["aprovada", "aprovado"].includes(normalized)) return "aprovado";
  if (["recusada", "recusado", "rejeitado", "rejeitada", "negado", "negada"].includes(normalized)) {
    return "recusado";
  }
  if (["expirado", "expirada"].includes(normalized)) return "expirado";

  return normalized || "pendente";
}

export function normalizeHistoricoStatus(value, dataSaida, dataEntrada) {
  const normalized = normalizeText(value);

  if (["expirado", "expirada"].includes(normalized)) return "expirado";
  if (["pendente", "aguardando", "em andamento", "em_andamento"].includes(normalized)) return "em_andamento";

  if (
    [
      "aprovado",
      "aprovada",
      "recusado",
      "recusada",
      "rejeitado",
      "negado",
      "saida",
      "saiu",
      "dentro",
      "ativo",
      "liberado",
      "finalizado",
      "concluido",
    ].includes(normalized)
  ) {
    return "finalizado";
  }

  if (dataSaida || dataEntrada) return "finalizado";
  return "em_andamento";
}

export function hasObservacaoRelevante(value) {
  const normalized = normalizeText(value);
  return Boolean(normalized && !normalized.includes("nenhuma observacao") && normalized !== "nenhuma");
}

export function looksLikeDescricaoCompleta(value) {
  return /(^|\|)\s*(visitante|cpf|telefone|email|e-mail|empresa|tag rfid|setor|setores permitidos|observa[^:]*):/i.test(
    String(value || "")
  );
}

export function getObservacaoFromDescricao(descricao) {
  return pickFirst(...OBSERVACAO_DESCRICAO_LABELS.map((label) => getDescricaoValue(descricao, label)));
}

export function sanitizeObservacao(...values) {
  for (const value of values) {
    const observacaoExtraida = getObservacaoFromDescricao(value);

    if (hasObservacaoRelevante(observacaoExtraida)) {
      return observacaoExtraida;
    }
  }

  for (const value of values) {
    const observacao = String(value || "").trim();

    if (!looksLikeDescricaoCompleta(observacao) && hasObservacaoRelevante(observacao)) {
      return observacao;
    }
  }

  return "Nenhuma observação cadastrada.";
}

export function getObservacoes(registro, descricao = registro?.descricao || "") {
  return sanitizeObservacao(registro?.observacoes, registro?.observacao, descricao);
}

export function getEmpresaNome(registro) {
  return String(
    pickFirst(
      registro?.nome,
      registro?.empresa,
      registro?.empresa_visitante,
      registro?.usuario?.empresa,
      registro?.usuario?.empresas?.nome,
      registro?.empresas?.nome,
      registro?.empresa_nome,
      registro?.nomeFantasia,
      registro?.razaoSocial,
      registro?.razao_social
    )
  ).trim();
}

export function getEmpresaNomeFromRegistro(registro) {
  return String(
    pickFirst(
      registro?.empresa,
      registro?.empresa_visitante,
      registro?.usuario?.empresa,
      registro?.usuario?.empresas?.nome,
      registro?.empresas?.nome,
      registro?.empresa_nome,
      registro?.nomeFantasia,
      registro?.razaoSocial,
      registro?.razao_social
    )
  ).trim();
}

export function getSetorNome(registro) {
  const departamento = registro?.departamento || registro?.setores || {};

  if (typeof registro?.setores === "string") return registro.setores;
  if (typeof registro?.departamento === "string") return registro.departamento;

  return String(
    pickFirst(registro?.nome, registro?.setor, registro?.setores?.nome, departamento?.nome, registro?.departamento?.nome)
  ).trim();
}

export function buildSelectOptions(registros, getLabel) {
  const options = new Map();

  registros.forEach((registro) => {
    const label = getLabel(registro);

    if (label) {
      options.set(label.toLowerCase(), {
        id: pickFirst(registro?.id, registro?.idSetor, registro?.idDepartamento),
        value: label,
        label,
      });
    }
  });

  return Array.from(options.values()).sort((a, b) => compareText(a.label, b.label, getActiveLanguage()));
}

export function getSetorLabel(visitante) {
  return visitante?.setorResponsavel || visitante?.setor || EMPTY_VALUE;
}

export function getSetoresPermitidosLabel(visitante) {
  if (Array.isArray(visitante?.setoresPermitidos) && visitante.setoresPermitidos.length > 0) {
    return visitante.setoresPermitidos.join(", ");
  }

  if (Array.isArray(visitante?.setoresAcesso) && visitante.setoresAcesso.length > 0) {
    return visitante.setoresAcesso.join(", ");
  }

  if (typeof visitante?.setoresPermitidos === "string" && visitante.setoresPermitidos.trim()) {
    return visitante.setoresPermitidos;
  }

  return EMPTY_VALUE;
}

export function normalizePortariaVisitante(visitante) {
  const usuario = visitante?.usuario || {};
  const departamento = visitante?.departamento || visitante?.setores || {};
  const departamentoNome = typeof departamento === "string" ? departamento : departamento?.nome;
  const descricao = visitante?.descricao || "";
  const setorBackend = pickFirst(visitante?.setor, departamentoNome, getDescricaoValue(descricao, "Setor"));
  const setorResponsavel = getSetorResponsavelFromDescricao(descricao, setorBackend);
  const setoresPermitidos = getSetoresPermitidosFromDescricao(descricao, setorBackend);
  const dataEntradaLog = pickFirst(
    visitante?.dataEntrada,
    visitante?.entrada,
    visitante?.dataDeEntrada,
    visitante?.dataDaEntrada,
    visitante?.horario_entrada
  );
  const dataEntrada = pickFirst(dataEntradaLog, visitante?.dataDaRequisicao);
  const dataSaida = pickFirst(visitante?.dataSaida, visitante?.saida, visitante?.dataDeSaida, visitante?.dataDaSaida);
  const status = !visitante?.status && dataEntrada && !dataSaida ? "ativo" : normalizePortariaStatus(visitante?.status);
  const nome = pickFirst(visitante?.nome, visitante?.visitante, usuario?.nome, getDescricaoValue(descricao, "Visitante"));

  return {
    ...visitante,
    id: pickFirst(visitante?.id, visitante?.idUsuario, visitante?.idLog, visitante?.idRegistro, visitante?.idRequisicao),
    idUsuario: pickFirst(visitante?.idUsuario, usuario?.id, visitante?.id),
    visitante: nome,
    nome,
    cpf: pickFirst(visitante?.cpf, usuario?.cpf, getDescricaoValue(descricao, "CPF")),
    telefone: pickFirst(
      visitante?.telefone,
      visitante?.celular,
      visitante?.cel,
      usuario?.celular,
      usuario?.telefone,
      getDescricaoValue(descricao, "Telefone")
    ),
    email: pickFirst(visitante?.email, usuario?.email, getDescricaoValue(descricao, ["Email", "E-mail"])),
    empresa: pickFirst(visitante?.empresa, visitante?.empresa_visitante, usuario?.empresa, getDescricaoValue(descricao, "Empresa")),
    setor: setorResponsavel,
    setorResponsavel,
    setoresPermitidos,
    setoresAcesso: setoresPermitidos,
    dataEntrada,
    dataSaida,
    dataDaRequisicao: pickFirst(visitante?.dataDaRequisicao, visitante?.createdAt),
    status,
    statusOriginal: visitante?.status,
    podeCheckout: Boolean(visitante?.podeCheckout || (!dataSaida && status === "ativo")),
  };
}

export function getVisitanteIdentity(registro, fallbackPrefix = "registro", index = 0) {
  const usuario = registro?.usuario || {};
  const idUsuario = pickFirst(registro?.idUsuario, usuario?.id);
  const cpf = onlyDigits(pickFirst(registro?.cpf, usuario?.cpf));
  const email = String(pickFirst(registro?.email, usuario?.email)).trim().toLowerCase();
  const nome = String(pickFirst(registro?.nome, registro?.visitante, usuario?.nome)).trim().toLowerCase();
  const id = pickFirst(registro?.id, registro?.idVisitante, registro?.idRequisicao);

  if (idUsuario) return `usuario:${idUsuario}`;
  if (cpf) return `cpf:${cpf}`;
  if (email) return `email:${email}`;
  if (nome) return `nome:${nome}`;

  return `${fallbackPrefix}:${id || index}`;
}

export function getVisitanteTimestamp(registro) {
  const datas = [
    registro?.dataSaida,
    registro?.saida,
    registro?.dataEntrada,
    registro?.entrada,
    registro?.dataDaRequisicao,
    registro?.validade,
  ];

  for (const data of datas) {
    const timestamp = new Date(data).getTime();
    if (!Number.isNaN(timestamp)) return timestamp;
  }

  return Number(registro?.id || registro?.idRequisicao || 0);
}

export function dedupeVisitantesPorIdentidade(registros) {
  const porVisitante = new Map();

  registros.forEach((registro, index) => {
    const key = getVisitanteIdentity(registro, "visitante", index);
    const atual = porVisitante.get(key);

    if (!atual || getVisitanteTimestamp(registro) >= getVisitanteTimestamp(atual)) {
      porVisitante.set(key, registro);
    }
  });

  return Array.from(porVisitante.values());
}

export function normalizePendencia(registro) {
  const usuario = registro?.usuario || {};
  const descricao = registro?.descricao || "";
  const status = normalizeRequisicaoStatus(pickFirst(registro?.status, registro?.solicitacao));
  const dataDaRequisicao = pickFirst(registro?.dataDaRequisicao, registro?.dataRequisicao, registro?.createdAt);
  const setorBackend = pickFirst(getSetorNome(registro), getDescricaoValue(descricao, "Setor"));
  const setoresLista = getSetoresPermitidosFromDescricao(descricao, setorBackend);
  const setoresPermitidos = setoresLista.join(", ");
  const areaResponsavel = pickFirst(
    registro?.setorResponsavel,
    registro?.setor_responsavel,
    getSetorResponsavelFromDescricao(descricao, ""),
    registro?.areaResponsavel,
    registro?.area_responsavel,
    setorBackend
  );
  const visitante = pickFirst(registro?.visitante, registro?.nome, usuario?.nome, getDescricaoValue(descricao, "Visitante"));
  const cpf = pickFirst(registro?.cpf, usuario?.cpf, getDescricaoValue(descricao, "CPF"));
  const email = pickFirst(registro?.email, usuario?.email, getDescricaoValue(descricao, ["Email", "E-mail"]));
  const empresa = pickFirst(getEmpresaNomeFromRegistro(registro), getDescricaoValue(descricao, "Empresa"));
  const motivo = normalizeMotivoVisita(pickFirst(registro?.motivo, getDescricaoValue(descricao, "Motivo"), "Outro"));
  const key = getVisitanteIdentity({ ...registro, visitante, cpf, email }, "requisicao");

  return {
    ...registro,
    id: pickFirst(registro?.id, registro?.idRequisicao, key),
    key,
    idUsuario: pickFirst(registro?.idUsuario, usuario?.id),
    visitante: visitante || EMPTY_VALUE,
    nome: visitante || EMPTY_VALUE,
    cpf,
    email,
    empresa: empresa || EMPTY_VALUE,
    setor: setoresPermitidos || EMPTY_VALUE,
    setoresPermitidos: setoresLista,
    setoresLista,
    areaResponsavel: areaResponsavel || EMPTY_VALUE,
    setorResponsavel: areaResponsavel || EMPTY_VALUE,
    motivo,
    status,
    solicitacao: dataDaRequisicao ? formatPortariaDateTime(dataDaRequisicao, "-") : REQUISICAO_STATUS_LABEL[status] || status,
    dataDaRequisicao,
    telefone: pickFirst(registro?.telefone, registro?.celular, usuario?.celular, getDescricaoValue(descricao, "Telefone")),
    observacoes: getObservacoes(registro, descricao),
  };
}

export function mergeRequisicoesPorVisitante(atual, nova) {
  const setoresLista = Array.from(new Set([...(atual.setoresLista || []), ...(nova.setoresLista || [])]));
  const principal = getVisitanteTimestamp(nova) >= getVisitanteTimestamp(atual) ? nova : atual;

  return {
    ...principal,
    ids: Array.from(new Set([...(atual.ids || [atual.id]), ...(nova.ids || [nova.id])].filter(Boolean))),
    setoresLista,
    setoresPermitidos: setoresLista,
    setor: setoresLista.length > 0 ? setoresLista.join(", ") : pickFirst(principal.setor, atual.setor, nova.setor),
    motivo: pickFirst(principal.motivo, atual.motivo, nova.motivo),
    observacoes: pickFirst(principal.observacoes, atual.observacoes, nova.observacoes),
    observacao: pickFirst(principal.observacao, atual.observacao, nova.observacao),
  };
}

export function dedupeRequisicoesPorVisitante(registros) {
  const porVisitante = new Map();

  registros.forEach((registro) => {
    const atual = porVisitante.get(registro.key);
    porVisitante.set(registro.key, atual ? mergeRequisicoesPorVisitante(atual, registro) : registro);
  });

  return Array.from(porVisitante.values()).sort((a, b) => getVisitanteTimestamp(b) - getVisitanteTimestamp(a));
}

export function normalizeAprovacao(registro) {
  const base = normalizePendencia(registro);
  const status = normalizeRequisicaoStatus(registro?.status);
  const observacao = pickFirst(getObservacaoFromDescricao(registro?.descricao), registro?.observacao);

  return {
    ...base,
    status,
    observacao,
    setor: base.setoresPermitidos.length > 0 ? base.setoresPermitidos.join(", ") : EMPTY_VALUE,
  };
}

export function pickBestCapitalization(current, next) {
  if (!current) return next || "";
  if (!next) return current;

  const currentHasUpper = /[A-ZÀ-Ý]/.test(current.slice(1));
  const nextHasUpper = /[A-ZÀ-Ý]/.test(next.slice(1));

  return !currentHasUpper && nextHasUpper ? next : current;
}

export function normalizeHistoricoRegistro(registro) {
  const usuario = registro?.usuario || {};
  const departamento = registro?.departamento || registro?.setores || {};
  const departamentoNome = typeof departamento === "string" ? departamento : departamento?.nome;
  const descricao = registro?.descricao || "";
  const setorBackend = pickFirst(registro?.setoresPermitidos, registro?.setor, departamentoNome, getDescricaoValue(descricao, "Setor"));
  const setoresPermitidos = getSetoresPermitidosFromDescricao(descricao, setorBackend);
  const setorResponsavel = getSetorResponsavelFromDescricao(descricao, setorBackend);
  const dataEntrada = pickFirst(registro?.dataEntrada, registro?.entrada, registro?.dataDaRequisicao, registro?.dataDeEntrada);
  const dataSaida = pickFirst(registro?.dataSaida, registro?.dataDeSaida);

  return {
    ...registro,
    visitante: pickFirst(registro?.visitante, registro?.nome, usuario?.nome, getDescricaoValue(descricao, "Visitante")),
    cpf: pickFirst(registro?.cpf, usuario?.cpf, getDescricaoValue(descricao, "CPF")),
    telefone: pickFirst(registro?.telefone, registro?.celular, usuario?.celular, usuario?.telefone, getDescricaoValue(descricao, "Telefone")),
    email: pickFirst(registro?.email, usuario?.email, getDescricaoValue(descricao, ["Email", "E-mail"])),
    empresa: pickFirst(registro?.empresa, registro?.empresa_visitante, usuario?.empresa, getDescricaoValue(descricao, "Empresa")),
    setor: setorResponsavel,
    setorResponsavel,
    setoresPermitidos,
    setoresLista: setoresPermitidos,
    dataEntrada,
    dataSaida,
    status: normalizeHistoricoStatus(registro?.status, dataSaida, dataEntrada),
    observacoes: pickFirst(registro?.observacoes, descricao),
  };
}

export function isFuncionarioRegistro(registro) {
  const usuario = registro?.usuario || {};
  const tipo = normalizeText(
    pickFirst(
      registro?.tipo,
      registro?.cargo,
      usuario?.tipo,
      usuario?.cargo,
      usuario?.funcionario?.tipo,
      usuario?.funcionario?.cargo
    )
  );

  return Boolean(
    usuario?.funcionario ||
      ["func", "funcionario", "port", "portaria", "sup", "supervisor", "ger", "gerente"].includes(tipo)
  );
}

export function getRegistroIdentity(registro) {
  return getVisitanteIdentity(registro, "registro");
}

export function compareRegistroRecency(a, b) {
  const timestampA = getVisitanteTimestamp(a);
  const timestampB = getVisitanteTimestamp(b);

  if (timestampA !== timestampB) {
    return timestampA - timestampB;
  }

  return Number(a?.id || a?.idRequisicao || 0) - Number(b?.id || b?.idRequisicao || 0);
}

export function dedupeRegistrosPorVisitante(registros) {
  const registrosPorVisitante = new Map();

  registros.forEach((registro) => {
    const key = `${getRegistroIdentity(registro)}|${registro.status || "em_andamento"}`;
    const registroAtual = registrosPorVisitante.get(key);

    if (!registroAtual) {
      registrosPorVisitante.set(key, registro);
      return;
    }

    const principal = compareRegistroRecency(registro, registroAtual) >= 0 ? registro : registroAtual;
    const setoresLista = Array.from(new Set([...(registroAtual.setoresLista || []), ...(registro.setoresLista || [])]));

    registrosPorVisitante.set(key, {
      ...principal,
      empresa: pickBestCapitalization(registroAtual.empresa, registro.empresa),
      setoresLista,
      setoresPermitidos: setoresLista,
      setor: principal.setor || registroAtual.setor || registro.setor,
    });
  });

  return Array.from(registrosPorVisitante.values()).sort((a, b) => compareRegistroRecency(b, a));
}

export function searchIncludes(value, term) {
  return normalizeText(value).includes(normalizeText(term));
}
