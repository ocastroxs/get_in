"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Loader2,
  MapPin,
  Search,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Topbar from "@/components/Topbar";
import ModalFiltro from "@/components/ui/ModalFiltro";
import StatCard from "@/components/StatCard";
import { api } from "@/services/api";
import { exportTableToPdf } from "@/lib/exportPdf";
import { formatCPF, formatPhone } from "@/lib/utils";
import { normalizeMotivoVisita } from "@/lib/visitanteMotivos";

const STATUS_LABEL = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado"
};

function pickFirst(...values) {
  return (
    values.find((value) => value !== undefined && value !== null && String(value).trim() !== "") ||
    ""
  );
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function getDescricaoValue(descricao, label) {
  if (typeof descricao !== "string") return "";

  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = descricao.match(new RegExp(`${escapedLabel}:\\s*([^|]+)`, "i"));

  return match?.[1]?.trim() || "";
}

function normalizeStatus(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("aguard")) {
    return "pendente";
  }

  if (["aprovada", "aprovado"].includes(normalized)) return "aprovado";
  if (["recusada", "recusado", "rejeitado", "negado"].includes(normalized)) return "recusado";

  return normalized || "pendente";
}

function getResponseArray(response, keys = []) {
  if (!response || typeof response !== "object" || !response.sucesso) {
    return [];
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  for (const key of keys) {
    if (Array.isArray(response.data?.[key])) {
      return response.data[key];
    }

    if (Array.isArray(response[key])) {
      return response[key];
    }
  }

  return [];
}

function formatDateTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function isToday(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function getEmpresaNome(registro) {
  if (typeof registro?.empresas === "string") return registro.empresas;

  return pickFirst(
    registro?.empresa,
    registro?.empresa_visitante,
    registro?.usuario?.empresas?.nome,
    registro?.usuario?.empresa,
    registro?.empresas?.nome
  );
}

function getSetorNome(registro) {
  if (typeof registro?.setores === "string") return registro.setores;
  if (typeof registro?.departamento === "string") return registro.departamento;

  return pickFirst(
    registro?.setor,
    registro?.setores?.nome,
    registro?.departamento?.nome
  );
}

function splitSetores(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item && item.toLowerCase() !== "nenhum");
}

function getSetoresPermitidosFromDescricao(descricao, fallback = "") {
  const setoresPermitidos = splitSetores(getDescricaoValue(descricao, "Setores permitidos"));

  if (setoresPermitidos.length > 0) {
    return setoresPermitidos;
  }

  return splitSetores(fallback);
}

function hasObservacaoRelevante(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return Boolean(normalized && !normalized.includes("nenhuma observacao") && normalized !== "nenhuma");
}

function getObservacoes(registro, descricao) {
  return pickFirst(
    registro?.observacoes,
    getDescricaoValue(descricao, "Observacao da Portaria"),
    getDescricaoValue(descricao, "Observacao"),
    getDescricaoValue(descricao, "Observacoes"),
    getDescricaoValue(descricao, "Observações"),
    "Nenhuma observacao cadastrada."
  );
}

function normalizeRequisicao(registro) {
  const usuario = registro?.usuario || {};
  const descricao = registro?.descricao || "";
  const status = normalizeStatus(pickFirst(registro?.status, registro?.solicitacao));
  const dataDaRequisicao = pickFirst(
    registro?.dataDaRequisicao,
    registro?.dataRequisicao,
    registro?.createdAt
  );
  const setorBackend = pickFirst(getSetorNome(registro), getDescricaoValue(descricao, "Setor"));
  const setoresLista = getSetoresPermitidosFromDescricao(descricao, setorBackend);
  const setoresPermitidos = setoresLista.join(", ");
  const areaResponsavel = pickFirst(
    registro?.setorResponsavel,
    registro?.setor_responsavel,
    getDescricaoValue(descricao, "Setor responsavel"),
    registro?.areaResponsavel,
    registro?.area_responsavel,
    getDescricaoValue(descricao, "Area responsavel"),
    getDescricaoValue(descricao, "Setor"),
    setorBackend
  );
  const visitante = pickFirst(
    registro?.visitante,
    registro?.nome,
    usuario?.nome,
    getDescricaoValue(descricao, "Visitante")
  );
  const cpf = pickFirst(registro?.cpf, usuario?.cpf, getDescricaoValue(descricao, "CPF"));
  const email = pickFirst(
    registro?.email,
    usuario?.email,
    getDescricaoValue(descricao, "Email"),
    getDescricaoValue(descricao, "E-mail")
  );
  const empresa = pickFirst(getEmpresaNome(registro), getDescricaoValue(descricao, "Empresa"));
  const motivo = normalizeMotivoVisita(pickFirst(registro?.motivo, getDescricaoValue(descricao, "Motivo"), "Outro"));
  const key = getRequisicaoIdentity({ ...registro, visitante, cpf, email });

  return {
    ...registro,
    id: pickFirst(registro?.id, registro?.idRequisicao, key),
    key,
    idUsuario: pickFirst(registro?.idUsuario, usuario?.id),
    visitante: visitante || "-",
    cpf,
    email,
    empresa: empresa || "-",
    setor: setoresPermitidos || "-",
    setoresLista,
    areaResponsavel: areaResponsavel || "-",
    motivo,
    status,
    solicitacao: dataDaRequisicao ? formatDateTime(dataDaRequisicao) : STATUS_LABEL[status] || status,
    dataDaRequisicao,
    telefone: pickFirst(registro?.telefone, registro?.celular, usuario?.celular, getDescricaoValue(descricao, "Telefone")),
    observacoes: getObservacoes(registro, descricao)
  };
}

function getRequisicaoIdentity(registro) {
  const idUsuario = pickFirst(registro?.idUsuario, registro?.usuario?.id);
  const cpf = onlyDigits(registro?.cpf);
  const email = String(registro?.email || registro?.usuario?.email || "").trim().toLowerCase();
  const visitante = String(registro?.visitante || registro?.nome || registro?.usuario?.nome || "")
    .trim()
    .toLowerCase();

  if (idUsuario) return `usuario:${idUsuario}`;
  if (cpf) return `cpf:${cpf}`;
  if (email) return `email:${email}`;
  if (visitante) return `nome:${visitante}`;

  return `requisicao:${pickFirst(registro?.id, registro?.idRequisicao, registro?.dataDaRequisicao, registro?.motivo)}`;
}

function getRequisicaoTimestamp(registro) {
  const datas = [registro?.dataDaRequisicao, registro?.validade];

  for (const data of datas) {
    const timestamp = new Date(data).getTime();

    if (!Number.isNaN(timestamp)) {
      return timestamp;
    }
  }

  return Number(registro?.id || 0);
}

function mergeRequisicoes(atual, nova) {
  const setoresLista = Array.from(
    new Set([...(atual.setoresLista || []), ...(nova.setoresLista || [])])
  );
  const principal = getRequisicaoTimestamp(nova) >= getRequisicaoTimestamp(atual) ? nova : atual;

  return {
    ...principal,
    ids: Array.from(new Set([...(atual.ids || [atual.id]), ...(nova.ids || [nova.id])].filter(Boolean))),
    setoresLista,
    setor: setoresLista.length > 0 ? setoresLista.join(", ") : pickFirst(principal.setor, atual.setor, nova.setor),
    motivo: pickFirst(principal.motivo, atual.motivo, nova.motivo),
    observacoes: pickFirst(principal.observacoes, atual.observacoes, nova.observacoes)
  };
}

function dedupeRequisicoesPorVisitante(registros) {
  const porVisitante = new Map();

  registros.forEach((registro) => {
    const atual = porVisitante.get(registro.key);
    porVisitante.set(registro.key, atual ? mergeRequisicoes(atual, registro) : registro);
  });

  return Array.from(porVisitante.values()).sort(
    (a, b) => getRequisicaoTimestamp(b) - getRequisicaoTimestamp(a)
  );
}

function ModalObservacoes({ isOpen, onClose, requisicao }) {
  if (!isOpen || !requisicao) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md animate-in zoom-in-95 rounded-xl border border-border bg-card shadow-lg duration-300">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <FileText size={17} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Observacoes</h2>
              <p className="text-xs text-muted-foreground">{requisicao.visitante} - {requisicao.setor}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            type="button"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <div className="rounded-2xl border border-border bg-background p-4 shadow-xs">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Registro da portaria</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {requisicao.observacoes || "Nenhuma observacao cadastrada."}
            </p>
          </div>
        </div>

        <div className="border-t border-border p-4">
          <Button variant="outline" onClick={onClose} className="h-11 w-full rounded-xl" type="button">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

function LinhaRequisicao({ requisicao, onAnalise }) {
  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">{requisicao.visitante}</p>
          <p className="text-xs text-muted-foreground">{formatCPF(requisicao.cpf) || "-"}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{requisicao.empresa}</td>
      <td className="px-4 py-3 text-sm text-foreground">{requisicao.areaResponsavel}</td>
      <td className="px-4 py-3 text-sm text-foreground">{requisicao.setor}</td>
      <td className="px-4 py-3 text-sm text-foreground">{requisicao.motivo}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        <div className="space-y-1">
          <p>{formatPhone(requisicao.telefone) || "-"}</p>
          <p className="max-w-[180px] truncate">{requisicao.email || "-"}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{requisicao.solicitacao}</td>
      <td className="px-4 py-3 text-right">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAnalise(requisicao)}
          className="h-9 gap-1.5 rounded-xl border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
          type="button"
        >
          <Eye size={14} />
          Observacoes
        </Button>
      </td>
    </tr>
  );
}

