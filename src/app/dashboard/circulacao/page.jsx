"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  Clock,
  Activity,
  Users,
  ArrowRight,
  AlertTriangle,
  Building2,
  Navigation,
  Loader2,
  X,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModalFiltro from "@/components/ui/ModalFiltro";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { api } from "@/services/api";

const STATUS = {
  ATIVO: "Ativo",
  CONCLUIDO: "Concluído",
  ALERTA: "Alerta",
};

const STATUS_STYLE = {
  [STATUS.ATIVO]: "bg-green-100 text-green-700",
  [STATUS.CONCLUIDO]: "bg-blue-100 text-blue-700",
  [STATUS.ALERTA]: "bg-red-100 text-red-700",
};

const STATUS_DOT = {
  [STATUS.ATIVO]: "bg-green-500",
  [STATUS.CONCLUIDO]: "bg-blue-500",
  [STATUS.ALERTA]: "bg-red-500",
};

const STATUS_OPTIONS = ["Todos", STATUS.ATIVO, STATUS.CONCLUIDO, STATUS.ALERTA];
const LIMITE_ALERTA_HORAS = 8;
const LOGS_POR_PAGINA = 8;

function normalizarArrayResponse(response, keys = []) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.dados)) return response.dados;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
    if (Array.isArray(response?.data?.[key])) return response.data[key];
    if (Array.isArray(response?.dados?.[key])) return response.dados[key];
  }

  return [];
}

function parseData(value) {
  if (!value) return null;

  const texto = String(value);
  const normalizada = texto.includes(" ") && !texto.includes("T") ? texto.replace(" ", "T") : texto;
  const data = new Date(normalizada);

  return Number.isNaN(data.getTime()) ? null : data;
}

function isHoje(data, referencia = new Date()) {
  if (!data) return false;

  return (
    data.getFullYear() === referencia.getFullYear() &&
    data.getMonth() === referencia.getMonth() &&
    data.getDate() === referencia.getDate()
  );
}

