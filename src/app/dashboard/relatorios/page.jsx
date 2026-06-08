"use client";

import { getActiveLanguage } from "@/lib/i18n-core";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRightLeft,
  Building2,
  Check,
  Clock,
  Download,
  Filter,
  Loader2,
  Search,
  Users,
  X,
} from "lucide-react";
import EntradasChart from "@/components/EntradasChart";
import EmpresasMaisVisitas from "@/components/EmpresasMaisVisitas";
import SetoresMaisVisitados from "@/components/SetoresMaisVisitados";
import StatCard from "@/components/StatCard";
import TiposVisitantesChart from "@/components/TiposVisitantesChart";
import Topbar from "@/components/Topbar";
import ModalFiltro from "@/components/ui/ModalFiltro";
import PaginationControls from "@/components/ui/PaginationControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { usePagination } from "@/hooks/usePagination";
import { exportTableToPdf } from "@/lib/exportPdf";
import { formatCPF } from "@/lib/utils";
import { api } from "@/services/api";

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "finalizado", label: "Finalizado" },
  { value: "alerta", label: "Alerta" },
];

const STATUS_LABEL = {
  em_andamento: "Em andamento",
  finalizado: "Finalizado",
  alerta: "Alerta",
};

const STATUS_STYLE = {
  em_andamento: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  finalizado: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  alerta: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300",
};

const EMPTY_RELATORIO = {
  resumo: {
    totalAcessos: 0,
    entradas: 0,
    saidas: 0,
    dentro: 0,
    taxaCheckout: 0,
    tempoMedio: "-",
    alertas: 0,
    empresasAcessadas: 0,
  },
  series: {
    porDia: [],
    porHora: [],
  },
  rankings: {
    setores: [],
    empresas: [],
    status: [],
    tipos: [],
  },
  registros: [],
  filtrosDisponiveis: {
    setores: [],
    empresas: [],
  },
};

function toDateInputValue(date) {
  const normalized = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return normalized.toISOString().slice(0, 10);
}