export default function PendenciasPage() {
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [requisicaoSelecionada, setRequisicaoSelecionada] = useState(null);
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [filtroSetor, setFiltroSetor] = useState("Todos");
  const [tempFiltroSetor, setTempFiltroSetor] = useState("Todos");

  useEffect(() => {
    fetchRequisicoes();
    const interval = setInterval(fetchRequisicoes, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchRequisicoes() {
    try {
      setLoading(true);
      const response = await api.get("/portaria/pendencias");
      const pendencias = getResponseArray(response, ["dados", "requisicoes"])
        .map(normalizeRequisicao)
        .filter((requisicao) => requisicao.status === "pendente" && isToday(requisicao.dataDaRequisicao));

      setRequisicoes(dedupeRequisicoesPorVisitante(pendencias));
    } catch (error) {
      console.error("Erro ao carregar pendencias:", error);
      setRequisicoes([]);
    } finally {
      setLoading(false);
    }
  }

  const requisicoesFiltradas = useMemo(() => {
    const termoBusca = busca.toLowerCase();
    const termoBuscaDigitos = onlyDigits(busca);

    return requisicoes.filter((requisicao) => {
      const cpfDigitos = onlyDigits(requisicao.cpf);
      const telefoneDigitos = onlyDigits(requisicao.telefone);
      const matchBusca =
        busca === "" ||
        requisicao.visitante.toLowerCase().includes(termoBusca) ||
        requisicao.empresa.toLowerCase().includes(termoBusca) ||
        requisicao.areaResponsavel.toLowerCase().includes(termoBusca) ||
        requisicao.setor.toLowerCase().includes(termoBusca) ||
        requisicao.motivo.toLowerCase().includes(termoBusca) ||
        (requisicao.telefone || "").toLowerCase().includes(termoBusca) ||
        formatPhone(requisicao.telefone).toLowerCase().includes(termoBusca) ||
        (requisicao.email || "").toLowerCase().includes(termoBusca) ||
        (requisicao.cpf || "").toLowerCase().includes(termoBusca) ||
        (termoBuscaDigitos !== "" && (cpfDigitos.includes(termoBuscaDigitos) || telefoneDigitos.includes(termoBuscaDigitos)));

      const setoresLista = requisicao.setoresLista?.length > 0 ? requisicao.setoresLista : [requisicao.setor];
      const matchSetor = filtroSetor === "Todos" || setoresLista.includes(filtroSetor);

      return matchBusca && matchSetor;
    });
  }, [requisicoes, busca, filtroSetor]);

  const setoresUnicos = useMemo(() => {
    const setores = requisicoes.flatMap((requisicao) =>
      requisicao.setoresLista?.length > 0 ? requisicao.setoresLista : [requisicao.setor]
    );

    return [
      "Todos",
      ...Array.from(new Set(setores.filter((setor) => setor && setor !== "-"))).sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      )
    ];
  }, [requisicoes]);

  function handleAnalise(requisicao) {
    setRequisicaoSelecionada(requisicao);
    setModalAberto(true);
  }

  const aplicarFiltros = () => {
    setFiltroSetor(tempFiltroSetor);
  };

  const limparFiltros = () => {
    setTempFiltroSetor("Todos");
    setFiltroSetor("Todos");
    setBusca("");
  };

  const exportarPDF = async () => {
    if (requisicoesFiltradas.length === 0) {
      alert("Nao ha dados para exportar.");
      return;
    }

    try {
      await exportTableToPdf({
        title: "Pendências da portaria",
        subtitle: "Requisições de visita aguardando aprovação",
        fileName: `pendencias_${new Date().toISOString().split("T")[0]}.pdf`,
        filters: [
          busca ? `Busca: ${busca}` : null,
          filtroSetor !== "Todos" ? `Setor permitido: ${filtroSetor}` : null,
        ].filter(Boolean),
        columns: [
          { header: "Visitante", weight: 1.4 },
          { header: "CPF", weight: 1 },
          { header: "Empresa", weight: 1.2 },
          { header: "Setor responsavel", weight: 1.1 },
          { header: "Setores permitidos", weight: 1.1 },
          { header: "Motivo", weight: 1.5 },
          { header: "Contato", weight: 1.2 },
          { header: "Solicitacao", weight: 1 },
        ],
        rows: requisicoesFiltradas.map((requisicao) => [
          requisicao.visitante,
          formatCPF(requisicao.cpf),
          requisicao.empresa,
          requisicao.areaResponsavel,
          requisicao.setor,
          requisicao.motivo,
          [formatPhone(requisicao.telefone), requisicao.email].filter(Boolean).join(" / "),
          requisicao.solicitacao,
        ]),
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Nao foi possivel exportar o PDF.");
    }
  };

  const stats = useMemo(() => {
    const setoresPermitidos = new Set(
      requisicoes
        .flatMap((requisicao) => requisicao.setoresLista || [])
        .filter((setor) => setor && setor !== "-")
    );
    const comObservacao = requisicoes.filter((requisicao) => hasObservacaoRelevante(requisicao.observacoes)).length;
    return {
      totalPendentes: requisicoes.length,
      setoresPermitidos: setoresPermitidos.size,
      comObservacao
    };
  }, [requisicoes]);

  return (
    <>
      <Topbar
        buttonText="Adicionar visitante"
        buttonHref="/portaria/novo"
        title="Pendências"
        subtitle="Requisições de visita aguardando aprovação"
      />

      <div className="flex flex-col gap-5 p-4 md:p-6 animate-in fade-in duration-700">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm dark:border-amber-500/50 dark:bg-amber-950/60">
          <AlertTriangle size={20} className="mt-0.5 flex-shrink-0 text-amber-600" />
          <div>
            <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100">Requisicoes pendentes</h3>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
              A lista considera apenas visitantes cadastrados hoje e separa setor responsavel de setores permitidos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            label="Total pendentes"
            value={stats.totalPendentes}
            icon={<AlertTriangle size={18} className="text-amber-600" />}
            accentVar="#d97706"
            sub="Aguardando aprovacao"
          />
          <StatCard
            label="Setores permitidos"
            value={stats.setoresPermitidos}
            icon={<MapPin size={18} className="text-blue-600" />}
            accentVar="#2563eb"
            sub="Envolvidos nas solicitacoes"
          />
          <StatCard
            label="Com observacao"
            value={stats.comObservacao}
            icon={<FileText size={18} className="text-amber-600" />}
            accentVar="#d97706"
            sub="Contexto adicional da portaria"
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full flex-1 items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar por nome, CPF, telefone, empresa, setor responsavel, setor permitido ou motivo..."
                  className="h-11 rounded-xl border-border/60 bg-card text-sm shadow-xs transition-all duration-200 hover:border-primary/30 hover:bg-accent/50 focus:border-primary/50 focus:ring-0 focus:ring-offset-0 outline-none pl-10"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                />
                {busca && (
                  <button
                    type="button"
                    onClick={() => setBusca("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <Button
                type="button"
                onClick={() => setModalFiltroAberto(true)}
                variant="outline"
                className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-4"
              >
                <Filter size={16} />
                <span className="hidden sm:inline">Filtros</span>
                {filtroSetor !== "Todos" && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    1
                  </span>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={exportarPDF}
                variant="outline"
                className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-4 text-sm font-medium"
                type="button"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Exportar PDF</span>
              </Button>
              <div className="rounded-xl border border-border/50 bg-muted/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground">
                {requisicoesFiltradas.length} visitante(s)
              </div>
            </div>
          </div>

          {(filtroSetor !== "Todos" || busca) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
              <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filtros ativos:</span>
              {busca && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Busca: {busca}
                </span>
              )}
              {filtroSetor !== "Todos" && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Setor permitido: {filtroSetor}
                </span>
              )}
              <Button
                variant="ghost"
                onClick={limparFiltros}
                className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                type="button"
              >
                Limpar tudo
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/20 p-4">
            <h3 className="text-sm font-bold">Lista de Pendencias</h3>
            <p className="text-xs text-muted-foreground">{requisicoesFiltradas.length} visitante(s) encontrados</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Visitante</th>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Setor responsavel</th>
                  <th className="px-4 py-3">Setores permitidos</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3">Contato</th>
                  <th className="px-4 py-3">Solicitacao</th>
                  <th className="px-4 py-3 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {loading && requisicoes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm">Carregando pendencias...</span>
                      </div>
                    </td>
                  </tr>
                ) : requisicoesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center text-sm text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="h-12 w-12 text-muted/30" />
                        <p>Nenhuma requisicao pendente encontrada.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requisicoesFiltradas.map((requisicao) => (
                    <LinhaRequisicao
                      key={`${requisicao.key}-${requisicao.id}`}
                      requisicao={requisicao}
                      onAnalise={handleAnalise}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ModalObservacoes
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        requisicao={requisicaoSelecionada}
      />

      <ModalFiltro
        isOpen={modalFiltroAberto}
        onClose={() => setModalFiltroAberto(false)}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Filtrar por setores permitidos
            </label>
            <div className="grid grid-cols-1 gap-2">
              {setoresUnicos.map((setor) => (
                <button
                  key={setor}
                  type="button"
                  onClick={() => setTempFiltroSetor(setor)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold transition-all ${
                    tempFiltroSetor === setor
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  <span>{setor === "Todos" ? "Todos os setores permitidos" : setor}</span>
                  {tempFiltroSetor === setor && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          {setoresUnicos.length === 1 && (
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                Nenhum setor permitido disponivel para filtrar nas pendencias atuais.
              </p>
            </div>
          )}
        </div>
      </ModalFiltro>
    </>
  );
}
