"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  CheckCircle2,
  Download,
  Eye,
  Filter,
  Loader2,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import ModalFiltro from "@/components/ui/ModalFiltro";
import PaginationControls from "@/components/ui/PaginationControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { usePagination } from "@/hooks/usePagination";
import { api } from "@/services/api";
import { exportTableToPdf } from "@/lib/exportPdf";
import { useToast } from "@/components/ui/toast-provider";
import {
  APROVACAO_STATUS_STYLE,
  dedupeRequisicoesPorVisitante,
  formatCPF,
  formatPortariaDateTime,
  isToday,
  normalizeAprovacao,
  REQUISICAO_STATUS_LABEL,
} from "@/lib/portaria-data";

function DescricaoVisual({ requisicao }) {
  const chips = [
    { label: "Setor responsável", value: requisicao.setorResponsavel },
    { label: "Setores permitidos", value: requisicao.setor },
    { label: "Motivo", value: requisicao.motivo },
  ].filter((item) => item.value && item.value !== "-");

  return (
    <div className="flex max-w-md flex-wrap gap-1.5">
      {chips.map((chip) => (
        <span key={`${chip.label}-${chip.value}`} className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-bold text-foreground">
          {chip.label}: {chip.value}
        </span>
      ))}
      {requisicao.observacao && requisicao.observacao !== "Nenhuma" && (
        <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
          Obs. portaria
        </span>
      )}
    </div>
  );
}

