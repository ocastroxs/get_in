"use client";

import { useMemo, useState } from "react";
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
  groupSupervisorAprovacoes,
  isToday,
  matchesSupervisorSearch,
  matchesSupervisorStatus,
  normalizeSupervisorRequisicao,
  SUPERVISOR_APROVACAO_STATUS_OPTIONS,
  SUPERVISOR_STATUS_LABEL,
  SUPERVISOR_STATUS_STYLE,
} from "@/lib/supervisor-data";

function LinhaRequisicao({ requisicao, onAprovar }) {
  const status = requisicao.statusEfetivo || requisicao.status || "pendente";
  const statusClass = SUPERVISOR_STATUS_STYLE[status] || SUPERVISOR_STATUS_STYLE.pendente;

  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-bold text-foreground">{requisicao.visitante || "-"}</p>
          <p className="text-[11px] text-muted-foreground">{formatCPF(requisicao.cpf) || "CPF não informado"}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{requisicao.empresa || "-"}</td>
      <td className="px-4 py-3">
        <div className="flex max-w-sm flex-wrap gap-1.5">
          {requisicao.setoresSolicitados.map((item) => (
            <span key={item.id || `${item.setor}-${item.status}`} className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${SUPERVISOR_STATUS_STYLE[item.status] || SUPERVISOR_STATUS_STYLE.pendente}`}>
              {item.setor}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{requisicao.motivoVisita || requisicao.motivo || "-"}</td>
      <td className="whitespace-nowrap px-4 py-3 text-[11px] font-mono text-muted-foreground">
        {formatSupervisorDateTime(requisicao.dataDaRequisicao)}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
          {SUPERVISOR_STATUS_LABEL[status] || SUPERVISOR_STATUS_LABEL.pendente}
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
  const { showToast } = useToast();
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [requisicaoSelecionada, setRequisicaoSelecionada] = useState(null);
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempFiltroStatus, setTempFiltroStatus] = useState("todos");

  useAutoRefresh(fetchRequisicoes);

  async function fetchRequisicoes({ silent = false } = {}) {
    try {
      if (!silent) setLoading(true);
      const response = await api.get("/requisicao-visitante");
      setRequisicoes(getResponseArray(response, ["dados", "requisicoes"]).map(normalizeSupervisorRequisicao));
    } catch (error) {
      console.error("Erro ao carregar requisições:", error);
      setRequisicoes([]);

      if (!silent) {
        showToast({
          type: "error",
          title: "Erro ao carregar aprovações",
          description: "Não foi possível buscar as solicitações de hoje.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const requisicoesHoje = useMemo(
    () => requisicoes.filter((requisicao) => isToday(requisicao.dataDaRequisicao)),
    [requisicoes]
  );

  const requisicoesAgrupadas = useMemo(() => groupSupervisorAprovacoes(requisicoesHoje), [requisicoesHoje]);

  const requisicoesFiltradas = useMemo(() => {
    return requisicoesAgrupadas.filter((requisicao) => {
      return matchesSupervisorSearch(requisicao, busca) && matchesSupervisorStatus(requisicao, filtroStatus);
    });
  }, [busca, filtroStatus, requisicoesAgrupadas]);

  const {
    page,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems: requisicoesPagina,
  } = usePagination(requisicoesFiltradas);

  const stats = useMemo(
    () => ({
      aprovados: requisicoesHoje.filter((requisicao) => requisicao.statusEfetivo === "aprovado").length,
      pendentes: requisicoesHoje.filter((requisicao) => requisicao.statusEfetivo === "pendente").length,
      recusados: requisicoesHoje.filter((requisicao) => requisicao.statusEfetivo === "recusado").length,
      expirados: requisicoesHoje.filter((requisicao) => requisicao.statusEfetivo === "expirado").length,
    }),
    [requisicoesHoje]
  );

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
      showToast({
        type: "info",
        title: "Nada para exportar",
        description: "Não há aprovações com os filtros atuais.",
      });
      return;
    }

    try {
      await exportTableToPdf({
        title: "Aprovações do supervisor",
        subtitle: "Solicitações de visitantes por setor",
        fileName: `aprovacoes_supervisor_${new Date().toISOString().split("T")[0]}.pdf`,
        filters: [
          "Data: hoje",
          busca ? `Busca: ${busca}` : null,
          filtroStatus !== "todos" ? `Status: ${SUPERVISOR_STATUS_LABEL[filtroStatus]}` : null,
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
        rows: requisicoesFiltradas.map((requisicao) => [
          requisicao.visitante || "-",
          formatCPF(requisicao.cpf) || "-",
          requisicao.empresa || "-",
          requisicao.setoresSolicitados
            .map((item) => `${item.setor} (${SUPERVISOR_STATUS_LABEL[item.status] || item.status})`)
            .join(", "),
          requisicao.motivoVisita || requisicao.motivo || "-",
          formatSupervisorDateTime(requisicao.dataDaRequisicao),
          SUPERVISOR_STATUS_LABEL[requisicao.statusEfetivo] || requisicao.statusEfetivo,
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

  return (
    <>
      <Topbar
        title="Aprovações"
        subtitle="Gerenciamento de solicitações de visitantes da portaria"
      />

      <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="Aprovados de hoje" value={stats.aprovados} valueClassName="text-green-600" icon={<CheckCircle2 size={17} className="text-green-600" />} sub="Setores autorizados" accentVar="var(--chart-2)" />
          <StatCard label="Pendentes de hoje" value={stats.pendentes} valueClassName="text-amber-600" icon={<AlertTriangle size={17} className="text-amber-600" />} sub="Aguardando análise" accentVar="var(--warning)" />
          <StatCard label="Recusados de hoje" value={stats.recusados} valueClassName="text-red-600" icon={<XCircle size={17} className="text-red-600" />} sub="Acesso não autorizado" accentVar="var(--destructive)" />
          <StatCard label="Expirados de hoje" value={stats.expirados} valueClassName="text-slate-600" icon={<XCircle size={17} className="text-slate-600" />} sub="Vencidos hoje" accentVar="#64748b" />
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
              <Button onClick={exportarPDF} variant="outline" className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-4 text-sm font-medium" type="button">
                <Download size={16} />
                <span className="hidden sm:inline">Exportar PDF</span>
              </Button>
              <div className="rounded-xl border border-border/50 bg-muted/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground">
                {requisicoesFiltradas.length} pedido(s)
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
            <h3 className="text-sm font-bold text-foreground">Listagem de Aprovações de hoje</h3>
            <p className="text-xs text-muted-foreground">Pendentes ficam válidas por até 24h; depois aparecem como expiradas.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requisicoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <AlertTriangle size={32} className="mb-3 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">Nenhuma requisição de hoje encontrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Visitante</th>
                    <th className="px-4 py-3">Empresa</th>
                    <th className="px-4 py-3">Setor</th>
                    <th className="px-4 py-3">Motivo</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requisicoesPagina.map((requisicao) => (
                    <LinhaRequisicao key={requisicao.key} requisicao={requisicao} onAprovar={handleAprovar} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && requisicoesFiltradas.length > 0 && (
            <PaginationControls
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              currentCount={requisicoesPagina.length}
              onPageChange={setPage}
              itemLabel="aprovação(ões)"
            />
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
              {SUPERVISOR_APROVACAO_STATUS_OPTIONS.map((status) => (
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
                  <span>{status === "todos" ? "Todos os Status" : SUPERVISOR_STATUS_LABEL[status]}</span>
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
