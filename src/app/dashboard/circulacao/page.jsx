"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Download, 
  Clock, 
  Activity, 
  Users, 
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Building2,
  Loader2
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { STATS_CIRCULACAO, CIRCULACAO_LISTA, OCUPACAO_SETORES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatarData(isoString) {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}

function formatarHora(isoString) {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function CirculacaoPage() {
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [busca, setBusca]         = useState("");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  async function carregarLogs() {
    setLoading(true);
    try {
      // Busca histórico completo de acessos via GET /logs/
      const data = await api.get('/logs/');
      const lista = Array.isArray(data) ? data
        : (data?.data ?? data?.dados ?? null);

      if (lista && Array.isArray(lista)) {
        setLogs(lista);
      } else {
        // Fallback para mock
        setLogs(CIRCULACAO_LISTA);
      }
      setUltimaAtualizacao(new Date());
    } catch (error) {
      console.error('Erro ao buscar logs de circulação:', error);
      setLogs(CIRCULACAO_LISTA);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarLogs();
  }, []);

  const registrosFiltrados = useMemo(() => {
    if (!busca.trim()) return logs;
    return logs.filter(reg => {
      const nome = reg.pessoa || reg.usuario?.nome || reg.nomeUsuario || String(reg.idUsuario || "");
      const dispositivo = reg.destino || reg.dispositivo?.local || String(reg.idDispositivo || "");
      return (
        nome.toLowerCase().includes(busca.toLowerCase()) ||
        dispositivo.toLowerCase().includes(busca.toLowerCase())
      );
    });
  }, [logs, busca]);

  // Estatísticas derivadas dos logs reais
  const stats = useMemo(() => {
    const dentroAgora = logs.filter(l => l.dataDeEntrada && !l.dataDeSaida).length;
    const sairam = logs.filter(l => l.dataDeSaida).length;
    return {
      total: logs.length,
      dentroAgora,
      sairam,
    };
  }, [logs]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Circulação Interna</h1>
          <p className="text-sm text-muted-foreground">
            Monitoramento de logs de acesso em tempo real
            {ultimaAtualizacao && (
              <span className="ml-2 text-muted-foreground/60">
                · Atualizado às {ultimaAtualizacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={carregarLogs} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Atualizar
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => {
            const csv = ["ID,Usuário,Dispositivo,Entrada,Saída",
              ...registrosFiltrados.map(l =>
                [l.id, l.idUsuario, l.idDispositivo, l.dataDeEntrada || "—", l.dataDeSaida || "—"].join(",")
              )].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = "circulacao.csv"; a.click();
          }}>
            <Download size={14} /> Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total de Registros"
          value={loading ? "..." : stats.total}
          icon={<Activity size={20} className="text-primary" />}
          accentVar="var(--primary)"
        />
        <StatCard
          label="Dentro Agora"
          value={loading ? "..." : stats.dentroAgora}
          valueClassName="text-chart-2"
          icon={<Users size={20} className="text-chart-2" />}
          accentVar="var(--chart-2)"
        />
        <StatCard
          label="Saíram"
          value={loading ? "..." : stats.sairam}
          valueClassName="text-chart-3"
          icon={<ArrowRight size={20} className="text-chart-3" />}
          accentVar="var(--chart-3)"
        />
      </div>

      {/* Barra de busca */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Buscar por usuário ou dispositivo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
          />
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Histórico de Acessos</h2>
          <span className="text-xs text-muted-foreground">
            {registrosFiltrados.length} registro{registrosFiltrados.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usuário</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dispositivo</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entrada</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saída</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">Carregando logs de circulação...</p>
                    </div>
                  </td>
                </tr>
              ) : registrosFiltrados.length > 0 ? (
                registrosFiltrados.map((log, i) => {
                  const dentro = log.dataDeEntrada && !log.dataDeSaida;
                  return (
                    <tr key={log.id || i} className="border-b border-border hover:bg-accent/40 transition-all">
                      <td className="py-3 px-4 text-xs font-mono text-muted-foreground">#{log.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {log.idUsuario || "?"}
                          </div>
                          <span className="text-sm text-foreground">
                            {log.usuario?.nome || log.nomeUsuario || `Usuário #${log.idUsuario}`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Building2 size={13} />
                          {log.dispositivo?.local || `Dispositivo #${log.idDispositivo}`}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-sm text-foreground">
                          <Clock size={13} className="text-muted-foreground" />
                          {formatarHora(log.dataDeEntrada)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {log.dataDeSaida ? formatarHora(log.dataDeSaida) : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          dentro ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dentro ? "bg-green-500" : "bg-blue-500"}`} />
                          {dentro ? "Dentro" : "Saiu"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Activity className="w-12 h-12 text-muted/30" />
                      <p className="text-sm text-muted-foreground">Nenhum registro de circulação encontrado.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
