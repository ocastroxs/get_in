"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Loader2,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModalFiltro from "@/components/ui/ModalFiltro";
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
  matchesSupervisorSearch,
  normalizeSupervisorRequisicao,
  sortSupervisorRequisicoesDesc,
  SUPERVISOR_STATUS_LABEL,
  SUPERVISOR_STATUS_OPTIONS,
  SUPERVISOR_STATUS_STYLE,
} from "@/lib/supervisor-data";

export default function SupervisorDashboardPage() {
  const { showToast } = useToast();
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("todos");
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
          title: "Erro ao carregar solicitações",
          description: "Não foi possível buscar os dados do supervisor agora.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const ultimasRequisicoes = useMemo(
    () => [...requisicoes].sort(sortSupervisorRequisicoesDesc).slice(0, 10),
    [requisicoes]
  );

  const requisicoesFiltradas = useMemo(() => {
    return ultimasRequisicoes.filter((requisicao) => {
      const matchBusca = matchesSupervisorSearch(requisicao, busca);
      const matchStatus = filtroStatus === "todos" || requisicao.statusEfetivo === filtroStatus;

      return matchBusca && matchStatus;
    });
  }, [busca, filtroStatus, ultimasRequisicoes]);

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
      total: ultimasRequisicoes.length,
      aprovados: ultimasRequisicoes.filter((requisicao) => requisicao.statusEfetivo === "aprovado").length,
      pendentes: ultimasRequisicoes.filter((requisicao) => requisicao.statusEfetivo === "pendente").length,
      recusados: ultimasRequisicoes.filter((requisicao) => requisicao.statusEfetivo === "recusado").length,
      expirados: ultimasRequisicoes.filter((requisicao) => requisicao.statusEfetivo === "expirado").length,
    }),
    [ultimasRequisicoes]
  );

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
        description: "Não há solicitações com os filtros atuais.",
      });
      return;
    }

    try {
      await exportTableToPdf({
        title: "Dashboard do supervisor",
        subtitle: "Solicitações de visitantes por setor",
        fileName: `requisicoes_supervisor_${new Date().toISOString().split("T")[0]}.pdf`,
        filters: [
          busca ? `Busca: ${busca}` : null,
          filtroStatus !== "todos" ? `Status: ${SUPERVISOR_STATUS_LABEL[filtroStatus]}` : null,
        ].filter(Boolean),
        columns: [
          { header: "Visitante", weight: 1.4 },
          { header: "CPF", weight: 1 },
          { header: "Empresa", weight: 1.1 },
          { header: "Setor", weight: 1.1 },
          { header: "Motivo", weight: 1.2 },
          { header: "Data", weight: 1 },
          { header: "Status", weight: 0.8 },
        ],
        rows: requisicoesFiltradas.map((requisicao) => [
          requisicao.visitante,
          formatCPF(requisicao.cpf) || "-",
          requisicao.empresa || "-",
          requisicao.setorResponsavel || "-",
          requisicao.motivoVisita || "-",
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
        title="Dashboard do Supervisor"
        subtitle="Visão geral das últimas 10 solicitações de visitantes"
        buttonText="Analisar pendentes"
        buttonHref="/supervisor/aprovacoes"
      />

      <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total" value={stats.total} icon={<Users size={20} className="text-blue-600" />} accentVar="#2563eb" sub="Últimas 10 requisições" />
          <StatCard label="Aprovados" value={stats.aprovados} icon={<CheckCircle2 size={20} className="text-green-600" />} accentVar="#16a34a" sub="Nas últimas 10" />
          <StatCard label="Pendentes" value={stats.pendentes} icon={<AlertTriangle size={20} className="text-amber-600" />} accentVar="#d97706" sub={stats.pendentes > 0 ? "Ação necessária" : "Nenhuma nas últimas 10"} />
          <StatCard label="Recusados" value={stats.recusados} icon={<XCircle size={20} className="text-red-600" />} accentVar="#dc2626" sub="Nas últimas 10" />
          <StatCard label="Expirados" value={stats.expirados} icon={<XCircle size={20} className="text-slate-600" />} accentVar="#64748b" sub="Nas últimas 10" />
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
                {requisicoesFiltradas.length} resultado(s)
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
          <div className="flex items-center justify-between border-b border-border bg-muted/20 p-5">
            <div>
              <h2 className="text-sm font-bold text-foreground">Últimas 10 Requisições</h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">KPIs, filtros e tabela consideram apenas as últimas 10 solicitações</p>
            </div>
            <Clock size={20} className="text-primary opacity-60" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requisicoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertTriangle size={32} className="mb-3 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">Nenhuma requisição encontrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Visitante</th>
                    <th className="px-4 py-3">Empresa</th>
                    <th className="px-4 py-3">Setor</th>
                    <th className="px-4 py-3">Solicitação</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requisicoesPagina.map((requisicao) => {
                    const status = requisicao.statusEfetivo || "pendente";
                    const actionHref = status === "pendente" ? "/supervisor/aprovacoes" : "/supervisor/historico";
                    const actionLabel = status === "pendente" ? "Analisar" : "Histórico";

                    return (
                      <tr key={requisicao.id || `${requisicao.idUsuario}-${requisicao.dataDaRequisicao}`} className="transition hover:bg-muted/40">
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-foreground">{requisicao.visitante || "-"}</p>
                          <p className="text-[11px] text-muted-foreground">{formatCPF(requisicao.cpf) || "CPF não informado"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-foreground">{requisicao.empresa || "-"}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">{requisicao.motivoVisita || "-"}</p>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-foreground">{requisicao.setorResponsavel || "-"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-[10px] font-mono text-muted-foreground">
                          {formatSupervisorDateTime(requisicao.dataDaRequisicao)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex w-fit items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${SUPERVISOR_STATUS_STYLE[status] || SUPERVISOR_STATUS_STYLE.pendente}`}>
                            {SUPERVISOR_STATUS_LABEL[status] || status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={actionHref}>
                            <Button size="sm" variant="outline" className="h-8 rounded-lg text-[11px] font-bold">
                              {actionLabel}
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
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
              itemLabel="requisição(ões)"
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InfoPanel icon={<TrendingUp size={18} />} title="Como Funciona" accent="blue">
            <InfoItem number="1" text="A portaria solicita acesso para um ou mais setores." />
            <InfoItem number="2" text="Cada setor pode ser analisado separadamente." />
            <InfoItem number="3" text="A portaria recebe o resultado e libera o fluxo aprovado." />
          </InfoPanel>

          <InfoPanel icon={<ShieldCheck size={18} />} title="Segurança" accent="green">
            <InfoItem icon={<Check size={12} />} text="Confira dados pessoais e empresa antes da decisão." />
            <InfoItem icon={<Check size={12} />} text="Aprove somente os setores realmente necessários." />
            <InfoItem icon={<Check size={12} />} text="Use o histórico para auditar decisões anteriores." />
          </InfoPanel>
        </div>
      </div>

      <ModalFiltro
        isOpen={modalFiltroAberto}
        onClose={() => setModalFiltroAberto(false)}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      >
        <div className="space-y-2">
          <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Status da Requisição
          </label>
          <div className="grid grid-cols-1 gap-2">
            {SUPERVISOR_STATUS_OPTIONS.map((status) => (
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
                <span>{status === "todos" ? "Todos os status" : SUPERVISOR_STATUS_LABEL[status]}</span>
                {tempFiltroStatus === status && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      </ModalFiltro>
    </>
  );
}

function InfoPanel({ icon, title, accent, children }) {
  const classes = {
    blue: "border-blue-200 bg-blue-50/80 text-blue-700",
    green: "border-green-200 bg-green-50/80 text-green-700",
  };

  return (
    <section className={`rounded-2xl border p-6 shadow-sm ${classes[accent]}`}>
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
        {icon}
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function InfoItem({ number, icon, text }) {
  return (
    <div className="flex items-start gap-3 text-xs font-medium leading-relaxed text-slate-700">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary shadow-xs">
        {icon || number}
      </span>
      <span>{text}</span>
    </div>
  );
}