function getDefaultFilters() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);

  return {
    inicio: toDateInputValue(start),
    fim: toDateInputValue(end),
    busca: "",
    setor: "",
    empresa: "",
    status: "todos",
  };
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(getActiveLanguage(), {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(getActiveLanguage(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function normalizePayload(payload) {
  const rankings = payload?.rankings || {};

  return {
    ...EMPTY_RELATORIO,
    ...(payload || {}),
    resumo: {
      ...EMPTY_RELATORIO.resumo,
      ...(payload?.resumo || {}),
    },
    series: {
      ...EMPTY_RELATORIO.series,
      ...(payload?.series || {}),
    },
    rankings: {
      ...EMPTY_RELATORIO.rankings,
      setores: Array.isArray(rankings.setores) ? rankings.setores : [],
      empresas: Array.isArray(rankings.empresas) ? rankings.empresas : [],
      status: Array.isArray(rankings.status) ? rankings.status : [],
      tipos: Array.isArray(rankings.tipos) ? rankings.tipos : [],
    },
    filtrosDisponiveis: {
      ...EMPTY_RELATORIO.filtrosDisponiveis,
      ...(payload?.filtrosDisponiveis || {}),
    },
    registros: Array.isArray(payload?.registros) ? payload.registros : [],
  };
}

function buildQuery(filters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      params.set(key, String(value).trim());
    }
  });

  return params.toString();
}

function getStatusLabel(value) {
  return STATUS_LABEL[value] || value || "-";
}

export default function RelatoriosPage() {
  const defaultFilters = useMemo(() => getDefaultFilters(), []);
  const [filters, setFilters] = useState(defaultFilters);
  const [tempFilters, setTempFilters] = useState(defaultFilters);
  const [buscaInput, setBuscaInput] = useState(defaultFilters.busca);
  const [relatorio, setRelatorio] = useState(EMPTY_RELATORIO);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);

  const carregarRelatorios = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError("");

    try {
      const query = buildQuery(filters);
      const response = await api.get(`/relatorios/acessos${query ? `?${query}` : ""}`);

      if (!response.sucesso) {
        throw new Error(response.mensagem || "Não foi possível carregar os relatórios.");
      }

      setRelatorio(normalizePayload(response.data));
    } catch (err) {
      setRelatorio(EMPTY_RELATORIO);
      setError(err.message || "Não foi possível carregar os relatórios.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    carregarRelatorios();
  }, [carregarRelatorios]);

  useAutoRefresh(carregarRelatorios, { immediate: false });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFilters((current) => {
        if (current.busca === buscaInput) return current;
        return { ...current, busca: buscaInput };
      });
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [buscaInput]);

  const {
    page,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems: registrosPagina,
  } = usePagination(relatorio.registros);

  const filtrosAtivos = useMemo(() => {
    const labels = [
      filters.inicio || filters.fim ? `Periodo: ${formatDate(filters.inicio)} a ${formatDate(filters.fim)}` : null,
      filters.busca ? `Busca: ${filters.busca}` : null,
      filters.setor ? `Setor: ${filters.setor}` : null,
      filters.empresa ? `Empresa: ${filters.empresa}` : null,
      filters.status !== "todos" ? `Status: ${getStatusLabel(filters.status)}` : null,
    ].filter(Boolean);

    return labels;
  }, [filters]);

  const filtrosNaoBusca = useMemo(
    () =>
      [
        filters.setor,
        filters.empresa,
        filters.status !== "todos" ? filters.status : "",
        filters.inicio !== defaultFilters.inicio || filters.fim !== defaultFilters.fim ? "periodo" : "",
      ].filter(Boolean).length,
    [defaultFilters.fim, defaultFilters.inicio, filters]
  );

  const aplicarFiltros = () => {
    setFilters((current) => ({
      ...current,
      inicio: tempFilters.inicio,
      fim: tempFilters.fim,
      setor: tempFilters.setor,
      empresa: tempFilters.empresa,
      status: tempFilters.status,
    }));
  };

  const limparFiltros = () => {
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    setBuscaInput("");
  };

  const abrirFiltros = () => {
    setTempFilters(filters);
    setModalFiltroAberto(true);
  };

  async function exportarPDF() {
    if (relatorio.registros.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    try {
      await exportTableToPdf({
        title: "Relatório de acessos",
        subtitle: "Acessos filtrados no painel administrativo",
        fileName: `relatorio_acessos_${new Date().toISOString().split("T")[0]}.pdf`,
        filters: filtrosAtivos,
        columns: [
          { header: "Pessoa", weight: 1.3 },
          { header: "CPF", weight: 0.9 },
          { header: "Tipo", weight: 0.8 },
          { header: "Empresa", weight: 1.1 },
          { header: "Setor", weight: 1.1 },
          { header: "Entrada", weight: 1.1 },
          { header: "Saída", weight: 1.1 },
          { header: "Permanência", weight: 0.8 },
          { header: "Status", weight: 0.9 },
        ],
        rows: relatorio.registros.map((registro) => [
          registro.visitante,
          formatCPF(registro.cpf) || "-",
          registro.tipo || "-",
          registro.empresa || "-",
          registro.setor || "-",
          formatDateTime(registro.entrada),
          formatDateTime(registro.saida),
          registro.permanencia || "-",
          registro.statusLabel || getStatusLabel(registro.status),
        ]),
      });
    } catch (err) {
      console.error("Erro ao exportar PDF:", err);
      alert("Não foi possível exportar o PDF.");
    }
  }

  const resumo = relatorio.resumo;
  const filtrosRelatorio = (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-1 items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Buscar por pessoa, CPF, empresa, setor ou status..."
              value={buscaInput}
              onChange={(event) => setBuscaInput(event.target.value)}
              className="h-11 rounded-xl border-border/60 bg-background/80 pl-10 text-sm"
            />
            {buscaInput && (
              <button
                type="button"
                onClick={() => setBuscaInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                aria-label="Limpar busca"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={abrirFiltros}
            className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-4"
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filtros</span>
            {filtrosNaoBusca > 0 && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                {filtrosNaoBusca}
              </span>
            )}
          </Button>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
          <Button
            type="button"
            onClick={exportarPDF}
            variant="outline"
            disabled={loading || relatorio.registros.length === 0}
            className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-4 text-sm font-medium"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Exportar PDF</span>
          </Button>
          <div className="rounded-xl border border-border/50 bg-muted/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground">
            {relatorio.registros.length} resultado(s)
          </div>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {filtrosAtivos.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Filtros ativos:
          </span>
          {filtrosAtivos.map((label) => (
            <span
              key={label}
              className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary"
            >
              {label}
            </span>
          ))}
          <Button
            type="button"
            variant="ghost"
            onClick={limparFiltros}
            className="h-7 px-2 text-[10px] text-muted-foreground hover:bg-transparent hover:text-foreground"
          >
            Limpar tudo
          </Button>
        </div>
      )}
    </section>
  );

  return (
    <div className="flex w-full flex-col gap-6 overflow-x-hidden pb-10 animate-in fade-in duration-700">
      <Topbar
        title="Relatórios de Acessos"
        subtitle="Análise administrativa de entradas, saídas, permanência, setores e empresas."
      />

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Acessos no periodo"
          value={resumo.totalAcessos}
          valueClassName="text-primary"
          icon={<Users size={17} className="text-primary" />}
          sub={`${resumo.dentro} pessoa(s) em andamento`}
          accentVar="var(--primary)"
        />
        <StatCard
          label="Taxa de check-out"
          value={`${resumo.taxaCheckout}%`}
          valueClassName="text-secondary"
          icon={<ArrowRightLeft size={17} className="text-secondary" />}
          sub={`${resumo.saidas} saida(s) registradas`}
          accentVar="var(--chart-2)"
        />
        <StatCard
          label="Tempo medio"
          value={resumo.tempoMedio}
          valueClassName="text-foreground"
          icon={<Clock size={17} className="text-foreground" />}
          sub="Somente acessos finalizados"
          accentVar="var(--chart-4)"
        />
        <StatCard
          label="Empresas acessadas"
          value={resumo.empresasAcessadas}
          valueClassName="text-foreground"
          icon={<Building2 size={17} className="text-foreground" />}
          sub="Com acesso no periodo"
          accentVar="var(--chart-5)"
        />
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm font-medium">Carregando relatorios...</p>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.85fr)]">
            <EntradasChart
              title="Volume de acessos"
              subtitle="Entradas agrupadas pelo periodo filtrado"
              data={relatorio.series.porDia}
              showPeriodToggle={false}
              emptyMessage="Nenhum acesso encontrado para os filtros atuais."
            />
            <TiposVisitantesChart
              title="Status dos acessos"
              subtitle="Distribuicao dos registros filtrados"
              data={relatorio.rankings.status}
              showPeriodToggle={false}
              emptyMessage="Nenhum status encontrado."
            />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <SetoresMaisVisitados title="Setores mais visitados" data={relatorio.rankings.setores} />
            <EmpresasMaisVisitas title="Empresas com mais acessos" data={relatorio.rankings.empresas} />
          </section>

          {filtrosRelatorio}

          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-2 border-b border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground">Registros detalhados</h2>
                <p className="text-xs text-muted-foreground">Acessos retornados pelo backend com os filtros atuais.</p>
              </div>
              <div className="text-xs font-semibold text-muted-foreground">
                Página {page} de {totalPages}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Pessoa</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Empresa</th>
                    <th className="px-4 py-3">Setor</th>
                    <th className="px-4 py-3">Entrada</th>
                    <th className="px-4 py-3">Saída</th>
                    <th className="px-4 py-3">Permanência</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {registrosPagina.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center text-sm text-muted-foreground">
                        Nenhum registro encontrado com os filtros atuais.
                      </td>
                    </tr>
                  ) : (
                    registrosPagina.map((registro) => (
                      <tr key={registro.id} className="transition-colors hover:bg-muted/35">
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-foreground">{registro.visitante || "-"}</p>
                          <p className="font-mono text-xs text-muted-foreground">{formatCPF(registro.cpf) || "-"}</p>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-muted-foreground">{registro.tipo || "-"}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{registro.empresa || "-"}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{registro.setor || "-"}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-foreground">
                          {formatDateTime(registro.entrada)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                          {formatDateTime(registro.saida)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-foreground">{registro.permanencia || "-"}</td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              STATUS_STYLE[registro.status] || "bg-muted text-muted-foreground"
                            }`}
                          >
                            {registro.statusLabel || getStatusLabel(registro.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <PaginationControls
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              currentCount={registrosPagina.length}
              onPageChange={setPage}
              itemLabel="registro(s)"
            />
          </section>
        </>
      )}

      <ModalFiltro
        isOpen={modalFiltroAberto}
        onClose={() => setModalFiltroAberto(false)}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Inicio">
              <Input
                type="date"
                value={tempFilters.inicio}
                onChange={(event) => setTempFilters((current) => ({ ...current, inicio: event.target.value }))}
                className="h-11 rounded-xl"
              />
            </Field>
            <Field label="Fim">
              <Input
                type="date"
                value={tempFilters.fim}
                onChange={(event) => setTempFilters((current) => ({ ...current, fim: event.target.value }))}
                className="h-11 rounded-xl"
              />
            </Field>
          </div>

          <Field label="Status">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTempFilters((current) => ({ ...current, status: option.value }))}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold transition-all ${
                    tempFilters.status === option.value
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  {option.label}
                  {tempFilters.status === option.value && <Check size={14} />}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Setor">
            <select
              value={tempFilters.setor}
              onChange={(event) => setTempFilters((current) => ({ ...current, setor: event.target.value }))}
              className="h-11 w-full rounded-xl border border-border/60 bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Todos os setores</option>
              {relatorio.filtrosDisponiveis.setores.map((setor) => (
                <option key={setor} value={setor}>
                  {setor}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Empresa">
            <select
              value={tempFilters.empresa}
              onChange={(event) => setTempFilters((current) => ({ ...current, empresa: event.target.value }))}
              className="h-11 w-full rounded-xl border border-border/60 bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Todas as empresas</option>
              {relatorio.filtrosDisponiveis.empresas.map((empresa) => (
                <option key={empresa} value={empresa}>
                  {empresa}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </ModalFiltro>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}
