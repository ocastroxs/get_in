"use client";

import { getActiveLanguage } from "@/lib/i18n-core";
import { useMemo, useState } from "react";
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
import ModalPortal from "@/components/ui/ModalPortal";
import PaginationControls from "@/components/ui/PaginationControls";
import StatCard from "@/components/StatCard";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { usePagination } from "@/hooks/usePagination";
import { api } from "@/services/api";
import { exportTableToPdf } from "@/lib/exportPdf";
import { useToast } from "@/components/ui/toast-provider";
import {
  dedupeRequisicoesPorVisitante as dedupePortariaRequisicoes,
  formatCPF,
  formatPhone,
  getResponseArray as getPortariaResponseArray,
  hasObservacaoRelevante as hasPortariaObservacaoRelevante,
  normalizePendencia,
  onlyDigits as onlyPortariaDigits,
} from "@/lib/portaria-data";

function ModalObservacoes({ isOpen, onClose, requisicao }) {
  if (!isOpen || !requisicao) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg animate-in zoom-in-95 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl duration-300">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Observação da portaria</h2>
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

        <div className="max-h-[70vh] overflow-y-auto p-5" data-lenis-prevent>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-5 shadow-xs dark:border-blue-500/20 dark:bg-blue-950/30">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-200">Registro da portaria</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-blue-950 dark:text-blue-100">
              {requisicao.observacoes || "Nenhuma observação cadastrada."}
            </p>
          </div>
        </div>

        <div className="border-t border-border bg-muted/10 p-4">
          <Button variant="outline" onClick={onClose} className="h-11 w-full rounded-xl" type="button">
            Fechar
          </Button>
        </div>
        </div>
      </div>
    </ModalPortal>
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
          Observação
        </Button>
      </td>
    </tr>
  );
}

export default function PendenciasPage() {
  const { showToast } = useToast();
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [requisicaoSelecionada, setRequisicaoSelecionada] = useState(null);
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [filtroSetor, setFiltroSetor] = useState("Todos");
  const [tempFiltroSetor, setTempFiltroSetor] = useState("Todos");

  useAutoRefresh(fetchRequisicoes);

  async function fetchRequisicoes({ silent = false } = {}) {
    try {
      if (!silent) setLoading(true);
      const response = await api.get("/portaria/pendencias");
      const pendencias = getPortariaResponseArray(response, ["dados", "requisicoes"])
        .map(normalizePendencia)
        .filter((requisicao) => requisicao.status === "pendente");

      setRequisicoes(dedupePortariaRequisicoes(pendencias));
    } catch (error) {
      console.error("Erro ao carregar pendencias:", error);
      setRequisicoes([]);
    } finally {
      setLoading(false);
    }
  }

  const requisicoesFiltradas = useMemo(() => {
    const termoBusca = busca.toLowerCase();
    const termoBuscaDigitos = onlyPortariaDigits(busca);

    return requisicoes.filter((requisicao) => {
      const cpfDigitos = onlyPortariaDigits(requisicao.cpf);
      const telefoneDigitos = onlyPortariaDigits(requisicao.telefone);
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

  const {
    page,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems: requisicoesPagina,
  } = usePagination(requisicoesFiltradas);

  const setoresUnicos = useMemo(() => {
    const setores = requisicoes.flatMap((requisicao) =>
      requisicao.setoresLista?.length > 0 ? requisicao.setoresLista : [requisicao.setor]
    );

    return [
      "Todos",
      ...Array.from(new Set(setores.filter((setor) => setor && setor !== "-"))).sort((a, b) =>
        a.localeCompare(b, getActiveLanguage())
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
      showToast({
        type: "info",
        title: "Nada para exportar",
        description: "Não há pendências com os filtros atuais.",
      });
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
          { header: "Setor responsável", weight: 1.1 },
          { header: "Setores permitidos", weight: 1.1 },
          { header: "Motivo", weight: 1.5 },
          { header: "Contato", weight: 1.2 },
          { header: "Solicitação", weight: 1 },
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
      showToast({
        type: "error",
        title: "Erro ao exportar PDF",
        description: "Não foi possível gerar o arquivo agora.",
      });
    }
  };

  const stats = useMemo(() => {
    const setoresPermitidos = new Set(
      requisicoes
        .flatMap((requisicao) => requisicao.setoresLista || [])
        .filter((setor) => setor && setor !== "-")
    );
    const comObservacao = requisicoes.filter((requisicao) => hasPortariaObservacaoRelevante(requisicao.observacoes)).length;
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
              <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100">Requisições pendentes</h3>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
              A lista considera visitantes ainda dentro do prazo de 24h e separa setor responsável de setores permitidos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            label="Total pendentes"
            value={stats.totalPendentes}
            icon={<AlertTriangle size={18} className="text-amber-600" />}
            accentVar="#d97706"
            sub="Aguardando aprovação"
          />
          <StatCard
            label="Setores permitidos"
            value={stats.setoresPermitidos}
            icon={<MapPin size={18} className="text-blue-600" />}
            accentVar="#2563eb"
            sub="Envolvidos nas solicitações"
          />
          <StatCard
            label="Com observação"
            value={stats.comObservacao}
            icon={<FileText size={18} className="text-amber-600" />}
            accentVar="#d97706"
            sub="Contexto adicional da portaria"
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center lg:flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar por nome, CPF, telefone, empresa, setor responsável, setor permitido ou motivo..."
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

            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
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
            <h3 className="text-sm font-bold">Lista de Pendências</h3>
            <p className="text-xs text-muted-foreground">{requisicoesFiltradas.length} visitante(s) encontrados</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Visitante</th>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Setor responsável</th>
                  <th className="px-4 py-3">Setores permitidos</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3">Contato</th>
                  <th className="px-4 py-3">Solicitação</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading && requisicoes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm">Carregando pendências...</span>
                      </div>
                    </td>
                  </tr>
                ) : requisicoesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center text-sm text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="h-12 w-12 text-muted/30" />
                        <p>Nenhuma requisição pendente encontrada.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requisicoesPagina.map((requisicao) => (
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
          {!loading && requisicoesFiltradas.length > 0 && (
            <PaginationControls
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              currentCount={requisicoesPagina.length}
              onPageChange={setPage}
              itemLabel="pendência(s)"
            />
          )}
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
                Nenhum setor permitido disponível para filtrar nas pendências atuais.
              </p>
            </div>
          )}
        </div>
      </ModalFiltro>
    </>
  );
}
