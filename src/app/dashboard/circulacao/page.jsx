"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Download, 
  Printer, 
  Clock, 
  MoreHorizontal, 
  Activity, 
  Map, 
  Users, 
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Building2,
  Navigation,
  Loader2,
  X,
  Filter,
  Check
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModalFiltro from "@/components/ui/ModalFiltro";
import { api } from "@/services/api";

// ─── HELPERS & CONFIG ────────────────────────────────────────────────────────

const STATUS_LABEL = {
  "Ativo": "Ativo",
  "Concluído": "Concluído",
  "Alerta": "Alerta"
};

const STATUS_STYLE = {
  "Ativo": "bg-green-100 text-green-700",
  "Concluído": "bg-blue-100 text-blue-700",
  "Alerta": "bg-red-100 text-red-700"
};

const STATUS_DOT = {
  "Ativo": "bg-green-500",
  "Concluído": "bg-blue-500",
  "Alerta": "bg-red-500"
};

function toCSV(rows) {
  const cols = ["Pessoa", "Origem", "Destino", "Horário", "Status"];
  const lines = rows.map((r) =>
    [r.pessoa || "—", r.origem || "—", r.destino || "—", r.horario || "—", r.status || "—"].join(";")
  );
  return [cols.join(";"), ...lines].join("\n");
}

