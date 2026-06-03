"use client";

import { getActiveLanguage } from "@/lib/i18n-core";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  Download,
  Filter,
  Loader2,
  MoreHorizontal,
  Navigation,
  Search,
  Users,
  X,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Topbar from "@/components/Topbar";
import ModalFiltro from "@/components/ui/ModalFiltro";
import PaginationControls from "@/components/ui/PaginationControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { usePagination } from "@/hooks/usePagination";
import { exportTableToPdf } from "@/lib/exportPdf";
import { api } from "@/services/api";

const STATUS_STYLE = {
  Ativo: "bg-green-100 text-green-700",
  "Concluído": "bg-blue-100 text-blue-700",
  Alerta: "bg-red-100 text-red-700",
};

const STATUS_DOT = {
  Ativo: "bg-green-500",
  "Concluído": "bg-blue-500",
  Alerta: "bg-red-500",
};

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatarHora(value) {
  if (!value) return "-";
  const data = new Date(value);
  if (Number.isNaN(data.getTime())) return value;
  return data.toLocaleTimeString(getActiveLanguage(), { hour: "2-digit", minute: "2-digit" });
}

function normalizarLog(log) {
  const ativo = log.dataDeEntrada && !log.dataDeSaida;

  return {
    ...log,
    id: log.log_id || log.id,
    idSetor: log.id_setor || log.idSetor || null,
    pessoa: log.usuario_nome || log.pessoa || "Usuário",
    tipo: log.tipo_usuario || (log.usuario_cpf ? "Visitante" : "Usuário"),
    origem: log.local_dispositivo || "Acesso",
    destino: log.setor_dispositivo || log.departamento_usuario || log.destino || "Setor",
    horario: formatarHora(log.dataDeEntrada),
    status: ativo ? "Ativo" : "Concluído",
  };
}

