"use client";

import { useState, useEffect, useMemo } from "react";
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
  X
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <tr className="border-b border-border hover:bg-accent/40 transition-colors">
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
            <Button size="sm" className="h-7 text-[10px] gap-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white border-none">
              Aprovar
            </Button>
          ) : reg.status !== "Saiu" ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] gap-1.5 px-3 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
            >
              Check-out
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Eye size={12} className="text-muted-foreground" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7">
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

  const carregarRegistros = async () => {
    setLoading(true);
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

  useEffect(() => {
    carregarRegistros();
  }, []);

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

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Check-in / Check-out</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Registro de movimentação de visitantes em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadCSV(registrosFiltrados)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Download size={16} /> Exportar
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors">
            <LogOut size={16} /> Check-out
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <UserPlus size={16} /> Check-in
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Check-ins"
          value={stats.checkins}
          valueClassName="text-blue-600"
          icon={<ArrowRightLeft size={17} className="text-blue-600" />}
          sub="hoje"
          accentVar="var(--blue-500)"
        />
        <StatCard
          label="Check-outs"
          value={stats.checkouts}
          valueClassName="text-green-600"
          icon={<LogOut size={17} className="text-green-600" />}
          sub="realizados"
          accentVar="var(--green-500)"
        />
        <StatCard
          label="Dentro"
          value={stats.dentro}
          valueClassName="text-cyan-600"
          icon={<Users size={17} className="text-cyan-600" />}
          sub="na empresa"
          accentVar="var(--cyan-500)"
        />
        <StatCard
          label="Pendentes"
          value={stats.pendentes}
          valueClassName="text-yellow-600"
          icon={<Clock size={17} className="text-yellow-600" />}
          sub="aprovação"
          accentVar="var(--yellow-500)"
        />
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-muted-foreground px-2">Status:</span>
            {["Todas", "Dentro", "Saiu", "Pendente", "Alerta"].map((status) => (
              <button
                key={status}
                onClick={() => setFiltroStatus(status)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filtroStatus === status
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {status}
              </button>
            ))}
            {(busca || filtroStatus !== "Todas") && (
              <button
                onClick={() => { setBusca(""); setFiltroStatus("Todas"); }}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input
              placeholder="Buscar visitante, CPF, empresa..."
              className="pl-9 h-9 text-xs"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">Registro de Movimentação</h3>
            <p className="text-[10px] text-muted-foreground">{registrosFiltrados.length} registros • mostrando por página</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Clock size={14} />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => downloadCSV(registrosFiltrados)}>
              <Download size={14} />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
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
    </div>
  );
}
