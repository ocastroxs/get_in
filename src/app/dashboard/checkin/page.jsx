"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  LogOut,
  Users,
  ArrowRightLeft,
  Loader2,
  RefreshCw,
  X,
  Plus,
  AlertTriangle,
  Building2,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { STATS_MOVIMENTACAO, MOVIMENTACAO_LISTA } from "@/lib/mockData";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Modal Novo Check-in ──────────────────────────────────────────────────────

function ModalNovoCheckin({ onClose, onSave, usuarios, dispositivos }) {
  const [form, setForm] = useState({
    idUsuario: "", idDispositivo: ""
  });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit() {
    if (!form.idUsuario || !form.idDispositivo) {
      setErro("Selecione o usuário e o dispositivo.");
      return;
    }
    setSaving(true);
    setErro("");
    try {
      // Cria log via POST /logs/
      const resultado = await api.post('/logs/', {
        idUsuario: parseInt(form.idUsuario),
        idDispositivo: parseInt(form.idDispositivo),
        dataDeEntrada: new Date().toISOString(),
        dataDeSaida: null,
      });

      if (resultado && (resultado.sucesso || resultado.data?.id)) {
        onSave(resultado.data || resultado);
        onClose();
      } else {
        setErro(resultado?.mensagem || "Erro ao registrar check-in.");
      }
    } catch (err) {
      console.error(err);
      setErro("Erro de conexão com o servidor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserPlus size={15} className="text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Novo Check-in</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Usuário *</label>
            <select
              value={form.idUsuario}
              onChange={set("idUsuario")}
              className="w-full h-9 pl-3 pr-7 rounded-lg border border-border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            >
              <option value="">— Selecionar usuário —</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.nome} ({u.cpf})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Dispositivo / Local *</label>
            <select
              value={form.idDispositivo}
              onChange={set("idDispositivo")}
              className="w-full h-9 pl-3 pr-7 rounded-lg border border-border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            >
              <option value="">— Selecionar dispositivo —</option>
              {dispositivos.map(d => (
                <option key={d.id} value={d.id}>{d.local} (Dep. #{d.idDepartamento})</option>
              ))}
            </select>
          </div>

          {erro && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive">
              <AlertTriangle size={13} /> {erro}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button size="sm" className="gap-1.5" onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <span className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <CheckCircle2 size={13} />
            )}
            Registrar Check-in
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function CheckinPage() {
  const [logs, setLogs]               = useState([]);
  const [usuarios, setUsuarios]       = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("Todas");
  const [busca, setBusca]             = useState("");
  const [modalAberto, setModalAberto] = useState(false);

  async function carregarDados() {
    setLoading(true);
    try {
      // Busca logs via GET /logs/
      const logsData = await api.get('/logs/');
      const listaLogs = Array.isArray(logsData) ? logsData
        : (logsData?.data ?? logsData?.dados ?? null);

      if (listaLogs && Array.isArray(listaLogs)) {
        setLogs(listaLogs);
      } else {
        setLogs(MOVIMENTACAO_LISTA);
      }

      // Busca usuários para o modal
      const userData = await api.get('/user/');
      const listaUsers = Array.isArray(userData) ? userData
        : (userData?.data ?? userData?.dados ?? []);
      setUsuarios(listaUsers);

      // Busca dispositivos para o modal
      const dispData = await api.get('/dispositivos/');
      const listaDisp = Array.isArray(dispData) ? dispData
        : (dispData?.data ?? dispData?.dados ?? []);
      setDispositivos(listaDisp);

    } catch (error) {
      console.error('Erro ao buscar dados de check-in:', error);
      setLogs(MOVIMENTACAO_LISTA);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const registrosFiltrados = useMemo(() => {
    return logs.filter((reg) => {
      const dentro = reg.dataDeEntrada && !reg.dataDeSaida;
      const saiu = reg.dataDeSaida;

      const matchesStatus =
        filtroStatus === "Todas" ||
        (filtroStatus === "Dentro" && dentro) ||
        (filtroStatus === "Saiu" && saiu);

      const nomeBusca = reg.usuario?.nome || reg.nomeUsuario || String(reg.idUsuario || "");
      const dispBusca = reg.dispositivo?.local || String(reg.idDispositivo || "");

      const matchesBusca =
        busca.trim() === "" ||
        nomeBusca.toLowerCase().includes(busca.toLowerCase()) ||
        dispBusca.toLowerCase().includes(busca.toLowerCase());

      return matchesStatus && matchesBusca;
    });
  }, [logs, filtroStatus, busca]);

  const stats = useMemo(() => {
    const dentro = logs.filter(l => l.dataDeEntrada && !l.dataDeSaida).length;
    const saiu = logs.filter(l => l.dataDeSaida).length;
    return {
      total: logs.length,
      dentro,
      saiu,
    };
  }, [logs]);

  function handleSave(novoLog) {
    setLogs(p => [novoLog, ...p]);
  }

  return (
    <div className="p-6 space-y-6">
      {modalAberto && (
        <ModalNovoCheckin
          onClose={() => setModalAberto(false)}
          onSave={handleSave}
          usuarios={usuarios}
          dispositivos={dispositivos}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Check-in / Check-out</h1>
          <p className="text-sm text-muted-foreground">Registro de entradas e saídas por dispositivo</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={carregarDados} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Atualizar
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => {
            const csv = ["ID,Usuário,Dispositivo,Entrada,Saída",
              ...registrosFiltrados.map(l =>
                [l.id, l.idUsuario, l.idDispositivo, l.dataDeEntrada || "—", l.dataDeSaida || "—"].join(",")
              )].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = "checkins.csv"; a.click();
          }}>
            <Download size={14} /> Exportar
          </Button>
          <Button size="sm" className="gap-2 bg-sidebar-primary text-sidebar-primary-foreground" onClick={() => setModalAberto(true)}>
            <UserPlus size={14} /> Novo Check-in
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total de Registros"
          value={loading ? "..." : stats.total}
          icon={<ArrowRightLeft size={20} className="text-primary" />}
          accentVar="var(--primary)"
        />
        <StatCard
          label="Dentro Agora"
          value={loading ? "..." : stats.dentro}
          valueClassName="text-chart-2"
          icon={<Users size={20} className="text-chart-2" />}
          accentVar="var(--chart-2)"
        />
        <StatCard
          label="Saíram"
          value={loading ? "..." : stats.saiu}
          valueClassName="text-chart-3"
          icon={<LogOut size={20} className="text-chart-3" />}
          accentVar="var(--chart-3)"
        />
      </div>

      {/* Filtros */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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

          <div className="flex items-center gap-2">
            {["Todas", "Dentro", "Saiu"].map(f => (
              <button
                key={f}
                onClick={() => setFiltroStatus(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  filtroStatus === f
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Registros de Acesso</h2>
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
                      <p className="text-sm text-muted-foreground">Carregando registros...</p>
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
                      <ArrowRightLeft className="w-12 h-12 text-muted/30" />
                      <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
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
