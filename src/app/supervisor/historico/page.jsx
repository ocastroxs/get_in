"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Download,
  Eye,
  Filter,
  Info,
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
import ModalPortal from "@/components/ui/ModalPortal";
import PaginationControls from "@/components/ui/PaginationControls";
import { useToast } from "@/components/ui/toast-provider";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { usePagination } from "@/hooks/usePagination";
import { api } from "@/services/api";
import { exportTableToPdf } from "@/lib/exportPdf";
import {
  formatCPF,
  formatSupervisorDateTime,
  getResponseArray,
  groupSupervisorHistorico,
  matchesSupervisorSearch,
  matchesSupervisorStatus,
  normalizeSupervisorRequisicao,
  SUPERVISOR_STATUS_LABEL,
  SUPERVISOR_STATUS_OPTIONS,
  SUPERVISOR_STATUS_STYLE,
} from "@/lib/supervisor-data";

function LinhaHistorico({ registro, onDetalhes }) {
  const status = registro.statusEfetivo || registro.status || "pendente";
  const statusClass = SUPERVISOR_STATUS_STYLE[status] || SUPERVISOR_STATUS_STYLE.pendente;

  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{registro.visitante || "-"}</p>
          <p className="text-xs text-muted-foreground">{formatCPF(registro.cpf) || "CPF não informado"}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{registro.empresa || "-"}</td>
      <td className="px-4 py-3">
        <div className="flex max-w-sm flex-wrap gap-1.5">
          {(registro.setores.length > 0 ? registro.setores : ["-"]).map((setor) => (
            <span key={setor} className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-bold text-foreground">
              {setor}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{registro.motivoVisita || registro.motivo || "-"}</td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
        {formatSupervisorDateTime(registro.dataDaRequisicao)}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
          {SUPERVISOR_STATUS_LABEL[status] || SUPERVISOR_STATUS_LABEL.pendente}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDetalhes(registro)}
          className="h-8 gap-1.5 rounded-lg text-[11px] font-bold"
          type="button"
        >
          <Eye size={13} />
          Detalhes
        </Button>
      </td>
    </tr>
  );
}

function ModalDetalhesHistorico({ registro, onClose }) {
  if (!registro) return null;

  const status = registro.statusEfetivo || registro.status || "pendente";

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/20 p-5">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-foreground">Detalhes da requisição</h2>
              <p className="truncate text-xs text-muted-foreground">
                {registro.visitante || "-"} - {SUPERVISOR_STATUS_LABEL[status] || status}
              </p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <X size={18} />
            </button>
          </div>

          <div className="grid max-h-[70vh] gap-3 overflow-y-auto p-5 text-sm" data-lenis-prevent>
            <Detail label="CPF" value={formatCPF(registro.cpf) || "-"} />
            <Detail label="Empresa" value={registro.empresa || "-"} />
            <Detail label="Setores" value={registro.setores.join(", ") || "-"} />
            <Detail label="Motivo" value={registro.motivoVisita || registro.motivo || "-"} />
            <Detail label="Solicitação" value={formatSupervisorDateTime(registro.dataDaRequisicao)} />
          </div>

          <div className="border-t border-border p-5">
            <Button type="button" onClick={onClose} className="h-10 w-full rounded-xl">
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-background/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="break-words text-sm font-semibold text-foreground sm:text-right">{value}</span>
    </div>
  );
}