export default function PortariaAprovacoesPage() {
  const { showToast } = useToast();
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroData, setFiltroData] = useState("");
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempFiltroStatus, setTempFiltroStatus] = useState("todos");
  const [tempFiltroData, setTempFiltroData] = useState("");

  useAutoRefresh(fetchRequisicoes);

  async function fetchRequisicoes({ silent = false } = {}) {
    try {
      if (!silent) setLoading(true);
      const response = await api.get("/requisicao-visitante");
      const data = response?.sucesso && Array.isArray(response.data) ? response.data : [];

      setRequisicoes(
        dedupeRequisicoesPorVisitante(
          data
            .map(normalizeAprovacao)
            .filter((requisicao) => ["aprovado", "recusado"].includes(requisicao.status) && isToday(requisicao.dataDaRequisicao))
        )
      );
    } catch (error) {
      console.error("Erro ao carregar aprovações da portaria:", error);
      setRequisicoes([]);
    } finally {
      setLoading(false);
    }
  }

  const requisicoesFiltradas = useMemo(() => {
    const termo = busca.toLowerCase();

    return requisicoes.filter((requisicao) => {
      const matchBusca =
        !busca ||
        requisicao.visitante.toLowerCase().includes(termo) ||
        requisicao.empresa.toLowerCase().includes(termo) ||
        requisicao.areaResponsavel.toLowerCase().includes(termo) ||
        requisicao.setor.toLowerCase().includes(termo) ||
        requisicao.motivo.toLowerCase().includes(termo) ||
        requisicao.cpf.includes(busca);
      const matchStatus = filtroStatus === "todos" || requisicao.status === filtroStatus;
      const matchData = !filtroData || String(requisicao.dataDaRequisicao || "").includes(filtroData);

      return matchBusca && matchStatus && matchData;
    });
  }, [busca, filtroData, filtroStatus, requisicoes]);

  const {
    page,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems: requisicoesPagina,
  } = usePagination(requisicoesFiltradas);

  const stats = useMemo(() => ({
    aprovadosHoje: requisicoes.filter((requisicao) => requisicao.status === "aprovado" && isToday(requisicao.dataDaRequisicao)).length,
    recusadosHoje: requisicoes.filter((requisicao) => requisicao.status === "recusado" && isToday(requisicao.dataDaRequisicao)).length,
    setores: new Set(requisicoes.flatMap((requisicao) => requisicao.setoresPermitidos || []).filter((setor) => setor && setor !== "-")).size,
    comObservacao: requisicoes.filter((requisicao) => requisicao.observacao && requisicao.observacao !== "Nenhuma").length,
  }), [requisicoes]);

  const aplicarFiltros = () => {
    setFiltroStatus(tempFiltroStatus);
    setFiltroData(tempFiltroData);
  };

  const limparFiltros = () => {
    setBusca("");
    setFiltroStatus("todos");
    setTempFiltroStatus("todos");
    setFiltroData("");
    setTempFiltroData("");
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

    await exportTableToPdf({
      title: "Aprovações da portaria",
      subtitle: "Resultados de análise recebidos do supervisor",
      fileName: `aprovacoes_portaria_${new Date().toISOString().split("T")[0]}.pdf`,
      filters: [
        busca ? `Busca: ${busca}` : null,
        filtroStatus !== "todos" ? `Status: ${REQUISICAO_STATUS_LABEL[filtroStatus]}` : null,
        filtroData ? `Data: ${filtroData}` : null,
      ].filter(Boolean),
      columns: [
        { header: "Visitante", weight: 1.4 },
        { header: "CPF", weight: 1 },
        { header: "Empresa", weight: 1.1 },
        { header: "Setor responsável", weight: 1 },
        { header: "Setores permitidos", weight: 1 },
        { header: "Motivo", weight: 1 },
        { header: "Status", weight: 0.8 },
      ],
      rows: requisicoesFiltradas.map((requisicao) => [
        requisicao.visitante,
        formatCPF(requisicao.cpf),
        requisicao.empresa,
        requisicao.setorResponsavel,
        requisicao.setor,
        requisicao.motivo,
        REQUISICAO_STATUS_LABEL[requisicao.status] || requisicao.status,
      ]),
    });
  }

  return (
    <>
      <Topbar
        title="Aprovações da Portaria"
        subtitle="Resultados das análises feitas pelo supervisor"
      />

      <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="Aprovados hoje" value={stats.aprovadosHoje} icon={<CheckCircle2 size={18} className="text-green-600" />} accentVar="#16a34a" sub="Entram como dentro" />
          <StatCard label="Recusados hoje" value={stats.recusadosHoje} icon={<XCircle size={18} className="text-red-600" />} accentVar="#dc2626" sub="Acesso negado" />
          <StatCard label="Setores permitidos" value={stats.setores} icon={<ShieldCheck size={18} className="text-blue-600" />} accentVar="#2563eb" sub="Com decisão hoje" />
          <StatCard label="Com observação" value={stats.comObservacao} icon={<Eye size={18} className="text-amber-600" />} accentVar="#d97706" sub="Registro da portaria" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center lg:flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar por visitante, CPF, empresa, setor responsável ou setor permitido..."
                  className="h-11 rounded-xl pl-10"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                />
                {busca && (
                  <button type="button" onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                )}
              </div>
              <Button type="button" onClick={() => setModalFiltroAberto(true)} variant="outline" className="h-11 gap-2 rounded-xl">
                <Filter size={16} />
                Filtros
              </Button>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
              <Button type="button" onClick={exportarPDF} variant="outline" className="h-11 gap-2 rounded-xl">
                <Download size={16} />
                Exportar PDF
              </Button>
              <div className="rounded-xl border border-border/50 bg-muted/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground">
                {requisicoesFiltradas.length} resultado(s)
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/20 p-4">
            <h3 className="text-sm font-bold text-foreground">Resultados de aprovação</h3>
            <p className="text-xs text-muted-foreground">Descrições resumidas em marcadores para leitura rápida.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requisicoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <ShieldCheck size={32} className="mb-3 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">Nenhuma aprovação encontrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Visitante</th>
                    <th className="px-4 py-3">Empresa</th>
                    <th className="px-4 py-3">Descrição</th>
                    <th className="px-4 py-3">Solicitação</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requisicoesPagina.map((requisicao) => (
                    <tr key={requisicao.key} className="transition-colors hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-foreground">{requisicao.visitante}</p>
                        <p className="text-xs text-muted-foreground">{formatCPF(requisicao.cpf) || "-"}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{requisicao.empresa}</td>
                      <td className="px-4 py-3"><DescricaoVisual requisicao={requisicao} /></td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatPortariaDateTime(requisicao.dataDaRequisicao, "-")}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${APROVACAO_STATUS_STYLE[requisicao.status]}`}>
                          {REQUISICAO_STATUS_LABEL[requisicao.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href="/portaria/historico">
                          <Button size="sm" variant="outline" className="h-8 rounded-lg text-[11px] font-bold">
                            Histórico
                          </Button>
                        </Link>
                      </td>
                    </tr>
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

      <ModalFiltro
        isOpen={modalFiltroAberto}
        onClose={() => setModalFiltroAberto(false)}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</label>
            <div className="grid gap-2">
              {["todos", "aprovado", "recusado"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTempFiltroStatus(status)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold transition-all ${
                    tempFiltroStatus === status
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  {status === "todos" ? "Todos os status" : REQUISICAO_STATUS_LABEL[status]}
                  {tempFiltroStatus === status && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="ml-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <Calendar size={13} />
              Data
            </label>
            <Input type="date" value={tempFiltroData} onChange={(event) => setTempFiltroData(event.target.value)} className="h-11 rounded-xl" />
          </div>
        </div>
      </ModalFiltro>
    </>
  );
}
