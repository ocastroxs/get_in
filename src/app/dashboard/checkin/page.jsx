"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Download,
  Printer,
  Clock,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  LogOut,
  Calendar,
  Building2,
  Users,
  ArrowRightLeft,
  Eye,
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
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { api } from "@/services/api";

// ─── HELPERS & CONFIG ────────────────────────────────────────────────────────

const STATUS_LABEL = {
  "Dentro": "Dentro",
  "Saiu": "Saiu",
  "Aguard. aprovação": "Aguard. aprovação",
  "Alerta": "Alerta"
};

const STATUS_STYLE = {
  "Dentro": "bg-green-100 text-green-700",
  "Saiu": "bg-blue-100 text-blue-700",
  "Aguard. aprovação": "bg-yellow-100 text-yellow-700",
  "Alerta": "bg-red-100 text-red-700"
};

const STATUS_DOT = {
  "Dentro": "bg-green-500",
  "Saiu": "bg-blue-500",
  "Aguard. aprovação": "bg-yellow-500",
  "Alerta": "bg-red-500"
};

function toCSV(rows) {
  const cols = ["Visitante", "Empresa", "CPF", "Setor", "Entrada", "Saída", "Status"];
  const lines = rows.map((r) =>
    [r.visitante || r.nome, r.empresa, r.cpf, r.setor, r.entrada || r.dataDeEntrada, r.saida || r.dataDeSaida || "—", r.status].join(";")
  );
  return [cols.join(";"), ...lines].join("\n");
}