function LinhaCirculacao({ reg }) {
  if (!reg) return null;

  return (
    <tr className="border-b border-border transition-colors duration-300 hover:bg-primary/[0.035]">
      <td className="px-4 py-3">
        <p className="text-xs font-bold leading-none">{reg.pessoa || "-"}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">{reg.tipo || "-"}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] font-medium">
          <span className="text-muted-foreground">{reg.origem || "-"}</span>
          <ArrowRight size={12} className="text-muted-foreground" />
          <span className="text-foreground">{reg.destino || "-"}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-[11px] font-bold">{reg.horario || "-"}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[reg.status] ?? "bg-gray-100 text-gray-700"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[reg.status] ?? "bg-gray-400"}`} />
          {reg.status || "-"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" aria-label="Mais opções">
          <MoreHorizontal size={12} className="text-muted-foreground" />
        </Button>
      </td>
    </tr>
  );
}

export default function CirculacaoPage() {
  const [circulacao, setCirculacao] = useState([]);
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempFiltroStatus, setTempFiltroStatus] = useState("Todos");

  const carregarDados = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);

    try {
      const [responseLogs, responseSetores] = await Promise.all([
        api.get("/views/logs"),
        api.get("/setores"),
      ]);

      if (responseLogs.sucesso) {
        setCirculacao((responseLogs.data || []).map(normalizarLog));
      }

      if (responseSetores.sucesso) {
        setSetores(responseSetores.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados de circulação:", error);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(carregarDados);

  const registrosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return circulacao.filter((reg) => {
      const matchesBusca =
        !termo ||
        (reg.pessoa || "").toLowerCase().includes(termo) ||
        (reg.origem || "").toLowerCase().includes(termo) ||
        (reg.destino || "").toLowerCase().includes(termo);
      const matchesStatus = filtroStatus === "Todos" || reg.status === filtroStatus;

      return matchesBusca && matchesStatus;
    });
  }, [circulacao, busca, filtroStatus]);

  const setoresComOcupacao = useMemo(() => {
    const maxUsuarios = Math.max(...setores.map((setor) => toNumber(setor.usuariosCadastrados)), 1);

    return setores.map((setor) => {
      const usuarios = toNumber(setor.usuariosCadastrados);

      return {
        ...setor,
        usuariosCadastrados: usuarios,
        funcionariosCadastrados: toNumber(setor.funcionariosCadastrados),
        visitantesCadastrados: toNumber(setor.visitantesCadastrados),
        percentual: Math.round((usuarios / maxUsuarios) * 100),
      };
    });
  }, [setores]);

  const stats = useMemo(() => {
    const fluxoPorSetor = new Map();

    circulacao.forEach((registro) => {
      const nome = registro.destino || "Setor";
      fluxoPorSetor.set(nome, (fluxoPorSetor.get(nome) || 0) + 1);
    });

    const setorMaisAtivo = [...fluxoPorSetor.entries()]
      .map(([nome, movimentos]) => ({ nome, movimentos }))
      .sort((a, b) => b.movimentos - a.movimentos || a.nome.localeCompare(b.nome, "pt-BR"))[0];

    return {
      totalMovimentos: circulacao.length,
      ocupacaoAtual: circulacao.filter((r) => r.dataDeEntrada && !r.dataDeSaida).length,
      setorMaisAtivo,
      usuariosCadastrados: setores.reduce((total, setor) => total + toNumber(setor.usuariosCadastrados), 0),
    };
  }, [circulacao, setores]);

  const {
    page,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems: registrosPagina,
  } = usePagination(registrosFiltrados);

  const aplicarFiltros = () => {
    setFiltroStatus(tempFiltroStatus);
  };

  const limparFiltros = () => {
    setTempFiltroStatus("Todos");
    setFiltroStatus("Todos");
    setBusca("");
  };

  async function exportarPDF() {
    if (registrosFiltrados.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    try {
      await exportTableToPdf({
        title: "Circulação Interna",
        subtitle: "Monitoramento de fluxo e ocupação em tempo real",
        fileName: `circulacao_${new Date().toISOString().split("T")[0]}.pdf`,
        filters: [
          busca ? `Busca: ${busca}` : null,
          filtroStatus !== "Todos" ? `Status: ${filtroStatus}` : null,
        ].filter(Boolean),
        columns: [
          { header: "Pessoa", weight: 1.3 },
          { header: "Origem", weight: 1.1 },
          { header: "Destino", weight: 1.1 },
          { header: "Horário", weight: 0.8 },
          { header: "Status", weight: 0.8 },
        ],
        rows: registrosFiltrados.map((registro) => [
          registro.pessoa || "-",
          registro.origem || "-",
          registro.destino || "-",
          registro.horario || "-",
          registro.status || "-",
        ]),
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Não foi possível exportar o PDF.");
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <Topbar
        title="Circulação Interna"
        subtitle="Monitoramento de fluxo e ocupação em tempo real"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Movimentações"
          value={stats.totalMovimentos}
          valueClassName="text-primary"
          icon={<Activity size={17} className="text-primary" />}
          sub="registros carregados"
          accentVar="var(--primary)"
        />
        <StatCard
          label="Ocupação Atual"
          value={stats.ocupacaoAtual}
          valueClassName="text-secondary"
          icon={<Users size={17} className="text-secondary" />}
          sub="pessoas dentro"
          accentVar="var(--chart-2)"
        />
        <StatCard
          label="Setor Mais Ativo"
          value={stats.setorMaisAtivo?.nome || "-"}
          valueClassName="text-foreground font-bold text-sm"
          icon={<Navigation size={17} className="text-foreground" />}
          sub={`${stats.setorMaisAtivo?.movimentos || 0} movimento(s)`}
          accentVar="var(--chart-4)"
        />
        <StatCard
          label="Usuários cadastrados"
          value={stats.usuariosCadastrados}
          valueClassName="text-foreground"
          icon={<Users size={17} className="text-foreground" />}
          sub="vinculados aos setores"
          accentVar="var(--border)"
        />
      </div>

      <div className="rounded-[24px] border border-border bg-card p-5 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-1 items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar pessoa ou setor..."
                className="h-11 rounded-xl border-border/60 bg-background/80 pl-10 text-sm transition-all duration-300 focus-visible:border-primary/40 focus-visible:ring-primary/20"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Limpar busca"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <Button
              type="button"
              onClick={() => setModalFiltroAberto(true)}
              variant="outline"
              className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-4 transition-all duration-300 hover:border-primary/20 hover:bg-white hover:shadow-sm"
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filtros</span>
              {filtroStatus !== "Todos" && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  1
                </span>
              )}
            </Button>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
            <Button
              type="button"
              onClick={exportarPDF}
              variant="outline"
              disabled={loading || registrosFiltrados.length === 0}
              className="h-11 gap-2 rounded-xl border-border/60 bg-background/80 px-4 text-sm font-medium"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Exportar PDF</span>
            </Button>
            <div className="rounded-xl border border-border/50 bg-muted/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground shadow-sm shadow-slate-200/20">
              {registrosFiltrados.length} resultado(s)
            </div>
          </div>
        </div>

        {(filtroStatus !== "Todos" || busca) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filtros ativos:</span>
            {busca && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Busca: {busca}
              </span>
            )}
            {filtroStatus !== "Todos" && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Status: {filtroStatus}
              </span>
            )}
            <Button
              variant="ghost"
              onClick={limparFiltros}
              className="h-7 px-2 text-[10px] text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground"
            >
              Limpar tudo
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-[24px] border border-border bg-card p-5 shadow-md lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Ocupação por Setor</h3>
            <Building2 size={16} className="text-muted-foreground" />
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-xs text-muted-foreground">Carregando...</span>
            </div>
          ) : setoresComOcupacao.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Nenhum setor encontrado</div>
          ) : (
            <div className="space-y-4">
              {setoresComOcupacao.map((setor, index) => (
                <div key={setor.id || index} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span>{setor.nome || "-"}</span>
                    <span className="text-muted-foreground">{setor.usuariosCadastrados} pessoa(s)</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {setor.funcionariosCadastrados} funcionário(s) · {setor.visitantesCadastrados} visitante(s)
                  </p>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${setor.percentual}%`,
                        backgroundColor: "var(--primary)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-md lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border bg-muted/20 p-4">
            <div>
              <h3 className="text-sm font-bold">Logs de Circulação</h3>
              <p className="text-[10px] text-muted-foreground">Últimas movimentações internas detectadas</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Pessoa</th>
                  <th className="px-4 py-3">Fluxo</th>
                  <th className="px-4 py-3">Horário</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm">Carregando registros...</span>
                      </div>
                    </td>
                  </tr>
                ) : registrosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-sm text-muted-foreground">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  registrosPagina.map((reg) => <LinhaCirculacao key={reg.id} reg={reg} />)
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
            itemLabel="log(s)"
          />
        </div>
      </div>

      <div className="flex items-start gap-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
          <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-red-800 dark:text-red-300">Sem alertas no momento</h4>
          <p className="mt-1 text-xs text-red-700 dark:text-red-400">
            Todos os visitantes estão dentro do tempo previsto de permanência.
          </p>
        </div>
      </div>

      <ModalFiltro
        isOpen={modalFiltroAberto}
        onClose={() => setModalFiltroAberto(false)}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Status da Circulação
            </label>
            <div className="grid grid-cols-1 gap-2">
              {["Todos", "Ativo", "Concluído", "Alerta"].map((status) => (
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
                  <span>{status === "Todos" ? "Todos os Status" : status}</span>
                  {tempFiltroStatus === status && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ModalFiltro>
    </div>
  );
}