export default function HistoricoSupervisorPage() {
  const { showToast } = useToast();
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [registroSelecionado, setRegistroSelecionado] = useState(null);
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempFiltroStatus, setTempFiltroStatus] = useState("todos");

  useAutoRefresh(fetchRequisicoes);

  async function fetchRequisicoes({ silent = false } = {}) {
    try {
      if (!silent) setLoading(true);
      const response = await api.get("/requisicao-visitante");
      setRequisicoes(getResponseArray(response, ["dados", "requisicoes"]).map(normalizeSupervisorRequisicao));
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      setRequisicoes([]);

      if (!silent) {
        showToast({
          type: "error",
          title: "Erro ao carregar histórico",
          description: "Não foi possível buscar os registros do supervisor.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const registros = useMemo(() => groupSupervisorHistorico(requisicoes), [requisicoes]);

  const registrosFiltrados = useMemo(() => {
    return registros.filter((registro) => {
      return matchesSupervisorSearch(registro, busca) && matchesSupervisorStatus(registro, filtroStatus);
    });
  }, [busca, filtroStatus, registros]);

  const {
    page,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems: registrosPagina,
  } = usePagination(registrosFiltrados);

  const stats = useMemo(
    () => ({
      aprovados: requisicoes.filter((requisicao) => requisicao.statusEfetivo === "aprovado").length,
      pendentes: requisicoes.filter((requisicao) => requisicao.statusEfetivo === "pendente").length,
      recusados: requisicoes.filter((requisicao) => requisicao.statusEfetivo === "recusado").length,
      expirados: requisicoes.filter((requisicao) => requisicao.statusEfetivo === "expirado").length,
    }),
    [requisicoes]
  );

  async function exportarPDF() {
    if (registrosFiltrados.length === 0) {
      showToast({
        type: "info",
        title: "Nada para exportar",
        description: "Não há registros com os filtros atuais.",
      });
      return;
    }

    try {
      await exportTableToPdf({
        title: "Histórico de aprovações",
        subtitle: "Registros agrupados por usuário e status",
        fileName: `historico-requisicoes-${new Date().toISOString().split("T")[0]}.pdf`,
        filters: [
          busca ? `Busca: ${busca}` : null,
          filtroStatus !== "todos" ? `Status: ${SUPERVISOR_STATUS_LABEL[filtroStatus]}` : null,
        ].filter(Boolean),
        columns: [
          { header: "Nome", weight: 1.3 },
          { header: "CPF", weight: 1 },
          { header: "Empresa", weight: 1.1 },
          { header: "Setores", weight: 1.6 },
          { header: "Motivo", weight: 1.1 },
          { header: "Data", weight: 1 },
          { header: "Status", weight: 0.8 },
        ],
        rows: registrosFiltrados.map((registro) => [
          registro.visitante || "-",
          formatCPF(registro.cpf) || "-",
          registro.empresa || "-",
          registro.setores.join(", ") || "-",
          registro.motivoVisita || registro.motivo || "-",
          formatSupervisorDateTime(registro.dataDaRequisicao),
          SUPERVISOR_STATUS_LABEL[registro.statusEfetivo] || registro.statusEfetivo,
        ]),
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      showToast({
        type: "error",
        title: "Erro ao exportar PDF",
        description: "Não foi possível gerar o arquivo agora.",
      });
    }
  }

  const aplicarFiltros = () => setFiltroStatus(tempFiltroStatus);

  const limparFiltros = () => {
    setTempFiltroStatus("todos");
    setFiltroStatus("todos");
    setBusca("");
  };

  return (
    <>
      <Topbar
        title="Histórico de Aprovações"
        subtitle="Visualize todas as requisições processadas"
      />

      <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="Aprovados" value={stats.aprovados} valueClassName="text-green-600" icon={<CheckCircle2 size={17} className="text-green-600" />} sub="Setores autorizados" accentVar="var(--chart-2)" />
          <StatCard label="Pendentes" value={stats.pendentes} valueClassName="text-amber-600" icon={<AlertTriangle size={17} className="text-amber-600" />} sub="Aguardando análise" accentVar="var(--warning)" />
          <StatCard label="Recusados" value={stats.recusados} valueClassName="text-red-600" icon={<XCircle size={17} className="text-red-600" />} sub="Acesso não autorizado" accentVar="var(--destructive)" />
          <StatCard label="Expirados" value={stats.expirados} valueClassName="text-slate-600" icon={<XCircle size={17} className="text-slate-600" />} sub="Mais de 24h pendente" accentVar="#64748b" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center lg:flex-1">
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

            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
              <Button type="button" onClick={exportarPDF} variant="outline" className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-4 text-sm font-medium">
                <Download size={16} />
                <span className="hidden sm:inline">Exportar PDF</span>
              </Button>
              <div className="rounded-xl border border-border/50 bg-muted/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground">
                {registrosFiltrados.length} resultado(s)
              </div>
            </div>
          </div>

          {(busca || filtroStatus !== "todos") && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
              <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filtros ativos:</span>
              {busca && (
                <span className="inline-flex max-w-full items-center break-all rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Busca: {busca}
                </span>
              )}
              {filtroStatus !== "todos" && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  Status: {SUPERVISOR_STATUS_LABEL[filtroStatus]}
                </span>
              )}
              <Button variant="ghost" onClick={limparFiltros} className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground" type="button">
                Limpar tudo
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/20 p-4">
            <h3 className="text-sm font-bold text-foreground">Registros de Acesso</h3>
            <p className="text-xs text-muted-foreground">Solicitações agrupadas por usuário e status</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm">Carregando dados...</span>
              </div>
            </div>
          ) : registrosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertTriangle size={32} className="mb-3 text-muted-foreground opacity-20" />
              <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[940px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Visitante</th>
                    <th className="px-4 py-3">Empresa</th>
                    <th className="px-4 py-3">Setor</th>
                    <th className="px-4 py-3">Motivo</th>
                    <th className="px-4 py-3">Solicitação</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {registrosPagina.map((registro) => (
                    <LinhaHistorico key={registro.key} registro={registro} onDetalhes={setRegistroSelecionado} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && registrosFiltrados.length > 0 && (
            <PaginationControls
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              currentCount={registrosPagina.length}
              onPageChange={setPage}
              itemLabel="registro(s)"
            />
          )}
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/90 p-5 shadow-sm">
          <div className="flex gap-3">
            <div className="h-fit rounded-xl bg-white p-2 text-blue-700 shadow-xs">
              <Info size={18} />
            </div>
            <div>
              <h3 className="mb-1 text-sm font-bold text-slate-900">Sobre o Histórico</h3>
              <p className="text-xs leading-relaxed text-slate-700">
                Este histórico consolida todos os setores do mesmo visitante por status. Assim, setores aprovados, recusados e pendentes aparecem em logs separados e mais fáceis de auditar.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ModalDetalhesHistorico
        registro={registroSelecionado}
        onClose={() => setRegistroSelecionado(null)}
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
              Status da Requisição
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SUPERVISOR_STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTempFiltroStatus(status)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                    tempFiltroStatus === status
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  <span>{status === "todos" ? "Todos" : SUPERVISOR_STATUS_LABEL[status]}</span>
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