function formatarDataHora(value) {
  const data = parseData(value);
  if (!data) return "-";

  const diaMes = data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  const hora = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${diaMes} ${hora}`;
}

function formatarDuracao(ms) {
  if (!ms || ms < 0) return "-";

  const minutos = Math.max(1, Math.round(ms / 60000));
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;

  return horas > 0 ? `${horas}h ${resto}m` : `${resto}m`;
}

function getLogId(log) {
  return log?.log_id ?? log?.id ?? log?.idLog ?? null;
}

function getStatusCirculacao(entrada, saida, agora = new Date()) {
  const entradaData = parseData(entrada);
  const saidaData = parseData(saida);

  if (saidaData) return STATUS.CONCLUIDO;
  if (entradaData && (agora - entradaData) / (1000 * 60 * 60) >= LIMITE_ALERTA_HORAS) {
    return STATUS.ALERTA;
  }

  return STATUS.ATIVO;
}

function criarMapPorId(items, getId = (item) => item?.id) {
  return new Map(
    items
      .map((item) => [getId(item), item])
      .filter(([id]) => id !== undefined && id !== null)
  );
}

function normalizarCirculacaoItem(log, contexto, index) {
  const { logsPorId, dispositivosPorId, setoresPorId } = contexto;
  const id = getLogId(log) ?? `log-${index}`;
  const logOriginal = logsPorId.get(id) || {};
  const dispositivo = dispositivosPorId.get(logOriginal.idDispositivo) || {};
  const setorDestino = setoresPorId.get(dispositivo.idSetor) || {};
  const entrada = log.dataDeEntrada ?? log.entrada ?? logOriginal.dataDeEntrada;
  const saida = log.dataDeSaida ?? log.saida ?? logOriginal.dataDeSaida;
  const destino =
    setorDestino.nome ||
    log.setor_dispositivo ||
    log.setorDestino ||
    log.local_dispositivo ||
    dispositivo.local ||
    "-";
  const origem =
    log.departamento_usuario ||
    log.setor_usuario ||
    log.origem ||
    "Portaria";
  const entradaData = parseData(entrada);
  const saidaData = parseData(saida);
  const duracaoMs = entradaData && saidaData ? saidaData - entradaData : null;

  return {
    id,
    idUsuario: log.idUsuario ?? log.usuario_id ?? logOriginal.idUsuario,
    idDispositivo: logOriginal.idDispositivo,
    idSetorDestino: dispositivo.idSetor ?? setorDestino.id,
    pessoa: log.usuario_nome || log.visitante_nome || log.nome || `Usuário ${logOriginal.idUsuario || ""}`.trim(),
    tipo: log.usuario_cpf ? `CPF ${log.usuario_cpf}` : "Usuário cadastrado",
    origem,
    destino,
    localDispositivo: log.local_dispositivo || dispositivo.local || "-",
    dataDeEntrada: entrada,
    dataDeSaida: saida,
    horario: entrada ? formatarDataHora(entrada) : "-",
    saidaFormatada: saida ? formatarDataHora(saida) : "-",
    tempo: formatarDuracao(duracaoMs),
    status: getStatusCirculacao(entrada, saida),
    ativo: !!entradaData && !saidaData,
  };
}

function normalizarCirculacao(logsDetalhados, logs, dispositivos, setores) {
  const logsPorId = criarMapPorId(logs);
  const dispositivosPorId = criarMapPorId(dispositivos);
  const setoresPorId = criarMapPorId(setores);
  const baseLogs = logsDetalhados.length > 0 ? logsDetalhados : logs;

  return baseLogs
    .map((log, index) =>
      normalizarCirculacaoItem(log, { logsPorId, dispositivosPorId, setoresPorId }, index)
    )
    .sort((a, b) => {
      const dataA = parseData(a.dataDeEntrada)?.getTime() || 0;
      const dataB = parseData(b.dataDeEntrada)?.getTime() || 0;
      return dataB - dataA;
    });
}

function toCSV(rows) {
  const cols = ["Pessoa", "Origem", "Destino", "Entrada", "Saida", "Tempo", "Status"];
  const lines = rows.map((r) =>
    [
      r.pessoa || "-",
      r.origem || "-",
      r.destino || "-",
      r.horario || "-",
      r.saidaFormatada || "-",
      r.tempo || "-",
      r.status || "-",
    ].join(";")
  );

  return [cols.join(";"), ...lines].join("\n");
}

function downloadCSV(data) {
  const blob = new Blob([toCSV(data)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "circulacao.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function LinhaCirculacao({ reg }) {
  if (!reg) return null;

  return (
    <tr className="group h-[60px] border-b border-border transition-colors duration-300 hover:bg-primary/[0.035]">
      <td className="px-4 py-2 align-middle">
        <p className="truncate text-xs font-bold leading-none">{reg.pessoa || "-"}</p>
        <p className="mt-1 truncate text-[10px] text-muted-foreground">{reg.tipo || "-"}</p>
      </td>
      <td className="px-4 py-2 align-middle">
        <div className="flex min-w-0 items-center gap-2 text-[11px] font-medium">
          <span className="truncate text-muted-foreground">{reg.origem || "-"}</span>
          <ArrowRight size={12} className="text-muted-foreground" />
          <span className="truncate text-foreground">{reg.destino || "-"}</span>
        </div>
        <p className="mt-1 truncate text-[10px] text-muted-foreground">Dispositivo: {reg.localDispositivo || "-"}</p>
      </td>
      <td className="whitespace-nowrap px-4 py-2 align-middle text-[11px] font-bold">
        <span>{reg.horario || "-"}</span>
        {reg.saidaFormatada !== "-" && (
          <span className="ml-2 font-medium text-muted-foreground">saída {reg.saidaFormatada}</span>
        )}
      </td>
      <td className="px-4 py-2 align-middle">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            STATUS_STYLE[reg.status] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[reg.status] ?? "bg-gray-400"}`} />
          {reg.status || "-"}
        </span>
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
  const [paginaAtual, setPaginaAtual] = useState(1);

  const carregarDados = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);

    try {
      const [logsDetalhadosResponse, logsResponse, setoresResponse, dispositivosResponse] =
        await Promise.all([
          api.get("/views/logs"),
          api.get("/logs"),
          api.get("/setores"),
          api.get("/dispositivos"),
        ]);

      const logsDetalhados = normalizarArrayResponse(logsDetalhadosResponse, ["logs"]);
      const logs = normalizarArrayResponse(logsResponse, ["logs"]);
      const setoresData = normalizarArrayResponse(setoresResponse, ["setores"]);
      const dispositivos = normalizarArrayResponse(dispositivosResponse, ["dispositivos"]);

      setSetores(setoresData);
      setCirculacao(normalizarCirculacao(logsDetalhados, logs, dispositivos, setoresData));
    } catch (error) {
      console.error("Erro ao carregar dados de circulacao:", error);
      setCirculacao([]);
      setSetores([]);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(carregarDados);

  const registrosFiltrados = useMemo(() => {
    const termoBusca = busca.trim().toLowerCase();

    return circulacao.filter((reg) => {
      const matchesBusca =
        !termoBusca ||
        (reg.pessoa || "").toLowerCase().includes(termoBusca) ||
        (reg.origem || "").toLowerCase().includes(termoBusca) ||
        (reg.destino || "").toLowerCase().includes(termoBusca) ||
        (reg.localDispositivo || "").toLowerCase().includes(termoBusca);

      const matchesStatus = filtroStatus === "Todos" || reg.status === filtroStatus;

      return matchesBusca && matchesStatus;
    });
  }, [circulacao, busca, filtroStatus]);

  const totalPaginas = Math.max(1, Math.ceil(registrosFiltrados.length / LOGS_POR_PAGINA));
  const paginaNormalizada = Math.min(paginaAtual, totalPaginas);
  const inicioPagina = (paginaNormalizada - 1) * LOGS_POR_PAGINA;
  const fimPagina = Math.min(inicioPagina + LOGS_POR_PAGINA, registrosFiltrados.length);
  const registrosPaginados = registrosFiltrados.slice(inicioPagina, fimPagina);
  const linhasVazias = Math.max(0, LOGS_POR_PAGINA - registrosPaginados.length);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroStatus]);

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [paginaAtual, totalPaginas]);

  const ocupacaoPorSetor = useMemo(() => {
    const porSetor = new Map();

    circulacao.forEach((registro) => {
      const chave = registro.idSetorDestino || registro.destino;
      if (!chave || registro.destino === "-") return;

      const atual = porSetor.get(chave) || {
        id: registro.idSetorDestino || chave,
        nome: registro.destino,
        ocupacaoAtual: 0,
        movimentos: 0,
      };

      atual.movimentos += 1;
      if (registro.ativo) atual.ocupacaoAtual += 1;
      porSetor.set(chave, atual);
    });

    setores.forEach((setor) => {
      if (!porSetor.has(setor.id)) {
        porSetor.set(setor.id, {
          id: setor.id,
          nome: setor.nome || "-",
          ocupacaoAtual: 0,
          movimentos: 0,
        });
      }
    });

    return [...porSetor.values()].sort((a, b) => b.ocupacaoAtual - a.ocupacaoAtual || b.movimentos - a.movimentos);
  }, [circulacao, setores]);

  const stats = useMemo(() => {
    const hoje = new Date();
    const movimentosHoje = circulacao.filter((r) => isHoje(parseData(r.dataDeEntrada), hoje));
    const ativos = circulacao.filter((r) => r.ativo);
    const duracoes = circulacao
      .map((r) => {
        const entrada = parseData(r.dataDeEntrada);
        const saida = parseData(r.dataDeSaida);
        return entrada && saida ? saida - entrada : null;
      })
      .filter((valor) => valor && valor > 0);
    const setorMaisAtivo = ocupacaoPorSetor[0] || {};
    const tempoMedio =
      duracoes.length > 0
        ? formatarDuracao(duracoes.reduce((total, valor) => total + valor, 0) / duracoes.length)
        : "-";

    return {
      totalMovimentos: movimentosHoje.length,
      ocupacaoAtual: ativos.length,
      setorMaisAtivo,
      tempoMedio,
      alertas: ativos.filter((r) => r.status === STATUS.ALERTA).length,
    };
  }, [circulacao, ocupacaoPorSetor]);

  const maiorOcupacao = Math.max(...ocupacaoPorSetor.map((setor) => setor.ocupacaoAtual), 1);

  const aplicarFiltros = () => {
    setFiltroStatus(tempFiltroStatus);
  };

  const limparFiltros = () => {
    setTempFiltroStatus("Todos");
    setFiltroStatus("Todos");
    setBusca("");
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <Topbar
        title="Circulação Interna"
        subtitle="Monitoramento de fluxo e ocupação integrado aos logs do banco."
        secondaryButtonText="Atualizar"
        onSecondaryButtonClick={carregarDados}
        buttonText="Exportar CSV"
        onButtonClick={() => downloadCSV(registrosFiltrados)}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Movimentações"
          value={stats.totalMovimentos}
          valueClassName="text-primary"
          icon={<Activity size={17} className="text-primary" />}
          sub="hoje"
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
          label="Tempo Médio"
          value={stats.tempoMedio}
          valueClassName="text-muted-foreground"
          icon={<Clock size={17} className="text-muted-foreground" />}
          sub="por permanência"
          accentVar="var(--border)"
        />
      </div>

      <div className="rounded-[24px] border border-border bg-card p-5 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-1 items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar pessoa, setor ou dispositivo..."
                className="h-11 rounded-xl border-border/60 bg-background/80 pl-10 text-sm transition-all duration-300 focus-visible:border-primary/40 focus-visible:ring-primary/20"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
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

          <div className="rounded-xl border border-border/50 bg-muted/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground shadow-sm shadow-slate-200/20">
            {registrosFiltrados.length} resultado(s)
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

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        <div className="h-full space-y-4 overflow-hidden rounded-[24px] border border-border bg-card p-5 shadow-md lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Ocupação por Setor</h3>
            <Building2 size={16} className="text-muted-foreground" />
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-xs text-muted-foreground">Carregando...</span>
            </div>
          ) : ocupacaoPorSetor.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Nenhum setor encontrado</div>
          ) : (
            <div className="space-y-4">
              {ocupacaoPorSetor.map((setor) => {
                const percentual = Math.round((setor.ocupacaoAtual / maiorOcupacao) * 100);

                return (
                  <div key={setor.id} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span>{setor.nome || "-"}</span>
                      <span className="text-muted-foreground">{setor.ocupacaoAtual} pessoa(s)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentual}%`,
                          backgroundColor: "var(--primary)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="pt-2 text-[10px] font-medium text-muted-foreground">
            {stats.alertas > 0
              ? `${stats.alertas} permanência(s) acima de ${LIMITE_ALERTA_HORAS}h`
              : "Sem permanências em alerta no momento"}
          </div>
        </div>

        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-border bg-card shadow-md lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border bg-muted/20 p-4">
            <div>
              <h3 className="text-sm font-bold">Logs de Circulação</h3>
              <p className="text-[10px] text-muted-foreground">Movimentações registradas por dispositivos RFID</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCSV(registrosFiltrados)}
              className="h-8 gap-2 rounded-xl border-border/70 bg-white/75 text-xs hover:border-primary/20 hover:bg-white"
            >
              <Download size={14} />
              Exportar
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[28%]" />
                <col className="w-[24%]" />
                <col className="w-[30%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Pessoa</th>
                  <th className="px-4 py-3">Fluxo</th>
                  <th className="px-4 py-3">Horário</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm">Carregando registros...</span>
                      </div>
                    </td>
                  </tr>
                ) : registrosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-sm text-muted-foreground">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  <>
                    {registrosPaginados.map((reg) => <LinhaCirculacao key={reg.id} reg={reg} />)}
                    {Array.from({ length: linhasVazias }).map((_, index) => (
                      <tr key={`empty-${index}`} className="h-[60px] border-b border-border/60">
                        <td colSpan={4} />
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[11px] font-medium text-muted-foreground">
              {registrosFiltrados.length === 0
                ? "Nenhum registro"
                : `${inicioPagina + 1}-${fimPagina} de ${registrosFiltrados.length} registros`}
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Página {paginaNormalizada} de {totalPaginas}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-xl border-border/70 bg-background/70"
                  onClick={() => setPaginaAtual((pagina) => Math.max(1, pagina - 1))}
                  disabled={paginaNormalizada === 1}
                >
                  <ChevronLeft size={14} />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-xl border-border/70 bg-background/70"
                  onClick={() => setPaginaAtual((pagina) => Math.min(totalPaginas, pagina + 1))}
                  disabled={paginaNormalizada === totalPaginas}
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
          <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-red-800 dark:text-red-300">
            {stats.alertas > 0 ? `${stats.alertas} alerta(s) de permanência` : "Sem alertas no momento"}
          </h4>
          <p className="mt-1 text-xs text-red-700 dark:text-red-400">
            {stats.alertas > 0
              ? `Existem pessoas com permanência acima de ${LIMITE_ALERTA_HORAS}h sem saída registrada.`
              : "Todos os visitantes estão dentro do tempo previsto de permanência."}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={carregarDados}
          className="rounded-lg border-red-200 text-red-700 hover:bg-red-100 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/50"
        >
          Verificar
        </Button>
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
              {STATUS_OPTIONS.map((status) => (
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