function downloadCSV(data) {
  const blob = new Blob([toCSV(data)], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "movimentacao.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── LINHA DA TABELA ─────────────────────────────────────────────────────────

function LinhaMovimentacao({ reg }) {
  if (!reg) return null;

  return (
    <tr className="border-b border-border transition-colors duration-300 hover:bg-primary/[0.035]">
      <td className="px-4 py-3">
        <p className="text-xs font-bold leading-none">{reg.visitante || reg.nome || "—"}</p>
      </td>
      <td className="px-4 py-3 text-[11px] font-medium text-muted-foreground">{reg.empresa || "—"}</td>
      <td className="px-4 py-3 text-[11px] font-medium text-muted-foreground">{reg.cpf || "—"}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md w-fit">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">{reg.setor || "—"}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-[11px] font-bold">{reg.entrada || reg.dataDeEntrada || "—"}</td>
      <td className="px-4 py-3 text-[11px] font-medium text-muted-foreground">{reg.saida || reg.dataDeSaida || "—"}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[reg.status] ?? "bg-muted text-muted-foreground"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[reg.status] ?? "bg-muted-foreground"}`} />
          {reg.status || "—"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {reg.status === "Aguard. aprovação" ? (
            <Button size="sm" className="h-7 gap-1.5 rounded-xl border-none bg-primary px-3 text-[10px] text-white hover:bg-primary/90">
              Aprovar
            </Button>
          ) : reg.status !== "Saiu" ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 rounded-xl border-secondary/20 px-3 text-[10px] text-secondary hover:bg-secondary/10 hover:text-secondary"
            >
              Check-out
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
              <Eye size={12} className="text-muted-foreground" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
            <MoreHorizontal size={12} className="text-muted-foreground" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function CheckinPage() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("Todas");
  const [busca, setBusca] = useState("");
  
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempFiltroStatus, setTempFiltroStatus] = useState("Todas");

  const carregarRegistros = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.get('/logs');
      if (response.sucesso) {
        setRegistros(response.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar registros de movimentação:", error);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(carregarRegistros);

  const registrosFiltrados = useMemo(() => {
    return registros.filter((reg) => {
      const matchesStatus =
        filtroStatus === "Todas" ||
        (filtroStatus === "Dentro" && reg.status === "Dentro") ||
        (filtroStatus === "Saiu" && reg.status === "Saiu") ||
        (filtroStatus === "Pendente" && reg.status === "Aguard. aprovação") ||
        (filtroStatus === "Alerta" && reg.status === "Alerta");

      const matchesBusca =
        !busca.trim() ||
        (reg.visitante || reg.nome || "").toLowerCase().includes(busca.toLowerCase()) ||
        (reg.cpf || "").includes(busca) ||
        (reg.empresa || "").toLowerCase().includes(busca.toLowerCase());

      return matchesStatus && matchesBusca;
    });
  }, [registros, filtroStatus, busca]);

  const stats = useMemo(() => ({
    checkins: registros.filter((r) => r.dataDeEntrada && !r.dataDeSaida).length,
    checkouts: registros.filter((r) => r.dataDeSaida).length,
    dentro: registros.filter((r) => r.dataDeEntrada && !r.dataDeSaida).length,
    pendentes: registros.filter((r) => r.status === "Aguard. aprovação").length,
  }), [registros]);

  const aplicarFiltros = () => {
    setFiltroStatus(tempFiltroStatus);
  };

  const limparFiltros = () => {
    setTempFiltroStatus("Todas");
    setFiltroStatus("Todas");
    setBusca("");
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <Topbar
        title="Check-in / Check-out"
        subtitle="Registro de movimentação de visitantes em tempo real"
        secondaryButtonText="Exportar CSV"
        onSecondaryButtonClick={() => downloadCSV(registrosFiltrados)}
      />
      <div className="flex justify-end gap-2 -mt-2">
        <Button
          size="sm"
          className="gap-1.5 rounded-xl shadow-lg shadow-primary/15"
        >
          <UserPlus size={14} /> Check-in
        </Button>
        <Button
          size="sm"
          className="gap-1.5 rounded-xl border-none bg-secondary text-white shadow-lg shadow-secondary/20 hover:bg-secondary/90"
        >
          <LogOut size={14} /> Check-out
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Check-ins"
          value={stats.checkins}
          valueClassName="text-primary"
          icon={<ArrowRightLeft size={17} className="text-primary" />}
          sub="hoje"
          accentVar="var(--primary)"
        />
        <StatCard
          label="Check-outs"
          value={stats.checkouts}
          valueClassName="text-secondary"
          icon={<LogOut size={17} className="text-secondary" />}
          sub="realizados"
          accentVar="var(--chart-2)"
        />
        <StatCard
          label="Dentro"
          value={stats.dentro}
          valueClassName="text-foreground"
          icon={<Users size={17} className="text-foreground" />}
          sub="na empresa"
          accentVar="var(--chart-4)"
        />
        <StatCard
          label="Pendentes"
          value={stats.pendentes}
          valueClassName="text-destructive"
          icon={<Clock size={17} className="text-destructive" />}
          sub="aprovação"
          accentVar="var(--destructive)"
        />
      </div>

      {/* Barra de Filtros Padronizada */}
      <div className="bg-card border border-border rounded-[24px] p-5 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar visitante, CPF, empresa..."
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
              {filtroStatus !== "Todas" && (
                <span className="ml-1 w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                  1
                </span>
              )}
            </Button>
          </div>

          <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-semibold text-muted-foreground">
            {registrosFiltrados.length} registro(s) encontrado(s)
          </div>
        </div>

        {(filtroStatus !== "Todas" || busca) && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Filtros ativos:</span>
            {busca && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                Busca: {busca}
              </span>
            )}
            {filtroStatus !== "Todas" && (
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

      <div className="bg-card rounded-[24px] border border-border overflow-hidden shadow-md">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">Registro de Movimentação</h3>
            <p className="text-[10px] text-muted-foreground">Monitoramento em tempo real</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => downloadCSV(registrosFiltrados)}>
              <Download size={14} />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
              <Printer size={14} />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 py-3">Visitante</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">CPF</th>
                <th className="px-4 py-3">Setor de Destino</th>
                <th className="px-4 py-3">Entrada</th>
                <th className="px-4 py-3">Saída</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-sm">Carregando registros...</span>
                    </div>
                  </td>
                </tr>
              ) : registrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-sm text-muted-foreground">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                registrosFiltrados.map((reg) => (
                  <LinhaMovimentacao key={reg.id} reg={reg} />
                ))
              )}
            </tbody>
          </table>
        </div>
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
              Status do Movimento
            </label>
            <div className="grid grid-cols-1 gap-2">
              {["Todas", "Dentro", "Saiu", "Pendente", "Alerta"].map((status) => (
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
                  <span>{status === "Todas" ? "Todos os Status" : status}</span>
                  {tempFiltroStatus === status && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-[10px] text-primary/80 leading-relaxed">
              <strong>Info:</strong> O status &quot;Pendente&quot; indica visitantes que aguardam aprovação de um supervisor para entrar.
            </p>
          </div>
        </div>
      </ModalFiltro>
    </div>
  );
}
