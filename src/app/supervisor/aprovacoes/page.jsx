"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  Filter,
  Loader2,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import ModalFiltro from "@/components/ui/ModalFiltro";
import ModalAprovacaoVisitante from "@/components/supervisor/ModalAprovacaoVisitante";
import { api } from "@/services/api";
import { exportTableToPdf } from "@/lib/exportPdf";
import { formatCPF } from "@/lib/utils";

const STATUS_LABEL = {
  todos: "Todos",
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado",
  expirado: "Expirado",
  misto: "Misto",
};

const STATUS_STYLE = {
  pendente: "bg-amber-100 text-amber-700",
  aprovado: "bg-green-100 text-green-700",
  recusado: "bg-red-100 text-red-600",
  expirado: "bg-slate-100 text-slate-700",
  misto: "bg-blue-100 text-blue-700",
};

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function isToday(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function getSetorNome(requisicao) {
  return requisicao?.setores?.nome || requisicao?.departamento?.nome || requisicao?.setor || "-";
}

function getEffectiveStatus(requisicao) {
  const status = String(requisicao?.status || "pendente").toLowerCase();

  if (status === "pendente" && !isToday(requisicao?.dataDaRequisicao)) {
    return "expirado";
  }

  return status;
}

function getGroupKey(requisicao) {
  const usuario = requisicao.usuario || {};
  return [
    requisicao.idUsuario || usuario.id || usuario.cpf || usuario.email || usuario.nome,
    requisicao.empresa || "",
    requisicao.motivo || "",
    requisicao.validade || "",
    requisicao.descricao || "",
  ].join("|");
}

function groupRequisicoes(requisicoes) {
  const groups = new Map();

  requisicoes.forEach((requisicao) => {
    const key = getGroupKey(requisicao);
    const current = groups.get(key);
    const nextSetor = {
      ...requisicao,
      status: getEffectiveStatus(requisicao),
      setor: getSetorNome(requisicao),
    };

    if (!current) {
      groups.set(key, {
        ...requisicao,
        key,
        setoresSolicitados: [nextSetor],
      });
      return;
    }

    current.setoresSolicitados.push(nextSetor);

    if (new Date(requisicao.dataDaRequisicao).getTime() > new Date(current.dataDaRequisicao).getTime()) {
      current.dataDaRequisicao = requisicao.dataDaRequisicao;
    }
  });

  return Array.from(groups.values()).map((group) => {
    const statuses = Array.from(new Set(group.setoresSolicitados.map((item) => getEffectiveStatus(item))));
    const hasPendencia = group.setoresSolicitados.some((item) => getEffectiveStatus(item) === "pendente");

    return {
      ...group,
      hasPendencia,
      status: hasPendencia ? "pendente" : statuses.length === 1 ? statuses[0] : "misto",
    };
  });
}

function LinhaRequisicao({ requisicao, onAprovar }) {
  const usuario = requisicao.usuario || {};
  const status = requisicao.status || "pendente";
  const statusClass = STATUS_STYLE[status] || STATUS_STYLE.pendente;

  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-bold text-foreground">{usuario.nome || "-"}</p>
          <p className="text-[11px] text-muted-foreground">{formatCPF(usuario.cpf) || "CPF nao informado"}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{requisicao.empresa || "-"}</td>
      <td className="px-4 py-3">
        <div className="flex max-w-sm flex-wrap gap-1.5">
          {requisicao.setoresSolicitados.map((item) => (
            <span key={item.id} className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_STYLE[item.status] || STATUS_STYLE.pendente}`}>
              {item.setor}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{requisicao.motivo || "-"}</td>
      <td className="whitespace-nowrap px-4 py-3 text-[11px] font-mono text-muted-foreground">
        {formatDateTime(requisicao.dataDaRequisicao)}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
          {STATUS_LABEL[status] || STATUS_LABEL.pendente}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => onAprovar(requisicao)}
            className="h-9 gap-1.5 rounded-xl bg-blue-600 text-[11px] font-bold hover:bg-blue-700"
            type="button"
          >
            <ChevronRight size={14} />
            <span className="hidden xl:inline uppercase">Analisar</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function AprovacoesSupervisorPage() {
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [requisicaoSelecionada, setRequisicaoSelecionada] = useState(null);
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempFiltroStatus, setTempFiltroStatus] = useState("todos");

  useEffect(() => {
    fetchRequisicoes();
    const interval = setInterval(fetchRequisicoes, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchRequisicoes() {
    try {
      setLoading(true);
      const response = await api.get("/requisicao-visitante");

      if (response?.sucesso && Array.isArray(response.data)) {
        setRequisicoes(
          response.data.map((requisicao) => ({
            ...requisicao,
            status: getEffectiveStatus(requisicao),
          }))
        );
      } else {
        setRequisicoes([]);
      }
    } catch (error) {
      console.error("Erro ao carregar requisicoes:", error);
      setRequisicoes([]);
    } finally {
      setLoading(false);
    }
  }

  const requisicoesAgrupadas = useMemo(() => groupRequisicoes(requisicoes), [requisicoes]);

  const requisicoesFiltradas = useMemo(() => {
    return requisicoesAgrupadas.filter((requisicao) => {
      const usuario = requisicao.usuario || {};
      const termoBusca = busca.toLowerCase();
      const setores = requisicao.setoresSolicitados.map((item) => item.setor).join(" ").toLowerCase();
      const matchBusca =
        busca === "" ||
        (usuario.nome || "").toLowerCase().includes(termoBusca) ||
        (usuario.cpf || "").includes(busca) ||
        (requisicao.empresa || "").toLowerCase().includes(termoBusca) ||
        setores.includes(termoBusca);
      const matchStatus =
        filtroStatus === "todos" ||
        requisicao.setoresSolicitados.some((item) => getEffectiveStatus(item) === filtroStatus);

      return matchBusca && matchStatus;
    });
  }, [requisicoesAgrupadas, busca, filtroStatus]);

  const requisicoesHoje = useMemo(
    () => requisicoes.filter((requisicao) => isToday(requisicao.dataDaRequisicao)),
    [requisicoes]
  );
  const countAprovadosHoje = requisicoesHoje.filter((requisicao) => requisicao.status === "aprovado").length;
  const countPendentesHoje = requisicoesHoje.filter((requisicao) => requisicao.status === "pendente").length;
  const countRecusadosHoje = requisicoesHoje.filter((requisicao) => requisicao.status === "recusado").length;
  const countAprovados = requisicoes.filter((requisicao) => requisicao.status === "aprovado").length;
  const countPendentes = requisicoes.filter((requisicao) => requisicao.status === "pendente").length;
  const countRecusados = requisicoes.filter((requisicao) => requisicao.status === "recusado").length;
  const countExpirados = requisicoes.filter((requisicao) => requisicao.status === "expirado").length;

  function handleAprovar(requisicao) {
    setRequisicaoSelecionada(requisicao);
    setModalAberto(true);
  }

  const aplicarFiltros = () => setFiltroStatus(tempFiltroStatus);

  const limparFiltros = () => {
    setTempFiltroStatus("todos");
    setFiltroStatus("todos");
    setBusca("");
  };

  async function exportarPDF() {
    if (requisicoesFiltradas.length === 0) {
      alert("Nao ha dados para exportar.");
      return;
    }

    try {
      await exportTableToPdf({
        title: "Aprovacoes do supervisor",
        subtitle: "Solicitacoes de visitantes por setor",
        fileName: `aprovacoes_supervisor_${new Date().toISOString().split("T")[0]}.pdf`,
        filters: [
          busca ? `Busca: ${busca}` : null,
          filtroStatus !== "todos" ? `Status: ${STATUS_LABEL[filtroStatus]}` : null,
        ].filter(Boolean),
        columns: [
          { header: "Visitante", weight: 1.3 },
          { header: "CPF", weight: 1 },
          { header: "Empresa", weight: 1.1 },
          { header: "Setores", weight: 1.7 },
          { header: "Motivo", weight: 1.1 },
          { header: "Data", weight: 1 },
          { header: "Status", weight: 0.8 },
        ],
        rows: requisicoesFiltradas.map((r) => {
          const usuario = r.usuario || {};
          return [
            usuario.nome || "-",
            formatCPF(usuario.cpf) || "-",
            r.empresa || "-",
            r.setoresSolicitados.map((item) => `${item.setor} (${STATUS_LABEL[getEffectiveStatus(item)] || getEffectiveStatus(item)})`).join(", "),
            r.motivo || "-",
            formatDateTime(r.dataDaRequisicao),
            STATUS_LABEL[r.status] || r.status,
          ];
        }),
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Nao foi possivel exportar o PDF.");
    }
  }

  return (
    <>
      <Topbar
        title="Aprovações"
        subtitle="Gerenciamento das solicitacoes de visitantes"
      />

      <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Aprovados de hoje" value={countAprovadosHoje} valueClassName="text-green-600" icon={<CheckCircle2 size={17} className="text-green-600" />} sub="Setores autorizados" accentVar="var(--chart-2)" />
          <StatCard label="Pendentes de hoje" value={countPendentesHoje} valueClassName="text-amber-600" icon={<AlertTriangle size={17} className="text-amber-600" />} sub="Aguardando analise" accentVar="var(--warning)" />
          <StatCard label="Recusados de hoje" value={countRecusadosHoje} valueClassName="text-red-600" icon={<XCircle size={17} className="text-red-600" />} sub="Acesso nao autorizado" accentVar="var(--destructive)" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="Aprovados" value={countAprovados} valueClassName="text-green-600" icon={<CheckCircle2 size={17} className="text-green-600" />} sub="Total autorizado" accentVar="var(--chart-2)" />
          <StatCard label="Pendentes" value={countPendentes} valueClassName="text-amber-600" icon={<AlertTriangle size={17} className="text-amber-600" />} sub="Somente hoje" accentVar="var(--warning)" />
          <StatCard label="Recusados" value={countRecusados} valueClassName="text-red-600" icon={<XCircle size={17} className="text-red-600" />} sub="Total recusado" accentVar="var(--destructive)" />
          <StatCard label="Expirados" value={countExpirados} valueClassName="text-slate-600" icon={<XCircle size={17} className="text-slate-600" />} sub="Pendentes antigos" accentVar="#64748b" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full flex-1 items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar por nome, CPF, empresa ou setor..."
                  className="h-11 rounded-xl border-border/60 bg-background/80 pl-10 text-sm"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                />
                {busca && (
                  <button type="button" onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                )}
              </div>

              <Button type="button" onClick={() => setModalFiltroAberto(true)} variant="outline" className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-4">
                <Filter size={16} />
                <span className="hidden sm:inline">Filtros</span>
                {filtroStatus !== "todos" && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">1</span>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={exportarPDF} variant="outline" className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-4 text-sm font-medium" type="button">
                <Download size={16} />
                <span className="hidden sm:inline">Exportar PDF</span>
              </Button>
              <div className="rounded-xl border border-border/50 bg-muted/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground">
                {requisicoesFiltradas.length} pedido(s)
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/20 p-4">
            <h3 className="text-sm font-bold text-foreground">Listagem de Aprovações</h3>
            <p className="text-xs text-muted-foreground">Pendentes valem apenas para hoje; solicitacoes antigas ficam como expiradas.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requisicoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <AlertTriangle size={32} className="mb-3 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">Nenhuma requisicao encontrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Visitante</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Empresa</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Setor</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Motivo</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Data</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requisicoesFiltradas.map((requisicao) => (
                    <LinhaRequisicao key={requisicao.key} requisicao={requisicao} onAprovar={handleAprovar} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ModalAprovacaoVisitante
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        requisicao={requisicaoSelecionada}
        onConfirm={fetchRequisicoes}
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
              Status do setor
            </label>
            <div className="grid grid-cols-1 gap-2">
              {["todos", "aprovado", "pendente", "recusado", "expirado"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTempFiltroStatus(status)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold transition-all ${
                    tempFiltroStatus === status
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  <span>{status === "todos" ? "Todos os Status" : STATUS_LABEL[status]}</span>
                  {tempFiltroStatus === status && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ModalFiltro>
    </>
  );
}