function downloadCSV(data) {
  const blob = new Blob([toCSV(data)], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "circulacao.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── LINHA DA TABELA ─────────────────────────────────────────────────────────

function LinhaCirculacao({ reg }) {
  if (!reg) return null;

  return (
    <tr className="border-b border-border transition-colors duration-300 hover:bg-primary/[0.035] group">
      <td className="px-4 py-3">
        <p className="text-xs font-bold leading-none">{reg.pessoa || "—"}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{reg.tipo || "—"}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] font-medium">
          <span className="text-muted-foreground">{reg.origem || "—"}</span>
          <ArrowRight size={12} className="text-muted-foreground" />
          <span className="text-foreground">{reg.destino || "—"}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-[11px] font-bold">
        {reg.horario || "—"}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[reg.status] ?? "bg-gray-100 text-gray-700"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[reg.status] ?? "bg-gray-400"}`} />
          {reg.status || "—"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
          <MoreHorizontal size={12} className="text-muted-foreground" />
        </Button>
      </td>
    </tr>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function CirculacaoPage() {
  const [circulacao, setCirculacao] = useState([]);
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempFiltroStatus, setTempFiltroStatus] = useState("Todos");

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregando logs de circulação
      const responseLogs = await api.get('/logs');
      if (responseLogs.sucesso) {
        setCirculacao(responseLogs.data || []);
      }
      
      // Carregando setores para ocupação
      const responseSetores = await api.get('/dep');
      if (responseSetores.sucesso) {
        setSetores(responseSetores.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados de circulação:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const registrosFiltrados = useMemo(() => {
    return circulacao.filter(reg => {
      const matchesBusca = !busca.trim() ||
        (reg.pessoa || "").toLowerCase().includes(busca.toLowerCase()) || 
        (reg.origem || "").toLowerCase().includes(busca.toLowerCase()) ||
        (reg.destino || "").toLowerCase().includes(busca.toLowerCase());
      
      const matchesStatus = filtroStatus === "Todos" || reg.status === filtroStatus;
      
      return matchesBusca && matchesStatus;
    });
  }, [circulacao, busca, filtroStatus]);

  const stats = useMemo(() => ({
    totalMovimentos: circulacao.length,
    ocupacaoAtual: circulacao.filter(r => r.dataDeEntrada && !r.dataDeSaida).length,
    setorMaisAtivo: circulacao.reduce((a, b) => (b.visitantes || 0) > (a.visitantes || 0) ? b : a, circulacao[0]) || {},
    tempoMedio: "—",
  }), [circulacao]);

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
        subtitle="Monitoramento de fluxo e ocupação em tempo real"
        secondaryButtonText="Atualizar"
        onSecondaryButtonClick={carregarDados}
        buttonText="Ver Mapa de Calor"
        onButtonClick={() => {}}
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
          value={stats.setorMaisAtivo?.nome || "—"}
          valueClassName="text-foreground font-bold text-sm"
          icon={<Navigation size={17} className="text-foreground" />}
          sub="maior fluxo"
          accentVar="var(--chart-4)"
        />
        <StatCard
          label="Tempo Médio"
          value={stats.tempoMedio}
          valueClassName="text-muted-foreground"
          icon={<Clock size={17} className="text-muted-foreground" />}
          sub="por setor"
          accentVar="var(--border)"
        />
      </div>

      {/* Barra de Filtros Padronizada */}
      <div className="bg-card border border-border rounded-[24px] p-5 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar pessoa ou setor..."
                className="pl-10 h-11 rounded-xl border-border/60 bg-background/80 text-sm transition-all duration-300 focus-visible:border-primary/40 focus-visible:ring-primary/20"
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
              className="h-11 px-4 gap-2 rounded-xl border-border/60 bg-background/80 transition-all duration-300 hover:border-primary/20 hover:bg-white hover:shadow-sm"
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filtros</span>
              {filtroStatus !== "Todos" && (
                <span className="ml-1 w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                  1
                </span>
              )}
            </Button>
          </div>

          <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-semibold text-muted-foreground shadow-sm shadow-slate-200/20">
            {registrosFiltrados.length} resultado(s)
          </div>
        </div>

        {(filtroStatus !== "Todos" || busca) && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros ativos:</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ocupação por Setor */}
        <div className="lg:col-span-1 bg-card rounded-[24px] border border-border p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">Ocupação por Setor</h3>
            <Building2 size={16} className="text-muted-foreground" />
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-xs text-muted-foreground">Carregando...</span>
            </div>
          ) : setores.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-8">
              Nenhum setor encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {setores.map((setor, i) => (
                <div key={setor.id || i} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span>{setor.nome || "—"}</span>
                    <span className="text-muted-foreground">0/{0} pessoas</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: "0%",
                        backgroundColor: "var(--primary)"
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="pt-2">
            <Button variant="ghost" className="w-full text-xs text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground">
              Ver detalhes de todos os setores
            </Button>
          </div>
        </div>

        {/* Logs de Circulação */}
        <div className="lg:col-span-2 bg-card rounded-[24px] border border-border overflow-hidden shadow-md">
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Logs de Circulação</h3>
              <p className="text-[10px] text-muted-foreground">
                Últimas movimentações internas detectadas
              </p>
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

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
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
                  registrosFiltrados.map((reg) => (
                    <LinhaCirculacao key={reg.id} reg={reg} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Alertas de Circulação */}
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
          <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-red-800 dark:text-red-300">Sem alertas no momento</h4>
          <p className="text-xs text-red-700 dark:text-red-400 mt-1">
            Todos os visitantes estão dentro do tempo previsto de permanência.
          </p>
        </div>
        <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg">
          Verificar
        </Button>
      </div>

      {/* Modal de Filtro Padronizado */}
      <ModalFiltro
        isOpen={modalFiltroAberto}
        onClose={() => setModalFiltroAberto(false)}
        onApply={aplicarFiltros}
        onClear={limparFiltros}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Status da Circulação
            </label>
            <div className="grid grid-cols-1 gap-2">
              {["Todos", "Ativo", "Concluído", "Alerta"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTempFiltroStatus(status)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all border ${
                    tempFiltroStatus === status
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/30 hover:bg-muted/40"
                  }`}
                >
                  <span>{status === "Todos" ? "Todos os Status" : status}</span>
                  {tempFiltroStatus === status && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-[10px] text-primary/80 leading-relaxed">
              <strong>Info:</strong> O monitoramento de circulação ajuda a garantir que os visitantes estejam nos locais autorizados dentro do cronograma previsto.
            </p>
          </div>
        </div>
      </ModalFiltro>
    </div>
  );
}
